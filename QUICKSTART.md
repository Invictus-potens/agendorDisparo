# 🚀 INSTALAÇÃO RÁPIDA - AGENDOR DISPARO

## ⚡ Setup em 5 minutos

### 1️⃣ Clone e Instale
```bash
git clone https://github.com/seu-usuario/agendorDisparo.git
cd agendorDisparo
npm install
```

### 2️⃣ Configure suas Credenciais
```bash
# Copie o arquivo de exemplo
copy credentials.example.js credentials.js

# Edite com suas credenciais reais
notepad credentials.js
```

**Substitua:**
- `seu-token-agendor-aqui` → Seu token do Agendor
- `seu-token-telezapy-aqui` → Seu token do Telezapy

### 3️⃣ Teste o Sistema
```bash
# Teste de conectividade
npm run test:system

# Teste de mensagem
npm run test:message
```

### 4️⃣ Inicie o Monitoramento
```bash
npm start
```

## 🎯 O que acontece agora?

1. **Primeira execução**: Sistema coleta pessoas existentes (sem enviar mensagens)
2. **Execuções seguintes**: Detecta pessoas novas e envia mensagens automaticamente
3. **Monitoramento contínuo**: Verifica a cada 30 segundos

## 📱 Comandos Úteis

- `stats` - Ver estatísticas
- `new` - Ver pessoas novas
- `messages` - Histórico de mensagens
- `help` - Ajuda
- `quit` - Sair

## 🚨 Solução Rápida de Problemas

### Mensagens não sendo enviadas?
```bash
npm run debug
```

### Erro de API?
```bash
npm run test:system
```

### Testar envio manual?
```bash
npm run force:send
```

## 📞 Suporte

- **Issues**: [GitHub](https://github.com/seu-usuario/agendorDisparo/issues)
- **Documentação**: [README.md](README.md)

---

**🎉 Pronto! Seu sistema está funcionando e enviando mensagens automaticamente!**
