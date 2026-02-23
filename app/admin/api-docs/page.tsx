'use client';

import { Code, Key, Server, KeyRound, Copy, CheckCircle2 } from 'lucide-react';


export default function ApiDocsPage() {
    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Code className="w-6 h-6 text-[#002554]" />
                    Documentação da API Proxy
                </h1>
                <p className="text-slate-500 mt-1">Guia de integração para desenvolvedores Mobile (Android/iOS) e Web consumirem a Inteligência Artificial do ecossistema Liber.</p>
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
                            <span className="text-slate-600 truncate px-2 text-xs md:text-sm">https://[SEU_DOMINIO]/api/chat</span>
                        </div>
                        <div className="text-[11px] text-slate-500 border-t border-blue-100 pt-2 font-sans">
                            <strong>Nota:</strong> O <code>[SEU_DOMINIO]</code> é o endereço onde esta API será hospedada na nuvem (ex: <code>https://api.liber.com.br</code>). Para testes locais agorinha mesmo, o caminho é <code>http://localhost:3000/api/chat</code>.
                        </div>
                    </div>
                </div>
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
  "userId": "ID_DO_USUARIO_AUTENTICADO", // (Requerido) O Firebase UID longo gerado no Login.
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

            {/* Enviar Imagens */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50 p-5 flex items-center gap-3">
                    <div className="bg-[#002554]/10 text-[#002554] w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">3</div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Suporte a Visão (Imagens)</h3>
                        <p className="text-sm text-slate-500">Anexe imagens convertidas em Base64 dentro do objeto <code>image</code>.</p>
                    </div>
                </div>
                <div className="p-6">
                    <div className="bg-[#1e1e1e] p-4 rounded-xl overflow-x-auto shadow-inner border border-slate-800">
                        <pre className="text-blue-300 font-mono text-[13px] leading-relaxed">
                            {`{
  "userId": "ID_DO_USUARIO_AUTENTICADO",
  "appId": "agente-diagnostico",         
  "message": "O que você vê na lousa?", 
  "threadId": "OPCIONAL", // Se for conversa nova, não envie.
  "image": {
    "base64": "iVBORw0KGgoAAAANSUhEUgAA...", // O corpo base64 puro
    "mimeType": "image/jpeg" // "image/jpeg" ou "image/png"
  }
}`}
                        </pre>
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
                        <p className="text-sm text-slate-600">Ocorre quando o motor da IA rejeita seu conteúdo ou está fora do ar. Recomendado exibir um toast de "Tente novamente mais tarde".</p>
                    </div>
                </div>
            </div>

        </div>
    );
}
