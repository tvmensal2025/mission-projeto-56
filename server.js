const express = require('express');
const cors = require('cors');
const { applySelectionFromFrontend } = require('./api/apply-selection.cjs');
const { testWeeklyReport } = require('./api/weekly-report.cjs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rota para aplicar seleção de IA
app.post('/api/apply-selection', async (req, res) => {
  try {
    console.log('📥 Recebendo requisição para aplicar seleção:', req.body);
    
    const { selectedModel, selectedPreset } = req.body;
    
    if (!selectedModel || !selectedPreset) {
      return res.status(400).json({
        success: false,
        error: 'Modelo e preset são obrigatórios'
      });
    }

    const result = await applySelectionFromFrontend(selectedModel, selectedPreset);
    
    console.log('📤 Enviando resposta:', result);
    res.json(result);
    
  } catch (error) {
    console.error('💥 Erro na API:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Rota para testar relatório semanal
app.post('/api/test-weekly-report', async (req, res) => {
  try {
    console.log('📥 Recebendo requisição para testar relatório semanal');
    
    const result = await testWeeklyReport();
    
    console.log('📤 Enviando resposta:', result);
    res.json(result);
    
  } catch (error) {
    console.error('💥 Erro na API:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Rota de saúde
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 APIs disponíveis:`);
  console.log(`   POST /api/apply-selection`);
  console.log(`   POST /api/test-weekly-report`);
  console.log(`   GET  /api/health`);
});

module.exports = app; 