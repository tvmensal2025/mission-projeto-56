
// Configuração centralizada para variáveis de ambiente
export const config = {
  // Supabase Configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || "http://127.0.0.1:54321",
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
    projectId: "local"
  },
  
  // GitHub Configuration
  github: {
    repoUrl: import.meta.env.VITE_GITHUB_REPO_URL || "https://github.com/tvmensal2025/mission-health-nexus-99.git",
    repoName: import.meta.env.VITE_GITHUB_REPO_NAME || "mission-health-nexus-99"
  },
  
  // App Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || "Mission Health Nexus 99",
    version: import.meta.env.VITE_APP_VERSION || "1.0.0",
    environment: import.meta.env.VITE_APP_ENVIRONMENT || "development"
  },
  
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:5173",
    timeout: 10000
  },
  
  // OpenAI Configuration
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || "",
    baseURL: import.meta.env.VITE_OPENAI_BASE_URL || "https://api.openai.com/v1",
    model: import.meta.env.VITE_OPENAI_MODEL || "gpt-3.5-turbo",
    maxTokens: parseInt(import.meta.env.VITE_OPENAI_MAX_TOKENS || "1000"),
    temperature: parseFloat(import.meta.env.VITE_OPENAI_TEMPERATURE || "0.7")
  },
  
  // Feature Flags
  features: {
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === "true",
    enableDebugMode: import.meta.env.VITE_DEBUG_MODE === "true",
    enableNotifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS !== "false",
    enableGPTAssistant: import.meta.env.VITE_ENABLE_GPT_ASSISTANT === "true"
  }
} as const;

// Tipos para as configurações
export type Config = typeof config;
export type GitHubConfig = Config['github'];
export type AppConfig = Config['app'];

// Função para validar se as configurações estão corretas
export function validateConfig(): boolean {
  const required = [
    config.supabase.url,
    config.supabase.anonKey
  ];
  
  return required.every(value => value && value.length > 0);
}

// Função para obter configurações específicas do ambiente
export function getEnvironmentConfig() {
  return {
    isDevelopment: config.app.environment === 'development',
    isProduction: config.app.environment === 'production',
    isStaging: config.app.environment === 'staging'
  };
}
