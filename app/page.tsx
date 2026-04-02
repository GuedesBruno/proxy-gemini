'use client';

import { useState, useEffect } from 'react';
import { Paperclip, Send, Loader2, Trash2 } from 'lucide-react';

interface Product {
  id: string;
  name?: string;
}

interface AppItem {
  id: string;
  description?: string;
  product_id?: string;
  productId?: string;
  system_prompt?: string;
}

interface UserItem {
  id: string;
  name?: string;
  email?: string;
  product_id?: string;
}

export default function Home() {
  const [isAdminSession, setIsAdminSession] = useState(false);
  const [productId, setProductId] = useState('');
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [appId, setAppId] = useState('');
  const [availableApps, setAvailableApps] = useState<AppItem[]>([]);
  const [simulatedUserId, setSimulatedUserId] = useState('');
  const [availableUsers, setAvailableUsers] = useState<UserItem[]>([]);
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<{ role: string; parts: { text: string }[] }[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<{
    tokens_consumed: number;
    updated_balance: number;
  } | null>(null);

  useEffect(() => {
    const roleCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('session_role='))
      ?.split('=')[1];

    setIsAdminSession(roleCookie === 'admin' || roleCookie === 'superadmin');

    const fetchSelectData = async () => {
      try {
        const [resUsers, resApps, resProducts] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/admin/applications'),
          fetch('/api/admin/products')
        ]);

        if (resUsers.ok) {
          const usersList = await resUsers.json();
          setAvailableUsers(usersList);
          if (usersList.length > 0) setSimulatedUserId(usersList[0].id);
        }

        if (resApps.ok) {
          const appsList = await resApps.json();
          setAvailableApps(appsList);
        }

        if (resProducts.ok) {
          const productsList = await resProducts.json();
          setAvailableProducts(productsList);
          if (productsList.length > 0) setProductId(productsList[0].id);
        }
      } catch (err) {
        console.error("Erro ao buscar dados iniciais:", err);
      }
    };
    fetchSelectData();
  }, []);

  const normalizeValue = (value?: string) => (value || '').trim().toLowerCase();
  const appProductId = (app: AppItem) => app.product_id || app.productId || '';

  const filteredApps = availableApps.filter((a) => {
    return normalizeValue(appProductId(a)) === normalizeValue(productId);
  });
  const productMatchedUsers = availableUsers.filter((u) => {
    return normalizeValue(u.product_id) === normalizeValue(productId);
  });
  const filteredUsers = isAdminSession ? availableUsers : productMatchedUsers;
  const selectedApp = filteredApps.find((a) => a.id === appId) || null;

  useEffect(() => {
    if (filteredApps.length > 0) {
      if (!filteredApps.some((a) => a.id === appId)) {
        setAppId(filteredApps[0].id);
      }
    } else {
      setAppId('');
    }
    setShowPromptPreview(false);
  }, [productId, availableApps]);

  useEffect(() => {
    if (filteredUsers.length > 0) {
      if (!filteredUsers.some((u) => u.id === simulatedUserId)) {
        setSimulatedUserId(filteredUsers[0].id);
      }
    } else {
      setSimulatedUserId('');
    }
  }, [productId, availableUsers]);

  const clearHistory = () => {
    if (confirm('Tem certeza que deseja limpar o histórico de conversa com este App? Isto forçará o proxy a criar uma nova Thread de sessão limpa.')) {
      setChatHistory([]);
      setThreadId(null);
      setResponseData(null);
    }
  };

  // Helper function to read file as Base64 string
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let base64String = reader.result as string;
        // Remove the data:*/*;base64, prefix
        base64String = base64String.split(';base64,').pop() || '';
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && !imageFile) || loading || !appId || !simulatedUserId) return;

    setLoading(true);
    setError(null);
    setResponseData(null);

    try {
      let imagePayload = undefined;

      if (imageFile) {
        const base64Data = await fileToBase64(imageFile);
        imagePayload = {
          base64: base64Data,
          mimeType: imageFile.type,
        };
      }

      // 1. Atualiza visualmente o historico imediatamente com a mensagem enviada
      const previewText = message.trim() ? message : '[Imagem enviada sem texto]';
      const newUserMsg = { role: 'user', parts: [{ text: previewText }] };
      setChatHistory(prev => [...prev, newUserMsg]);

      const reqBody: any = {
        userId: simulatedUserId,
        appId,
        message: message.trim(),
        image: imagePayload
      };

      // Se já temos uma thread ativa para essa conversa, passa ela pro servidor.
      if (threadId) {
        reqBody.threadId = threadId;
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reqBody),
      });

      const data = await res.json();

      if (!res.ok) {
        // Se a chamada falhou, removemos a mensagem visual otimista
        setChatHistory(prev => prev.slice(0, -1));
        throw new Error(data.error || 'Erro ao processar requisição');
      }

      setResponseData(data);

      // Guarda a Thread ID vinculada no backend para as proximas mensagens
      if (data.threadId) {
        setThreadId(data.threadId);
      }

      // 2. Adiciona a resposta da IA no histórico visual
      setChatHistory((prev) => [
        ...prev,
        { role: 'model', parts: [{ text: data.message }] }
      ]);

      // Limpar os campos apos o sucesso
      setMessage('');
      setImageFile(null);
      // Reseta o input de arquivo manipulando o DOM
      const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 antialiased">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

        {/* Header */}
        <div className="bg-blue-600 px-6 py-8 sm:px-10 text-center">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Painel IA - Tecassistiva</h1>
          <p className="mt-2 text-blue-100 text-sm font-medium">
            Ambiente de testes integrados para a API Gemini
          </p>
        </div>

        {/* Form Container */}
        <div className="px-6 py-8 sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Input - Product ID */}
            <div>
              <label htmlFor="productId" className="block text-sm font-semibold text-gray-700 mb-2">
                Produto
              </label>
              <select
                id="productId"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="block w-full rounded-lg border-2 border-gray-200 py-3 pl-4 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 bg-gray-50 transition-all duration-200 text-gray-800"
              >
                {availableProducts.length === 0 && <option value="">Carregando Produtos...</option>}
                {availableProducts.map((p) => (
                  <option key={p.id} value={p.id} className="font-medium text-gray-700">
                    {p.name || p.id}
                  </option>
                ))}
              </select>
            </div>

            {/* Input - App ID */}
            <div>
              <label htmlFor="appId" className="block text-sm font-semibold text-gray-700 mb-2">
                Aplicativo (filtrado pelo produto)
              </label>
              <select
                id="appId"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                className="block w-full rounded-lg border-2 border-gray-200 py-3 pl-4 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 bg-gray-50 transition-all duration-200 text-gray-800"
              >
                {filteredApps.length === 0 && <option value="">Nenhum app para este produto</option>}
                {filteredApps.map((a) => (
                  <option key={a.id} value={a.id} className="font-medium text-gray-700">
                    {a.id} {a.description ? `- ${a.description}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowPromptPreview((prev) => !prev)}
                disabled={!selectedApp}
                className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {showPromptPreview ? 'Ocultar Pré-Prompt' : 'Ver Pré-Prompt do App'}
              </button>
              {showPromptPreview && selectedApp && (
                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-500 mb-2">SYSTEM PROMPT</p>
                  <pre className="whitespace-pre-wrap text-sm text-slate-700">{selectedApp.system_prompt || 'Sem pré-prompt configurado para este app.'}</pre>
                </div>
              )}
            </div>

            {/* Input - User Selector */}
            {filteredUsers.length > 0 && (
              <div>
                <label htmlFor="simulatedUser" className="block text-sm font-semibold text-gray-700 mb-2">
                  Simular Escopo de Usuário (Consumo de Tokens na Base):
                </label>
                <select
                  id="simulatedUser"
                  value={simulatedUserId}
                  onChange={(e) => setSimulatedUserId(e.target.value)}
                  className="block w-full rounded-lg border-2 border-gray-200 py-3 pl-4 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 bg-gray-50 transition-all duration-200 text-gray-800"
                >
                  {filteredUsers.map((u) => (
                    <option key={u.id} value={u.id} className="font-medium text-gray-700">
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {availableUsers.length > 0 && filteredUsers.length === 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Nenhum usuário encontrado para o produto selecionado. Selecione outro produto ou vincule usuários a este produto.
              </div>
            )}

            {isAdminSession && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
                Sessão admin detectada: o teste pode usar usuários fora do produto selecionado.
              </div>
            )}

            {/* Input - Message & Image Attach */}
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                Mensagem (opcional quando enviar imagem)
              </label>

              <div className="relative flex items-end rounded-lg border-2 border-gray-200 bg-gray-50 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/20 transition-all duration-200">
                <div className="flex-1">
                  <textarea
                    id="message"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="block w-full rounded-lg border-none py-3 px-4 text-base focus:ring-0 bg-transparent resize-none text-gray-800 placeholder:text-gray-400"
                    placeholder="Digite uma mensagem ou envie apenas uma imagem..."
                  />
                  {imageFile && (
                    <div className="px-4 pb-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 truncate max-w-50">
                        {imageFile.name}
                      </span>
                      <button type="button" onClick={() => setImageFile(null)} className="ml-2 text-red-500 hover:text-red-700 text-xs font-bold">✕</button>
                    </div>
                  )}
                </div>

                {/* Oculto: O Input Real */}
                <input
                  id="imageUpload"
                  name="imageUpload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setImageFile(file || null);
                  }}
                />

                {/* Botões anexos e de Envio encapsulados no fundo da borda */}
                <div className="flex items-center gap-2 p-2 shrink-0 border-l border-gray-200">
                  <label
                    htmlFor="imageUpload"
                    className="cursor-pointer p-2 rounded-full hover:bg-gray-200 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Anexar Imagem"
                  >
                    <Paperclip className="w-5 h-5" />
                  </label>

                  <button
                    type="submit"
                      disabled={loading || (!message.trim() && !imageFile) || !appId || !simulatedUserId}
                    className={`p-2 rounded-full transition-all flex items-center justify-center 
                        ${(loading || (!message.trim() && !imageFile) || !appId || !simulatedUserId) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'}
                        `}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                  </button>
                </div>
              </div>
            </div>



            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-200 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex">
                  <div className="shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Falha ao se comunicar com a API</h3>
                    <div className="mt-1 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </form>
        </div>

        {/* Results Info Cards */}
        {responseData && (
          <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-8 sm:px-10 flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500 fade-in">
            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Tokens Utilizados */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm transition-transform hover:-translate-y-1 duration-300">
                <div className="flex items-center space-x-2 mb-2">
                  <svg className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">Custo Última Req</span>
                </div>
                <p className="mt-1 text-3xl font-extrabold text-gray-900">{responseData.tokens_consumed}</p>
              </div>

              {/* Saldo Restante */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm transition-transform hover:-translate-y-1 duration-300">
                <div className="flex items-center space-x-2 mb-2">
                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">Saldo Restante</span>
                </div>
                <p className="mt-1 text-3xl font-extrabold text-blue-600">{responseData.updated_balance}</p>
              </div>
            </div>

            {/* Gemini Response History */}
            {chatHistory.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm relative overflow-hidden flex flex-col h-96">
                <div className="bg-gray-100 px-4 py-3 border-b flex items-center justify-between shrink-0">
                  <span className="font-semibold text-gray-700 text-sm">Histórico de Conversa</span>
                  <button
                    type="button"
                    onClick={clearHistory}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors flex items-center gap-1"
                    title="Limpar Histórico"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-xs font-semibold">Limpar</span>
                  </button>
                </div>

                <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4">
                  {chatHistory.map((item, index) => {
                    const isUser = item.role === 'user';
                    return (
                      <div
                        key={index}
                        className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] px-5 py-3 rounded-2xl ${isUser
                            ? 'bg-blue-600 text-white rounded-tr-sm shadow-md'
                            : 'bg-gray-100 text-gray-800 rounded-tl-sm border border-gray-200 shadow-sm'
                            }`}
                        >
                          <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                            {item.parts[0]?.text}
                          </p>
                          <p className={`text-[10px] mt-2 block opacity-70 ${isUser ? 'text-right' : 'text-left'}`}>
                            {isUser ? 'Você' : 'Gemini'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
