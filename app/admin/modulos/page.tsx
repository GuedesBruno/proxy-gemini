'use client';

import { useState, useEffect } from 'react';
import { Bot, Settings2, ShieldAlert, Cpu, Database, Activity, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminModulosPage() {
    const [settings, setSettings] = useState<any>(null);
    const [apps, setApps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeModal, setActiveModal] = useState<'prompts' | 'llm' | 'limits' | null>(null);
    const [wizardStep, setWizardStep] = useState(1);
    const [formData, setFormData] = useState<any>({});
    const [appsFormData, setAppsFormData] = useState<any[]>([]);

    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const [resSettings, resApps] = await Promise.all([
                fetch('/api/admin/settings'),
                fetch('/api/admin/applications')
            ]);

            if (resSettings.ok && resApps.ok) {
                const dataSettings = await resSettings.json();
                const dataApps = await resApps.json();
                setSettings(dataSettings);
                setFormData(dataSettings);
                setApps(dataApps);
                setAppsFormData(dataApps);
            } else {
                throw new Error('Falha em buscar recursos');
            }
        } catch (error) {
            console.error('Erro ao buscar db base:', error);
            setErrorMsg('Falha ao carregar as configurações ou aplicações.');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (type: 'prompts' | 'llm' | 'limits') => {
        setFormData({ ...settings }); // reset form to current settings
        setAppsFormData([...apps]); // reset apps
        setWizardStep(1); // reset step
        setErrorMsg(null);
        setSuccessMsg(null);
        setActiveModal(type);
    };

    const closeModal = () => {
        setActiveModal(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        // Evita salvamento prematuro se estiver no meio do Wizard de Prompts
        if (activeModal === 'prompts' && wizardStep === 1) {
            setWizardStep(2);
            return;
        }

        setSaving(true);
        setErrorMsg(null);
        setSuccessMsg(null);

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Falha ao salvar as configurações.');

            const updatedData = await res.json();
            setSettings(updatedData);

            if (activeModal === 'prompts') {
                // 1. Array Updates (PATCH)
                const resApps = await fetch('/api/admin/applications', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ apps: appsFormData })
                });

                if (!resApps.ok) throw new Error('Falha ao salvar prompts de aplicativos específicos.');
                setApps([...appsFormData]);
            }

            setSuccessMsg('Configurações salvas com sucesso!');
            setTimeout(() => {
                closeModal();
                setSuccessMsg(null);
            }, 1500);

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
                    <Cpu className="w-6 h-6 text-[#002554]" />
                    Módulos Inteligência Artificial
                </h1>
                <p className="text-slate-500 mt-1">Gerencie os agentes, limites e configurações dos modelos LLM que operam por trás da plataforma.</p>
            </div>

            {/* Global Alerts */}
            {successMsg && !activeModal && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-xl flex items-center shadow-sm">
                    <CheckCircle2 className="w-5 h-5 mr-3 shrink-0 text-emerald-600" />
                    <span className="font-medium text-sm">{successMsg}</span>
                </div>
            )}
            {errorMsg && !activeModal && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center shadow-sm">
                    <AlertCircle className="w-5 h-5 mr-3 shrink-0 text-red-600" />
                    <span className="font-medium text-sm">{errorMsg}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Agent Config Card */}
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col items-start justify-between">
                    <div className="w-full">
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                            <Bot className="w-6 h-6 text-[#002554]" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Comportamento do Agente</h3>
                        <p className="text-sm text-slate-500 mb-4 h-10">Configure as instruções de sistema, persona e tom de voz do Assistente Base.</p>
                    </div>
                    <button onClick={() => openModal('prompts')} className="text-sm font-semibold text-[#002554] bg-slate-50 w-full py-2.5 rounded-lg border border-slate-200 hover:bg-[#002554] hover:border-[#002554] hover:text-white transition-all">
                        Configurar Prompts
                    </button>
                </div>

                {/* LLM Models Card */}
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col items-start justify-between">
                    <div className="w-full">
                        <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
                            <Database className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Modelos (Gemini / GPT)</h3>
                        <p className="text-sm text-slate-500 mb-4 h-10">Selecione o motor de processamento, temperatura de criatividade e Fallbacks.</p>
                    </div>
                    <button onClick={() => openModal('llm')} className="text-sm font-semibold text-purple-600 bg-slate-50 w-full py-2.5 rounded-lg border border-slate-200 hover:bg-purple-600 hover:border-purple-600 hover:text-white transition-all">
                        Ajustar LLM
                    </button>
                </div>

                {/* Rate limits Card */}
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col items-start justify-between">
                    <div className="w-full">
                        <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center mb-4">
                            <ShieldAlert className="w-6 h-6 text-orange-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Rate Limits & Segurança</h3>
                        <p className="text-sm text-slate-500 mb-4 h-10">Controle a vazão de requisições por segundo (RPS) e limites diários de contexto.</p>
                    </div>
                    <button onClick={() => openModal('limits')} className="text-sm font-semibold text-orange-600 bg-slate-50 w-full py-2.5 rounded-lg border border-slate-200 hover:bg-orange-600 hover:border-orange-600 hover:text-white transition-all">
                        Gerenciar Limites
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mt-8">
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-bold text-slate-800">Status dos Serviços Integrados</h3>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-sm font-medium text-slate-700">Motor Primário (Google Gemini API)</span>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500">{settings?.llm_model}</span>
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">Online</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 opacity-60">
                        <span className="text-sm font-medium text-slate-700">OpenAI Fallback API</span>
                        <span className="px-2.5 py-1 bg-slate-200 text-slate-500 text-xs font-bold rounded-full">Desativado</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 opacity-60">
                        <span className="text-sm font-medium text-slate-700">Vector Embeddings (RAG)</span>
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">Pausado (Em Breve)</span>
                    </div>
                </div>
            </div>

            {/* MODALS */}
            {activeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50 rounded-t-2xl shrink-0">
                            <h3 className="text-lg font-bold text-[#002554] flex items-center gap-2">
                                {activeModal === 'prompts' && <><Bot className="w-5 h-5" /> Configurar Comportamento (Persona)</>}
                                {activeModal === 'llm' && <><Database className="w-5 h-5" /> Ajustar Motor LLM</>}
                                {activeModal === 'limits' && <><ShieldAlert className="w-5 h-5" /> View Limits & Defesas</>}
                            </h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-red-500 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto">
                            {errorMsg && (
                                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center shadow-sm">
                                    <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                                    <span className="font-medium text-sm">{errorMsg}</span>
                                </div>
                            )}
                            {successMsg && (
                                <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center shadow-sm">
                                    <CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
                                    <span className="font-medium text-sm">{successMsg}</span>
                                </div>
                            )}

                            <form id="settings-form" onSubmit={handleSave} className="flex flex-col gap-5">

                                {/* PROMPTS MODAL */}
                                {activeModal === 'prompts' && (
                                    <>
                                        {/* Step Indicator */}
                                        <div className="flex items-center gap-2 mb-6">
                                            <div className={`flex-1 h-2 rounded-full transition-colors ${wizardStep >= 1 ? 'bg-[#002554]' : 'bg-slate-200'}`}></div>
                                            <div className={`flex-1 h-2 rounded-full transition-colors ${wizardStep === 2 ? 'bg-[#002554]' : 'bg-slate-200'}`}></div>
                                        </div>

                                        {wizardStep === 1 && (
                                            <div className="flex flex-col gap-1.5 border-b border-slate-200 pb-6 mb-2 animate-in fade-in slide-in-from-right-4 duration-300">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="h-6 w-1 bg-[#002554] rounded-full"></div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800">Passo 1: Regras Globais do Gateway</h4>
                                                        <p className="text-xs text-slate-500 font-normal mt-0.5">A base comportamental (Persona) de todas as suas IAs.</p>
                                                    </div>
                                                </div>
                                                <label className="text-sm font-bold text-slate-700 mt-2">Persona do Agente Base</label>
                                                <input
                                                    type="text"
                                                    value={formData.persona || ''}
                                                    onChange={e => setFormData({ ...formData, persona: e.target.value })}
                                                    placeholder="Ex: Assistente Especializado em Vendas"
                                                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#002554]/20 focus:border-[#002554] outline-none transition-all w-full"
                                                    required
                                                />
                                                <p className="text-xs text-slate-500 mb-3 block">Identificação interna para esta persona.</p>

                                                <label className="text-sm font-bold text-slate-700 mt-2">System Prompt Global</label>
                                                <textarea
                                                    value={formData.system_prompt || ''}
                                                    onChange={e => setFormData({ ...formData, system_prompt: e.target.value })}
                                                    rows={5}
                                                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#002554]/20 focus:border-[#002554] outline-none transition-all resize-none w-full leading-relaxed"
                                                    placeholder="Você é um assistente..."
                                                />
                                            </div>
                                        )}

                                        {/* Modais de Apps Específicas */}
                                        {wizardStep === 2 && (
                                            <div className="flex flex-col gap-1.5 mt-2 animate-in fade-in slide-in-from-right-4 duration-300">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="h-6 w-1 bg-amber-500 rounded-full"></div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800">Passo 2: Diretrizes Específicas (Por App)</h4>
                                                        <p className="text-xs text-slate-500 font-normal mt-0.5">Regras únicas para cada aplicativo conectado que sobrescrevem o global.</p>
                                                    </div>
                                                </div>

                                                {appsFormData.length === 0 ? (
                                                    <p className="text-sm text-slate-500 italic p-4 bg-slate-50 rounded-lg text-center mt-4">Nenhum aplicativo registrado no projeto.</p>
                                                ) : (
                                                    <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 mt-2">
                                                        {appsFormData.map((app: any, idx: number) => (
                                                            <div key={app.id || idx} className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col gap-2">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="font-bold text-sm text-[#002554]">App ID:</span>
                                                                    <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-slate-200">{app.id}</span>
                                                                </div>
                                                                <textarea
                                                                    value={app.pre_prompt || ''}
                                                                    onChange={(e) => {
                                                                        const nv = [...appsFormData];
                                                                        nv[idx].pre_prompt = e.target.value;
                                                                        setAppsFormData(nv);
                                                                    }}
                                                                    rows={3}
                                                                    className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all resize-none bg-white w-full leading-relaxed"
                                                                    placeholder="Regras particulares para este projeto (ex: Formate as saídas como XML)."
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* LLM MODAL */}
                                {activeModal === 'llm' && (
                                    <>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-bold text-slate-700">Modelo Primário (Gemini)</label>
                                            <select
                                                value={formData.llm_model || 'gemini-2.5-flash'}
                                                onChange={e => setFormData({ ...formData, llm_model: e.target.value })}
                                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#002554]/20 focus:border-[#002554] outline-none transition-all"
                                            >
                                                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recomendado / Rápido)</option>
                                                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Tarefas Complexas / Caro)</option>
                                                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Antigo)</option>
                                                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Antigo)</option>
                                            </select>
                                            <p className="text-xs text-slate-500 mx-1">O modelo Pro gasta até 10x mais tokens financeiros do Google.</p>
                                        </div>
                                        <div className="flex flex-col gap-1.5 mt-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-bold text-slate-700">Temperatura: {formData.temperature || 0}</label>
                                            </div>
                                            <input
                                                type="range"
                                                min="0.0" max="2.0" step="0.1"
                                                value={formData.temperature || 0.7}
                                                onChange={e => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#002554]"
                                            />
                                            <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1">
                                                <span>Restrito / Lógico</span>
                                                <span>Criativo / Aleatório</span>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* LIMITS MODAL */}
                                {activeModal === 'limits' && (
                                    <>
                                        <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl mb-2 flex gap-3">
                                            <ShieldAlert className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                                            <div className="text-sm text-orange-800">
                                                <p className="font-bold mb-1">Proteção de Infraestrutura</p>
                                                Essas métricas limitam a taxa máxima global da API por motivos de segurança, se sobrepondo ao limite individual do cliente.
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-bold text-slate-700">RPS Global (Requests Per Second)</label>
                                            <input
                                                type="number"
                                                value={formData.rate_limit_rps || 0}
                                                onChange={e => setFormData({ ...formData, rate_limit_rps: parseInt(e.target.value) })}
                                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#002554]/20 focus:border-[#002554] outline-none transition-all"
                                                min={1}
                                            />
                                            <p className="text-xs text-slate-500">Pico máximo de requisições simultâneas aceitas pelo Node.js Proxy.</p>
                                        </div>
                                        <div className="flex flex-col gap-1.5 mt-2">
                                            <label className="text-sm font-bold text-slate-700">Maximum Daily Context Tokens</label>
                                            <input
                                                type="number"
                                                value={formData.daily_tokens_cap || 0}
                                                onChange={e => setFormData({ ...formData, daily_tokens_cap: parseInt(e.target.value) })}
                                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#002554]/20 focus:border-[#002554] outline-none transition-all font-mono"
                                                min={10000}
                                                step={10000}
                                            />
                                            <p className="text-xs text-slate-500">Limite de segurança emergencial (Soft Cap).</p>
                                        </div>
                                    </>
                                )}
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl shrink-0 gap-3">
                            {activeModal === 'prompts' && wizardStep === 1 ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        disabled={saving}
                                        className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 font-bold transition-colors text-sm"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        key="btn-advance"
                                        onClick={(e) => { e.preventDefault(); setWizardStep(2); }}
                                        className="flex items-center justify-center gap-2 px-6 py-2 bg-[#002554] text-white rounded-lg hover:bg-blue-900 font-bold transition-colors min-w-[120px] text-sm shadow-md"
                                    >
                                        Avançar (Apps) ➔
                                    </button>
                                </>
                            ) : activeModal === 'prompts' && wizardStep === 2 ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setWizardStep(1)}
                                        disabled={saving}
                                        className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 font-bold transition-colors text-sm"
                                    >
                                        ⬅ Voltar
                                    </button>
                                    <button
                                        type="submit"
                                        form="settings-form"
                                        disabled={saving}
                                        className="flex items-center justify-center gap-2 px-6 py-2 bg-[#002554] text-white rounded-lg hover:bg-blue-900 font-bold transition-colors disabled:opacity-70 min-w-[120px] text-sm shadow-md"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Alterações'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        disabled={saving}
                                        className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 font-bold transition-colors text-sm"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        form="settings-form"
                                        disabled={saving}
                                        className="flex items-center justify-center gap-2 px-6 py-2 bg-[#002554] text-white rounded-lg hover:bg-blue-900 font-bold transition-colors disabled:opacity-70 min-w-[120px] text-sm shadow-md"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Alterações'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
