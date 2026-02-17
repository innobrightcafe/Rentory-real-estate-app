
import React, { useState } from 'react';
import { Ban, CheckCircle2, RefreshCw, MessageSquare, Briefcase, User as UserIcon, Shield } from 'lucide-react';
import { Card, Badge } from '../UI';
import { UserRole } from '../../types';

export const UserManagement = ({ accounts, onToggleUserStatus, onMessageUser }: any) => {
    const [filter, setFilter] = useState<'ALL' | 'STAFF' | 'TENANTS' | 'LANDLORDS'>('ALL');

    const filteredAccounts = accounts.filter((acc: any) => {
        if (filter === 'STAFF') return acc.role === UserRole.TOUR_GUIDE;
        if (filter === 'TENANTS') return acc.role === UserRole.TENANT;
        if (filter === 'LANDLORDS') return acc.role === UserRole.LANDLORD;
        return true;
    });

    return (
        <div className="py-6 md:py-12 space-y-8 animate-in slide-in-from-right max-w-7xl mx-auto text-left">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-2xl md:text-5xl font-black tracking-tighter text-slate-900 leading-tight">Registry Node</h2>
                    <p className="text-slate-400 font-medium mt-1">Manage global network participants and staff.</p>
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl md:rounded-3xl border border-slate-200 gap-1 overflow-x-auto no-scrollbar max-w-full">
                    {[
                        { id: 'ALL', label: 'All' },
                        { id: 'STAFF', label: 'Staff' },
                        { id: 'TENANTS', label: 'Tenants' },
                        { id: 'LANDLORDS', label: 'Landlords' }
                    ].map(f => (
                        <button 
                            key={f.id}
                            onClick={() => setFilter(f.id as any)}
                            className={`px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${filter === f.id ? 'bg-white text-emerald-950 shadow-md border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAccounts.map((acc: any) => (
                    <Card key={acc.id} className="p-8 bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all rounded-[2.5rem] flex flex-col justify-between group">
                        <div className="space-y-6">
                            <div className="flex justify-between items-start">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg transition-transform group-hover:scale-110 ${acc.role === UserRole.ADMIN ? 'bg-emerald-950' : acc.role === UserRole.TOUR_GUIDE ? 'bg-amber-500' : 'bg-indigo-600'}`}>
                                    {acc.role === UserRole.TOUR_GUIDE ? <Briefcase size={24}/> : acc.role === UserRole.ADMIN ? <Shield size={24}/> : <UserIcon size={24}/>}
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <Badge color={acc.status === 'ACTIVE' ? 'emerald' : 'gray'}>{acc.status}</Badge>
                                    {acc.role === UserRole.TOUR_GUIDE && <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Active Ops</span>}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-black tracking-tight text-slate-900 truncate">{acc.name}</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 mb-4">{acc.role}</p>
                                
                                {acc.role === UserRole.TOUR_GUIDE && (
                                    <div className="bg-amber-50 p-4 rounded-2xl mb-4 border border-amber-100">
                                        <p className="text-[9px] font-black uppercase text-amber-600 tracking-widest mb-1">Performance Stats</p>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-xs font-bold text-slate-400">Balance</p>
                                                <p className="text-lg font-black text-slate-900 leading-none">₦{acc.balance?.toLocaleString() || 0}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-slate-400">Rating</p>
                                                <p className="text-lg font-black text-slate-900 leading-none">{acc.rating || '5.0'} ★</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                                    <RefreshCw size={12}/> ACCESS PIN: <span className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{acc.pin}</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-8">
                            <button onClick={() => onMessageUser(acc.id)} className="flex-1 py-3 bg-emerald-950 text-white rounded-xl font-bold uppercase text-[9px] border border-emerald-900 flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg hover:bg-black">
                                <MessageSquare size={14}/> Private Chat
                            </button>
                            <button onClick={() => onToggleUserStatus(acc.id)} className={`flex-1 py-3 rounded-xl font-bold uppercase text-[9px] flex items-center justify-center gap-2 active:scale-95 transition-all ${acc.status === 'ACTIVE' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                {acc.status === 'ACTIVE' ? <><Ban size={14}/> Suspend</> : <><CheckCircle2 size={14}/> Activate</>}
                            </button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
