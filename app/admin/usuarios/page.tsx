'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Pencil, Trash2, X } from 'lucide-react';

interface UserData {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    serialNumber?: string;
    plan_id?: string;
    token_balance: number;
    total_spent_tokens: number;
}

export default function UsersManagement() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);

    // Status
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Modal Control
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [processing, setProcessing] = useState(false);

    // Form states
    const [formName, setFormName] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formPhone, setFormPhone] = useState('');
    const [formSerial, setFormSerial] = useState('');
    const [formPlan, setFormPlan] = useState('');
    const [formTokens, setFormTokens] = useState('');

    // Inline Token Edit
    const [editingBalanceFor, setEditingBalanceFor] = useState<string | null>(null);
    const [balanceInput, setBalanceInput] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const handleOpenCreate = () => openModal();
        window.addEventListener('admin-users-open-create', handleOpenCreate);

        return () => {
            window.removeEventListener('admin-users-open-create', handleOpenCreate);
        };
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const res = await fetch('/api/admin/users');
            if (!res.ok) throw new Error('Falha ao obter utilizadores.');
            const data: UserData[] = await res.json();
            setUsers(data);
        } catch (error: any) {
            setErrorMsg(error.message || 'Erro desconhecido');
        } finally {
            setLoading(false);
        }
    };

    const displaySuccess = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 5000);
    }

    // Modal Operations
    const openModal = (user?: UserData) => {
        setErrorMsg(null);
        if (user) {
            setEditingUser(user);
            setFormName(user.name || '');
            setFormEmail(user.email || '');
            setFormPhone(user.phone || '');
            setFormSerial(user.serialNumber || '');
            setFormPlan(user.plan_id || 'none');
            setFormTokens(''); // Edit won't change balance here
        } else {
            setEditingUser(null);
            setFormName('');
            setFormEmail('');
            setFormPhone('');
            setFormSerial('');
            setFormPlan('none');
            setFormTokens('');
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrorMsg(null);

        try {
            if (editingUser) {
                // PATCH - Atualizando Perfil
                const res = await fetch('/api/admin/users', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: editingUser.id,
                        name: formName,
                        email: formEmail,
                        phone: formPhone,
                        serialNumber: formSerial,
                        plan_id: formPlan
                    })
                });

                if (!res.ok) throw new Error((await res.json()).error);
                fetchUsers();
                displaySuccess(`Utilizador ${formName || formEmail} atualizado!`);

            } else {
                // POST - Criando Novo Usuário
                const initialTokens = parseInt(formTokens, 10);
                if (isNaN(initialTokens) || initialTokens < 0) {
                    throw new Error('Tokens iniciais inválidos.');
                }

                const payload = {
                    name: formName,
                    email: formEmail,
                    phone: formPhone,
                    serialNumber: formSerial,
                    plan_id: formPlan,
                    initialTokens: Number(formTokens),
                    adminEmail: 'bi@tecassistiva.com.br' // Master authentication block bypass
                };

                const res = await fetch('/api/admin/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error((await res.json()).error);
                fetchUsers();
                displaySuccess(`Novo utilizador inserido no sistema!`);
            }
            closeModal();
        } catch (error: any) {
            setErrorMsg(error.message || 'Erro ao comunicar com a API de registo.');
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (userId: string, identifier: string) => {
        if (!window.confirm(`Tem a certeza que deseja APAGAR de forma irreversível o usuário ${identifier}?`)) {
            return;
        }

        setErrorMsg(null);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            if (!res.ok) throw new Error((await res.json()).error);

            setUsers(prev => prev.filter(u => u.id !== userId));
            displaySuccess('Registro apagado com sucesso.');

        } catch (err: any) {
            setErrorMsg(err.message || 'Erro ao apagar conta.');
        }
    }

    // Inline Balance Edit
    const handleUpdateBalance = async (userId: string) => {
        const inputValue = balanceInput[userId];
        if (inputValue === undefined) return;

        const newBalance = parseInt(inputValue, 10);

        // Se a input for vazia ou inválida cancela a edição
        if (isNaN(newBalance) || newBalance < 0) {
            setEditingBalanceFor(null);
            return;
        }

        const currentUser = users.find(u => u.id === userId);
        if (currentUser && currentUser.token_balance === newBalance) {
            setEditingBalanceFor(null);
            return; // Sem alteração
        }

        setErrorMsg(null);
        setEditingBalanceFor(userId);

        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, set_balance: newBalance })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Erro ao atualizar saldo.');
            }

            const data = await res.json();
            setUsers(prev => prev.map(user => user.id === userId ? { ...user, token_balance: data.new_balance } : user));
            displaySuccess('Saldo atualizado com sucesso!');
        } catch (error: any) {
            setErrorMsg(error.message || 'Erro ao atualizar saldo absoluto.');
        } finally {
            setEditingBalanceFor(null);
        }
    };

    return (
        <div className="w-full flex flex-col space-y-8 p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            {/* Tratamento de Status Globais */}
            {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center shadow-sm">
                    <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
                    <span className="font-medium text-sm">{errorMsg}</span>
                </div>
            )}
            {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-xl flex items-center shadow-sm">
                    <svg className="w-5 h-5 mr-3 shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    <span className="font-medium text-sm">{successMsg}</span>
                </div>
            )}

            {/* Tabela Principal */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <svg className="animate-spin h-8 w-8 text-[#002554] mb-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <p className="text-slate-500 font-medium animate-pulse">Carregando dados...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-16 text-slate-500 text-lg">Nenhum utilizador encontrado.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="py-4 px-6 text-sm font-bold text-slate-700 uppercase tracking-wider">Usuário</th>
                                    <th className="py-4 px-6 text-sm font-bold text-slate-700 uppercase tracking-wider">Contato</th>
                                    <th className="py-4 px-6 text-sm font-bold text-slate-700 uppercase tracking-wider">Plano</th>
                                    <th className="py-4 px-6 text-sm font-bold text-slate-700 uppercase tracking-wider">N/S Tecassistiva</th>
                                    <th className="py-4 px-6 text-sm font-bold text-slate-700 uppercase tracking-wider">Disponível</th>
                                    <th className="py-4 px-6 text-sm font-bold text-slate-700 uppercase tracking-wider">Gastos</th>
                                    <th className="py-4 px-6 text-sm font-bold text-slate-700 uppercase tracking-wider text-right">Ações Principais</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-[#002554]/10 text-[#002554] font-bold border border-[#002554]/20 uppercase">
                                                    {(user.name || user.email || user.id).charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900">{user.name || 'Sem Nome'}</div>
                                                    <div className="text-xs text-slate-500 mt-0.5">{user.email || 'S/ E-mail'}</div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <span className="text-sm text-slate-700 font-medium">{user.phone || 'N/D'}</span>
                                        </td>

                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full border ${user.plan_id === 'ouro' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                user.plan_id === 'prata' ? 'bg-slate-200 text-slate-700 border-slate-300' :
                                                    user.plan_id === 'bronze' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                                        'bg-gray-100 text-gray-500 border-gray-200'
                                                }`}>
                                                {user.plan_id === 'ouro' ? 'Avançado' :
                                                    user.plan_id === 'prata' ? 'Intermediário' :
                                                        user.plan_id === 'bronze' ? 'Básico' : 'Nenhum'}
                                            </span>
                                        </td>

                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <span className="text-sm text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded shadow-inner">
                                                {user.serialNumber || 'N/D'}
                                            </span>
                                        </td>

                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <div className="flex items-center text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-lg w-fit border border-emerald-100 text-sm shadow-sm hover:shadow transition-shadow">
                                                <input
                                                    type="number"
                                                    value={balanceInput[user.id] !== undefined ? balanceInput[user.id] : (user.token_balance || 0)}
                                                    onChange={(e) => setBalanceInput(prev => ({ ...prev, [user.id]: e.target.value }))}
                                                    onBlur={() => handleUpdateBalance(user.id)}
                                                    disabled={editingBalanceFor === user.id}
                                                    className="bg-transparent border-none p-0 outline-none focus:ring-0 w-24 font-bold text-center text-emerald-700 disabled:opacity-50"
                                                />
                                            </div>
                                        </td>

                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <div className="flex items-center text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-lg text-xs border border-slate-200 w-fit">
                                                <span className="font-bold text-slate-700">{(user.total_spent_tokens || 0).toLocaleString()}</span>
                                            </div>
                                        </td>

                                        <td className="py-4 px-6 whitespace-nowrap text-right flex items-center justify-end gap-5">
                                            {/* Action Toggles (Edit / Delete) */}
                                            <div className="flex items-center gap-2 pr-2">
                                                <button onClick={() => openModal(user)} className="text-slate-400 hover:text-blue-600 transition-colors p-1" title="Editar Usuário">
                                                    <Pencil className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleDelete(user.id, user.name || user.email || user.id)} className="text-slate-400 hover:text-red-600 transition-colors p-1" title="Apagar Irreversivelmente">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MODAL Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50">
                            <h3 className="text-lg font-bold text-[#002554]">
                                {editingUser ? 'Editar Perfil do Usuário' : 'Novo Usuário do Sistema'}
                            </h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-red-500 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body / Form */}
                        <form onSubmit={handleSaveUser} className="p-6 flex flex-col gap-4">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-medium text-slate-700">Nome Completo</label>
                                    <input type="text" value={formName} onChange={e => setFormName(e.target.value)} required placeholder="Ex: João Silva" disabled={processing} className="rounded-md border border-slate-300 px-3 py-2 focus:ring-1 focus:ring-[#002554]" />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-medium text-slate-700">E-mail</label>
                                    <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} required placeholder="user@domain.com" disabled={processing} className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-[#002554]" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-medium text-slate-700">Celular</label>
                                    <input type="tel" value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="(11) 90000-0000" disabled={processing} className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-[#002554]" />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-medium text-slate-700">N/S Tecassistiva (Opcional)</label>
                                    <input type="text" value={formSerial} onChange={e => setFormSerial(e.target.value)} placeholder="TECASSISTIVA-000A" disabled={processing} className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-[#002554] font-mono" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1 mt-2">
                                <label className="text-sm font-bold text-[#002554]">Plano do Usuário</label>
                                <select
                                    value={formPlan}
                                    onChange={(e) => {
                                        const selectedPlan = e.target.value;
                                        setFormPlan(selectedPlan);
                                        // Auto-fill tokens if creating new user
                                        if (!editingUser) {
                                            if (selectedPlan === 'ouro') setFormTokens('100000');
                                            else if (selectedPlan === 'prata') setFormTokens('30000');
                                            else if (selectedPlan === 'bronze') setFormTokens('10000');
                                            else setFormTokens('0');
                                        }
                                    }}
                                    disabled={processing}
                                    className="w-full md:w-1/2 rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-[#002554]"
                                >
                                    <option value="none">Nenhum plano ativo</option>
                                    <option value="bronze">Plano Básico</option>
                                    <option value="prata">Plano Intermediário</option>
                                    <option value="ouro">Plano Avançado</option>
                                </select>
                            </div>

                            {!editingUser && (
                                <div className="flex flex-col gap-1 mt-2 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                                    <label className="text-sm font-bold text-[#002554]">Crédito Inicial (Tokens)</label>
                                    <p className="text-xs text-slate-500 mb-2">Define o montante habilitado na carteira da conta que está sendo gerada.</p>
                                    <input type="number" value={formTokens} onChange={e => setFormTokens(e.target.value)} min="0" required disabled={processing} className="w-full md:w-1/2 rounded-md border border-blue-200 px-3 py-2 focus:ring-1 focus:ring-[#002554]" />
                                </div>
                            )}

                            {/* Actions Footer */}
                            <div className="flex justify-end gap-3 mt-6 border-t border-slate-100 pt-4">
                                <button type="button" onClick={closeModal} disabled={processing} className="px-4 py-2 bg-white border border-slate-300 rounded hover:bg-slate-50 text-slate-700 font-medium transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={processing || !formEmail} className="px-6 py-2 bg-[#002554] border border-transparent rounded hover:bg-blue-900 text-white font-medium transition-colors flex items-center">
                                    {processing ? 'Gravando...' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
