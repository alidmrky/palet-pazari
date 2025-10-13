import mongoose from 'mongoose';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToMongoDB } from '@/packages/libs/Database/mongodb';
import { User } from '@/packages/models/User';
import { UserType } from '@/packages/types/User';
import { trackLogin } from '@/packages/utils/logger';
import { LoginStatus, LoginMethod } from '@/packages/models/UserLogin';
import bcrypt from 'bcryptjs';

const handler = NextAuth({
  // MongoDB adapter'ı kaldırıyoruz, sadece bizim User modelimizi kullanacağız
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectToMongoDB();

           // Bizim User modelimizi kullan (palet-pazari database'de)
           // Password'u da çekmek için select('+password') kullan
           const user = await User.findOne({
             email: credentials.email.toLowerCase()
           }).select('+password');

          if (!user || !user.password) {
            console.log('User not found or no password for:', credentials.email);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            // Başarısız login tracking
            await trackLogin({
              userId: user._id.toString(),
              email: user.email,
              loginMethod: LoginMethod.EMAIL,
              status: LoginStatus.FAILED,
              ipAddress: 'unknown',
              userAgent: 'unknown',
              failureReason: 'Invalid password'
            });
            return null;
          }

          // Başarılı login tracking
          await trackLogin({
            userId: user._id.toString(),
            email: user.email,
            loginMethod: LoginMethod.EMAIL,
            status: LoginStatus.SUCCESS,
            ipAddress: 'unknown',
            userAgent: 'unknown'
          });

          // Son giriş zamanını güncelle
          user.lastLoginAt = new Date();
          await user.save();

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.getDisplayName(),
            userType: user.userType,
            image: null
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // OAuth girişleri için
      if (account?.provider === 'google' || account?.provider === 'facebook') {
        try {
          await connectToMongoDB();

          const existingUser = await User.findOne({
            $or: [
              { email: user.email },
              { googleId: account.providerAccountId },
              { facebookId: account.providerAccountId }
            ]
          });

          if (existingUser) {
            // Mevcut kullanıcıyı güncelle
            if (account.provider === 'google') {
              existingUser.googleId = account.providerAccountId;
            } else if (account.provider === 'facebook') {
              existingUser.facebookId = account.providerAccountId;
            }
            existingUser.lastLoginAt = new Date();
            await existingUser.save();

            // OAuth başarılı login tracking
            await trackLogin({
              userId: existingUser._id.toString(),
              email: existingUser.email,
              loginMethod: account.provider === 'google' ? LoginMethod.GOOGLE : LoginMethod.FACEBOOK,
              status: LoginStatus.SUCCESS,
              ipAddress: 'unknown',
              userAgent: 'unknown'
            });
          } else {
            // Yeni kullanıcı oluştur
            const newUser = new User({
              email: user.email!,
              userType: UserType.INDIVIDUAL, // OAuth kullanıcıları varsayılan olarak bireysel
              isEmailVerified: true,
              isActive: true,
              lastLoginAt: new Date(),
              ...(account.provider === 'google' && { googleId: account.providerAccountId }),
              ...(account.provider === 'facebook' && { facebookId: account.providerAccountId })
            });

            // OAuth'dan gelen bilgileri kullan
            if (profile?.name) {
              const nameParts = profile.name.split(' ');
              newUser.individualInfo = {
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || ''
              };
            }

            await newUser.save();

            // OAuth yeni kullanıcı login tracking
            await trackLogin({
              userId: newUser._id.toString(),
              email: newUser.email,
              loginMethod: account.provider === 'google' ? LoginMethod.GOOGLE : LoginMethod.FACEBOOK,
              status: LoginStatus.SUCCESS,
              ipAddress: 'unknown',
              userAgent: 'unknown'
            });
          }

          return true;
        } catch (error) {
          console.error('OAuth sign in error:', error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.userType = (user as any).userType;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && token.id) {
        session.user.id = token.id as string;
        (session.user as any).userType = token.userType;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register',
    error: '/auth/error'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 gün
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
