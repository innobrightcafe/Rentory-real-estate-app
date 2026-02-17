
import React from 'react';
import { MessageSquare, ChevronRight, User, ShieldAlert, Navigation, Home } from 'lucide-react';
import { Card, Badge } from '../UI';

export const SupportInbox = ({ chatSessions, onSelectSession, accounts }: any) => {
    return (
        <div className="py-6 md:py-12 space-y-8 animate-in fade-in max-w-5xl mx-auto text-left">
            <div className="flex justify-between items-end border-b border-slate-200 pb-6">
                <div>
                    <h2 className="text-2xl md:text-5xl font-black tracking-tighter text-slate-900 leading-tight">Conversation Monitor</h2>
                    <p className="text-slate-400 font-medium mt-1">Platform-wide dialogue transparency.</p>
                </div>
                <Badge color="indigo">{chatSessions.length} active channels</Badge>
            </div>

            {chatSessions.length === 0 ? (
                <div className="text-center py-32 opacity-30">
                    <MessageSquare size={80} className="mx-auto mb-6"/>
                    <p className="text-[12px] font-black uppercase tracking-[6px]">Quiet Environment</p>
                </div>
            ) : (
                <div className="space-y-4 pb-20">
                    {chatSessions.map((session: any) => {
                        const lastMsg = session.messages[session.messages.length - 1];
                        const isPrivate = session.propertyId === 'SUPPORT' || session.id.includes('chat_support');
                        const hasGuide = !!session.assignedGuideId;

                        const tenant = accounts.find((a: any) => a.id === session.tenantId);
                        const landlord = accounts.find((a: any) => a.id === session.landlordId);
                        const guide = hasGuide ? accounts.find((a: any) => a.id === session.assignedGuideId) : null;

                        return (
                            <Card 
                                key={session.id} 
                                onClick={() => onSelectSession(session.id)} 
                                className={`p-8 flex items-center justify-between border-none shadow-sm rounded-[2.5rem] cursor-pointer hover:shadow-xl transition-all ${isPrivate ? 'bg-emerald-50 border-emerald-100 border' : 'bg-white border border-slate-100'}`}
                            >
                                <div className="flex items-center gap-6 flex-1 min-w-0">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-inner shrink-0 ${isPrivate ? 'bg-emerald-950' : 'bg-slate-900'}`}>
                                        {isPrivate ? <ShieldAlert size={28}/> : hasGuide ? <Navigation size={28}/> : <Home size={28}/>}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-black text-slate-900 text-xl tracking-tight truncate">{session.propertyTitle}</h3>
                                            {isPrivate && <Badge color="emerald">Private Support</Badge>}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 mb-3">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1"><User size={10}/> {tenant?.name || 'User'}</span>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-200">/</span>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1"><User size={10}/> {isPrivate ? 'Admin' : landlord?.name || 'Owner'}</span>
                                            {hasGuide && (
                                                <>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-200">/</span>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 flex items-center gap-1"><Navigation size={10}/> {guide?.name || 'Guide'}</span>
                                                </>
                                            )}
                                        </div>
                                        <p className="text-slate-500 text-sm truncate bg-slate-50/50 p-2 rounded-lg italic border border-slate-100">"{lastMsg?.text || 'Establishing connection...'}"</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 ml-6">
                                    <div className="text-right hidden md:block">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{session.messages.length} MSGS</p>
                                        <p className="text-[8px] font-bold text-slate-300 mt-1">LAST {new Date(session.lastUpdated).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                                    </div>
                                    <ChevronRight size={24} className="text-slate-300"/>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
