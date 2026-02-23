'use client';

import { useState, useEffect } from 'react';
import { AppWindow, Loader2, Plus, CheckCircle2, AlertCircle, Trash2, Edit2, X } from 'lucide-react';

export default function AdminAppsPage() {
    const [apps, setApps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [newAppId, setNewAppId] = useState('');
    const [newAppDesc, setNewAppDesc] = useState('');

    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [editingApp, setEditingApp] = useState<any | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editTab, setEditTab] = useState<'info' | 'prompt' | 'llm'>('info');

    useEffect(() => {
        fetchApps();
    }, []);

    const fetchApps = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/applications');
            if (res.ok) {
                const data = await res.json();
                setApps(data);
            } else {
                setErrorMsg('Falha ao carregar aplicativos.');
            }
        } catch (error) {
            console.error('Erro ao buscar aplicações:', error);
            setErrorMsg('Erro de conexão ao buscar aplicativos.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateApp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAppId.trim()) {
            setErrorMsg('O App ID é obrigatório.');
            return;
        }

        setSaving(true);
        setErrorMsg(null);
        setSuccessMsg(null);

        try {
            const res = await fetch('/api/admin/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: newAppId.trim(),
                    // We map description to a pre_prompt field internally if we want,
                    // but according to plan we simply leave pre_prompt blank. 
                    // Let's add description to the document schema just for display.
                    description: newAppDesc.trim(),
                    pre_prompt: ''
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Falha ao criar o aplicativo.');
            }

            setSuccessMsg('Aplicativo criado com sucesso!');
            setNewAppId('');
            setNewAppDesc('');
            fetchApps(); // Reload list

            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (error: any) {
            setErrorMsg(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteApp = async (id: string) => {
        if (!confirm(`Tem certeza que deseja excluir o App "${id}"? Isso removerá as configurações de prompt associadas.`)) return;

        setSaving(true);
        setErrorMsg(null);
        try {
            const res = await fetch('/api/admin/applications', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });

            if (!res.ok) throw new Error('Falha ao excluir o aplicativo.');

            setSuccessMsg('Aplicativo excluído com sucesso!');
            fetchApps();
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (error: any) {
            setErrorMsg(error.message);
        } finally {
            setSaving(false);
        }
    };

    const openEditModal = (app: any) => {
        setEditingApp({ ...app });
        setEditTab('info');
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setEditingApp(null);
        setIsEditModalOpen(false);
    };

    const handleUpdateApp = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setErrorMsg(null);

        try {
            // Reusing the PATCH route which takes { apps: [{id, pre_prompt, description...}] }
            // Note: Our PATCH currently only updates pre_prompt, we need it to update description too or replace it.
            // Wait, we can just POST it again because in Firestore, set() with merge:true or update() can be used.
            // Wait, our backend POST has a check if it exists: `if (appDoc.exists) return 409`.
            // Our backend PATCH updates `pre_prompt` explicitly inside the batch loop.
            const res = await fetch('/api/admin/applications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apps: [{
                        id: editingApp.id,
                        pre_prompt: editingApp.pre_prompt, // preserve legacy
                        description: editingApp.description,
                        system_prompt: editingApp.system_prompt,
                        llm_model: editingApp.llm_model,
                        temperature: editingApp.temperature
                    }]
                })
            });

            if (!res.ok) throw new Error('Falha ao atualizar o aplicativo.');

            setSuccessMsg('Aplicativo atualizado com sucesso!');
            closeEditModal();
            fetchApps();
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (error: any) {
            setErrorMsg(error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 w-full flex justify-center items-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[#002554]" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <AppWindow className="w-6 h-6 text-[#002554]" />
                    Aplicações (Apps)
                </h1>
                <p className="text-slate-500 mt-1">Gerencie os projetos e agentes que consomem a Inteligência Artificial do Gateway.</p>
            </div>

            {/* Global Alerts */}
            {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-xl flex items-center shadow-sm">
                    <CheckCircle2 className="w-5 h-5 mr-3 shrink-0 text-emerald-600" />
                    <span className="font-medium text-sm">{successMsg}</span>
                </div>
            )}
            {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center shadow-sm">
                    <AlertCircle className="w-5 h-5 mr-3 shrink-0 text-red-600" />
                    <span className="font-medium text-sm">{errorMsg}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cadastro Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Plus className="w-5 h-5 text-emerald-600" />
                            <h3 className="text-lg font-bold text-slate-800">Novo Aplicativo</h3>
                        </div>
                        <form onSubmit={handleCreateApp} className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-slate-700 block mb-1">App ID (Nome Único)</label>
                                <input
                                    type="text"
                                    value={newAppId}
                                    onChange={e => setNewAppId(e.target.value)}
                                    placeholder="ex: agente-educacional"
                                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#002554]/20 focus:border-[#002554] outline-none w-full font-mono bg-slate-50"
                                    required
                                />
                                <p className="text-xs text-slate-500 mt-1">Sugerido usar hífens e sem espaços.</p>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-700 block mb-1">Descrição</label>
                                <input
                                    type="text"
                                    value={newAppDesc}
                                    onChange={e => setNewAppDesc(e.target.value)}
                                    placeholder="ex: Agente tutor de tecnologia assistiva"
                                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#002554]/20 focus:border-[#002554] outline-none w-full"
                                />
                                <p className="text-xs text-slate-500 mt-1">Uma breve nota para identificar o uso deste app.</p>
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg bg-[#002554] text-white font-medium hover:bg-[#002554]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin -ml-1 mr-2" /> : null}
                                Criar Aplicativo
                            </button>
                            <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded-lg mt-4 border border-blue-100 italic">
                                Após a criação, vá em <strong>Módulos IA</strong> para vincular as regras de Prompt deste App.
                            </div>
                        </form>
                    </div>
                </div>

                {/* Lista de Apps */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-slate-800">Aplicações Registradas</h3>

                    {apps.length === 0 ? (
                        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-8 text-center text-slate-500">
                            Nenhum aplicativo cadastrado ainda. Use o formulário ao lado para criar o primeiro.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {apps.map((app) => (
                                <div key={app.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="bg-slate-100 text-[#002554] font-mono text-xs font-bold px-2 py-1 rounded inline-block border border-slate-200">
                                                {app.id}
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-600 mt-3 font-medium">
                                            {app.description || 'Sem descrição definida.'}
                                        </p>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                                        <span className="text-[10px] text-slate-400">Inserido em {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Desconhecido'}</span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEditModal(app)}
                                                className="p-1.5 text-slate-400 hover:text-[#002554] hover:bg-slate-100 rounded transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteApp(app.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                title="Excluir"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Edição Avançada */}
            {isEditModalOpen && editingApp && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col h-[80vh] max-h-[700px]">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50 rounded-t-2xl shrink-0">
                            <div>
                                <h3 className="text-lg font-bold text-[#002554] flex items-center gap-2">
                                    <AppWindow className="w-5 h-5 text-emerald-600" />
                                    Configurar Agente: {editingApp.id}
                                </h3>
                            </div>
                            <button onClick={closeEditModal} className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-slate-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex flex-1 overflow-hidden">
                            {/* Tabs Sidebar */}
                            <div className="w-48 bg-slate-50/50 border-r border-slate-100 p-4 space-y-2 shrink-0 overflow-y-auto">
                                <button
                                    type="button"
                                    onClick={() => setEditTab('info')}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${editTab === 'info' ? 'bg-white text-[#002554] shadow-sm border border-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}
                                >
                                    Informações Básicas
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditTab('prompt')}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${editTab === 'prompt' ? 'bg-white text-[#002554] shadow-sm border border-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}
                                >
                                    Regras & Identidade
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditTab('llm')}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${editTab === 'llm' ? 'bg-white text-[#002554] shadow-sm border border-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}
                                >
                                    Modelo & LLM
                                </button>
                            </div>

                            {/* Conteúdo da Tab */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {editTab === 'info' && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div>
                                            <label className="text-sm font-bold text-slate-700 block mb-1">App ID (Fixo)</label>
                                            <input
                                                type="text"
                                                value={editingApp.id}
                                                disabled
                                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm w-full font-mono bg-slate-100 text-slate-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-bold text-slate-700 block mb-1">Descrição</label>
                                            <input
                                                type="text"
                                                value={editingApp.description || ''}
                                                onChange={e => setEditingApp({ ...editingApp, description: e.target.value })}
                                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#002554]/20 focus:border-[#002554] outline-none w-full"
                                                placeholder="ex: Agente de Análise Liber"
                                            />
                                        </div>
                                    </div>
                                )}

                                {editTab === 'prompt' && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="bg-blue-50/50 p-4 border border-blue-100 rounded-lg mb-2 text-sm text-slate-600">
                                            Essa é a "alma" do seu agente. Defina o tom, formato de resposta, e conhecimentos essenciais que devem ser enxertados no início de cada conversa.
                                        </div>
                                        <div>
                                            <label className="text-sm font-bold text-slate-700 block mb-1">System Prompt / Regras do Agente</label>
                                            <textarea
                                                value={editingApp.system_prompt || ''}
                                                onChange={e => setEditingApp({ ...editingApp, system_prompt: e.target.value })}
                                                rows={10}
                                                className="rounded-lg border border-slate-300 px-3 py-3 text-sm focus:ring-2 focus:ring-[#002554]/20 focus:border-[#002554] outline-none w-full resize-none leading-relaxed shadow-sm"
                                                placeholder="Você é um assistente..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {editTab === 'llm' && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div>
                                            <label className="text-sm font-bold text-slate-700 block mb-1">Modelo de Inteligência Artificial</label>
                                            <select
                                                value={editingApp.llm_model || 'gemini-2.5-flash'}
                                                onChange={e => setEditingApp({ ...editingApp, llm_model: e.target.value })}
                                                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#002554]/20 focus:border-[#002554] outline-none w-full bg-white shadow-sm"
                                            >
                                                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recomendado / Mais Rápido)</option>
                                                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Avançado / Alto Consumo)</option>
                                                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Legado)</option>
                                                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Legado)</option>
                                            </select>
                                            <p className="text-xs text-slate-500 mt-2">
                                                Modelos Pro gastam sensivelmente mais na sua cota de acesso ao Google. Use-os apenas com prompts complexos.
                                            </p>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-sm font-bold text-slate-700">Temperatura (Criatividade): {editingApp.temperature || 0}</label>
                                            </div>
                                            <input
                                                type="range"
                                                min="0.0" max="2.0" step="0.1"
                                                value={editingApp.temperature || 0.7}
                                                onChange={e => setEditingApp({ ...editingApp, temperature: parseFloat(e.target.value) })}
                                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#002554]"
                                            />
                                            <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1 mt-2">
                                                <span>Focado / Preditivo</span>
                                                <span>Criativo / Aleatório</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-slate-50 rounded-b-2xl shrink-0 gap-3">
                            <button
                                type="button"
                                onClick={closeEditModal}
                                disabled={saving}
                                className="px-5 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-white font-bold transition-colors shadow-sm text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleUpdateApp}
                                disabled={saving}
                                className="flex items-center justify-center px-6 py-2 bg-[#002554] text-white rounded-lg hover:bg-blue-900 font-bold transition-colors disabled:opacity-50 min-w-[140px] shadow-md text-sm"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Salvar App
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
