const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Configurações
const AGENDOR_API_URL = 'https://api.agendor.com.br/v3/people';
const AUTH_TOKEN = 'f1955769-0806-47e6-b682-5ebd624aa151';
const DATA_FILE = './people-data.json';
const CHECK_INTERVAL = 30000; // 30 segundos

// Configurações do Telezapy
const TELEZAPY_CONFIG = {
    enabled: true,
    apiToken: 'de58e90c195fd9a9fb7106e8dc388dbe60cb82fb50eabe38dcdac635eeb7f1df2c265f0d8cd718b37b44eb5c3eb87f7718210663e2fa88e842a25fc0c4dd628092eb6e367765be1b8b637f80ba20e76a7571346b3743093da905850847386d99b1d1f324c5d5ca3023734b084f6b460447098449c1b2e6bd873aa3c026',
    apiUrl: 'https://api-krolik.telezapy.tech',
    sendEndpoint: '/api/send',
    messageTemplate: "Olá {name}, vi que se interessou em nossos produtos.",
    connectionFrom: 6,
    ticketStrategy: "create",
    maxRetries: 3,
    retryDelay: 5000
};

// Headers para autenticação
const headers = {
    'Authorization': `Token ${AUTH_TOKEN}`,
    'Content-Type': 'application/json'
};

// Estrutura de dados para armazenar pessoas
let peopleData = {
    lastCheck: null,
    totalPeople: 0,
    newPeople: [],
    allPeople: [],
    isFirstRun: true, // Flag para identificar primeira execução
    messagesSent: [], // Histórico de mensagens enviadas
    messagesFailed: [] // Histórico de mensagens que falharam
};

// Função para carregar dados existentes do arquivo JSON
async function loadExistingData() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        peopleData = JSON.parse(data);
        
        // Verificar se é primeira execução
        if (peopleData.isFirstRun === undefined) {
            peopleData.isFirstRun = true;
        }
        
        // Garantir que todos os arrays existam
        if (!peopleData.allPeople) peopleData.allPeople = [];
        if (!peopleData.newPeople) peopleData.newPeople = [];
        if (!peopleData.messagesSent) peopleData.messagesSent = [];
        if (!peopleData.messagesFailed) peopleData.messagesFailed = [];
        if (!peopleData.totalPeople) peopleData.totalPeople = 0;
        
        console.log(`📂 Dados carregados: ${peopleData.allPeople.length} pessoas existentes`);
        console.log(`🔄 Primeira execução: ${peopleData.isFirstRun ? 'Sim' : 'Não'}`);
        return true;
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('📂 Arquivo de dados não encontrado. Criando novo arquivo...');
            peopleData.isFirstRun = true;
            return false;
        } else {
            console.error('❌ Erro ao carregar dados:', error.message);
            return false;
        }
    }
}

// Função para salvar dados no arquivo JSON
async function saveData() {
    try {
        peopleData.lastCheck = new Date().toISOString();
        await fs.writeFile(DATA_FILE, JSON.stringify(peopleData, null, 2));
        console.log('💾 Dados salvos com sucesso');
    } catch (error) {
        console.error('❌ Erro ao salvar dados:', error.message);
    }
}

// Função para buscar pessoas da API do Agendor
async function fetchPeopleFromAgendor() {
    try {
        console.log('🔍 Buscando pessoas da API do Agendor...');
        
        const response = await axios.get(AGENDOR_API_URL, { headers });
        
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
            const people = response.data.data;
            console.log(`✅ ${people.length} pessoas encontradas na API`);
            return people;
        } else {
            console.log('⚠️  Nenhuma pessoa encontrada na API ou formato inválido');
            console.log('Resposta da API:', JSON.stringify(response.data, null, 2));
            return [];
        }
    } catch (error) {
        console.error('❌ Erro ao buscar pessoas da API:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Dados:', error.response.data);
        }
        return [];
    }
}

