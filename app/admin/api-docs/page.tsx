'use client';

import { Code, Key, Server, KeyRound, Copy, CheckCircle2 } from 'lucide-react';


export default function ApiDocsPage() {
    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Code className="w-6 h-6 text-[#002554]" />
                    Documentação da API - Portal IA Tecassistiva
                </h1>
                <p className="text-slate-500 mt-1">Guia de integração para sistemas clientes (hardware/software) acessarem as funcionalidades de IA (chat, visão, prompts customizados) via API Gateway.</p>
                <p className="text-sm mt-3 text-slate-600">
                    Passo a passo:
                    <ol className="list-decimal list-inside ml-4 mt-2 space-y-1">
                        <li>Cadastrar Produto em <strong>/admin/produtos</strong> com permissões de acesso (chat, image_recognition, custom_prompts).</li>
                        <li>Criar Aplicações em <strong>/admin/apps</strong> vinculando a <code>product_id</code>, definindo <code>system_prompt</code> (regras do agente) e modelo.</li>
                        <li>Cadastrar/associar usuário em <strong>/admin/usuarios</strong> com <code>product_id</code> e saldo de tokens.</li>
                        <li>Para hardware: cadastrar dispositivo em <strong>/admin/dispositivos</strong> com Serial Number vinculado ao usuário.</li>
                        <li>Consumir <code>POST /api/chat</code> com <code>userId</code> (Serial Number para hardware), <code>appId</code> e <code>message</code> (e opcional <code>image</code>/<code>threadId</code>).</li>
                    </ol>
                </p>
            </div>

            {/* Intro Alert */}
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-6 rounded-xl flex gap-4 shadow-sm">
                <Server className="w-6 h-6 shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-bold text-lg mb-1">Endpoints de Acesso</h3>
                    <p className="text-sm opacity-90 mb-3">
                        O Gateway atua como um intermediário que valida autenticação, limite de tokens e gerencia as <strong>Pessoas (System Prompts)</strong> e <strong>Memória (Threads)</strong> automaticamente. O seu front-end precisa apenas enviar o texto do usuário.
                    </p>
                    <div className="bg-white/60 px-4 py-3 border border-blue-100 rounded-lg flex flex-col justify-center font-mono text-sm max-w-xl shadow-inner gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[#002554] font-bold">POST</span>
                            <span className="text-slate-600 truncate px-2 text-xs md:text-sm">https://ia.tecassistiva.com.br/api/chat</span>
                        </div>
                        <div className="text-[11px] text-slate-500 border-t border-blue-100 pt-2 font-sans">
                            <strong>Produção:</strong> Este é o endereço oficial e definitivo da API para consumir o Proxy Gemini via HTTPS.
                        </div>
                    </div>
                </div>
            </div>

            {/* Visão Geral de Parâmetros */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 text-lg mb-2">Visão Geral de Parâmetros</h3>
                <p className="text-sm text-slate-600 mb-3">Campos principais aceitos por <code>/api/chat</code>:</p>
                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                    <li><code>userId</code>: UID do usuário Firebase ou Serial Number do hardware (Ex: LBR-001).</li>
                    <li><code>appId</code>: Identificador da aplicação/agent dentro do portal (Ex: liber_vision, tecassistiva_chat).</li>
                    <li><code>message</code>: Texto de entrada do usuário.</li>
                    <li><code>threadId</code>: (Opcional) mantém contexto da conversa.</li>
                    <li><code>image</code>: (Opcional) {`{ base64, mimeType }`} para reconhecimento de imagens.</li>
                </ul>

                <h4 className="font-semibold text-slate-700 text-sm mt-4 mb-2 uppercase tracking-wide">Código de resposta</h4>
                <p className="text-sm text-slate-600">
                    200: Sucesso, retorno com texto e tokenCount; 403: falta de permissão/saldo; 404: app/usuário não encontrado; 500: erro interno.
                </p>
            </div>

            {/* Iniciar Conversa */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50 p-5 flex items-center gap-3">
                    <div className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">1</div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Iniciando uma Nova Conversa</h3>
                        <p className="text-sm text-slate-500">Para a primeira mensagem do fluxo. O sistema criará a memória em nuvem.</p>
                    </div>
                </div>
                <div className="p-6">
                    <h4 className="font-semibold text-slate-700 text-sm mb-2 uppercase tracking-wide">Corpo da Requisição (JSON)</h4>
                    <div className="bg-[#1e1e1e] p-4 rounded-xl overflow-x-auto shadow-inner relative group border border-slate-800">
                        <pre className="text-emerald-400 font-mono text-[13px] leading-relaxed">
                            {`{
  "userId": "ID_DO_USUARIO_OU_S/N",      // (Requerido) O Firebase UID longo ou S/N do Equipamento.
  "appId": "agente-educacional",         // (Requerido) O Nome Único registrado na aba Aplicações.
  "message": "Olá! Preciso de ajuda."    // (Requerido) O texto do usuário.
}`}
                        </pre>
                    </div>

                    <h4 className="font-semibold text-slate-700 text-sm mb-2 mt-6 uppercase tracking-wide">Resposta Esperada (200 OK)</h4>
                    <div className="bg-[#1e1e1e] p-4 rounded-xl overflow-x-auto shadow-inner border border-slate-800">
                        <pre className="text-amber-400 font-mono text-[13px] leading-relaxed">
                            {`{
  "text": "Olá! Claro, como posso te ajudar hoje?", 
  "threadId": "c7a8b9f2-1234-abcd-...", // ⚠️ SALVE ESTE ID NA MEMÓRIA DO APP
  "tokenCount": 142                       
}`}
                        </pre>
                    </div>
                </div>
            </div>

            {/* Continuar Conversa */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50 p-5 flex items-center gap-3">
                    <div className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">2</div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Continuando uma Conversa</h3>
                        <p className="text-sm text-slate-500">Para manter o contexto da conversa, envie o <code className="bg-slate-200 px-1 py-0.5 rounded textxs">threadId</code> recebido anteriormente.</p>
                    </div>
                </div>
                <div className="p-6">
                    <h4 className="font-semibold text-slate-700 text-sm mb-2 uppercase tracking-wide">Corpo da Requisição (JSON)</h4>
                    <div className="bg-[#1e1e1e] p-4 rounded-xl overflow-x-auto shadow-inner border border-slate-800">
                        <pre className="text-emerald-400 font-mono text-[13px] leading-relaxed">
                            {`{
  "userId": "ID_DO_USUARIO_AUTENTICADO",
  "appId": "agente-educacional",         
  "message": "Você pode explicar frações?", 
  "threadId": "c7a8b9f2-1234-abcd-..."   // (Requerido) Enviar junto com a nova mensagem
}`}
                        </pre>
                    </div>
                </div>
            </div>

            {/* Hardware Auth */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50 p-5 flex items-center gap-3">
                    <div className="bg-purple-100 text-purple-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                        <Server className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Autenticação M2M (Máquina)</h3>
                        <p className="text-sm text-slate-500">Fluxo focado em hardwares Tecassistiva (Robôs, Totens) onde não há formulário de login.</p>
                    </div>
                </div>
                <div className="p-6">
                    <div className="text-sm text-slate-600 mb-4 bg-slate-50 p-4 border border-slate-100 rounded-lg">
                        <strong>Como funciona?</strong> Você cadastra o <code className="bg-slate-200 px-1 rounded">Serial Number</code> do hardware na aba <em>Dispositivos</em> deste painel Administrativo (Ex: LBR-001) e vincula ele a um usuário com saldo de tokens.
                        No código do hardware Tecassistiva, o <code>userId</code> enviado na chamada POST deve ser o Serial Number físico do aparelho. A validação é feita através da verificação do saldo de tokens do usuário vinculado ao dispositivo.
                    </div>
                    <div className="bg-[#1e1e1e] p-4 rounded-xl overflow-x-auto shadow-inner border border-slate-800">
                        <pre className="text-purple-300 font-mono text-[13px] leading-relaxed">
                            {`{
  "userId": "LBR-001",                   // Serial Number do dispositivo (vinculado ao usuário)
  "appId": "liber_vision",         
  "message": "O que você vê na minha frente?" // O texto do usuário ou descrição da imagem
}`}
                        </pre>
                    </div>
                </div>
            </div>

            {/* Enviar Imagens */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50 p-5 flex items-center gap-3">
                    <div className="bg-[#002554]/10 text-[#002554] w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">3</div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Suporte a Visão (Imagens) - Genérico</h3>
                        <p className="text-sm text-slate-500">Anexe imagens convertidas em Base64 dentro do objeto <code>image</code>. Veja exemplo específico em Liber Vision.</p>
                    </div>
                </div>
                <div className="p-6">
                    <div className="bg-[#1e1e1e] p-4 rounded-xl overflow-x-auto shadow-inner border border-slate-800">
                        <pre className="text-blue-300 font-mono text-[13px] leading-relaxed">
                            {`{
  "userId": "ID_DO_USUARIO_OU_SERIAL",
  "appId": "nome_do_app_com_permissao_image",         
  "message": "Analise esta imagem", 
  "threadId": "OPCIONAL", // Se for conversa nova, não envie.
  "image": {
    "base64": "iVBORw0KGgoAAAANSUhEUgAA...", // O corpo base64 puro (sem data:...)
    "mimeType": "image/jpeg" // "image/jpeg" ou "image/png"
  }
}`}
                        </pre>
                    </div>
                    <div className="text-sm text-slate-600 mt-4 bg-amber-50 p-4 border border-amber-100 rounded-lg">
                        <strong>Requisitos:</strong> O app deve ter permissão <code>image_recognition</code> no produto. Imagens consomem mais tokens que texto puro.
                    </div>
                </div>
            </div>

            {/* Liber Vision - Reconhecimento de Imagem */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50 p-5 flex items-center gap-3">
                    <div className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Liber Vision - Reconhecimento de Imagem</h3>
                        <p className="text-sm text-slate-500">Exemplo completo de como enviar uma imagem para análise usando o app <code>liber_vision</code>.</p>
                    </div>
                </div>
                <div className="p-6">
                    <div className="text-sm text-slate-600 mb-4 bg-green-50 p-4 border border-green-100 rounded-lg">
                        <strong>Fluxo passo a passo:</strong>
                        <ol className="list-decimal list-inside mt-2 space-y-1">
                            <li>O hardware captura a imagem (câmera, scanner, etc.)</li>
                            <li>Converte a imagem para Base64 (sem headers como data:image/jpeg;base64,)</li>
                            <li>Envia para o proxy com <code>userId</code> (Serial Number), <code>appId: liber_vision</code>, <code>message</code> (pergunta sobre a imagem) e objeto <code>image</code></li>
                            <li>O proxy valida: dispositivo existe, usuário tem saldo, app tem permissão <code>image_recognition</code></li>
                            <li>IA analisa a imagem e retorna descrição/texto</li>
                            <li>Resposta volta com texto da IA e consumo de tokens</li>
                        </ol>
                    </div>

                    <h4 className="font-semibold text-slate-700 text-sm mb-2 uppercase tracking-wide">Exemplo de Requisição (Hardware)</h4>
                    <div className="bg-[#1e1e1e] p-4 rounded-xl overflow-x-auto shadow-inner border border-slate-800">
                        <pre className="text-green-300 font-mono text-[13px] leading-relaxed">
                            {`POST https://ia.tecassistiva.com.br/api/chat
Content-Type: application/json

{
  "userId": "LBR-001",                    // Serial Number do dispositivo
  "appId": "liber_vision",                // App específico para visão computacional
  "message": "Descreva o que você vê nesta imagem em detalhes", // Pergunta sobre a imagem
  "image": {
    "base64": "iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAgAElEQVR4nO...", // Base64 puro da imagem
    "mimeType": "image/jpeg"              // Tipo MIME: image/jpeg ou image/png
  }
}`}
                        </pre>
                    </div>

                    <h4 className="font-semibold text-slate-700 text-sm mb-2 mt-6 uppercase tracking-wide">Resposta de Sucesso (200 OK)</h4>
                    <div className="bg-[#1e1e1e] p-4 rounded-xl overflow-x-auto shadow-inner border border-slate-800">
                        <pre className="text-amber-400 font-mono text-[13px] leading-relaxed">
                            {`{
  "text": "Na imagem, vejo uma pessoa sentada em uma mesa com um computador portátil aberto. Há livros e papéis espalhados, sugerindo um ambiente de estudo ou trabalho. A pessoa parece estar digitando no teclado.", 
  "threadId": "abc123-def456-...",        // ID para manter contexto se houver conversa
  "tokenCount": 285                       // Tokens consumidos (imagem + análise)
}`}
                        </pre>
                    </div>

                    <div className="text-sm text-slate-600 mt-4 bg-blue-50 p-4 border border-blue-100 rounded-lg">
                        <strong>Nota importante:</strong> O custo de tokens para análise de imagem é maior que texto puro. Certifique-se de que o usuário vinculado ao dispositivo tenha saldo suficiente. A primeira requisição cria um <code>threadId</code> que pode ser usado em conversas subsequentes sobre a mesma imagem.
                    </div>
                </div>
            </div>

            {/* Tratamento de Erros */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50 p-5 flex items-center gap-3">
                    <div className="bg-red-100 text-red-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">!</div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Tratamento de Erros (HTTP Status)</h3>
                        <p className="text-sm text-slate-500">Sua aplicação deve estar preparada para interceptar as respostas negativas da API.</p>
                    </div>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-1">
                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs">403 Forbidden</span>
                            Saldo de Tokens Insuficiente
                        </h4>
                        <p className="text-sm text-slate-600">Ocorre quando a cota contratada no plano do usuário esgotou. O Front-end deve bloquear a barra de chat e incentivar o Upgrade.</p>
                    </div>
                    <div className="h-px bg-slate-100 w-full line"></div>
                    <div>
                        <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-1">
                            <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs">404 Not Found</span>
                            App ou Usuário Inexistente
                        </h4>
                        <p className="text-sm text-slate-600">Ocorre quando o <code>userId</code> ou o <code>appId</code> providenciados não existem no banco do Admin Gateway.</p>
                    </div>
                    <div className="h-px bg-slate-100 w-full line"></div>
                    <div>
                        <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-1">
                            <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-xs">500 Internal Error</span>
                            Falha no Google Gemini
                        </h4>
                        <p className="text-sm text-slate-600">Ocorre quando o motor da IA rejeita seu conteúdo ou está fora do ar. Recomendado exibir um toast de “Tente novamente mais tarde”.</p>
                    </div>
                </div>
            </div>

        </div>
    );
}
