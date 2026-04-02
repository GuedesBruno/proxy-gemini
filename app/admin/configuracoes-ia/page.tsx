'use client';

import { useState, useEffect } from 'react';
import { Cpu, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface AppConfig {
    id: string;
    description?: string;
    product_id?: string;
    system_prompt?: string;
    llm_model?: string;
    temperature?: number;
}

export default function AdminConfiguracoesIA() {
    const [apps, setApps] = useState<AppConfig[]>([]);
    const [selectedApp, setSelectedApp] = useState<AppConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        fetchApps();
    }, []);

    const fetchApps = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const res = await fetch('/api/admin/applications');
            if (!res.ok) throw new Error('Falha ao carregar aplicações.');
            const data = await res.json();
            setApps(data || []);
            setSelectedApp(data?.[0] || null);
        } catch (err: any) {
            setErrorMsg(err.message || 'Erro ao carregar aplicações.');
        } finally {
            setLoading(false);
        }
    };

    const handleFieldChange = (key: keyof AppConfig, value: any) => {
        if (!selectedApp) return;
        setSelectedApp({ ...selectedApp, [key]: value });
    };

    const handleSave = async () => {
        if (!selectedApp) return;
        setSaving(true);
        setErrorMsg(null);

        try {
            const payload = {
                id: selectedApp.id,
                description: selectedApp.description || '',
                product_id: selectedApp.product_id || '',
                system_prompt: selectedApp.system_prompt || '',
                llm_model: selectedApp.llm_model || 'gemini-2.5-flash',
                temperature: selectedApp.temperature ?? 0.7
            };

            const res = await fetch('/api/admin/applications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apps: [payload] })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Falha ao salvar aplicação.');
            }

            setSuccessMsg('Aplicação atualizada com sucesso.');
            fetchApps();
            setTimeout(() => setSuccessMsg(null), 2500);
        } catch (err: any) {
            setErrorMsg(err.message || 'Erro ao salvar aplicação.');
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
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errorMsg}
                </div>
            )}

            {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {successMsg}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <h2 className="font-bold text-slate-800 mb-3">Aplicações</h2>
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                        {apps.length === 0 ? (
                            <p className="text-slate-500 text-sm">Nenhuma aplicação cadastrada.</p>
                        ) : (
                            apps.map((app) => (
                                <button
                                    key={app.id}
                                    onClick={() => setSelectedApp(app)}
                                    className={`w-full text-left px-3 py-2 rounded-lg transition ${selectedApp?.id === app.id ? 'bg-blue-50 border border-blue-300' : 'hover:bg-slate-50'}`}
                                >
                                    <p className="font-semibold text-slate-800">{app.id}</p>
                                    <p className="text-xs text-slate-500">{app.description || 'Sem descrição'}</p>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <h2 className="font-bold text-slate-800 mb-4">Editar Aplicação</h2>
                    {!selectedApp ? (
                        <p className="text-slate-500">Selecione uma aplicação para editar.</p>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">App ID</label>
                                <input type="text" value={selectedApp.id} disabled className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-100" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Descrição</label>
                                <input
                                    type="text"
                                    value={selectedApp.description || ''}
                                    onChange={(e) => handleFieldChange('description', e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">System Prompt</label>
                                <textarea
                                    value={selectedApp.system_prompt || ''}
                                    onChange={(e) => handleFieldChange('system_prompt', e.target.value)}
                                    rows={5}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">LLM Model</label>
                                    <select
                                        value={selectedApp.llm_model || 'gemini-2.5-flash'}
                                        onChange={(e) => handleFieldChange('llm_model', e.target.value)}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2"
                                    >
                                        <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                                        <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                                        <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                                        <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Temperatura</label>
                                    <input
                                        type="range"
                                        min={0}
                                        max={2}
                                        step={0.1}
                                        value={selectedApp.temperature ?? 0.7}
                                        onChange={(e) => handleFieldChange('temperature', Number(e.target.value))}
                                        className="w-full"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">{(selectedApp.temperature ?? 0.7).toFixed(1)}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-[#002554] text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-900 disabled:opacity-50"
                            >
                                {saving ? 'Salvando...' : 'Salvar Configuração'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
