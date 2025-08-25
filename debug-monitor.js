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

// Função para verificar se uma pessoa já existe
function personExists(newPerson, existingPeople) {
    if (!newPerson || !existingPeople || !Array.isArray(existingPeople)) {
        return false;
    }
    
    return existingPeople.some(existing => {
        // Verificar por ID (mais confiável)
        if (existing.id === newPerson.id) {
            return true;
        }
        
        // Verificar por nome e WhatsApp (para casos onde ID pode mudar)
        if (existing.name === newPerson.name && 
            existing.whatsapp === newPerson.whatsapp && 
            existing.whatsapp !== null) {
            return true;
        }
        
        // Verificar apenas por WhatsApp se disponível
        if (existing.whatsapp && 
            existing.whatsapp === newPerson.whatsapp) {
            return true;
        }
        
        return false;
    });
}

// Função para encontrar pessoas novas
function findNewPeople(currentPeople, existingPeople) {
    const newPeople = [];
    
    if (!currentPeople || !Array.isArray(currentPeople)) {
        console.log('⚠️  Lista de pessoas atual inválida');
        return newPeople;
    }
    
    if (!existingPeople || !Array.isArray(existingPeople)) {
        existingPeople = [];
    }
    
    console.log(`🔍 Comparando ${currentPeople.length} pessoas atuais com ${existingPeople.length} pessoas existentes`);
    
    for (const person of currentPeople) {
        const personData = extractPersonData(person);
        
        if (!personData) {
            console.log(`⚠️  Dados inválidos para pessoa:`, person);
            continue;
        }
        
        console.log(`\n👤 Verificando: ${personData.name} (ID: ${personData.id}, WhatsApp: ${personData.whatsapp})`);
        
        if (!personExists(personData, existingPeople)) {
            console.log(`🆕 NOVA PESSOA DETECTADA: ${personData.name}`);
            newPeople.push(personData);
        } else {
            console.log(`✅ Pessoa já existe: ${personData.name}`);
        }
    }
    
    return newPeople;
}

// Função principal de diagnóstico
async function debugMonitor() {
    console.log('🔍 DIAGNÓSTICO DO MONITORAMENTO\n');
    
    try {
        // 1. Carregar dados existentes
        console.log('1️⃣ Carregando dados existentes...');
        let existingData;
        try {
            const data = await fs.readFile(DATA_FILE, 'utf8');
            existingData = JSON.parse(data);
            console.log(`✅ Dados carregados: ${existingData.allPeople?.length || 0} pessoas existentes`);
            console.log(`🔄 Primeira execução: ${existingData.isFirstRun ? 'Sim' : 'Não'}`);
        } catch (error) {
            console.log('❌ Erro ao carregar dados:', error.message);
            existingData = { allPeople: [], isFirstRun: true };
        }
        
        // 2. Buscar pessoas da API
        console.log('\n2️⃣ Buscando pessoas da API do Agendor...');
        const response = await axios.get(AGENDOR_API_URL, { headers });
        
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
            const currentPeople = response.data.data;
            console.log(`✅ ${currentPeople.length} pessoas encontradas na API`);
            
            // 3. Mostrar pessoas da API
            console.log('\n3️⃣ Pessoas encontradas na API:');
            currentPeople.forEach((person, index) => {
                const personData = extractPersonData(person);
                if (personData) {
                    console.log(`${index + 1}. ${personData.name} (ID: ${personData.id}, WhatsApp: ${personData.whatsapp || 'Não informado'})`);
                }
            });
            
            // 4. Mostrar pessoas existentes
            console.log('\n4️⃣ Pessoas existentes no arquivo local:');
            if (existingData.allPeople && existingData.allPeople.length > 0) {
                existingData.allPeople.forEach((person, index) => {
                    console.log(`${index + 1}. ${person.name} (ID: ${person.id}, WhatsApp: ${person.whatsapp || 'Não informado'})`);
                });
            } else {
                console.log('📭 Nenhuma pessoa existente');
            }
            
            // 5. Encontrar pessoas novas
            console.log('\n5️⃣ Detectando pessoas novas...');
            const newPeople = findNewPeople(currentPeople, existingData.allPeople || []);
            
            if (newPeople.length > 0) {
                console.log(`\n🎉 ${newPeople.length} nova(s) pessoa(s) encontrada(s)!`);
                newPeople.forEach((person, index) => {
                    console.log(`${index + 1}. ${person.name} (${person.whatsapp || 'Sem WhatsApp'})`);
                });
            } else {
                console.log('\n✅ Nenhuma pessoa nova encontrada');
            }
            
            // 6. Verificar se deveria enviar mensagens
            console.log('\n6️⃣ Verificação de envio de mensagens:');
            console.log(`   isFirstRun: ${existingData.isFirstRun}`);
            console.log(`   Pessoas novas: ${newPeople.length}`);
            console.log(`   Deveria enviar mensagens: ${!existingData.isFirstRun && newPeople.length > 0 ? 'SIM' : 'NÃO'}`);
            
        } else {
            console.log('⚠️  Nenhuma pessoa encontrada na API ou formato inválido');
            console.log('Resposta da API:', JSON.stringify(response.data, null, 2));
        }
        
    } catch (error) {
        console.error('❌ Erro durante diagnóstico:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Dados:', error.response.data);
        }
    }
}

// Executar diagnóstico
debugMonitor().catch(console.error);
