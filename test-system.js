const axios = require('axios');

// Teste básico do sistema
async function testSystem() {
    console.log('🧪 Testando sistema de monitoramento...\n');
    
    // Teste 1: Verificar se axios está funcionando
    console.log('1️⃣ Testando axios...');
    try {
        const response = await axios.get('https://httpbin.org/get');
        console.log('✅ Axios funcionando corretamente');
    } catch (error) {
        console.log('❌ Erro no axios:', error.message);
    }
    
    // Teste 2: Verificar configurações
    console.log('\n2️⃣ Verificando configurações...');
    const AGENDOR_API_URL = 'https://api.agendor.com.br/v3/people';
    const AUTH_TOKEN = 'f1955769-0806-47e6-b682-5ebd624aa151';
    
    console.log(`🔗 URL Agendor: ${AGENDOR_API_URL}`);
    console.log(`🔑 Token: ${AUTH_TOKEN.substring(0, 8)}...`);
    
    // Teste 3: Verificar API do Agendor
    console.log('\n3️⃣ Testando API do Agendor...');
    try {
        const headers = {
            'Authorization': `Token ${AUTH_TOKEN}`,
            'Content-Type': 'application/json'
        };
        
        const response = await axios.get(AGENDOR_API_URL, { headers });
        console.log('✅ API do Agendor respondendo');
        console.log(`📊 Status: ${response.status}`);
        console.log(`📋 Dados recebidos: ${response.data ? 'Sim' : 'Não'}`);
        
        if (response.data && response.data.data) {
            console.log(`👥 Pessoas encontradas: ${response.data.data.length}`);
            if (response.data.data.length > 0) {
                const firstPerson = response.data.data[0];
                console.log(`📝 Primeira pessoa: ${firstPerson.name || 'Sem nome'}`);
                console.log(`🆔 ID: ${firstPerson.id || 'Sem ID'}`);
            }
        } else {
            console.log('⚠️  Estrutura de dados inesperada');
            console.log('Resposta:', JSON.stringify(response.data, null, 2));
        }
        
    } catch (error) {
        console.log('❌ Erro na API do Agendor:', error.message);
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Dados: ${JSON.stringify(error.response.data, null, 2)}`);
        }
    }
    
    // Teste 4: Verificar configurações do Telezapy
    console.log('\n4️⃣ Verificando configurações do Telezapy...');
    const TELEZAPY_CONFIG = {
        enabled: true,
        apiToken: 'de58e90c195fd9a9fb7106e8dc388dbe60cb82fb50eabe38dcdac635eeb7f1df2c265f0d8cd718b37b44eb5c3eb87f7718210663e2fa88e842a25fc0c4dd628092eb6e367765be1b8b637f80ba20e76a7571346b3743093da905850847386d99b1d1f324c5d5ca3023734b084f6b460447098449c1b2e6bd873aa3c026',
        apiUrl: 'https://api-krolik.telezapy.tech',
        sendEndpoint: '/api/send'
    };
    
    console.log(`📱 Telezapy habilitado: ${TELEZAPY_CONFIG.enabled}`);
    console.log(`🔗 URL: ${TELEZAPY_CONFIG.apiUrl}`);
    console.log(`🔑 Token: ${TELEZAPY_CONFIG.apiToken.substring(0, 8)}...`);
    
    // Teste 5: Verificar API do Telezapy
    console.log('\n5️⃣ Testando API do Telezapy...');
    try {
        const testUrl = `${TELEZAPY_CONFIG.apiUrl}/health`;
        const response = await axios.get(testUrl, { timeout: 5000 });
        console.log('✅ API do Telezapy respondendo');
        console.log(`📊 Status: ${response.status}`);
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            console.log('⚠️  Timeout na API do Telezapy (pode ser normal)');
        } else {
            console.log('⚠️  API do Telezapy não respondeu (pode ser normal)');
        }
    }
    
    console.log('\n🎯 Testes concluídos!');
    console.log('💡 Se todos os testes passaram, o sistema deve funcionar corretamente.');
}

// Executar testes
testSystem().catch(console.error);
