'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, Zap, DollarSign, Activity } from 'lucide-react';

interface DashboardData {
    totalUsers: number;
    totalRequests: number;
    totalTokens: number;
    estimatedCost: string;
    chartData: { date: string; tokens: number }[];
    userUsageData: { name: string; tokens: number }[];
}

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const response = await fetch('/api/admin/dashboard');
                if (response.ok) {
                    const result = await response.json();
                    setData(result);
                } else {
                    console.error('Falha ao buscar dados do dashboard');
                }
            } catch (error) {
                console.error('Erro na requisição do dashboard:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center min-h-[50vh]">
                <p className="text-xl font-medium text-slate-500 animate-pulse">Carregando painel...</p>
            </div>
        );
    }

    // Prevenção de quebra caso o fetch falhe e data seja nulo
    if (!data) return null;

    return (
        <div className="w-full flex flex-col space-y-8 p-8 max-w-[1600px] mx-auto">

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Card 1 - Total de Usuários */}
                <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col justify-center">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total de Usuários</p>
                    <div className="mt-2 flex items-center space-x-3">
                        <div className="p-2 bg-blue-50 text-blue-500 rounded-md">
                            <Users className="w-6 h-6" />
                        </div>
                        <p className="text-3xl font-bold text-[#002554]">{data.totalUsers}</p>
                    </div>
                </div>

                {/* Card 2 - Tokens Gastos Hoje */}
                <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col justify-center">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Tokens Gastos (Total)</p>
                    <div className="mt-2 flex items-center space-x-3">
                        <div className="p-2 bg-orange-50 text-orange-500 rounded-md">
                            <Zap className="w-6 h-6" />
                        </div>
                        <p className="text-3xl font-bold text-[#002554]">{data.totalTokens.toLocaleString()}</p>
                    </div>
                </div>

                {/* Card 3 - Custo Estimado */}
                <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col justify-center">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Custo Estimado</p>
                    <div className="mt-2 flex items-center space-x-3">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-md">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <p className="text-3xl font-bold text-[#002554]">${data.estimatedCost}</p>
                    </div>
                </div>

                {/* Card 4 - Requisições */}
                <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col justify-center">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Requisições</p>
                    <div className="mt-2 flex items-center space-x-3">
                        <div className="p-2 bg-emerald-50 text-emerald-500 rounded-md">
                            <Activity className="w-6 h-6" />
                        </div>
                        <p className="text-3xl font-bold text-[#002554]">{data.totalRequests}</p>
                    </div>
                </div>
            </div>

            {/* Áreas para Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mt-2">

                {/* Gráfico 1 - Consumo de Tokens */}
                <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col min-h-[420px]">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                        Consumo de Tokens (Últimos dias)
                    </h3>
                    <div className="flex-1 w-full h-full min-h-[300px] mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="tokens"
                                    stroke="#002554"
                                    strokeWidth={3}
                                    dot={{ fill: '#002554', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Gráfico 2 - Uso por Módulo */}
                <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col min-h-[420px]">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                        Uso por Módulo
                    </h3>
                    <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50 mt-2">
                        <p className="text-slate-400 font-medium text-sm flex items-center space-x-2">
                            <Activity className="w-5 h-5" />
                            <span>Gráfico de Pizza / Rosca será construído em breve</span>
                        </p>
                    </div>
                </div>

                {/* Gráfico 3 - Consumo por Usuário */}
                <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col min-h-[420px] lg:col-span-2">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                        Consumo por Usuário
                    </h3>
                    <div className="flex-1 w-full h-full min-h-[300px] mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.userUsageData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                                <Tooltip
                                    cursor={{ fill: '#F1F5F9' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar
                                    dataKey="tokens"
                                    fill="#002554"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={60}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

        </div>
    );
}
