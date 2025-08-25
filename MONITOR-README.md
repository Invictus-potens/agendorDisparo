# 👥 Sistema de Monitoramento de Pessoas - Agendor

Este sistema monitora continuamente a lista de pessoas no Agendor CRM, detecta novas pessoas criadas e armazena os dados em JSON, evitando duplicatas.

## 🎯 Funcionalidades Principais

- ✅ **Monitoramento contínuo** da lista de pessoas do Agendor
- ✅ **Detecção automática** de novas pessoas criadas
- ✅ **Armazenamento em JSON** com estrutura organizada
- ✅ **Prevenção de duplicatas** por ID, nome e WhatsApp
- ✅ **Campos obrigatórios**: Nome e WhatsApp (sempre incluídos)
- ✅ **Verificação periódica** configurável (padrão: 30 segundos)
- ✅ **Comandos interativos** via console
- ✅ **Exportação** em JSON e CSV
- ✅ **Backup automático** dos dados

## 🛠️ Pré-requisitos

- Node.js 14+ instalado
- Token de autenticação do Agendor
- Acesso à API do Agendor v3

## 🚀 Instalação e Configuração

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar token do Agendor
- Abra `person-monitor.js`
- Substitua `AUTH_TOKEN` pelo seu token real
- Token encontrado em: Menu > Integrações no Agendor

### 3. Personalizar configurações (opcional)
- Copie `monitor-config.js` para `config.js`
- Ajuste as configurações conforme necessário

## 🎮 Como Usar

### Iniciar o monitoramento
```bash
npm run monitor
# ou
node person-monitor.js
```

### Comandos disponíveis durante execução
```
stats      - Exibir estatísticas
new        - Exibir pessoas novas
clear      - Limpar dados antigos
export     - Exportar dados em JSON
export csv - Exportar dados em CSV
check      - Verificar pessoas agora
help       - Exibir ajuda
quit       - Sair do programa
```

## 📊 Estrutura dos Dados

### Arquivo JSON (`people-data.json`)
```json
{
  "lastCheck": "2024-01-15T10:30:00.000Z",
  "totalPeople": 25,
  "newPeople": [
    {
      "id": 12345,
      "name": "João Silva",
      "whatsapp": "11999991111",
      "email": "joao@email.com",
      "phone": "+55 11 99999-1111",
      "company": "Empresa ABC Ltda",
      "position": "Gerente de Vendas",
      "created_at": "2024-01-15T10:00:00.000Z",
      "updated_at": "2024-01-15T10:00:00.000Z"
    }
  ],
  "allPeople": [...]
}
```

### Campos sempre incluídos
- **`name`**: Nome da pessoa (obrigatório)
- **`whatsapp`**: Número do WhatsApp (obrigatório, limpo e formatado)

### Campos opcionais
- **`email`**: Email de contato
- **`phone`**: Telefone
- **`company`**: Nome da empresa
- **`position`**: Cargo/função
- **`created_at`**: Data de criação
- **`updated_at`**: Data de atualização

## 🔍 Detecção de Duplicatas

O sistema usa múltiplas estratégias para evitar duplicatas:

1. **Por ID**: Verifica se o ID já existe (mais confiável)
2. **Por Nome + WhatsApp**: Verifica combinação única
3. **Por WhatsApp**: Verifica apenas o número (se disponível)

## ⚙️ Configurações

### Intervalo de verificação
```javascript
const CHECK_INTERVAL = 30000; // 30 segundos
```

### Campos obrigatórios
```javascript
const requiredFields = {
    name: true,        // Sempre incluir nome
    whatsapp: true,    // Sempre incluir WhatsApp
    email: false,      // Opcional
    phone: false,      // Opcional
    company: false,    // Opcional
    position: false    // Opcional
};
```

## 🧪 Testes

### Criar pessoas de exemplo
```bash
npm run test:create
# ou
node test-person-creation.js create
```

### Listar pessoas existentes
```bash
npm run test:list
# ou
node test-person-creation.js list
```

### Criar pessoa personalizada
```bash
npm run test:custom "Nome" "email@exemplo.com" "telefone" "Empresa" "Cargo"
# ou
node test-person-creation.js custom "Nome" "email@exemplo.com" "telefone" "Empresa" "Cargo"
```

## 📁 Arquivos do Sistema

- **`person-monitor.js`** - Sistema principal de monitoramento
- **`monitor-config.js`** - Configurações de exemplo
- **`test-person-creation.js`** - Script de teste para criar pessoas
- **`people-data.json`** - Arquivo de dados (criado automaticamente)

## 🔄 Fluxo de Funcionamento

1. **Inicialização**: Carrega dados existentes do JSON
2. **Verificação periódica**: Busca pessoas da API do Agendor
3. **Comparação**: Compara lista atual com dados existentes
4. **Detecção**: Identifica pessoas novas
5. **Armazenamento**: Salva pessoas novas no JSON
6. **Logs**: Exibe informações no console
7. **Repetição**: Aguarda próximo ciclo de verificação

## 📈 Monitoramento e Logs

### Logs automáticos
- Timestamp de cada verificação
- Número de pessoas encontradas
- Pessoas novas detectadas
- Estatísticas de execução

### Comandos de monitoramento
- **`stats`**: Estatísticas completas
- **`new`**: Lista de pessoas novas
- **`check`**: Verificação manual imediata

## 🚨 Solução de Problemas

### Erro de autenticação
1. Verifique se o token está correto
2. Confirme se o token tem permissões adequadas
3. Teste a API do Agendor separadamente

### Nenhuma pessoa sendo detectada
1. Verifique se existem pessoas na conta do Agendor
2. Confirme se a API está retornando dados
3. Use `npm run test:list` para verificar

### Problemas de duplicatas
1. Verifique a lógica de detecção no código
2. Use `clear` para limpar dados antigos
3. Ajuste as configurações de detecção

## 🔒 Segurança

- Token de autenticação armazenado no código
- Dados salvos localmente em JSON
- Sem transmissão de dados para terceiros
- Logs apenas no console local

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do console
2. Confirme a configuração do token
3. Teste a API do Agendor separadamente
4. Verifique a conectividade de rede

## 🎉 Pronto!

Seu sistema de monitoramento está funcionando e detectando automaticamente novas pessoas criadas no Agendor, sempre incluindo nome e WhatsApp, e evitando duplicatas!