// Função para extrair dados relevantes de uma pessoa
function extractPersonData(person) {
    // Verificar se a pessoa é válida
    if (!person || typeof person !== 'object') {
        console.log('⚠️  Dados de pessoa inválidos');
        return {
            id: null,
            name: 'Pessoa inválida',
            whatsapp: null,
            email: null,
            phone: null,
            company: null,
            position: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    }
    
    return {
        id: person.id || null,
        name: person.name || 'Sem nome',
        whatsapp: extractWhatsApp(person),
        email: person.contact?.email || null,
        phone: person.contact?.phone || null,
        company: person.organization?.name || null,
        position: person.position || null,
        created_at: person.created_at || new Date().toISOString(),
        updated_at: person.updated_at || new Date().toISOString()
    };
}

// Função para extrair WhatsApp de diferentes campos possíveis
function extractWhatsApp(person) {
    // Verificar se a pessoa é válida
    if (!person || typeof person !== 'object') {
        return null;
    }
    
    // Verificar diferentes campos onde o WhatsApp pode estar
    const possibleFields = [
        person.contact?.whatsapp,
        person.contact?.phone,
        person.whatsapp,
        person.phone
    ];
    
    for (const field of possibleFields) {
        if (field) {
            // Limpar e formatar o número (apenas números)
            const cleanNumber = field.toString().replace(/\D/g, '');
            if (cleanNumber.length >= 10) {
                return cleanNumber;
            }
        }
    }
    
    return null;
}

// Função para verificar se uma pessoa já existe
function personExists(newPerson, existingPeople) {
    // Verificar se os parâmetros são válidos
    if (!newPerson || !existingPeople || !Array.isArray(existingPeople)) {
        return false;
    }
    
    return existingPeople.some(existing => {
        // Verificar por ID (mais confiável) - PRINCIPAL CRITÉRIO
        if (existing.id === newPerson.id) {
            console.log(`🔍 ID igual encontrado: ${existing.id} = ${newPerson.id}`);
            return true;
        }
        
        // Verificar por nome + WhatsApp (apenas se ambos forem únicos)
        if (existing.name === newPerson.name && 
            existing.whatsapp === newPerson.whatsapp && 
            existing.whatsapp !== null &&
            existing.name !== null) {
            console.log(`🔍 Nome + WhatsApp igual: ${existing.name} + ${existing.whatsapp}`);
            return true;
        }
        
        // NÃO verificar apenas por WhatsApp - pode causar falsos positivos
        // if (existing.whatsapp && existing.whatsapp === newPerson.whatsapp) {
        //     return true;
        // }
        
        return false;
    });
}

// Função para enviar mensagem via Telezapy
async function sendTelezapyMessage(personData, retryCount = 0) {
    console.log(`\n🔍 DEBUG: Iniciando envio de mensagem para ${personData.name}`);
    console.log(`🔍 DEBUG: Telezapy habilitado: ${TELEZAPY_CONFIG.enabled}`);
    console.log(`🔍 DEBUG: WhatsApp: ${personData.whatsapp}`);
    
    if (!TELEZAPY_CONFIG.enabled) {
        console.log('⚠️  Telezapy desabilitado nas configurações');
        return false;
    }
    
    if (!personData.whatsapp) {
        console.log(`⚠️  Pessoa ${personData.name} não possui WhatsApp. Pulando envio.`);
        return false;
    }
    
    try {
        // Preparar mensagem personalizada
        const message = TELEZAPY_CONFIG.messageTemplate.replace('{name}', personData.name);
        
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
        const sendUrl = `${TELEZAPY_CONFIG.apiUrl}${TELEZAPY_CONFIG.sendEndpoint}/${personData.whatsapp}`;
        
        console.log(`📱 Enviando mensagem para ${personData.name} (${personData.whatsapp})...`);
        console.log(`📝 Mensagem: "${message}"`);
        console.log(`🔗 URL: ${sendUrl}`);
        console.log(`📋 Dados: ${JSON.stringify(messageData, null, 2)}`);
        console.log(`🔑 Headers: ${JSON.stringify(telezapyHeaders, null, 2)}`);
        
        const response = await axios.post(sendUrl, messageData, { 
            headers: telezapyHeaders,
            timeout: 30000
        });
        
        console.log(`🔍 DEBUG: Resposta recebida - Status: ${response.status}`);
        console.log(`🔍 DEBUG: Resposta completa: ${JSON.stringify(response.data, null, 2)}`);
        
        if (response.status === 200 || response.status === 201) {
            console.log(`✅ Mensagem enviada com sucesso para ${personData.name}!`);
            
            // Registrar sucesso
            const successRecord = {
                personId: personData.id,
                name: personData.name,
                whatsapp: personData.whatsapp,
                message: message,
                sentAt: new Date().toISOString(),
                status: 'success',
                response: response.data
            };
            
            if (!peopleData.messagesSent) peopleData.messagesSent = [];
            peopleData.messagesSent.push(successRecord);
            
            return true;
        } else {
            throw new Error(`Status inesperado: ${response.status}`);
        }
        
    } catch (error) {
        console.error(`❌ Erro ao enviar mensagem para ${personData.name}:`, error.message);
        
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Dados:`, error.response.data);
            console.error(`   Headers:`, error.response.headers);
        } else if (error.request) {
            console.error(`   Nenhuma resposta recebida da API`);
        }
        
        // Registrar falha
        const failureRecord = {
            personId: personData.id,
            name: personData.name,
            whatsapp: personData.whatsapp,
            message: TELEZAPY_CONFIG.messageTemplate.replace('{name}', personData.name),
            failedAt: new Date().toISOString(),
            status: 'failed',
            error: error.message,
            retryCount: retryCount
        };
        
        if (!peopleData.messagesFailed) peopleData.messagesFailed = [];
        peopleData.messagesFailed.push(failureRecord);
        
        // Tentar novamente se ainda não excedeu o limite
        if (retryCount < TELEZAPY_CONFIG.maxRetries) {
            console.log(`🔄 Tentativa ${retryCount + 1} de ${TELEZAPY_CONFIG.maxRetries}. Aguardando ${TELEZAPY_CONFIG.retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, TELEZAPY_CONFIG.retryDelay));
            return await sendTelezapyMessage(personData, retryCount + 1);
        }
        
        return false;
    }
}

