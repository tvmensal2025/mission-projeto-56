// Cliente Supabase para desenvolvimento local
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Configuração para Supabase local
const LOCAL_SUPABASE_URL = "http://127.0.0.1:54321";
const LOCAL_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

export const supabaseLocal = createClient<Database>(LOCAL_SUPABASE_URL, LOCAL_SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Função para verificar se estamos em desenvolvimento local
export const isLocalDevelopment = () => {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
};

// Cliente dinâmico baseado no ambiente
export const getSupabaseClient = () => {
  if (isLocalDevelopment()) {
    console.log('🔧 Usando Supabase Local');
    return supabaseLocal;
  } else {
    console.log('🌐 Usando Supabase Remoto');
    return createClient<Database>(
      import.meta.env.VITE_SUPABASE_URL_MAIN || "https://hlrkoyywjpckdotimtik.supabase.co",
      import.meta.env.VITE_SUPABASE_ANON_KEY_MAIN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI"
    );
  }
}; 