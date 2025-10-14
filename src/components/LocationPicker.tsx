'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, X, Check } from 'lucide-react';

interface LocationPickerProps {
  onLocationSelect: (location: {
    sehir: string;
    ilce: string;
    mahalle?: string;
    latitude?: number;
    longitude?: number;
    adresAciklama?: string;
  }) => void;
  initialLocation?: {
    sehir: string;
    ilce: string;
    mahalle?: string;
    latitude?: number;
    longitude?: number;
    adresAciklama?: string;
  };
}

interface Suggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export default function LocationPicker({ onLocationSelect, initialLocation }: LocationPickerProps) {
  const [sehir, setSehir] = useState(initialLocation?.sehir || '');
  const [ilce, setIlce] = useState(initialLocation?.ilce || '');
  const [mahalle, setMahalle] = useState(initialLocation?.mahalle || '');
  const [adresAciklama, setAdresAciklama] = useState(initialLocation?.adresAciklama || '');
  const [latitude, setLatitude] = useState(initialLocation?.latitude);
  const [longitude, setLongitude] = useState(initialLocation?.longitude);

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  // Google Maps API yükleme
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setMapLoaded(true);
        initializeMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setMapLoaded(true);
        initializeMap();
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    // Harita oluştur
    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 41.0082, lng: 28.9784 }, // İstanbul
      zoom: 10,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });

    mapInstanceRef.current = map;

    // Marker oluştur
    const marker = new google.maps.Marker({
      map: map,
      draggable: true,
      animation: google.maps.Animation.DROP
    });

    markerRef.current = marker;

    // Marker sürüklendiğinde
    marker.addListener('dragend', () => {
      const position = marker.getPosition();
      if (position) {
        setLatitude(position.lat());
        setLongitude(position.lng());
        reverseGeocode(position.lat(), position.lng());
      }
    });

    // Harita tıklandığında
    map.addListener('click', (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        setLatitude(lat);
        setLongitude(lng);
        marker.setPosition(event.latLng);
        reverseGeocode(lat, lng);
      }
    });

    // Autocomplete oluştur
    const autocomplete = new google.maps.places.Autocomplete(
      document.getElementById('location-search') as HTMLInputElement,
      {
        types: ['geocode'],
        componentRestrictions: { country: 'tr' }
      }
    );

    autocompleteRef.current = autocomplete;

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setLatitude(lat);
        setLongitude(lng);
        marker.setPosition(place.geometry.location);
        map.setCenter(place.geometry.location);
        map.setZoom(15);

        // Adres bilgilerini ayıkla
        parseAddressComponents(place.address_components || []);
      }
    });
  };

  const parseAddressComponents = (components: google.maps.GeocoderAddressComponent[]) => {
    let city = '';
    let district = '';
    let neighborhood = '';

    components.forEach(component => {
      const types = component.types;
      if (types.includes('locality')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_2')) {
        district = component.long_name;
      } else if (types.includes('sublocality') || types.includes('neighborhood')) {
        neighborhood = component.long_name;
      }
    });

    setSehir(city);
    setIlce(district);
    setMahalle(neighborhood);
  };

  const reverseGeocode = (lat: number, lng: number) => {
    if (!window.google) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        parseAddressComponents(results[0].address_components);
      }
    });
  };

  const handleLocationSelect = () => {
    onLocationSelect({
      sehir,
      ilce,
      mahalle,
      latitude,
      longitude,
      adresAciklama
    });
  };

  const clearLocation = () => {
    setSehir('');
    setIlce('');
    setMahalle('');
    setAdresAciklama('');
    setLatitude(undefined);
    setLongitude(undefined);

    if (markerRef.current) {
      markerRef.current.setMap(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Konum Seçimi
          </CardTitle>
          <CardDescription>
            Haritadan konum seçin veya adres bilgilerini girin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Arama Çubuğu */}
          <div>
            <Label htmlFor="location-search">Konum Ara</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="location-search"
                placeholder="Şehir, ilçe, mahalle ara..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Adres Bilgileri */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="sehir">Şehir</Label>
              <Input
                id="sehir"
                value={sehir}
                onChange={(e) => setSehir(e.target.value)}
                placeholder="İstanbul"
              />
            </div>
            <div>
              <Label htmlFor="ilce">İlçe</Label>
              <Input
                id="ilce"
                value={ilce}
                onChange={(e) => setIlce(e.target.value)}
                placeholder="Kadıköy"
              />
            </div>
            <div>
              <Label htmlFor="mahalle">Mahalle</Label>
              <Input
                id="mahalle"
                value={mahalle}
                onChange={(e) => setMahalle(e.target.value)}
                placeholder="Fenerbahçe"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="adres-aciklama">Adres Detayı (Opsiyonel)</Label>
            <Input
              id="adres-aciklama"
              value={adresAciklama}
              onChange={(e) => setAdresAciklama(e.target.value)}
              placeholder="Detaylı adres bilgisi..."
            />
          </div>

          {/* Koordinat Bilgileri */}
          {(latitude && longitude) && (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">
                Konum seçildi: {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </span>
            </div>
          )}

          {/* Aksiyonlar */}
          <div className="flex gap-2">
            <Button onClick={handleLocationSelect} disabled={!sehir || !ilce}>
              <Check className="h-4 w-4 mr-2" />
              Konumu Onayla
            </Button>
            <Button variant="outline" onClick={clearLocation}>
              <X className="h-4 w-4 mr-2" />
              Temizle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Harita */}
      <Card>
        <CardHeader>
          <CardTitle>Harita</CardTitle>
          <CardDescription>
            Haritaya tıklayarak veya marker'ı sürükleyerek konum seçin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            ref={mapRef}
            className="w-full h-96 rounded-lg border"
            style={{ minHeight: '384px' }}
          />
          {!mapLoaded && (
            <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Harita yükleniyor...</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seçilen Konum Özeti */}
      {(sehir || ilce || mahalle) && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Seçilen Konum</h4>
            <div className="space-y-1 text-sm text-blue-800">
              {sehir && <p><strong>Şehir:</strong> {sehir}</p>}
              {ilce && <p><strong>İlçe:</strong> {ilce}</p>}
              {mahalle && <p><strong>Mahalle:</strong> {mahalle}</p>}
              {adresAciklama && <p><strong>Adres:</strong> {adresAciklama}</p>}
              {latitude && longitude && (
                <p><strong>Koordinatlar:</strong> {latitude.toFixed(6)}, {longitude.toFixed(6)}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
