const axios = require('axios');

// Teste específico para envio de mensagens
async function testMessageSending() {
    console.log('📱 Testando envio de mensagens via Telezapy...\n');
    
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
    
    console.log('👤 Pessoa de teste:');
    console.log(`   Nome: ${testPerson.name}`);
    console.log(`   WhatsApp: ${testPerson.whatsapp}`);
    console.log(`   ID: ${testPerson.id}`);
    
    console.log('\n📝 Mensagem a ser enviada:');
    const message = TELEZAPY_CONFIG.messageTemplate.replace('{name}', testPerson.name);
    console.log(`   "${message}"`);
    
    console.log('\n🔗 Configurações da API:');
    console.log(`   URL: ${TELEZAPY_CONFIG.apiUrl}`);
    console.log(`   Endpoint: ${TELEZAPY_CONFIG.sendEndpoint}`);
    console.log(`   Token: ${TELEZAPY_CONFIG.apiToken.substring(0, 8)}...`);
    
    // Teste 1: Verificar se a API está acessível
    console.log('\n1️⃣ Testando conectividade com a API...');
    try {
        const testUrl = `${TELEZAPY_CONFIG.apiUrl}/health`;
        const response = await axios.get(testUrl, { timeout: 10000 });
        console.log('✅ API acessível');
        console.log(`   Status: ${response.status}`);
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            console.log('⚠️  Timeout na API (pode ser normal)');
        } else if (error.response) {
            console.log('⚠️  API respondeu com erro');
            console.log(`   Status: ${error.response.status}`);
        } else {
            console.log('⚠️  Erro de conectividade');
            console.log(`   Erro: ${error.message}`);
        }
    }
    
    // Teste 2: Tentar enviar mensagem
    console.log('\n2️⃣ Tentando enviar mensagem...');
    try {
        // Preparar dados para API
        const messageData = {
            body: message,
            connectionFrom: TELEZAPY_CONFIG.connectionFrom,
            ticketStrategy: TELEZAPY_CONFIG.ticketStrategy
        };
        
        // Headers para Telezapy
        const telezapyHeaders = {
            'accept': 'application/json',
            'Authorization': `Bearer ${TELEZAPY_CONFIG.apiToken}`,
            'Content-Type': 'application/json'
        };
        
        // URL completa para envio
        const sendUrl = `${TELEZAPY_CONFIG.apiUrl}${TELEZAPY_CONFIG.sendEndpoint}/${testPerson.whatsapp}`;
        
        console.log(`   URL de envio: ${sendUrl}`);
        console.log(`   Dados: ${JSON.stringify(messageData, null, 2)}`);
        console.log(`   Headers: ${JSON.stringify(telezapyHeaders, null, 2)}`);
        
        const response = await axios.post(sendUrl, messageData, { 
            headers: telezapyHeaders,
            timeout: 30000
        });
        
        console.log('✅ Mensagem enviada com sucesso!');
        console.log(`   Status: ${response.status}`);
        console.log(`   Resposta: ${JSON.stringify(response.data, null, 2)}`);
        
    } catch (error) {
        console.log('❌ Erro ao enviar mensagem:');
        console.log(`   Erro: ${error.message}`);
        
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Dados: ${JSON.stringify(error.response.data, null, 2)}`);
            console.log(`   Headers: ${JSON.stringify(error.response.headers, null, 2)}`);
        } else if (error.request) {
            console.log('   Nenhuma resposta recebida da API');
        }
        
        // Verificar se é erro de autenticação
        if (error.response && error.response.status === 401) {
            console.log('\n🔐 Possível problema de autenticação:');
            console.log('   - Verifique se o token está correto');
            console.log('   - Verifique se o token não expirou');
            console.log('   - Verifique se a API está ativa');
        }
        
        // Verificar se é erro de formato
        if (error.response && error.response.status === 400) {
            console.log('\n📝 Possível problema de formato:');
            console.log('   - Verifique se o número está no formato correto');
            console.log('   - Verifique se os campos obrigatórios estão presentes');
        }
    }
    
    // Teste 3: Verificar formato do número
    console.log('\n3️⃣ Verificando formato do número...');
    const cleanNumber = testPerson.whatsapp.replace(/\D/g, '');
    console.log(`   Número original: ${testPerson.whatsapp}`);
    console.log(`   Número limpo: ${cleanNumber}`);
    console.log(`   Comprimento: ${cleanNumber.length} dígitos`);
    
    if (cleanNumber.length < 10) {
        console.log('   ⚠️  Número muito curto (mínimo 10 dígitos)');
    } else if (cleanNumber.length > 15) {
        console.log('   ⚠️  Número muito longo (máximo 15 dígitos)');
    } else {
        console.log('   ✅ Formato do número parece correto');
    }
    
    console.log('\n🎯 Teste concluído!');
    console.log('💡 Verifique os logs acima para identificar possíveis problemas.');
}

// Executar teste
testMessageSending().catch(console.error);
