const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjk3Mjk3NCwiZXhwIjoyMDQ4NTQ4OTc0fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Função para obter configurações de IA
async function getAIConfigurations() {
  try {
    console.log('🔍 Buscando configurações de IA...');
    
    const { data, error } = await supabase
      .from('ai_configurations')
      .select('*');

    if (error) {
      console.error('❌ Erro ao buscar configurações:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Configurações encontradas:', data?.length || 0);
    return { success: true, data };
  } catch (error) {
    console.error('💥 Erro fatal:', error);
    return { success: false, error: error.message };
  }
}

// Função para atualizar configurações para máximo
async function updateToMaximo() {
  try {
    console.log('🚀 Atualizando configurações para máximo...');
    
    const maximoConfigs = [
      {
        functionality: 'chat_daily',
        service: 'openai',
        model: 'gpt-4o',
        max_tokens: 4000,
        temperature: 0.8,
        is_enabled: true,
        preset_level: 'maximo'
      },
      {
        functionality: 'weekly_report',
        service: 'openai',
        model: 'o3-PRO',
        max_tokens: 8192,
        temperature: 0.8,
        is_enabled: true,
        preset_level: 'maximo'
      },
      {
        functionality: 'monthly_report',
        service: 'openai',
        model: 'o3-PRO',
        max_tokens: 8192,
        temperature: 0.7,
        is_enabled: true,
        preset_level: 'maximo'
      },
      {
        functionality: 'medical_analysis',
        service: 'openai',
        model: 'o3-PRO',
        max_tokens: 8192,
        temperature: 0.3,
        is_enabled: true,
        preset_level: 'maximo'
      },
      {
        functionality: 'preventive_analysis',
        service: 'openai',
        model: 'o3-PRO',
        max_tokens: 8192,
        temperature: 0.5,
        is_enabled: true,
        preset_level: 'maximo'
      }
    ];

    // Primeiro, limpar configurações existentes
    const { error: deleteError } = await supabase
      .from('ai_configurations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) {
      console.error('❌ Erro ao limpar configurações:', deleteError);
    } else {
      console.log('✅ Configurações antigas removidas');
    }

    // Inserir novas configurações
    const results = [];
    for (const config of maximoConfigs) {
      try {
        const { error } = await supabase
          .from('ai_configurations')
          .insert(config);

        if (error) {
          console.error(`❌ Erro ao inserir ${config.functionality}:`, error);
          results.push({ functionality: config.functionality, success: false, error: error.message });
        } else {
          console.log(`✅ ${config.functionality} atualizado`);
          results.push({ functionality: config.functionality, success: true });
        }
      } catch (error) {
        console.error(`💥 Erro fatal ao inserir ${config.functionality}:`, error);
        results.push({ functionality: config.functionality, success: false, error: error.message });
      }
    }

    return { success: true, results };
  } catch (error) {
    console.error('💥 Erro fatal:', error);
    return { success: false, error: error.message };
  }
}

// Função para testar configurações
async function testAIConfigurations() {
  try {
    console.log('🧪 Testando configurações de IA...');
    
    const { data, error } = await supabase
      .from('ai_configurations')
      .select('functionality, model, max_tokens, temperature, preset_level');

    if (error) {
      return { success: false, error: error.message };
    }

    console.log('📊 Configurações atuais:');
    data.forEach(config => {
      console.log(`- ${config.functionality}: ${config.model} (${config.max_tokens} tokens, temp ${config.temperature})`);
    });

    return { success: true, data };
  } catch (error) {
    console.error('💥 Erro fatal:', error);
    return { success: false, error: error.message };
  }
}

// Exportar funções
module.exports = {
  getAIConfigurations,
  updateToMaximo,
  testAIConfigurations
};

// Se executado diretamente
if (require.main === module) {
  async function main() {
    console.log('🔧 API de Configurações de IA');
    console.log('='.repeat(50));
    
    // Testar configurações atuais
    console.log('\n1. Testando configurações atuais...');
    const testResult = await testAIConfigurations();
    console.log('Resultado:', testResult);
    
    // Atualizar para máximo
    console.log('\n2. Atualizando para máximo...');
    const updateResult = await updateToMaximo();
    console.log('Resultado:', updateResult);
    
    // Verificar configurações finais
    console.log('\n3. Verificando configurações finais...');
    const finalResult = await testAIConfigurations();
    console.log('Resultado:', finalResult);
  }
  
  main().catch(console.error);
} 