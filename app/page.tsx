'use client';

import { useState } from 'react';

export default function Home() {
  const [appId, setAppId] = useState('liber_chat');
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<{ role: string; parts: { text: string }[] }[]>([]);
  const [responseData, setResponseData] = useState<{
    tokens_consumed: number;
    updated_balance: number;
  } | null>(null);

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
    if (!message.trim() || loading) return;

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
      const newUserMsg = { role: 'user', parts: [{ text: message }] };
      const updatedHistory = [...chatHistory, newUserMsg];
      setChatHistory(updatedHistory);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'user_teste_123',
          appId,
          history: updatedHistory,
          image: imagePayload
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao processar requisição');
      }

      setResponseData(data);

      // 2. Adiciona a resposta da IA no histórico
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

            {/* Input - File / Image Upload */}
            <div>
              <label htmlFor="imageUpload" className="block text-sm font-semibold text-gray-700 mb-2">
                Anexar Imagem (Opcional, aceita JPEG, PNG, WEBP)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label
                      htmlFor="imageUpload"
                      className="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Faça o upload de um arquivo</span>
                      <input
                        id="imageUpload"
                        name="imageUpload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          setImageFile(file || null);
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    {imageFile ? `Arquivo selecionado: ${imageFile.name}` : 'PNG, JPG, WEBP até 4MB'}
                  </p>
                </div>
              </div>
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
                <div className="bg-gray-100 px-4 py-3 border-b flex items-center shrink-0">
                  <span className="font-semibold text-gray-700 text-sm">Histórico de Conversa</span>
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
