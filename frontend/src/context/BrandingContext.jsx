import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';

const BrandingContext = createContext({
  name: 'Restaurant',
  primaryColor: '#E63946',
  logoUrl: null,
  supportEmail: null,
  timezone: 'UTC',
  loading: true,
});

export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState({
    name: 'Restaurant',
    primaryColor: '#E63946',
    logoUrl: null,
    supportEmail: null,
    timezone: 'UTC',
    location: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    settingsAPI.getBranding()
      .then((data) => {
        setBranding({
          name: data.name || 'Restaurant',
          primaryColor: data.primaryColor || '#E63946',
          logoUrl: data.logoUrl || null,
          supportEmail: data.supportEmail || null,
          timezone: data.timezone || 'UTC',
          location: data.location || null,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <BrandingContext.Provider value={{ ...branding, loading }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  return useContext(BrandingContext);
}
