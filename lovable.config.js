module.exports = {
  // Configurações específicas para deploy na Lovable
  build: {
    command: 'npm run build:prod',
    output: 'dist',
    install: 'npm ci'
  },
  
  // Configurações de ambiente
  env: {
    NODE_ENV: 'production',
    NODE_VERSION: '18'
  },
  
  // Arquivos e pastas a serem ignorados
  ignore: [
    'node_modules',
    '.git',
    'dist',
    'build',
    '*.log',
    '.env.local',
    '.env.production',
    'coverage',
    '.nyc_output',
    'test-*.js',
    'teste-*.js',
    '*.md',
    'docs/',
    'supabase/functions/',
    'supabase/migrations/'
  ],
  
  // Configurações de cache
  cache: {
    paths: [
      'node_modules/.cache',
      '.vite'
    ]
  },
  
  // Configurações de rede
  network: {
    timeout: 300000 // 5 minutos
  }
}; 