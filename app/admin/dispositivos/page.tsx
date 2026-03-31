'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Plus, RefreshCw, Trash2, Edit, AlertCircle, CheckCircle2, Loader2, Link as LinkIcon, Lock, Unlock } from 'lucide-react';

export default function AdminDevicesPage() {
    const [devices, setDevices] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ serial_number: '', linked_user_id: '', model_name: '', status: 'active' });
    const [isEditing, setIsEditing] = useState(false);

    // Messages
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const fetchData = async () => {
        setRefreshing(true);
        try {
            const [resDevices, resUsers, resProducts] = await Promise.all([
                fetch('/api/admin/devices'),
                fetch('/api/admin/users'),
                fetch('/api/admin/products')
            ]);

            if (resDevices.ok) setDevices(await resDevices.json());
            if (resUsers.ok) {
                const data = await resUsers.json();
                setUsers(data.users || []);
            }
            if (resProducts.ok) {
                const data = await resProducts.json();
                setProducts(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Falha ao carregar dados:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openCreateModal = () => {
        setFormData({ serial_number: '', linked_user_id: '', model_name: '', status: 'active' });
        setIsEditing(false);
        setErrorMsg(null);
        setIsModalOpen(true);
    };

    const openEditModal = (device: any) => {
        setFormData({
            serial_number: device.id,
            linked_user_id: device.linked_user_id,
            model_name: device.model_name || '',
            status: device.status || 'active'
        });
        setIsEditing(true);
        setErrorMsg(null);
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setErrorMsg(null);

        try {
            const endpoint = '/api/admin/devices';
            const method = isEditing ? 'PATCH' : 'POST';

            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Falha ao salvar dispositivo.');

            setSuccessMsg(data.message);
            setIsModalOpen(false);
            fetchData();
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (error: any) {
            setErrorMsg(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(`Tem certeza que deseja apagar o vínculo do equipamento ${id}? Isso fará com que o Hardware perca acesso imediato a IA.`)) return;

        try {
            const res = await fetch(`/api/admin/devices?id=${id}`, { method: 'DELETE' });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            setSuccessMsg(data.message);
            fetchData();
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (error: any) {
            alert(error.message);
        }
    };

    const toggleStatus = async (device: any) => {
        const newStatus = device.status === 'active' ? 'inactive' : 'active';
        try {
            const res = await fetch('/api/admin/devices', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ serial_number: device.id, status: newStatus })
            });
            if (res.ok) fetchData();
        } catch (e) {
            console.error(e);
        }
    }

    if (loading) {
        return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#002554]" /></div>;
    }

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Smartphone className="w-6 h-6 text-[#002554]" />
                        Equipamentos (Hardwares)
                    </h1>
                    <p className="text-slate-500 mt-1 max-w-2xl">Cadastre Números de Série de hardware proprietário e vincule-os aos seus Usuários.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        disabled={refreshing}
                        className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors bg-white shadow-sm disabled:opacity-50"
                        title="Atualizar Tabela"
                    >
                        <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 bg-[#002554] text-white px-5 py-2.5 rounded-lg hover:bg-blue-900 font-bold transition-all shadow-md active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Cadastrar Lote / NS
                    </button>
                </div>
            </div>

            {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-xl flex items-center shadow-sm">
                    <CheckCircle2 className="w-5 h-5 mr-3 shrink-0 text-emerald-600" />
                    <span className="font-medium text-sm">{successMsg}</span>
                </div>
            )}

            {/* Listagem Tabela */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-xs font-bold tracking-wide">
                        <tr>
                            <th className="px-6 py-4">S / N</th>
                            <th className="px-6 py-4">Produto</th>
                            <th className="px-6 py-4">Status / Rede</th>
                            <th className="px-6 py-4">Proprietário (Usuário)</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {devices.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                                    Nenhum dispositivo cadastrado no banco de dados.
                                </td>
                            </tr>
                        ) : (
                            devices.map(device => {
                                const owner = users.find(u => u.id === device.linked_user_id);
                                return (
                                    <tr key={device.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4 font-mono font-medium text-slate-800">
                                            {device.id}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-slate-600 font-medium bg-slate-100 flex flex-col gap-1 w-fit px-2 py-1 rounded">
                                                <span>{device.model_name || 'Desconhecido'}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {device.status === 'active' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold w-fit">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Ativo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold w-fit">
                                                    <Lock className="w-3 h-3" /> Bloqueado
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {owner ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-[#002554] flex items-center justify-center font-bold text-xs">
                                                        {owner.displayName ? owner.displayName.charAt(0).toUpperCase() : 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-xs">{owner.displayName || 'Sem Nome'}</p>
                                                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{owner.id}</p>
                                                    </div>
                                                    <LinkIcon className="w-3 h-3 text-emerald-500 ml-2 opacity-50" />
                                                </div>
                                            ) : (
                                                <span className="text-red-500 text-xs font-medium flex items-center gap-1 bg-red-50 px-2 py-1 rounded w-fit">
                                                    <AlertCircle className="w-3 h-3" /> Usuário Deletado
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => toggleStatus(device)}
                                                    className={`p-1.5 text-xs font-bold flex items-center gap-1 rounded bg-white border shadow-sm transition-colors ${device.status === 'active' ? 'text-orange-600 border-orange-200 hover:bg-orange-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}
                                                >
                                                    {device.status === 'active' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(device)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded bg-white border border-slate-200 shadow-sm transition-colors"
                                                    title="Editar Aparelho"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(device.id)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded bg-white border border-slate-200 shadow-sm transition-colors"
                                                    title="Apagar Registro"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Novo / Editar */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 bg-slate-50">
                            <h3 className="text-lg font-bold text-[#002554] flex items-center gap-2">
                                <Smartphone className="w-5 h-5" />
                                {isEditing ? 'Editar Configuração do Aparelho' : 'Vincular Novo Equipamento'}
                            </h3>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-5">
                            {errorMsg && (
                                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm font-medium flex gap-2 border border-red-200">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {errorMsg}
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-bold text-slate-700 block mb-1">Serial Number / MAC (NS)</label>
                                <input
                                    type="text"
                                    value={formData.serial_number}
                                    onChange={e => setFormData({ ...formData, serial_number: e.target.value })}
                                    disabled={isEditing}
                                    required
                                    placeholder="Ex: LBR-2026-X99"
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#002554]/20 focus:border-[#002554] outline-none disabled:bg-slate-100 disabled:text-slate-500 uppercase font-mono"
                                />
                                {!isEditing && <p className="text-xs text-slate-500 mt-1">Este ID será permanente. Cole o NS físico.</p>}
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-700 block mb-1">Dono Proprietário (Usuário Conta-Mãe)</label>
                                <select
                                    value={formData.linked_user_id}
                                    onChange={e => setFormData({ ...formData, linked_user_id: e.target.value })}
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#002554]/20 focus:border-[#002554] outline-none bg-white font-medium"
                                >
                                    <option value="" disabled>--- Selecione um Usuário ---</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>
                                            {u.displayName || 'Usuário Sem Nome'} ({u.email || u.id.substring(0, 6) + '...'})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><LinkIcon className="w-3 h-3" /> Os custos gerados por esta máquina serão pagos por esta conta.</p>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-700 block mb-1">Produto / Modelo</label>
                                <select
                                    value={formData.model_name}
                                    onChange={e => setFormData({ ...formData, model_name: e.target.value })}
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#002554]/20 focus:border-[#002554] outline-none bg-white"
                                >
                                    <option value="" disabled>--- Selecione um produto cadastrado ---</option>
                                    {products.length > 0 ? (
                                        products.map(product => (
                                            <option key={product.id} value={product.name || product.id}>
                                                {product.name || product.id}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="">Nenhum produto disponível</option>
                                    )}
                                </select>
                                <p className="text-xs text-slate-500 mt-1">Caso o produto não esteja na lista, cadastre em Admin &gt; Produtos.</p>
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors text-sm border border-transparent shadow-sm hover:border-slate-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2 bg-[#002554] text-white rounded-lg hover:bg-blue-900 font-bold transition-all disabled:opacity-50 text-sm shadow-md"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Vínculo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
