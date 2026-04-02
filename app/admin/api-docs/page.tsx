'use client';

import { Code, Server, CheckCircle2 } from 'lucide-react';


export default function ApiDocsPage() {
    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-6 rounded-xl flex gap-4 shadow-sm">
                <Server className="w-6 h-6 shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-bold text-lg mb-1">Endpoint Único</h3>
                    <p className="text-sm opacity-90 mb-3">
                        O proxy recebe a requisição do produto, valida o usuário, valida o saldo de tokens, confere o aplicativo e então chama a IA. A resposta volta no mesmo retorno HTTP da API.
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

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 text-lg mb-2">O Que Precisa Estar Configurado</h3>
                <ol className="list-decimal list-inside text-sm text-slate-600 space-y-2">
                    <li>Produto cadastrado com as permissões necessárias, como <code>chat</code> e <code>image_recognition</code>.</li>
                    <li>Aplicativo cadastrado em <code>/admin/apps</code> e vinculado ao produto correto.</li>
                    <li>Usuário cadastrado com saldo de tokens.</li>
                    <li>Se for hardware, dispositivo cadastrado em <code>/admin/dispositivos</code> usando o Serial Number e vinculado ao usuário.</li>
                </ol>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 text-lg mb-3">Estrutura do Projeto</h3>
                <ul className="list-disc list-inside text-sm text-slate-600 space-y-2">
                    <li><strong>Linguagem:</strong> TypeScript com Next.js (App Router) no frontend e backend.</li>
                    <li><strong>Hospedagem:</strong> Deploy em ambiente serverless (Vercel) com domínio de produção da Tecassistiva.</li>
                    <li><strong>Autenticação:</strong> Firebase Authentication (login por e-mail/senha e Google) com sessão baseada em cookies.</li>
                    <li><strong>Banco de Dados:</strong> Google Firestore (users, products, applications, devices, plans, orders, threads e usage_logs).</li>
                </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50 p-5 flex items-center gap-3">
                    <div className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">1</div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Lógica de Tokens Antes da IA</h3>
                        <p className="text-sm text-slate-500">Esta validação acontece antes de qualquer chamada ao modelo.</p>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-slate-700">
                        Antes de liberar a resposta da IA, a API identifica o usuário dono da requisição, verifica o saldo de tokens e só continua se houver saldo disponível.
                    </div>
                    <ol className="list-decimal list-inside text-sm text-slate-600 space-y-2">
                        <li>O produto envia <code>userId</code>, <code>appId</code> e <code>message</code>.</li>
                        <li>Se o <code>userId</code> for um Serial Number, a API localiza o dispositivo e encontra o usuário vinculado.</li>
                        <li>A API consulta o saldo de tokens desse usuário.</li>
                        <li>Se o saldo for zero ou menor, a requisição é bloqueada com HTTP <code>403</code>.</li>
                        <li>Se houver saldo, a API chama a IA.</li>
                        <li>Ao final, a API desconta os tokens consumidos e devolve o saldo atualizado.</li>
                    </ol>
                    <div className="bg-[#1e1e1e] p-4 rounded-xl overflow-x-auto shadow-inner border border-slate-800">
                        <pre className="text-amber-400 font-mono text-[13px] leading-relaxed">
                            {`{
  "error": "Saldo insuficiente. Seu token_balance deve ser maior que zero."
}`}
                        </pre>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50 p-5 flex items-center gap-3">
                    <div className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Exemplo 1: Reconhecimento de Imagem</h3>
                        <p className="text-sm text-slate-500">Fluxo recomendado para produtos como Liber Vision.</p>
                    </div>
                </div>
                <div className="p-6 space-y-6">
                    <div className="text-sm text-slate-600 bg-slate-50 p-4 border border-slate-100 rounded-lg">
                        Envie o Serial Number do dispositivo em <code>userId</code>, o app de visão em <code>appId</code>, a instrução em <code>message</code> e a imagem em Base64 no campo <code>image</code>.
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-700 text-sm mb-2 uppercase tracking-wide">Requisição</h4>
                        <div className="bg-[#1e1e1e] p-4 rounded-xl overflow-x-auto shadow-inner border border-slate-800">
                            <pre className="text-emerald-400 font-mono text-[13px] leading-relaxed">
                                {`{
  "userId": "LBR-001",
  "appId": "liber_vision",
  "message": "O que você vê nesta imagem?",
  "image": {
    "base64": "iVBORw0KGgoAAAANSUhEUgAA...",
    "mimeType": "image/jpeg"
  }
}`}
                            </pre>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-700 text-sm mb-2 uppercase tracking-wide">Resposta</h4>
                        <div className="bg-[#1e1e1e] p-4 rounded-xl overflow-x-auto shadow-inner border border-slate-800">
                            <pre className="text-amber-400 font-mono text-[13px] leading-relaxed">
                                {`{
  "message": "Na imagem há uma pessoa sentada em uma mesa com um notebook aberto.",
  "threadId": "abc123-def456-...",
  "tokens_consumed": 285,
  "updated_balance": 4715
}`}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50 p-5 flex items-center gap-3">
                    <div className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">2</div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Exemplo 2: Chat de Texto</h3>
                        <p className="text-sm text-slate-500">Use o mesmo endpoint sem o campo <code>image</code>.</p>
                    </div>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <h4 className="font-semibold text-slate-700 text-sm mb-2 uppercase tracking-wide">Primeira mensagem</h4>
                        <div className="bg-[#1e1e1e] p-4 rounded-xl overflow-x-auto shadow-inner border border-slate-800">
                            <pre className="text-emerald-400 font-mono text-[13px] leading-relaxed">
                                {`{
  "userId": "LBR-001",
  "appId": "liber_chat",
  "message": "Qual a capital da França?"
}`}
                            </pre>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-700 text-sm mb-2 uppercase tracking-wide">Resposta</h4>
                        <div className="bg-[#1e1e1e] p-4 rounded-xl overflow-x-auto shadow-inner border border-slate-800">
                            <pre className="text-amber-400 font-mono text-[13px] leading-relaxed">
                                {`{
  "message": "A capital da França é Paris.",
  "threadId": "x9y8z7-w6v5u4-...",
  "tokens_consumed": 42,
  "updated_balance": 4958
}`}
                            </pre>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-700 text-sm mb-2 uppercase tracking-wide">Continuando a conversa</h4>
                        <div className="bg-[#1e1e1e] p-4 rounded-xl overflow-x-auto shadow-inner border border-slate-800">
                            <pre className="text-blue-300 font-mono text-[13px] leading-relaxed">
                                {`{
  "userId": "LBR-001",
  "appId": "liber_chat",
  "message": "E qual o idioma oficial?",
  "threadId": "x9y8z7-w6v5u4-..."
}`}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 text-lg mb-3">Campos Aceitos Pela API</h3>
                <ul className="list-disc list-inside text-sm text-slate-600 space-y-2">
                    <li><code>userId</code>: ID do usuário ou Serial Number do dispositivo.</li>
                    <li><code>appId</code>: ID do aplicativo cadastrado no painel.</li>
                    <li><code>message</code>: texto enviado pelo produto.</li>
                    <li><code>threadId</code>: opcional, usado para manter o contexto.</li>
                    <li><code>image</code>: opcional, objeto com <code>base64</code> e <code>mimeType</code>.</li>
                </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50 p-5 flex items-center gap-3">
                    <div className="bg-red-100 text-red-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">!</div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Erros Esperados</h3>
                        <p className="text-sm text-slate-500">Essas são as respostas negativas que o produto precisa tratar.</p>
                    </div>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-1">
                            <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-xs">400</span>
                            Requisição inválida
                        </h4>
                        <p className="text-sm text-slate-600">Falta de <code>userId</code>, <code>appId</code> ou <code>message</code>.</p>
                    </div>
                    <div className="h-px bg-slate-100 w-full line"></div>
                    <div>
                        <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-1">
                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs">403</span>
                            Bloqueio de acesso
                        </h4>
                        <p className="text-sm text-slate-600">Saldo insuficiente, produto sem permissão ou aplicativo não autorizado para aquele produto.</p>
                    </div>
                    <div className="h-px bg-slate-100 w-full line"></div>
                    <div>
                        <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-1">
                            <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs">404</span>
                            Não encontrado
                        </h4>
                        <p className="text-sm text-slate-600">Usuário, dispositivo, produto associado ou aplicativo não encontrado.</p>
                    </div>
                    <div className="h-px bg-slate-100 w-full line"></div>
                    <div>
                        <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-1">
                            <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-xs">500</span>
                            Falha interna
                        </h4>
                        <p className="text-sm text-slate-600">Erro interno do proxy ou erro retornado pelo provedor de IA.</p>
                    </div>
                </div>
            </div>

        </div>
    );
}
