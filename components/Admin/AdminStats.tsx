
import React from 'react';
import { TrendingUp, DollarSign, Activity, FileText } from 'lucide-react';
import { Card, Badge } from '../UI';

export const AdminStats = ({ accounts, properties, leases, finance, onSelectLease }: any) => (
    <div className="py-6 md:py-12 space-y-8 md:space-y-12 animate-in fade-in max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            <Card className="p-8 border-none bg-emerald-950 text-white shadow-2xl relative overflow-hidden rounded-[2.5rem] text-left">
                <div className="absolute -right-4 -bottom-4 opacity-10"><DollarSign size={120} /></div>
                <p className="text-[10px] font-black uppercase text-emerald-400 tracking-[3px] mb-2">Net Revenue</p>
                <p className="text-3xl md:text-5xl font-black tracking-tighter">₦4.2M</p>
                <div className="flex items-center gap-2 mt-4 text-emerald-300 font-bold text-[10px]">
                    <TrendingUp size={14}/> +12% this month
                </div>
            </Card>
            <Card className="p-8 border-none bg-white shadow-sm flex flex-col justify-between rounded-[2.5rem] text-left">
                <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[3px] mb-2">User Nodes</p>
                    <p className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">{accounts.length}</p>
                </div>
                <p className="text-[10px] font-bold text-slate-400 mt-4 italic">Active participants</p>
            </Card>
            <Card className="p-8 border-none bg-white shadow-sm flex flex-col justify-between rounded-[2.5rem] text-left">
                <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[3px] mb-2">Inventory</p>
                    <p className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">{properties.length}</p>
                </div>
                <Badge color="emerald">Managed Assets</Badge>
            </Card>
            <Card className="p-8 border-none bg-white shadow-sm flex flex-col justify-between rounded-[2.5rem] text-left">
                <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[3px] mb-2">Velocity</p>
                    <p className="text-3xl md:text-5xl font-black text-emerald-700 tracking-tighter">{leases.length}</p>
                </div>
                <p className="text-[10px] font-bold text-slate-400 mt-4 italic">Contracts signed</p>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 p-10 border-none shadow-xl bg-white rounded-[3.5rem] text-left">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="text-sm md:text-xl font-black text-slate-900 tracking-tight flex items-center gap-3"><Activity size={24} className="text-emerald-600"/> Real-time Registry</h3>
                    <button className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:underline">Full Log</button>
                </div>
                <div className="space-y-6">
                    {leases.slice(0, 3).map((l: any) => (
                        <div key={l.id} className="flex items-center gap-6 p-5 hover:bg-slate-50 rounded-[2rem] transition-all group cursor-pointer" onClick={() => onSelectLease(l.id)}>
                            <div className="w-14 h-14 bg-emerald-50 text-emerald-950 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><FileText size={24}/></div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm md:text-lg font-black text-slate-900 leading-tight">Contract: {l.propertyName}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{l.tenantName} (Tenant)</p>
                            </div>
                            <Badge color={l.status === 'FULLY_SIGNED' ? 'emerald' : 'amber'}>{l.status}</Badge>
                        </div>
                    ))}
                    {leases.length === 0 && (
                        <div className="text-center py-10 opacity-30 italic">No recent lease activity.</div>
                    )}
                </div>
            </Card>
        </div>
    </div>
);