// Função para encontrar pessoas novas
function findNewPeople(currentPeople, existingPeople) {
    const newPeople = [];
    
    // Garantir que os arrays existam
    if (!currentPeople || !Array.isArray(currentPeople)) {
        console.log('⚠️  Lista de pessoas atual inválida');
        return newPeople;
    }
    
    if (!existingPeople || !Array.isArray(existingPeople)) {
        existingPeople = [];
    }
    
    for (const person of currentPeople) {
        const personData = extractPersonData(person);
        
        if (!personExists(personData, existingPeople)) {
            newPeople.push(personData);
            console.log(`🆕 Nova pessoa encontrada: ${personData.name} (${personData.whatsapp || 'Sem WhatsApp'})`);
        }
    }
    
    return newPeople;
}

// Função principal para verificar pessoas
async function checkForNewPeople() {
    try {
        console.log('\n🕐 Verificando pessoas...');
        console.log(`📅 Última verificação: ${peopleData.lastCheck || 'Nunca'}`);
        console.log(`🔄 Primeira execução: ${peopleData.isFirstRun ? 'Sim' : 'Não'}`);
        
        // Buscar pessoas da API
        const currentPeople = await fetchPeopleFromAgendor();
        
        if (currentPeople.length === 0) {
            console.log('⚠️  Nenhuma pessoa encontrada. Aguardando próxima verificação...');
            return;
        }
        
        // Encontrar pessoas novas
        const newPeople = findNewPeople(currentPeople, peopleData.allPeople || []);
        
        if (newPeople && newPeople.length > 0) {
            console.log(`🎉 ${newPeople.length} nova(s) pessoa(s) encontrada(s)!`);
            
                    // Adicionar pessoas novas aos dados
        if (!peopleData.newPeople) peopleData.newPeople = [];
        if (!peopleData.allPeople) peopleData.allPeople = [];
        if (!peopleData.messagesSent) peopleData.messagesSent = [];
        if (!peopleData.messagesFailed) peopleData.messagesFailed = [];
        
        peopleData.newPeople = [...peopleData.newPeople, ...newPeople];
        peopleData.allPeople = [...peopleData.allPeople, ...newPeople];
        peopleData.totalPeople = peopleData.allPeople.length;
            
            // Enviar mensagens para pessoas novas (apenas se não for primeira execução)
            console.log(`🔍 DEBUG: isFirstRun = ${peopleData.isFirstRun}`);
            console.log(`🔍 DEBUG: TELEZAPY_CONFIG.enabled = ${TELEZAPY_CONFIG.enabled}`);
            
            if (!peopleData.isFirstRun && TELEZAPY_CONFIG.enabled) {
                console.log('\n📱 Enviando mensagens de boas-vindas...');
                console.log(`🔍 DEBUG: ${newPeople.length} pessoas para enviar mensagem`);
                
                for (const person of newPeople) {
                    console.log(`🔍 DEBUG: Processando pessoa: ${person.name} (${person.whatsapp})`);
                    if (person.whatsapp) {
                        console.log(`🔍 DEBUG: Chamando sendTelezapyMessage para ${person.name}`);
                        const result = await sendTelezapyMessage(person);
                        console.log(`🔍 DEBUG: Resultado do envio: ${result}`);
                        
                        // Pequeno delay entre envios para não sobrecarregar a API
                        if (TELEZAPY_CONFIG.sending?.delayBetweenMessages > 0) {
                            await new Promise(resolve => setTimeout(resolve, TELEZAPY_CONFIG.sending.delayBetweenMessages));
                        }
                    } else {
                        console.log(`⚠️  ${person.name} não possui WhatsApp. Mensagem não enviada.`);
                    }
                }
            } else if (peopleData.isFirstRun) {
                console.log('🔄 Primeira execução: Mensagens não serão enviadas para pessoas existentes.');
            } else if (!TELEZAPY_CONFIG.enabled) {
                console.log('⚠️  Telezapy está desabilitado nas configurações');
            }
            
            // Marcar que não é mais primeira execução
            peopleData.isFirstRun = false;
            
            // Salvar dados
            await saveData();
            
            // Exibir resumo das pessoas novas
            console.log('\n📋 Resumo das pessoas novas:');
            newPeople.forEach((person, index) => {
                console.log(`${index + 1}. ${person.name} - WhatsApp: ${person.whatsapp || 'Não informado'}`);
            });
            
        } else {
            console.log('✅ Nenhuma pessoa nova encontrada');
            peopleData.totalPeople = currentPeople.length;
            
            // Marcar que não é mais primeira execução se ainda for
            if (peopleData.isFirstRun) {
                peopleData.isFirstRun = false;
                console.log('🔄 Primeira execução concluída. Agora mensagens serão enviadas para novas pessoas.');
            }
        }
        
        console.log(`📊 Total de pessoas monitoradas: ${peopleData.totalPeople || 0}`);
        console.log(`📊 Total de pessoas novas: ${(peopleData.newPeople || []).length}`);
        console.log(`📱 Mensagens enviadas: ${(peopleData.messagesSent || []).length}`);
        console.log(`❌ Mensagens falharam: ${(peopleData.messagesFailed || []).length}`);
        
    } catch (error) {
        console.error('❌ Erro durante verificação:', error.message);
    }
}

