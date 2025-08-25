// 🔐 CREDENCIAIS DE EXEMPLO
// Copie este arquivo para credentials.js e preencha com suas credenciais reais

module.exports = {
    // 🔑 Agendor CRM
    agendor: {
        authToken: 'seu-token-agendor-aqui',
        apiUrl: 'https://api.agendor.com.br/v3/people'
    },
    
    // 📱 Telezapy API
    telezapy: {
        enabled: true,
        apiToken: 'seu-token-telezapy-aqui',
        apiUrl: 'https://api-krolik.telezapy.tech',
        sendEndpoint: '/api/send',
        messageTemplate: "Olá {name}, vi que se interessou em nossos produtos.",
        connectionFrom: 6,
        ticketStrategy: "create"
    }
};

// 📝 INSTRUÇÕES:
// 1. Copie este arquivo para credentials.js
// 2. Substitua os valores pelos seus tokens reais
// 3. NUNCA commite o arquivo credentials.js no Git
// 4. Use este arquivo como referência para configuração
