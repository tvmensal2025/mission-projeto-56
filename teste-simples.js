// Teste simples do Sistema de Missão do Dia
import http from 'http';

function testarAplicacao() {
  console.log('🚀 Testando aplicação...');
  
  const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📄 Conteúdo da página carregado');
      
      // Verificar se há elementos da Missão do Dia
      if (data.includes('Missão do Dia')) {
        console.log('✅ Sistema de Missão do Dia encontrado na página');
      } else {
        console.log('⚠️ Sistema de Missão do Dia não encontrado');
      }
      
      if (data.includes('RITUAL DA MANHÃ')) {
        console.log('✅ Seção RITUAL DA MANHÃ encontrada');
      }
      
      if (data.includes('HÁBITOS DO DIA')) {
        console.log('✅ Seção HÁBITOS DO DIA encontrada');
      }
      
      if (data.includes('MENTE & EMOÇÕES')) {
        console.log('✅ Seção MENTE & EMOÇÕES encontrada');
      }
      
      console.log('🎉 Teste concluído!');
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Erro: ${e.message}`);
  });

  req.end();
}

testarAplicacao(); 