// Função para exibir estatísticas
function displayStats() {
    console.log('\n📊 ESTATÍSTICAS DO MONITORAMENTO');
    console.log('─'.repeat(50));
    console.log(`📅 Última verificação: ${peopleData.lastCheck || 'Nunca'}`);
    console.log(`👥 Total de pessoas: ${peopleData.totalPeople || 0}`);
    console.log(`🆕 Pessoas novas: ${(peopleData.newPeople || []).length}`);
    console.log(`🔄 Primeira execução: ${peopleData.isFirstRun ? 'Sim' : 'Não'}`);
    console.log(`📱 Mensagens enviadas: ${(peopleData.messagesSent || []).length}`);
    console.log(`❌ Mensagens falharam: ${(peopleData.messagesFailed || []).length}`);
    console.log(`📁 Arquivo de dados: ${DATA_FILE}`);
    console.log(`⏰ Intervalo de verificação: ${CHECK_INTERVAL / 1000} segundos`);
    console.log(`📱 Telezapy habilitado: ${TELEZAPY_CONFIG.enabled ? 'Sim' : 'Não'}`);
    console.log('─'.repeat(50));
}

// Função para exibir pessoas novas
function displayNewPeople() {
    if (!peopleData.newPeople || peopleData.newPeople.length === 0) {
        console.log('📭 Nenhuma pessoa nova encontrada ainda');
        return;
    }
    
    console.log('\n🆕 PESSOAS NOVAS ENCONTRADAS:');
    console.log('─'.repeat(50));
    
    peopleData.newPeople.forEach((person, index) => {
        console.log(`${index + 1}. ${person.name}`);
        console.log(`   📱 WhatsApp: ${person.whatsapp || 'Não informado'}`);
        console.log(`   📧 Email: ${person.email || 'Não informado'}`);
        console.log(`   🏢 Empresa: ${person.company || 'Não informada'}`);
        console.log(`   💼 Cargo: ${person.position || 'Não informado'}`);
        console.log(`   📅 Criado em: ${person.created_at}`);
        console.log('   ─'.repeat(30));
    });
}

