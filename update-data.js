const axios = require('axios');
const fs = require('fs').promises;

// Configurações
const AGENDOR_API_URL = 'https://api.agendor.com.br/v3/people';
const AUTH_TOKEN = 'f1955769-0806-47e6-b682-5ebd624aa151';
const DATA_FILE = './people-data.json';

// Headers para autenticação
const headers = {
    'Authorization': `Token ${AUTH_TOKEN}`,
    'Content-Type': 'application/json'
};

// Função para extrair dados relevantes de uma pessoa
function extractPersonData(person) {
    if (!person || typeof person !== 'object') {
        return null;
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
    if (!person || typeof person !== 'object') {
        return null;
    }
    
    const possibleFields = [
        person.contact?.whatsapp,
        person.contact?.phone,
        person.whatsapp,
        person.phone
    ];
    
    for (const field of possibleFields) {
        if (field) {
            const cleanNumber = field.toString().replace(/\D/g, '');
            if (cleanNumber.length >= 10) {
                return cleanNumber;
            }
        }
    }
    
    return null;
}

// Função principal para atualizar dados
async function updateData() {
    console.log('🔄 ATUALIZANDO ARQUIVO DE DADOS\n');
    
    try {
        // 1. Buscar pessoas da API
        console.log('1️⃣ Buscando pessoas da API do Agendor...');
        const response = await axios.get(AGENDOR_API_URL, { headers });
        
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
            const currentPeople = response.data.data;
            console.log(`✅ ${currentPeople.length} pessoas encontradas na API`);
            
            // 2. Extrair dados das pessoas
            const extractedPeople = [];
            currentPeople.forEach((person, index) => {
                const personData = extractPersonData(person);
                if (personData) {
                    extractedPeople.push(personData);
                    console.log(`${index + 1}. ${personData.name} (ID: ${personData.id}, WhatsApp: ${personData.whatsapp || 'Não informado'})`);
                }
            });
            
            // 3. Criar nova estrutura de dados
            const newData = {
                lastCheck: new Date().toISOString(),
                totalPeople: extractedPeople.length,
                newPeople: [], // Começar com lista vazia
                allPeople: extractedPeople, // Todas as pessoas atuais
                isFirstRun: false, // Não é mais primeira execução
                messagesSent: [], // Histórico vazio
                messagesFailed: [] // Histórico vazio
            };
            
            // 4. Salvar no arquivo
            console.log('\n4️⃣ Salvando dados atualizados...');
            await fs.writeFile(DATA_FILE, JSON.stringify(newData, null, 2));
            console.log('✅ Arquivo de dados atualizado com sucesso!');
            
            // 5. Resumo
            console.log('\n📊 RESUMO DA ATUALIZAÇÃO:');
            console.log(`   Total de pessoas: ${newData.totalPeople}`);
            console.log(`   Pessoas novas: ${newData.newPeople.length}`);
            console.log(`   Primeira execução: ${newData.isFirstRun ? 'Sim' : 'Não'}`);
            console.log(`   Arquivo: ${DATA_FILE}`);
            
            console.log('\n🎯 Agora o sistema deve funcionar corretamente!');
            console.log('💡 Execute "npm run monitor" para testar');
            
        } else {
            console.log('⚠️  Nenhuma pessoa encontrada na API ou formato inválido');
            console.log('Resposta da API:', JSON.stringify(response.data, null, 2));
        }
        
    } catch (error) {
        console.error('❌ Erro durante atualização:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Dados:', error.response.data);
        }
    }
}

// Executar atualização
updateData().catch(console.error);
