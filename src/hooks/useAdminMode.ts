import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';

export const useAdminMode = (user: User | null) => {
  const [isAdmin, setIsAdmin] = useState(true); // Sempre admin
  const [adminModeEnabled, setAdminModeEnabled] = useState(true); // Sempre habilitado

  useEffect(() => {
    if (user) {
      // Qualquer usuário logado é admin agora
      setIsAdmin(true);
      setAdminModeEnabled(true);
    } else {
      setIsAdmin(false);
      setAdminModeEnabled(false);
    }
  }, [user]);

  const toggleAdminMode = () => {
    // Permite alternar mesmo sem ser admin original
    setAdminModeEnabled(!adminModeEnabled);
  };

  return {
    isAdmin,
    adminModeEnabled,
    toggleAdminMode
  };
};