// Função para exibir histórico de mensagens
function displayMessageHistory() {
    console.log('\n📱 HISTÓRICO DE MENSAGENS:');
    console.log('─'.repeat(50));
    
    if ((!peopleData.messagesSent || peopleData.messagesSent.length === 0) && 
        (!peopleData.messagesFailed || peopleData.messagesFailed.length === 0)) {
        console.log('📭 Nenhuma mensagem enviada ainda');
        return;
    }
    
    if (peopleData.messagesSent && peopleData.messagesSent.length > 0) {
        console.log('\n✅ MENSAGENS ENVIADAS COM SUCESSO:');
        peopleData.messagesSent.forEach((msg, index) => {
            console.log(`${index + 1}. ${msg.name} (${msg.whatsapp})`);
            console.log(`   📝 "${msg.message}"`);
            console.log(`   📅 ${msg.sentAt}`);
            console.log('   ─'.repeat(20));
        });
    }
    
    if (peopleData.messagesFailed && peopleData.messagesFailed.length > 0) {
        console.log('\n❌ MENSAGENS QUE FALHARAM:');
        peopleData.messagesFailed.forEach((msg, index) => {
            console.log(`${index + 1}. ${msg.name} (${msg.whatsapp})`);
            console.log(`   📝 "${msg.message}"`);
            console.log(`   ❌ Erro: ${msg.error}`);
            console.log(`   📅 ${msg.failedAt}`);
            console.log('   ─'.repeat(20));
        });
    }
}

// Função para limpar dados antigos (opcional)
async function clearOldData() {
    try {
        peopleData.newPeople = [];
        peopleData.allPeople = [];
        peopleData.totalPeople = 0;
        peopleData.lastCheck = null;
        peopleData.isFirstRun = true;
        peopleData.messagesSent = [];
        peopleData.messagesFailed = [];
        
        await saveData();
        console.log('🗑️  Dados antigos limpos com sucesso');
    } catch (error) {
        console.error('❌ Erro ao limpar dados:', error.message);
    }
}

