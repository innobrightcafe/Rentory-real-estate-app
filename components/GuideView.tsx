
import React, { useState } from 'react';
import { Compass, MapPin, LogOut, MessageSquare, Navigation, Star, TrendingUp, User as UserIcon } from 'lucide-react';
import { User, TourRequest, Property, ChatSession } from '../types';
import { Card, Badge, Button } from './UI';
import { ChatSystem } from './ChatSystem';
import { ProfileView } from './ProfileView';

interface GuideViewProps {
    user: User;
    properties: Property[];
    onLogout: () => void;
    chatSessions: ChatSession[];
    onSendMessage: (sessionId: string, text: string) => void;
}

export const GuideView: React.FC<GuideViewProps> = ({ user, properties, onLogout, chatSessions, onSendMessage }) => {
    const [tasks, setTasks] = useState<TourRequest[]>([
        { id: 't1', propertyId: 'p1', tenantId: 'u1', status: 'ASSIGNED', type: 'PROPERTY_TOUR', tourMode: 'BASIC', requestedAt: new Date().toISOString(), scheduledDate: 'Today, 3:00 PM' },
        { id: 'v1', propertyId: 'p2', tenantId: 'SYSTEM', status: 'ASSIGNED', type: 'LANDLORD_VERIFICATION', tourMode: 'BASIC', requestedAt: new Date().toISOString(), scheduledDate: 'Tomorrow, 11:00 AM' }
    ]);

    const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);
    const [showProfile, setShowProfile] = useState(false);

    const handleComplete = (id: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'COMPLETED' } : t));
        alert("Mission synchronized. Payout verified.");
    };

    const handleOpenChat = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        const existingSession = chatSessions.find(s => s.propertyId === task.propertyId);
        if (existingSession) setActiveChatSessionId(existingSession.id);
        else alert("No active communication channel yet.");
    };

    const currentChatSession = chatSessions.find(s => s.id === activeChatSessionId);

    return (
        <div className="h-screen flex flex-col bg-[#fcfcfc] font-['Plus_Jakarta_Sans'] overflow-hidden">
            <header className="bg-emerald-950 text-white px-6 py-6 md:px-12 md:py-10 flex justify-between items-center relative overflow-hidden rounded-b-[2rem] md:rounded-b-[4rem] shadow-xl shrink-0">
                <div className="flex items-center gap-4 md:gap-6 relative z-10">
                    <div className="w-10 h-10 md:w-16 md:h-16 bg-emerald-600 rounded-xl md:rounded-3xl flex items-center justify-center shadow-lg border-2 border-emerald-400/20">
                        <Navigation size={22} className="md:w-8 md:h-8 text-white"/>
                    </div>
                    <div className="text-left">
                        <h1 className="text-base md:text-2xl font-bold tracking-tight leading-none">Guide Hub</h1>
                        <p className="text-[10px] md:text-[10px] font-bold uppercase tracking-widest text-emerald-400 mt-1">Authorized Agent</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowProfile(true)} className="p-2.5 md:p-4 bg-emerald-900/50 rounded-xl md:rounded-2xl text-white relative z-10 active:scale-90 border border-white/10">
                        <UserIcon size={20}/>
                    </button>
                    <button onClick={onLogout} className="p-2.5 md:p-4 bg-emerald-900/50 rounded-xl md:rounded-2xl text-emerald-300 relative z-10 active:scale-90 border border-white/10">
                        <LogOut size={20}/>
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-4 py-6 md:p-8 space-y-6 md:space-y-10 pb-40 no-scrollbar">
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                    <Card className="p-5 md:p-8 bg-white shadow-sm rounded-xl md:rounded-[2.5rem] border border-slate-100">
                        <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Ranking</p>
                        <div className="flex items-center gap-1.5">
                             <p className="text-2xl md:text-4xl font-bold text-emerald-950">4.9</p>
                             <Star size={16} className="text-amber-500 fill-amber-500"/>
                        </div>
                    </Card>
                    <Card className="p-5 md:p-8 bg-white shadow-sm rounded-xl md:rounded-[2.5rem] border border-slate-100">
                        <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Balance</p>
                        <p className="text-2xl md:text-3xl font-bold text-emerald-700 tracking-tighter">₦12,500</p>
                    </Card>
                </div>

                <div className="space-y-4 md:space-y-6 text-left">
                    <h2 className="text-base md:text-2xl font-bold text-emerald-950 tracking-tight flex items-center gap-2 px-1"><TrendingUp size={18} className="text-emerald-600"/> Current Missions</h2>
                    {tasks.map(task => {
                        const prop = properties.find(p => p.id === task.propertyId);
                        return (
                            <Card key={task.id} className={`p-6 md:p-8 border border-slate-100 shadow-sm rounded-2xl md:rounded-[3rem] transition-all relative ${task.status === 'COMPLETED' ? 'opacity-40 grayscale' : 'bg-white'}`}>
                                <div className="flex justify-between items-start mb-4 md:mb-6">
                                    <Badge color={task.type === 'LANDLORD_VERIFICATION' ? 'amber' : 'emerald'}>
                                        {task.type === 'LANDLORD_VERIFICATION' ? 'AUDIT' : 'TOUR'}
                                    </Badge>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">{task.status}</span>
                                </div>
                                <h3 className="text-lg md:text-2xl font-bold text-emerald-950 tracking-tight leading-tight mb-1 md:mb-2">{prop?.title || "Node Audit"}</h3>
                                <p className="text-xs md:text-sm font-medium text-slate-400 flex items-center gap-1.5 md:gap-2 mb-6 md:mb-8 text-left"><MapPin size={14} className="md:w-[18px] md:h-[18px] text-emerald-500"/> {prop?.address.split(',')[0]}</p>
                                
                                {task.status !== 'COMPLETED' && (
                                    <div className="flex gap-2 md:gap-4">
                                        <button onClick={() => handleOpenChat(task.id)} className="flex-1 py-3 md:py-4 bg-slate-50 text-emerald-950 rounded-xl md:rounded-2xl font-bold uppercase text-[10px] flex items-center justify-center gap-2 border border-slate-200">
                                            <MessageSquare size={16}/> Chat
                                        </button>
                                        <button onClick={() => handleComplete(task.id)} className="flex-1 py-3 md:py-4 bg-emerald-950 text-white rounded-xl md:rounded-2xl font-bold uppercase text-[10px] shadow-lg">
                                            Close Mission
                                        </button>
                                    </div>
                                )}
                            </Card>
                        )
                    })}
                </div>
            </main>

            {showProfile && (
                <ProfileView 
                    user={user} 
                    onLogout={onLogout} 
                    onClose={() => setShowProfile(false)} 
                />
            )}

            {activeChatSessionId && currentChatSession && (
                <ChatSystem session={currentChatSession} currentUser={user} onSendMessage={onSendMessage} onClose={() => setActiveChatSessionId(null)} />
            )}
        </div>
    );
};
