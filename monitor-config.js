// 📋 Configuração do Sistema de Monitoramento de Pessoas
// Copie este arquivo para config.js e personalize conforme necessário

module.exports = {
    // 🔑 Configurações de autenticação do Agendor
    agendor: {
        // Token de autenticação (encontre em Menu > Integrações)
        authToken: 'f1955769-0806-47e6-b682-5ebd624aa151',
        
        // URL base da API
        apiUrl: 'https://api.agendor.com.br/v3',
        
        // Endpoint para pessoas
        peopleEndpoint: '/people'
    },
    
    // 📱 Configurações da API do Telezapy
    telezapy: {
        // Habilitar envio automático de mensagens
        enabled: true,
        
        // Token de autenticação
        apiToken: 'de58e90c195fd9a9fb7106e8dc388dbe60cb82fb50eabe38dcdac635eeb7f1df2c265f0d8cd718b37b44eb5c3eb87f7718210663e2fa88e842a25fc0c4dd628092eb6e367765be1b8b637f80ba20e76a7571346b3743093da905850847386d99b1d1f324c5d5ca3023734b084f6b460447098449c1b2e6bd873aa3c026',
        
        // URL base da API
        apiUrl: 'https://api-krolik.telezapy.tech',
        
        // Endpoint para envio de mensagens
        sendEndpoint: '/api/send',
        
        // Configurações da mensagem
        message: {
            // Template da mensagem (use {name} para o nome da pessoa)
            template: "Olá {name}, vi que se interessou em nossos produtos.",
            
            // Configurações adicionais da API
            connectionFrom: 6,
            ticketStrategy: "create"
        },
        
        // Configurações de envio
        sending: {
            // Enviar mensagem imediatamente quando pessoa for detectada
            sendImmediately: true,
            
            // Delay entre envios (em milissegundos) - 0 = sem delay
            delayBetweenMessages: 0,
            
            // Máximo de tentativas em caso de falha
            maxRetries: 3,
            
            // Delay entre tentativas (em milissegundos)
            retryDelay: 5000
        }
    },
    
    // ⏰ Configurações de monitoramento
    monitoring: {
        // Intervalo entre verificações (em milissegundos)
        checkInterval: 30000, // 30 segundos
        
        // Habilitar logs detalhados
        enableLogs: true,
        
        // Verificar apenas pessoas criadas após esta data (opcional)
        // Formato: '2024-01-01T00:00:00.000Z'
        startDate: null,
        
        // Máximo de pessoas a verificar por vez
        maxPeoplePerRequest: 100
    },
    
    // 📁 Configurações de armazenamento
    storage: {
        // Arquivo principal de dados
        dataFile: './people-data.json',
        
        // Diretório para backups
        backupDir: './backups',
        
        // Fazer backup automático a cada X verificações
        backupInterval: 10,
        
        // Manter histórico de X dias
        keepHistoryDays: 30
    },
    
    // 🎯 Campos obrigatórios para monitorar
    requiredFields: {
        // Sempre incluir nome
        name: true,
        
        // Sempre incluir WhatsApp
        whatsapp: true,
        
        // Campos opcionais
        email: false,
        phone: false,
        company: false,
        position: false
    },
    
    // 🔍 Configurações de detecção de duplicatas
    duplicateDetection: {
        // Verificar por ID (mais confiável)
        checkById: true,
        
        // Verificar por nome + WhatsApp
        checkByNameAndWhatsApp: true,
        
        // Verificar apenas por WhatsApp
        checkByWhatsAppOnly: true,
        
        // Verificar por email (se disponível)
        checkByEmail: false
    },
    
    // 📊 Configurações de relatórios
    reporting: {
        // Exibir estatísticas a cada verificação
        showStatsOnCheck: true,
        
        // Salvar relatório de pessoas novas
        saveNewPeopleReport: true,
        
        // Formato do relatório: 'json', 'csv', 'both'
        reportFormat: 'both',
        
        // Incluir timestamp no nome dos arquivos
        includeTimestamp: true
    },
    
    // 🔒 Configurações de segurança
    security: {
        // Validar token antes de cada requisição
        validateToken: true,
        
        // Máximo de tentativas em caso de erro
        maxRetries: 3,
        
        // Delay entre tentativas (em milissegundos)
        retryDelay: 5000
    },
    
    // 📧 Configurações de notificação (opcional)
    notifications: {
        // Enviar notificação quando pessoa nova for encontrada
        onNewPerson: false,
        
        // Email
        email: {
            enabled: false,
            smtp: {
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: 'seu-email@gmail.com',
                    pass: 'sua-senha'
                }
            },
            from: 'monitor@seudominio.com',
            to: 'admin@seudominio.com'
        },
        
        // Slack
        slack: {
            enabled: false,
            webhookUrl: 'https://hooks.slack.com/services/...',
            channel: '#monitoramento'
        }
    },
    
    // 🗄️ Configurações de banco de dados (opcional)
    database: {
        // Usar banco de dados em vez de arquivo JSON
        enabled: false,
        
        // Tipo de banco
        type: 'sqlite', // 'sqlite', 'mysql', 'postgresql'
        
        // Configurações de conexão
        connection: {
            // Para SQLite
            filename: './people-monitor.db',
            
            // Para MySQL/PostgreSQL
            // host: 'localhost',
            // port: 3306,
            // database: 'people_monitor',
            // username: 'user',
            // password: 'pass'
        }
    },
    
    // 🔄 Configurações de sincronização
    sync: {
        // Sincronizar com sistema externo
        enabled: false,
        
        // URL da API externa
        externalApiUrl: 'https://api.externa.com/webhook',
        
        // Headers para API externa
        headers: {
            'Authorization': 'Bearer seu-token',
            'Content-Type': 'application/json'
        },
        
        // Campos a enviar para API externa
        fieldsToSync: ['name', 'whatsapp', 'email', 'company']
    }
};
