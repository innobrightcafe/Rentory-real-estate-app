
import React from 'react';
import { DollarSign, Home, Users, TrendingUp, Plus } from 'lucide-react';
import { Card, Badge, Button } from '../UI';

export const OwnerInsights = ({ myProperties, leases, onAddProperty }: any) => {
    const revenue = leases.filter((l: any) => l.status === 'FULLY_SIGNED').length * 250000;

    return (
        <div className="py-6 md:py-12 space-y-12 animate-in fade-in max-w-6xl mx-auto text-left">
            <div className="flex justify-between items-center px-2">
                <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">Earnings Overview</h2>
                <Button onClick={onAddProperty} className="bg-emerald-950 text-white rounded-xl py-2 md:py-3 px-4 md:px-6">
                    <Plus size={16}/> <span className="hidden md:inline ml-2">Add Property</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 p-8 md:p-12 bg-emerald-950 text-white border-none shadow-2xl relative overflow-hidden rounded-[2.5rem] md:rounded-[3.5rem]">
                    <div className="absolute -right-10 -bottom-10 opacity-10"><TrendingUp size={260}/></div>
                    <p className="text-[10px] font-black uppercase text-emerald-400 tracking-[4px] mb-4">Total Income</p>
                    <p className="text-5xl md:text-8xl font-black tracking-tighter mb-8">₦{(revenue / 1000).toLocaleString()}k</p>
                    <Badge color="emerald">Healthy Earnings</Badge>
                </Card>
                <div className="grid grid-cols-1 gap-6">
                    <Card className="p-8 md:p-10 bg-white border border-slate-100 rounded-[2.5rem] md:rounded-[3rem] flex items-center gap-6 shadow-sm">
                        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner"><Home size={32}/></div>
                        <div className="text-left">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Listed Properties</p>
                            <p className="text-3xl font-black text-slate-900">{myProperties.length}</p>
                        </div>
                    </Card>
                    <Card className="p-8 md:p-10 bg-white border border-slate-100 rounded-[2.5rem] md:rounded-[3rem] flex items-center gap-6 shadow-sm">
                        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner"><Users size={32}/></div>
                        <div className="text-left">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Renters</p>
                            <p className="text-3xl font-black text-slate-900">{leases.length}</p>
                        </div>
                    </Card>
                </div>
            </div>
            
            <div className="pt-8">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 px-2">Recent Transactions</h3>
                <div className="space-y-4">
                    {leases.length > 0 ? leases.map((l: any) => (
                        <div key={l.id} className="p-6 bg-white border border-slate-50 rounded-2xl flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-left">
                                <p className="font-bold text-slate-900">{l.tenantName} paid rent</p>
                                <p className="text-xs text-slate-400 mt-1">For {l.propertyName}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-emerald-600 tracking-tight">+₦250k</p>
                                <p className="text-[9px] font-bold text-slate-300 uppercase mt-1 tracking-widest">Verified</p>
                            </div>
                        </div>
                    )) : (
                        <div className="p-16 bg-white border-2 border-dashed border-slate-100 rounded-[3rem] text-center">
                            <DollarSign size={40} className="mx-auto text-slate-100 mb-4"/>
                            <p className="text-[11px] font-black uppercase tracking-widest text-slate-300">No recent activity detected</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
