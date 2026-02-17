
import React from 'react';
import { DollarSign, Wallet, History, Lock, FileText } from 'lucide-react';
import { Card } from '../UI';

export const FinanceCommand = ({ properties, leases }: any) => (
    <div className="py-6 md:py-12 space-y-12 animate-in fade-in max-w-7xl mx-auto text-left">
        <h2 className="text-2xl md:text-5xl font-black tracking-tighter text-slate-900 leading-tight">Financial Oversight</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="p-10 bg-white shadow-xl rounded-[3.5rem] space-y-8 text-left border-none">
                <h3 className="text-xl font-black tracking-tight text-slate-900">Yield Breakdown</h3>
                <div className="space-y-6">
                    <div className="flex justify-between items-center p-6 bg-slate-50 rounded-2xl">
                        <div><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Unlocks</p><p className="text-2xl font-black text-slate-900">₦{(properties.length * 5000).toLocaleString()}</p></div>
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><Lock size={20}/></div>
                    </div>
                    <div className="flex justify-between items-center p-6 bg-slate-50 rounded-2xl">
                        <div><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Commissions</p><p className="text-2xl font-black text-slate-900">₦{(leases.length * 25000).toLocaleString()}</p></div>
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl"><FileText size={20}/></div>
                    </div>
                </div>
            </Card>

            <Card className="lg:col-span-2 p-10 bg-white shadow-xl rounded-[3.5rem] flex flex-col border-none">
                <h3 className="text-xl font-black tracking-tight text-slate-900 mb-8 flex items-center gap-3"><History size={24} className="text-emerald-600"/> Audit Log</h3>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex items-center justify-between p-4 border-b border-slate-50 last:border-none">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400"><Wallet size={18}/></div>
                                <div>
                                    <p className="text-sm font-black text-slate-900">Contact Unlock RT-00{i}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Lagos Node • ₦5,000</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-emerald-600">+₦5,000</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Aug 2{i}, 11:40 AM</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    </div>
);
