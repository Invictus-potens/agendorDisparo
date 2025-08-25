# 🚀 Agendor Disparo

Sistema automatizado de monitoramento e disparo de mensagens WhatsApp para novos leads do Agendor CRM, integrado com a API Telezapy.

## ✨ Funcionalidades

- 🔍 **Monitoramento Automático**: Verifica periodicamente novos leads no Agendor
- 📱 **Disparo Automático**: Envia mensagens WhatsApp via Telezapy para novos leads
- 🎯 **Detecção Inteligente**: Identifica leads novos sem duplicatas
- 📊 **Relatórios**: Histórico de mensagens enviadas e falhadas
- ⚙️ **Configurável**: Fácil personalização de mensagens e intervalos
- 🛡️ **Robusto**: Sistema de retry e tratamento de erros

## 🏗️ Arquitetura

```
agendorDisparo/
├── person-monitor.js      # Sistema principal de monitoramento
├── test-system.js         # Testes de conectividade
├── test-message.js        # Testes de envio de mensagens
├── force-send.js          # Envio forçado de mensagem
├── debug-monitor.js       # Diagnóstico do sistema
├── update-data.js         # Atualização de dados
├── monitor-config.js      # Configurações de exemplo
├── people-data.json       # Dados das pessoas monitoradas
└── package.json           # Dependências e scripts
```

## 🚀 Instalação

### Pré-requisitos
- Node.js 14+ 
- Conta no Agendor CRM
- Token da API Telezapy

### Passos
```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/agendorDisparo.git
cd agendorDisparo

# 2. Instale as dependências
npm install

# 3. Configure suas credenciais
# Edite person-monitor.js com seus tokens
```

## ⚙️ Configuração

### 1. Credenciais do Agendor
```javascript
const AUTH_TOKEN = 'seu-token-agendor';
const AGENDOR_API_URL = 'https://api.agendor.com.br/v3/people';
```

### 2. Configurações do Telezapy
```javascript
const TELEZAPY_CONFIG = {
    enabled: true,
    apiToken: 'seu-token-telezapy',
    apiUrl: 'https://api-krolik.telezapy.tech',
    sendEndpoint: '/api/send',
    messageTemplate: "Olá {name}, vi que se interessou em nossos produtos.",
    connectionFrom: 6,
    ticketStrategy: "create"
};
```

## 📱 Uso

### Iniciar Monitoramento
```bash
npm start
# ou
npm run monitor
```

### Comandos Disponíveis
- `stats` - Exibir estatísticas
- `new` - Exibir pessoas novas
- `messages` - Histórico de mensagens
- `check` - Verificar pessoas agora
- `help` - Ajuda
- `quit` - Sair

### Testes
```bash
# Teste do sistema
npm run test:system

# Teste de mensagens
npm run test:message

# Envio forçado
npm run force:send

# Diagnóstico
npm run debug

# Atualizar dados
npm run update-data
```

## 🔧 Funcionamento

### Fluxo Principal
1. **Monitoramento**: Sistema verifica a API do Agendor a cada 30 segundos
2. **Detecção**: Compara lista atual com dados locais para identificar novos leads
3. **Validação**: Verifica se o lead possui WhatsApp válido
4. **Disparo**: Envia mensagem personalizada via Telezapy
5. **Registro**: Salva histórico de sucessos e falhas

### Lógica de Primeira Execução
- **Primeira vez**: Coleta todas as pessoas existentes sem enviar mensagens
- **Execuções seguintes**: Envia mensagens apenas para leads realmente novos

## 📊 Estrutura de Dados

```json
{
  "lastCheck": "2025-08-25T01:07:41.573Z",
  "totalPeople": 6,
  "newPeople": [],
  "allPeople": [...],
  "isFirstRun": false,
  "messagesSent": [...],
  "messagesFailed": [...]
}
```

## 🛠️ Desenvolvimento

### Estrutura do Código
- **Modular**: Funções separadas para cada responsabilidade
- **Assíncrono**: Uso de async/await para operações de API
- **Robusto**: Tratamento de erros e validações
- **Configurável**: Fácil personalização via constantes

### Extensibilidade
- Adicione novos campos de pessoa
- Implemente novos provedores de mensagem
- Integre com outros CRMs
- Adicione notificações (email, Slack, etc.)

## 📝 Logs e Debug

O sistema gera logs detalhados para facilitar o diagnóstico:
- 🔍 Logs de detecção de pessoas
- 📱 Logs de envio de mensagens
- ❌ Logs de erros e falhas
- 📊 Estatísticas em tempo real

## 🚨 Solução de Problemas

### Mensagens não sendo enviadas
1. Verifique se `isFirstRun` está `false`
2. Execute `npm run debug` para diagnóstico
3. Verifique se o Telezapy está habilitado
4. Confirme se as pessoas têm WhatsApp válido

### Erros de API
1. Verifique tokens de autenticação
2. Confirme conectividade com as APIs
3. Execute `npm run test:system`
4. Verifique logs de erro detalhados

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/seu-usuario/agendorDisparo/issues)
- **Documentação**: [Wiki](https://github.com/seu-usuario/agendorDisparo/wiki)

## 🔄 Changelog

### v1.0.0
- ✅ Sistema básico de monitoramento
- ✅ Integração com Agendor CRM
- ✅ Integração com Telezapy
- ✅ Sistema de detecção de duplicatas
- ✅ Logs e relatórios
- ✅ Sistema de retry e tratamento de erros

---

**Desenvolvido com ❤️ para automatizar o processo de qualificação de leads**
