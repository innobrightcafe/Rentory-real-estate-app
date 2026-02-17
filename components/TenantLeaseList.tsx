
import React from 'react';
import { FileText, ChevronRight } from 'lucide-react';
import { Card, Badge } from '../UI';

export const TenantLeaseList = ({ leases }: any) => {
    return (
        <div className="py-12 space-y-8 animate-in fade-in max-w-4xl mx-auto pb-48 text-left">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 leading-tight">Agreements</h2>
            {leases.length === 0 ? (
                <div className="text-center py-32 opacity-30">
                    <FileText size={80} className="mx-auto mb-6"/>
                    <p className="text-[12px] font-black uppercase tracking-[6px]">No Active Contracts</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {leases.map((lease: any) => (
                        <Card key={lease.id} className="p-8 flex items-center justify-between border-none shadow-sm bg-white rounded-[2.5rem] cursor-pointer hover:shadow-xl transition-all">
                            <div className="flex items-center gap-6 flex-1 min-w-0">
                                <div className="w-16 h-16 bg-slate-50 text-emerald-950 rounded-2xl flex items-center justify-center border border-slate-100 shrink-0">
                                    <FileText size={24}/>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-black text-slate-900 text-xl tracking-tight truncate">{lease.propertyName}</h3>
                                    <div className="mt-2"><Badge color={lease.status === 'FULLY_SIGNED' ? 'emerald' : 'amber'}>{lease.status}</Badge></div>
                                </div>
                            </div>
                            <ChevronRight size={24} className="text-slate-300 ml-6"/>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
