'use client';

import { useState } from 'react';

export default function Home() {
  const [appId, setAppId] = useState('liber_chat');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<{
    message: string;
    tokens_consumed: number;
    updated_balance: number;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResponseData(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'user_teste_123',
          appId,
          message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao processar requisição');
      }

      setResponseData(data);
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
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Proxy Liber</h1>
          <p className="mt-2 text-blue-100 text-sm font-medium">
            Ambiente de testes integrados para a API Gemini
          </p>
        </div>

        {/* Form Container */}
        <div className="px-6 py-8 sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Input - App ID */}
            <div>
              <label htmlFor="appId" className="block text-sm font-semibold text-gray-700 mb-2">
                Módulo / Contexto (App ID)
              </label>
              <select
                id="appId"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                className="block w-full rounded-lg border-2 border-gray-200 py-3 pl-4 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 bg-gray-50 transition-all duration-200 text-gray-800"
              >
                <option value="liber_chat" className="font-medium text-gray-700">Assistente de Conversação (liber_chat)</option>
                <option value="liber_vision" className="font-medium text-gray-700">Leitor/Audiodescrição (liber_vision)</option>
              </select>
            </div>

            {/* Input - Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                Sua Mensagem
              </label>
              <textarea
                id="message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="block w-full rounded-lg border-2 border-gray-200 py-3 px-4 text-base focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 bg-gray-50 transition-all duration-200 resize-none text-gray-800 placeholder:text-gray-400"
                placeholder="Insira o texto base para a geração de conteúdo..."
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-200 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex">
                  <div className="flex-shrink-0">
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className={`group relative w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-base font-bold text-white 
                ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500/50'} 
                transition-all duration-300 ease-in-out`}
            >
              <div className="flex items-center space-x-2">
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processando seu pedido...</span>
                  </>
                ) : (
                  <span>Enviar Solicitação</span>
                )}
              </div>
            </button>
          </form>
        </div>

        {/* Results Info Cards */}
        {responseData && (
          <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-8 sm:px-10 flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500 fade-in">
            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Tokens Utilizados */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm transition-transform hover:-translate-y-1 duration-300">
                <div className="flex items-center space-x-2 mb-2">
                  <svg className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">Custo / Tokens</span>
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

            {/* Gemini Response Block */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <div className="flex items-center mb-4 space-x-2 border-b border-gray-100 pb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                  <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </span>
                <h3 className="text-sm font-bold tracking-wider text-gray-800 uppercase">Resposta do Gemini</h3>
              </div>

              <div className="prose prose-sm sm:prose-base max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                {responseData.message}
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}
