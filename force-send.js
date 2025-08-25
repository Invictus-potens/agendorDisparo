const axios = require('axios');

// Script para forçar o envio de uma mensagem
async function forceSendMessage() {
    console.log('🚀 Forçando envio de mensagem de teste...\n');
    
    // Configurações do Telezapy
    const TELEZAPY_CONFIG = {
        enabled: true,
        apiToken: 'de58e90c195fd9a9fb7106e8dc388dbe60cb82fb50eabe38dcdac635eeb7f1df2c265f0d8cd718b37b44eb5c3eb87f7718210663e2fa88e842a25fc0c4dd628092eb6e367765be1b8b637f80ba20e76a7571346b3743093da905850847386d99b1d1f324c5d5ca3023734b084f6b460447098449c1b2e6bd873aa3c026',
        apiUrl: 'https://api-krolik.telezapy.tech',
        sendEndpoint: '/api/send',
        messageTemplate: "Olá {name}, vi que se interessou em nossos produtos.",
        connectionFrom: 6,
        ticketStrategy: "create"
    };
    
    // Dados de teste
    const testPerson = {
        id: 62222475,
        name: "Felipe",
        whatsapp: "5519995068303"
    };
    
    console.log('👤 Enviando mensagem para:');
    console.log(`   Nome: ${testPerson.name}`);
    console.log(`   WhatsApp: ${testPerson.whatsapp}`);
    
    try {
        // Preparar mensagem
        const message = TELEZAPY_CONFIG.messageTemplate.replace('{name}', testPerson.name);
        console.log(`📝 Mensagem: "${message}"`);
        
        // Preparar dados para API
        const messageData = {
            body: message,
            connectionFrom: TELEZAPY_CONFIG.connectionFrom,
            ticketStrategy: TELEZAPY_CONFIG.ticketStrategy
        };
        
        // Headers
        const headers = {
            'accept': 'application/json',
            'Authorization': `Bearer ${TELEZAPY_CONFIG.apiToken}`,
            'Content-Type': 'application/json'
        };
        
        // URL de envio
        const sendUrl = `${TELEZAPY_CONFIG.apiUrl}${TELEZAPY_CONFIG.sendEndpoint}/${testPerson.whatsapp}`;
        console.log(`🔗 URL: ${sendUrl}`);
        
        console.log('\n📤 Enviando...');
        const response = await axios.post(sendUrl, messageData, { 
            headers,
            timeout: 30000
        });
        
        console.log('✅ Mensagem enviada com sucesso!');
        console.log(`📊 Status: ${response.status}`);
        console.log(`📋 Resposta: ${JSON.stringify(response.data, null, 2)}`);
        
    } catch (error) {
        console.log('❌ Erro ao enviar mensagem:');
        console.log(`   Erro: ${error.message}`);
        
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Dados: ${JSON.stringify(error.response.data, null, 2)}`);
        }
    }
}

// Executar
forceSendMessage().catch(console.error);
