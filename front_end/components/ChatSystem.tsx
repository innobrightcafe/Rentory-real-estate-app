
import React, { useState, useEffect, useRef } from 'react';
import { Send, X, ShieldAlert, UserCircle, PlusCircle, PenTool, MessageSquare, Star } from 'lucide-react';
import { ChatSession, User, UserRole } from '../types';

interface ChatSystemProps {
    session: ChatSession;
    currentUser: User;
    onSendMessage: (sessionId: string, text: string) => void;
    onClose: () => void;
    onGenerateLease?: (session: ChatSession) => void;
}

export const ChatSystem: React.FC<ChatSystemProps> = ({ session, currentUser, onSendMessage, onClose, onGenerateLease }) => {
    const [input, setInput] = useState('');
    const [showActions, setShowActions] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isTenant = currentUser.role === UserRole.TENANT;
    const isLandlord = currentUser.role === UserRole.LANDLORD;
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [session.messages]);

    const handleSend = (text: string) => {
        if (!text.trim()) return;
        onSendMessage(session.id, text.trim());
        setInput('');
        setShowActions(false);
    };

    return (
        <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-0 md:p-6 animate-in fade-in">
            <div className="w-full h-full md:max-w-2xl md:h-[80vh] bg-white flex flex-col shadow-2xl overflow-hidden md:rounded-[3rem]">
                <header className="px-6 py-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-left">
                        <button onClick={onClose} className="p-2 bg-slate-50 rounded-xl"><X size={20}/></button>
                        <div>
                            <h3 className="font-black text-slate-900 leading-tight">{session.propertyTitle}</h3>
                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Discussion Channel</p>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-slate-50/20">
                    {session.messages.map((msg, i) => {
                        const isMe = msg.senderId === currentUser.id;
                        return (
                            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-6 py-4 shadow-sm ${isMe ? 'bg-emerald-950 text-white rounded-br-none' : 'bg-white border border-slate-200 rounded-bl-none'} text-left`}>
                                    <p className="text-sm font-bold">{msg.text}</p>
                                    <p className={`text-[8px] mt-2 font-black uppercase tracking-widest ${isMe ? 'text-emerald-400' : 'text-slate-300'}`}>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-6 bg-white border-t border-slate-100 relative">
                    {showActions && (
                        <div className="absolute bottom-full left-6 mb-4 p-2 bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col gap-1 z-10 animate-in slide-in-from-bottom-4 min-w-[200px] text-left">
                            {isTenant && (
                              <>
                                <button onClick={() => handleSend("I'd like to talk about the tour guide assigned to me.")} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl transition-all"><Star size={18} className="text-amber-500"/><span className="text-[10px] font-black uppercase tracking-widest">Talk About Guide</span></button>
                                <button onClick={() => handleSend("I want to discuss the landlord's terms.")} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl transition-all"><UserCircle size={18} className="text-indigo-600"/><span className="text-[10px] font-black uppercase tracking-widest">Talk About Owner</span></button>
                              </>
                            )}
                            {isLandlord && (
                              <button onClick={() => onGenerateLease?.(session)} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl transition-all"><PenTool size={18} className="text-emerald-600"/><span className="text-[10px] font-black uppercase tracking-widest">Draft Agreement</span></button>
                            )}
                        </div>
                    )}
                    <div className="flex gap-3">
                        <button onClick={() => setShowActions(!showActions)} className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-500 border border-slate-200 flex items-center justify-center active:scale-90 transition-all"><PlusCircle size={22}/></button>
                        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." className="flex-1 px-6 rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold focus:outline-none focus:border-emerald-950" onKeyDown={(e) => e.key === 'Enter' && handleSend(input)} />
                        <button onClick={() => handleSend(input)} disabled={!input.trim()} className="w-14 h-14 bg-emerald-950 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all disabled:opacity-30"><Send size={22}/></button>
                    </div>
                </div>
            </div>
        </div>
    );
};
