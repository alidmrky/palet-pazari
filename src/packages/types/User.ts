// User types and interfaces for client-side usage
export enum UserType {
  INDIVIDUAL = 'individual',
  COMPANY = 'company'
}

// Bireysel kullanıcı bilgileri
export interface IIndividualUser {
  firstName: string;
  lastName: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    district: string;
    postalCode: string;
    country: string;
  };
  birthDate?: Date;
  identityNumber?: string; // TC Kimlik No
}

// Şirket kullanıcı bilgileri
export interface ICompanyUser {
  companyName: string;
  taxNumber: string; // Vergi No
  taxOffice: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    district: string;
    postalCode: string;
    country: string;
  };
  authorizedPerson: {
    firstName: string;
    lastName: string;
    position: string;
    phone?: string;
    email?: string;
  };
  companyType?: string; // Limited, Anonim, vs.
  website?: string;
}
