
import React from 'react';
import { MessageSquare, ChevronRight } from 'lucide-react';
import { Card, Badge, NotificationBadge } from '../UI';

export const MessageInbox = ({ chatSessions, onSendMessage, user }: any) => {
    return (
        <div className="py-12 space-y-8 animate-in fade-in max-w-4xl mx-auto pb-48 text-left">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 leading-tight">Secure Inbox</h2>
            {chatSessions.length === 0 ? (
                <div className="text-center py-32 opacity-30">
                    <MessageSquare size={80} className="mx-auto mb-6"/>
                    <p className="text-[12px] font-black uppercase tracking-[6px]">No Active Channels</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {chatSessions.map((session: any) => {
                        const lastMsg = session.messages[session.messages.length - 1];
                        const unread = session.messages.filter((m: any) => !m.isRead && m.senderId !== user.id).length;
                        return (
                            <Card key={session.id} className="p-8 flex items-center justify-between border-none shadow-sm bg-white rounded-[2.5rem] cursor-pointer hover:shadow-xl transition-all relative">
                                <div className="flex items-center gap-6 flex-1 min-w-0">
                                    <div className="w-16 h-16 bg-emerald-950 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-inner shrink-0">
                                        {session.propertyTitle.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-black text-slate-900 text-xl tracking-tight truncate">{session.propertyTitle}</h3>
                                        <p className="text-slate-500 text-sm truncate mt-1">{lastMsg?.text || 'Secure Channel Open'}</p>
                                        <div className="mt-3"><Badge color="emerald">DIRECT AGENT</Badge></div>
                                    </div>
                                </div>
                                {unread > 0 && <NotificationBadge count={unread} className="relative right-4" />}
                                <ChevronRight size={24} className="text-slate-300 ml-6"/>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
