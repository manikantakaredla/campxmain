import { useState, useEffect } from 'react';
import { settingService } from '../services/settingService';

// Global cache to prevent redundant API calls
let cachedSettings = null;
let fetchPromise = null;

export const useSettings = () => {
  const [settings, setSettings] = useState(cachedSettings);
  const [loading, setLoading] = useState(!cachedSettings);

  useEffect(() => {
    let isMounted = true;

    if (cachedSettings) {
      if (isMounted) {
        setSettings(cachedSettings);
        setLoading(false);
      }
      return;
    }

    if (!fetchPromise) {
      fetchPromise = settingService.getSettings().then(response => {
        if (response.settings) {
          cachedSettings = response.settings;
        }
        return response.settings;
      }).catch(error => {
        console.error('Error fetching settings:', error);
        fetchPromise = null;
        return null;
      });
    }

    fetchPromise.then((data) => {
      if (isMounted) {
        setSettings(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return { settings, loading };
};