// Função para exportar dados em diferentes formatos
async function exportData(format = 'json') {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        switch (format.toLowerCase()) {
            case 'json':
                const jsonFile = `people-export-${timestamp}.json`;
                await fs.writeFile(jsonFile, JSON.stringify(peopleData, null, 2));
                console.log(`📤 Dados exportados para: ${jsonFile}`);
                break;
                
            case 'csv':
                const csvFile = `people-export-${timestamp}.csv`;
                const csvContent = generateCSV();
                await fs.writeFile(csvFile, csvContent);
                console.log(`📤 Dados exportados para: ${csvFile}`);
                break;
                
            default:
                console.log('❌ Formato não suportado. Use: json ou csv');
        }
    } catch (error) {
        console.error('❌ Erro ao exportar dados:', error.message);
    }
}

// Função para gerar CSV
function generateCSV() {
    const headers = ['Nome', 'WhatsApp', 'Email', 'Empresa', 'Cargo', 'Data de Criação'];
    const allPeople = peopleData.allPeople || [];
    const rows = allPeople.map(person => [
        person.name,
        person.whatsapp || '',
        person.email || '',
        person.company || '',
        person.position || '',
        person.created_at
    ]);
    
    return [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
}

// Função principal
async function main() {
    console.log('🚀 Iniciando monitoramento de pessoas do Agendor...');
    console.log(`🔑 Token Agendor: ${AUTH_TOKEN.substring(0, 8)}...`);
    console.log(`📱 Telezapy: ${TELEZAPY_CONFIG.enabled ? 'Habilitado' : 'Desabilitado'}`);
    console.log(`📁 Arquivo de dados: ${DATA_FILE}`);
    console.log(`⏰ Intervalo de verificação: ${CHECK_INTERVAL / 1000} segundos`);
    
    // Carregar dados existentes
    await loadExistingData();
    
    // Primeira verificação
    await checkForNewPeople();
    
    // Configurar verificação periódica
    setInterval(checkForNewPeople, CHECK_INTERVAL);
    
    // Configurar comandos via console
    process.stdin.on('data', async (data) => {
        const command = data.toString().trim().toLowerCase();
        
        switch (command) {
            case 'stats':
                displayStats();
                break;
            case 'new':
                displayNewPeople();
                break;
            case 'messages':
                displayMessageHistory();
                break;
            case 'clear':
                await clearOldData();
                break;
            case 'export':
                await exportData('json');
                break;
            case 'export csv':
                await exportData('csv');
                break;
            case 'check':
                await checkForNewPeople();
                break;
            case 'help':
                console.log('\n📚 COMANDOS DISPONÍVEIS:');
                console.log('  stats      - Exibir estatísticas');
                console.log('  new        - Exibir pessoas novas');
                console.log('  messages   - Exibir histórico de mensagens');
                console.log('  clear      - Limpar dados antigos');
                console.log('  export     - Exportar dados em JSON');
                console.log('  export csv - Exportar dados em CSV');
                console.log('  check      - Verificar pessoas agora');
                console.log('  help       - Exibir esta ajuda');
                console.log('  quit       - Sair do programa');
                break;
            case 'quit':
                console.log('👋 Encerrando monitoramento...');
                process.exit(0);
                break;
            default:
                console.log('❓ Comando não reconhecido. Digite "help" para ver comandos disponíveis.');
        }
    });
    
    console.log('\n💡 Digite "help" para ver comandos disponíveis');
    console.log('🔄 Monitoramento ativo. Pressione Ctrl+C para parar');
}

// Tratamento de erros
process.on('uncaughtException', (err) => {
    console.error('❌ Erro não tratado:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promise rejeitada:', reason);
});

// Executar se for chamado diretamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    checkForNewPeople,
    displayStats,
    displayNewPeople,
    displayMessageHistory,
    clearOldData,
    exportData,
    sendTelezapyMessage
};
