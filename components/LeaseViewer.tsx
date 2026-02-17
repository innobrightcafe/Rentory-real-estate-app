
import React from 'react';
import { X, FileText, CheckCircle, ShieldCheck, PenTool, Printer, Download } from 'lucide-react';
import { Lease, User, UserRole } from '../types';
import { Button } from './UI';

interface LeaseViewerProps {
    lease: Lease;
    currentUser: User;
    onClose: () => void;
    onSign: (id: string) => void;
}

export const LeaseViewer: React.FC<LeaseViewerProps> = ({ lease, currentUser, onClose, onSign }) => {
    const isTenant = currentUser.role === UserRole.TENANT;
    const isLandlord = currentUser.role === UserRole.LANDLORD;
    const isAdmin = currentUser.role === UserRole.ADMIN;
    
    const needsTenantSignature = isTenant && lease.status === 'SIGNED_BY_LANDLORD';
    const needsAdminAuthorization = isAdmin && lease.status === 'PENDING_ADMIN';
    const isFullySigned = lease.status === 'FULLY_SIGNED';

    const handlePrint = () => {
      window.print();
    };

    return (
        <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-3 md:p-10 no-print">
            <div className="w-full h-full max-w-4xl bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border-2 md:border-4 border-white/20">
                {/* Header */}
                <div className="px-5 md:px-8 py-4 md:py-6 border-b-2 border-slate-100 flex items-center justify-between bg-white shrink-0">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-950 text-white rounded-xl md:rounded-2xl flex items-center justify-center">
                            <FileText size={20} className="md:w-6 md:h-6"/>
                        </div>
                        <div className="text-left">
                            <h3 className="text-sm md:text-base font-black text-slate-900 leading-tight">Lease Hub</h3>
                            <p className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest truncate max-w-[150px] md:max-w-none">{lease.propertyName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handlePrint} className="p-2 md:p-3 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-all border border-slate-200 flex items-center gap-2">
                            <Printer size={18} />
                            <span className="hidden md:inline text-[10px] font-bold uppercase">Print/PDF</span>
                        </button>
                        <button onClick={onClose} className="p-2 md:p-3 bg-slate-100 rounded-lg md:rounded-xl text-slate-500 active:scale-90"><X size={18} className="md:w-5 md:h-5"/></button>
                    </div>
                </div>

                {/* Content - Specialized for Print */}
                <div id="printable-lease" className="flex-1 overflow-y-auto p-4 md:p-12 font-serif text-slate-800 leading-relaxed bg-slate-50/30 whitespace-pre-wrap print:p-0 print:bg-white print:overflow-visible">
                    <div className="max-w-2xl mx-auto bg-white p-6 md:p-16 shadow-xl border border-slate-100 rounded-xl md:rounded-2xl min-h-full print:shadow-none print:border-none print:p-0">
                        <div className="flex justify-between items-start mb-8 print:mb-12">
                            <div className="text-left">
                                <h1 className="text-2xl font-black text-emerald-950 tracking-tighter">Rentory Authorization</h1>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Digital Identity Verified Contract</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ref: {lease.id}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Dated: {new Date(lease.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="text-center mb-10 md:mb-16">
                            <h2 className="text-base md:text-3xl font-black uppercase tracking-widest border-b-2 md:border-b-4 border-slate-900 pb-1 md:pb-2 inline-block leading-tight">Lease Agreement</h2>
                        </div>
                        
                        <div className="text-xs md:text-base leading-relaxed print:text-sm">
                            {lease.content}
                        </div>
                        
                        <div className="mt-16 md:mt-24 pt-10 border-t-2 border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-left">
                            <div className="space-y-4">
                                <p className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest">Landlord</p>
                                <div className="border-b-2 border-slate-900 pb-1 md:pb-2 italic text-sm md:text-xl font-medium">
                                    {lease.landlordName}
                                </div>
                                <div className="flex items-center gap-1.5 md:gap-2 text-emerald-600">
                                    <ShieldCheck size={14}/>
                                    <span className="text-[8px] md:text-[9px] font-black uppercase">Identity Verified</span>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <p className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest">Tenant</p>
                                {(lease.status === 'PENDING_ADMIN' || lease.status === 'FULLY_SIGNED') ? (
                                    <>
                                        <div className="border-b-2 border-slate-900 pb-1 md:pb-2 italic text-sm md:text-xl font-medium">
                                            {lease.tenantName}
                                        </div>
                                        <div className="flex items-center gap-1.5 md:gap-2 text-emerald-600">
                                            <ShieldCheck size={14}/>
                                            <span className="text-[8px] md:text-[9px] font-black uppercase">Identity Verified</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="border-b-2 border-slate-200 pb-1 md:pb-2 text-slate-300 italic text-sm">
                                        Pending Tenant
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <p className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest">Rentory (Admin)</p>
                                {isFullySigned ? (
                                    <>
                                        <div className="border-b-2 border-emerald-950 pb-1 md:pb-2 italic text-sm md:text-xl font-black text-emerald-950">
                                            {lease.adminSignature}
                                        </div>
                                        <div className="flex items-center gap-1.5 md:gap-2 text-emerald-600">
                                            <CheckCircle size={14}/>
                                            <span className="text-[8px] md:text-[9px] font-black uppercase">Platform Authorized</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="border-b-2 border-slate-200 pb-1 md:pb-2 text-slate-300 italic text-sm">
                                        Pending Platform
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-12 text-[8px] text-slate-400 text-center uppercase tracking-widest opacity-50">
                            This document is digitally signed and managed by Rentory Real Estate Systems. All signatures are legally binding.
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 md:p-8 border-t-2 border-slate-100 bg-white flex justify-end gap-3 md:gap-4 shrink-0">
                    <Button variant="ghost" onClick={onClose} className="px-6 md:px-8">Close</Button>
                    {needsTenantSignature && (
                        <Button variant="primary" onClick={() => onSign(lease.id)} className="px-8 md:px-12 bg-emerald-600 border-emerald-600">
                            <PenTool size={16}/> Sign & Authorize
                        </Button>
                    )}
                    {needsAdminAuthorization && (
                        <Button variant="primary" onClick={() => onSign(lease.id)} className="px-8 md:px-12 bg-emerald-950 border-emerald-950">
                            <ShieldCheck size={16}/> Final Platform Approval
                        </Button>
                    )}
                </div>
            </div>

            <style>{`
              @media print {
                body * {
                  visibility: hidden;
                }
                #printable-lease, #printable-lease * {
                  visibility: visible;
                }
                #printable-lease {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                  background: white;
                }
                .no-print {
                  display: none !important;
                }
              }
            `}</style>
        </div>
    );
};
