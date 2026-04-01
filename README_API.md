# Documentação da API de Integração - Proxy Gemini

Esta documentação fornece os detalhes necessários para que aplicações externas (como clientes Android, iOS ou Web) se conectem e utilizem a Inteligência Artificial através da nossa API Proxy. 

A nossa API Proxy atua como uma barreira segura, gerenciando o saldo de tokens do usuário, injetando contextos e regras de persona (`system_prompt` da Aplicação), e gerenciando a memória da conversa diretamente no banco de dados (Firestore Threads).

---

## Endpoint Principal: Conversação (Chat)

Responsável por enviar mensagens para o modelo de Inteligência Artificial e recuperar a resposta.

- **URL:** `POST https://liber.tecassistiva.com.br/api/chat` 
  *(Para testes locais em desenvolvimento, altere para `http://localhost:3000/api/chat`).*
- **Content-Type:** `application/json`

### 1. Iniciando uma Nova Conversa
Para mandar a PRIMEIRA mensagem do usuário. A API criará uma nova *Thread* de histórico e te retornará o ID dessa memória na nuvem.

**Requisição (Body JSON):**
```json
{
  "userId": "ID_DO_USUARIO_AUTENTICADO_OU_NUMERO_DE_SERIE", // (string) Requerido. O UID do usuário no Firebase Auth OU o Número de Série (NS/MAC) cadastrado no Painel Admin.
  "appId": "agente-educacional",         // (string) Requerido. O "App ID" exato criado no Painel Admin
  "message": "Olá! Preciso de ajuda com matemática." // (string) Requerido. Texto do usuário final.
}
```

**Resposta de Sucesso (200 OK):**
```json
{
  "text": "Olá! Claro, adoro matemática. Em qual assunto você precisa de ajuda hoje?", // Resposta da IA
  "threadId": "c7a8b9f2-1234-abcd-... ", // (string) OBRIGATÓRIO SALVAR ESTE ID NO CLIENTE
  "tokenCount": 142                       // (number) Total de tokens gastos nesta requisição
}
```

---

### 2. Continuando uma Conversa (Com Memória)
Para que a IA "lembre" do que vocês estavam conversando. Você DEVE enviar o `threadId` recebido na etapa anterior.

**Requisição (Body JSON):**
```json
{
  "userId": "ID_DO_USUARIO_AUTENTICADO",
  "appId": "agente-educacional",
  "message": "Você pode me explicar sobre frações?",
  "threadId": "c7a8b9f2-1234-abcd-..."   // (string) Requerido para manter o contexto
}
```

A API buscará todo o histórico atrelado a esse `threadId`, acoplará a sua nova frase ("Pode me explicar..."), enviará ao Google Gemini, e salvará a resposta de forma automática.

**Resposta de Sucesso (200 OK):**
```json
{
  "text": "Sem problemas! Frações são partes de um todo. Imagine uma pizza repartida em 8 fatias...",
  "threadId": "c7a8b9f2-1234-abcd-...", // Permanecerá o mesmo ID enquanto a conversa durar.
  "tokenCount": 356
}
```

---

### 3. Enviando Imagens (Opcional - Gemini Vision)
Nossa API suporta leitura de imagens. Converta a imagem em Base64 e anexe na requisição sob o objeto `image`.

**Requisição (Body JSON):**
```json
{
  "userId": "ID_DO_USUARIO_AUTENTICADO",
  "appId": "agente-diagnostico",
  "message": "O que tem nesta imagem?",
  "threadId": "OPCIONAL", // Se for nova conversa, não enviar.
  "image": {
    "base64": "iVBORw0KGgoAAAANSUhEUgAA...", // (string) O corpo base64 puro (sem o prefixo data:image/jpeg;base64,)
    "mimeType": "image/jpeg"                 // (string) ex: "image/jpeg" ou "image/png"
  }
}
```

---

## 🛑 Tratamento de Erros (HTTP Status)

Sua aplicação mobile/front-end deve preparar fluxos para lidar com os possíveis retornos de erro do servidor proxy.

### `403 Forbidden` (Saldo Insuficiente)
Retornado caso o `userId` enviado não possua `token_balance` disponível na plataforma.
```json
{
  "error": "Saldo insuficiente. Seu token_balance deve ser maior que zero."
}
```
**Ação recomendada no Front-end:** Exibir um alerta informando que os créditos acabaram e oferecer um botão para o Painel/Upgrade.

### `404 Not Found` (App Inválido ou Usuário Inexistente)
```json
{
  "error": "Aplicação não encontrada."
}
```
**Ação recomendada no Front-end:** Verificar se o `appId` ou o `userId` passados estão corretos.

### `500 Internal Server Error` (Falha na API Gemini)
```json
{
  "error": "Failed to proxy request to Gemini",
  "details": "Mensagem técnica de erro..."
}
```
**Ação recomendada no Front-end:** Exibir mensaje de "Serviço Indisponível no momento" e tentar novamente.

---
## Resumo do Fluxo Mobile (Pseudo-código Kotlin/Swift/Dart)

1. Usuário faz Login via Firebase. Obter o `userId` (`user.uid`).
2. Usuário entra na tela do Agente Educacional.
3. Front-end prepara uma variável vazia ou nula: `var currentThreadId = null`.
4. Usuário digita "Oi, tudo bem?".
5. Disparar POST `/api/chat` com userId, "agente-educacional", mensagem e currentThreadId (que é null).
6. Recebe o Response 200 OK.
7. Atualiza a UI com a resposta da IA.
8. Salva o Thread retornado: `currentThreadId = response.threadId`.
9. Na próxima vez que o usuário digitar na mesma tela, o `currentThreadId` será preenchido.
10. Se ele sair e clicar em "Novo Chat", apenas defina `currentThreadId = null`.
