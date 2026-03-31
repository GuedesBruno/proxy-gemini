'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Plus, Edit, Save, X } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    createdAt?: string;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newProduct, setNewProduct] = useState<Partial<Product>>({ permissions: [] });
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/products');
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            } else {
                setErrorMsg('Falha ao carregar produtos.');
            }
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            setErrorMsg('Erro de conexão ao buscar produtos.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newProduct.id || !newProduct.name) {
            setErrorMsg('ID e nome do produto são obrigatórios.');
            return;
        }

        setSaving(true);
        setErrorMsg(null);
        try {
            const response = await fetch('/api/admin/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProduct),
            });

            if (!response.ok) {
                throw new Error('Falha ao criar produto.');
            }

            setNewProduct({ permissions: [] });
            setSuccessMsg('Produto criado com sucesso!');
            setTimeout(() => setSuccessMsg(null), 3000);
            fetchProducts();
        } catch (error: any) {
            console.error('Erro ao criar produto:', error);
            setErrorMsg(error?.message || 'Erro ao criar produto.');
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async (product: Product) => {
        setSaving(true);
        setErrorMsg(null);
        try {
            const response = await fetch('/api/admin/products', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ products: [product] }),
            });

            if (!response.ok) {
                throw new Error('Falha ao salvar produto.');
            }

            setEditingId(null);
            setSuccessMsg('Produto atualizado com sucesso!');
            setTimeout(() => setSuccessMsg(null), 3000);
            fetchProducts();
        } catch (error: any) {
            console.error('Erro ao salvar produto:', error);
            setErrorMsg(error?.message || 'Erro ao salvar produto.');
        } finally {
            setSaving(false);
        }
    };

    const togglePermission = (product: Product, permission: string) => {
        const updatedPermissions = product.permissions.includes(permission)
            ? product.permissions.filter((p) => p !== permission)
            : [...product.permissions, permission];

        const updatedProduct = { ...product, permissions: updatedPermissions };
        setProducts(products.map((p) => (p.id === product.id ? updatedProduct : p)));
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
                <h1 className="text-2xl font-bold text-slate-900">Gerenciar Produtos</h1>
                <p className="text-slate-500 mt-1">Cadastre produtos e permissões usados pelas aplicações.</p>
            </div>

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
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Plus className="w-5 h-5 text-emerald-600" />
                            <h2 className="text-lg font-bold text-slate-800">Novo Produto</h2>
                        </div>
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="ID do Produto"
                                value={newProduct.id || ''}
                                onChange={(e) => setNewProduct({ ...newProduct, id: e.target.value })}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#002554]/20 focus:border-[#002554] outline-none"
                            />
                            <input
                                type="text"
                                placeholder="Nome do Produto"
                                value={newProduct.name || ''}
                                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#002554]/20 focus:border-[#002554] outline-none"
                            />
                            <textarea
                                placeholder="Descrição"
                                value={newProduct.description || ''}
                                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#002554]/20 focus:border-[#002554] outline-none resize-none"
                                rows={3}
                            />
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-slate-700">Permissões</p>
                                <div className="flex flex-wrap gap-2">
                                    {['image_recognition', 'chat', 'custom_prompts'].map((perm) => (
                                        <label key={perm} className="inline-flex items-center gap-2 text-sm text-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={newProduct.permissions?.includes(perm) || false}
                                                onChange={() => {
                                                    const perms = newProduct.permissions || [];
                                                    setNewProduct({
                                                        ...newProduct,
                                                        permissions: perms.includes(perm)
                                                            ? perms.filter((p) => p !== perm)
                                                            : [...perms, perm],
                                                    });
                                                }}
                                                className="h-4 w-4 rounded border-slate-300 text-[#002554]"
                                            />
                                            {perm.replace('_', ' ')}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={handleCreate}
                                disabled={saving}
                                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#002554] px-4 py-2 text-white text-sm font-semibold hover:bg-[#002554]/90 transition-colors disabled:opacity-50"
                            >
                                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                Criar Produto
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">Produtos Cadastrados</h2>
                        {products.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-slate-500">
                                Nenhum produto encontrado. Cadastre um produto para começar.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {products.map((product) => (
                                    <div key={product.id} className="border border-slate-200 rounded-lg p-4 bg-white">
                                        {editingId === product.id ? (
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <input
                                                        type="text"
                                                        value={product.name}
                                                        onChange={(e) => setProducts((prev) =>
                                                            prev.map((p) => (p.id === product.id ? { ...p, name: e.target.value } : p))
                                                        )}
                                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#002554]/20 focus:border-[#002554] outline-none"
                                                    />
                                                    <textarea
                                                        value={product.description}
                                                        onChange={(e) => setProducts((prev) =>
                                                            prev.map((p) => (p.id === product.id ? { ...p, description: e.target.value } : p))
                                                        )}
                                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#002554]/20 focus:border-[#002554] outline-none resize-none"
                                                        rows={2}
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700 mb-2">Permissões</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {['image_recognition', 'chat', 'custom_prompts'].map((perm) => (
                                                            <label key={perm} className="inline-flex items-center gap-2 text-sm text-slate-700">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={product.permissions.includes(perm)}
                                                                    onChange={() => togglePermission(product, perm)}
                                                                    className="h-4 w-4 rounded border-slate-300 text-[#002554]"
                                                                />
                                                                {perm.replace('_', ' ')}
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleSave(product)}
                                                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-white text-sm font-semibold hover:bg-emerald-700"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                        Salvar
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="inline-flex items-center gap-2 rounded-lg bg-slate-300 px-3 py-2 text-slate-700 text-sm font-semibold hover:bg-slate-400"
                                                    >
                                                        <X className="w-4 h-4" />
                                                        Cancelar
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="flex flex-wrap items-start justify-between gap-4">
                                                    <div>
                                                        <h3 className="text-base font-semibold text-slate-800">{product.name}</h3>
                                                        <p className="text-sm text-slate-600">{product.description}</p>
                                                        {product.createdAt && (
                                                            <p className="text-xs text-slate-400 mt-1">Criado em {new Date(product.createdAt).toLocaleDateString()}</p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => setEditingId(product.id)}
                                                        className="inline-flex items-center gap-2 rounded-lg bg-[#002554] px-3 py-1.5 text-white text-xs font-semibold hover:bg-[#002554]/90"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                        Editar
                                                    </button>
                                                </div>

                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {product.permissions.length > 0 ? product.permissions.map((perm) => (
                                                        <span key={perm} className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                                                            {perm.replace('_', ' ')}
                                                        </span>
                                                    )) : (
                                                        <span className="text-xs text-slate-500">Sem permissões</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
