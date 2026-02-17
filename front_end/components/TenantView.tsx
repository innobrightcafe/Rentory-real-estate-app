
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, MapPin, Sparkles, MessageSquare, Compass, History, 
  Search, ChevronRight, ArrowRight, Lock, 
  FileText, ArrowLeft, Heart, Bell, Headphones, Clock
} from 'lucide-react';
import { Property, MatchResult, User, ChatSession, Lease } from '../types';
import { Button, Card, Badge, LoadingScreen, NotificationBadge } from './UI';
import { calculateMatchScore } from '../services/geminiService';
import { ChatSystem } from './ChatSystem';
import { LeaseViewer } from './LeaseViewer';

interface TenantViewProps {
  user: User;
  onLogout: () => void;
  properties: Property[];
  chatSessions: ChatSession[];
  leases: Lease[];
  onSignLease: (id: string) => void;
  onSendMessage: (sessionId: string, text: string) => void;
  onUnlockProperty: (propertyId: string) => void;
  onInitiateSupportChat: () => string;
  onUpdatePreferences: (prefs: string) => void;
  unlockedProperties: string[];
  viewedHistory: string[];
  onAddToHistory: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const TenantView: React.FC<TenantViewProps> = ({ 
    user, onLogout, properties, chatSessions, leases, onSignLease, 
    onSendMessage, onUnlockProperty, onInitiateSupportChat, onUpdatePreferences, unlockedProperties, viewedHistory, onAddToHistory, onToggleFavorite
}) => {
  const [onboardingStep, setOnboardingStep] = useState(user.preferences ? 99 : 0);
  const [activeTab, setActiveTab] = useState<'discover' | 'saved' | 'messages' | 'leases'>('discover');
  
  const [selections, setSelections] = useState<{type?: string, location?: string, budget?: string}>({});
  const [feedProperties, setFeedProperties] = useState<(Property & { match?: MatchResult })[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingMatches, setLoadingMatches] = useState(false);
  
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);
  const [selectedLeaseId, setSelectedLeaseId] = useState<string | null>(null);

  const detailScrollRef = useRef<HTMLDivElement>(null);

  const notificationCount = useMemo(() => {
    const unreadMessages = chatSessions.reduce((acc, s) => 
        acc + s.messages.filter(m => !m.isRead && m.senderId !== user.id).length, 0);
    const pendingLeases = leases.filter(l => l.status === 'SIGNED_BY_LANDLORD').length;
    return unreadMessages + pendingLeases;
  }, [chatSessions, leases, user.id]);

  useEffect(() => {
    if (selectedPropertyId && detailScrollRef.current) {
      detailScrollRef.current.scrollTop = 0;
    }
  }, [selectedPropertyId]);

  // Handle returning user search auto-start
  useEffect(() => {
    if (user.preferences && feedProperties.length === 0) {
      startMatching(user.preferences);
    }
  }, [user.preferences]);

  const onboardingScreens = [
    {
      title: "Architecture",
      subtitle: "Which space resonates with your energy?",
      options: ["Modern Loft", "Terrace Home", "Penthouse", "Studio Pad"],
      key: "type",
      bg: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Territory",
      subtitle: "Select your preferred operations base.",
      options: ["Lagos Islands", "FCT Abuja", "Garden City", "Lekki Hub"],
      key: "location",
      bg: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Investment",
      subtitle: "Define your monthly comfort ceiling.",
      options: ["Under ₦250k", "₦250k - ₦600k", "₦600k - ₦1.5M", "Luxury Only"],
      key: "budget",
      bg: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
    }
  ];

  const handleSelect = (val: string) => {
    const key = onboardingScreens[onboardingStep].key;
    const newSelections = { ...selections, [key]: val };
    setSelections(newSelections);
    
    if (onboardingStep < onboardingScreens.length - 1) {
      setOnboardingStep(prev => prev + 1);
    } else {
      const prefStr = Object.values(newSelections).join(' ');
      onUpdatePreferences(prefStr);
      startMatching(prefStr);
    }
  };

  const handleResetSearch = () => {
    setOnboardingStep(0);
    setSelections({});
    setFeedProperties([]);
    setCurrentIndex(0);
    onUpdatePreferences("");
  };

  const handleSupportClick = () => {
    const sid = onInitiateSupportChat();
    setActiveTab('messages');
    setActiveChatSessionId(sid);
  };

  const startMatching = async (prefStr: string) => {
    setLoadingMatches(true);
    setOnboardingStep(99); 
    const results = await Promise.all(properties.map(async (p) => {
        const matchData = await calculateMatchScore(prefStr, `${p.title} ${p.description}`);
        return { ...p, match: matchData };
    }));
    setFeedProperties(results.sort((a, b) => (b.match?.score || 0) - (a.match?.score || 0)));
    setLoadingMatches(false);
  };

  const handleViewProperty = (propId: string) => {
      onAddToHistory(propId);
      setSelectedPropertyId(propId);
  };

  const handleOpenChat = (sessionId: string) => {
    setActiveChatSessionId(sessionId);
  };

  const currentProperty = feedProperties.find(p => p.id === selectedPropertyId) || (selectedPropertyId ? properties.find(p => p.id === selectedPropertyId) : null);
  const currentChatSession = chatSessions.find(s => s.id === activeChatSessionId);
  const currentLease = leases.find(l => l.id === selectedLeaseId);

  if (onboardingStep < 99 && feedProperties.length === 0) {
    const screen = onboardingScreens[onboardingStep];
    return (
      <div className="h-full relative overflow-hidden bg-slate-900 flex flex-col text-white animate-in fade-in duration-700">
        <div className="absolute inset-0 z-0">
            <img src={screen.bg} className="w-full h-full object-cover opacity-50 scale-105" alt="bg" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/60 to-slate-900"></div>
        </div>
        <header className="relative z-10 px-6 py-6 flex justify-between items-center max-w-5xl mx-auto w-full">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white text-emerald-950 rounded-lg flex items-center justify-center font-bold shadow-2xl text-sm">R</div>
                <span className="font-bold tracking-tighter uppercase text-[10px]">Rentory</span>
            </div>
            <div className="flex gap-1">
                {onboardingScreens.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${onboardingStep === i ? 'w-6 bg-emerald-400' : 'w-2 bg-white/20'}`}></div>
                ))}
            </div>
        </header>
        <div className="relative z-10 flex-1 flex flex-col justify-end px-6 md:px-20 pb-10 md:pb-24 space-y-6 md:space-y-10 animate-in slide-in-from-bottom-10 duration-700 max-w-5xl mx-auto w-full">
            <div className="space-y-1 text-left">
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-[2px] text-emerald-400">Step 0{onboardingStep + 1}</p>
                <h2 className="text-3xl md:text-6xl font-bold tracking-tighter leading-tight">{screen.title}</h2>
                <p className="text-sm md:text-xl font-medium text-slate-300 max-w-lg">{screen.subtitle}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {screen.options.map((opt, i) => (
                    <button key={i} onClick={() => handleSelect(opt)} className="w-full py-4 md:py-8 px-5 rounded-xl bg-white/10 backdrop-blur-xl border border-white/10 text-left text-sm md:text-lg font-bold hover:bg-white/20 active:scale-[0.98] transition-all flex justify-between items-center group">
                        {opt}
                        <ArrowRight size={18} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                    </button>
                ))}
            </div>
        </div>
      </div>
    );
  }

  const favoriteProps = properties.filter(p => user.favorites?.includes(p.id));
  const historyProps = viewedHistory
    .map(id => properties.find(p => p.id === id))
    .filter((p): p is Property => p !== undefined);

  return (
    <div className="h-full flex flex-col bg-white relative overflow-hidden text-slate-900 font-['Plus_Jakarta_Sans']">
       <header className="px-4 md:px-12 py-3 md:py-6 bg-white border-b border-slate-100 flex justify-between items-center z-10 shrink-0 shadow-sm">
           <div className="flex items-center gap-3">
               <div className="w-8 md:w-11 h-8 md:h-11 bg-emerald-950 rounded-lg md:rounded-2xl flex items-center justify-center text-white font-bold shadow-lg text-sm md:text-lg">R</div>
               <div className="text-left">
                   <span className="font-bold text-slate-900 text-base md:text-2xl tracking-tighter block leading-none">Rentory</span>
                   <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">Portal</span>
               </div>
           </div>
           
           <div className="hidden md:flex gap-8 items-center mr-12">
               <button onClick={() => setActiveTab('discover')} className={`text-xs font-bold uppercase tracking-widest ${activeTab === 'discover' ? 'text-emerald-950 underline underline-offset-8 decoration-2' : 'text-slate-400 hover:text-slate-600'}`}>Discover</button>
               <button onClick={() => setActiveTab('saved')} className={`text-xs font-bold uppercase tracking-widest ${activeTab === 'saved' ? 'text-emerald-950 underline underline-offset-8 decoration-2' : 'text-slate-400 hover:text-slate-600'}`}>Saved</button>
               <button onClick={() => setActiveTab('messages')} className={`text-xs font-bold uppercase tracking-widest relative ${activeTab === 'messages' ? 'text-emerald-950 underline underline-offset-8 decoration-2' : 'text-slate-400 hover:text-slate-600'}`}>
                 Inbox
                 <NotificationBadge count={notificationCount} className="-top-3 -right-5" />
               </button>
               <button onClick={() => setActiveTab('leases')} className={`text-xs font-bold uppercase tracking-widest ${activeTab === 'leases' ? 'text-emerald-950 underline underline-offset-8 decoration-2' : 'text-slate-400 hover:text-slate-600'}`}>Leases</button>
           </div>

           <div className="flex items-center gap-3">
              <button className="p-2 bg-slate-50 rounded-lg text-slate-400 active:scale-90 transition-all relative">
                  <Bell size={18}/>
                  <NotificationBadge count={notificationCount} />
              </button>
              <button onClick={onLogout} className="p-2 bg-slate-50 rounded-lg text-slate-400 active:scale-90 transition-all">
                  <X size={18}/>
              </button>
           </div>
       </header>

       <main className="flex-1 overflow-y-auto no-scrollbar relative bg-slate-50/20 px-3 md:px-12 lg:px-20">
            {activeTab === 'discover' && (
                <div className="py-4 md:py-8 space-y-4 md:space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-32 md:pb-48">
                    {loadingMatches ? <LoadingScreen message="Identifying matches..." /> : (
                        <div className="flex flex-col items-center">
                            {feedProperties.length > 0 && currentIndex < feedProperties.length ? (
                                <Card className="w-full relative group shadow-sm border-none overflow-hidden flex flex-col md:flex-row rounded-2xl md:rounded-[2.5rem] bg-white">
                                    <div className="aspect-[4/3] md:h-full md:w-[50%] md:aspect-auto relative shrink-0 overflow-hidden">
                                        <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar h-full w-full">
                                            {feedProperties[currentIndex].images.map((img, idx) => (
                                                <img key={idx} src={img} className="w-full h-full object-cover shrink-0 snap-center" alt={`Property ${idx}`} />
                                            ))}
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/50 md:from-black/40 via-transparent to-transparent pointer-events-none"></div>
                                        <div className="absolute top-4 left-4"><Badge color="emerald">VERIFIED</Badge></div>
                                        <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(feedProperties[currentIndex].id); }} className="absolute top-4 right-4 w-9 h-9 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full flex items-center justify-center active:scale-90 transition-all z-20 shadow-lg text-white">
                                          <Heart size={18} className={user.favorites?.includes(feedProperties[currentIndex].id) ? 'fill-rose-500 text-rose-500' : 'text-white'} />
                                        </button>
                                    </div>
                                    <div className="p-5 md:p-14 flex-1 flex flex-col justify-between text-left">
                                        <div className="space-y-3 md:space-y-4">
                                            <div className="bg-emerald-50 px-2.5 py-1 rounded-lg font-bold shadow-sm text-[10px] md:text-[11px] text-emerald-900 border border-emerald-100 w-fit">
                                                {feedProperties[currentIndex].match?.score}% AI MATCH
                                            </div>
                                            <h2 className="text-xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">{feedProperties[currentIndex].title}</h2>
                                            <p className="text-emerald-700 font-bold text-lg md:text-3xl tracking-tighter">₦{feedProperties[currentIndex].price.toLocaleString()}<span className="text-xs md:text-sm font-medium text-slate-400 ml-1">/month</span></p>
                                            <p className="text-slate-500 text-sm md:text-lg font-medium leading-relaxed line-clamp-2 md:line-clamp-3 pt-1">{feedProperties[currentIndex].description}</p>
                                        </div>
                                        <div className="flex gap-2 pt-6 md:pt-10">
                                            <button onClick={() => setCurrentIndex(prev => prev + 1)} className="flex-1 py-3 md:py-5 rounded-xl md:rounded-2xl bg-slate-50 text-slate-500 font-bold uppercase text-[10px] md:text-[12px] active:scale-95 transition-all border border-slate-100">Skip</button>
                                            <button onClick={() => handleViewProperty(feedProperties[currentIndex].id)} className="flex-[2] py-3 md:py-5 rounded-xl md:rounded-2xl bg-emerald-950 text-white font-bold uppercase text-[10px] md:text-[12px] shadow-lg md:shadow-2xl active:scale-95 transition-all">View Details</button>
                                        </div>
                                    </div>
                                </Card>
                            ) : (
                                <div className="text-center py-16 md:py-32 max-w-lg animate-in fade-in slide-in-from-bottom-8">
                                    <div className="w-20 h-20 md:w-32 md:h-32 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                                        <Search size={40} className="md:w-16 md:h-16 text-slate-300"/>
                                    </div>
                                    <h3 className="text-xl md:text-3xl font-bold text-slate-900 tracking-tight mb-2">All Caught Up!</h3>
                                    <p className="text-slate-500 text-sm md:text-base font-medium mb-10 px-6">You've explored all currently available properties matching these criteria. Try resetting your preferences or speak with us.</p>
                                    
                                    <div className="flex flex-col gap-3 px-6">
                                        <Button onClick={handleResetSearch} variant="primary" className="w-full py-4 md:py-6 rounded-2xl text-xs md:text-sm shadow-xl">
                                            Reset Search Criteria
                                        </Button>
                                        <Button onClick={handleSupportClick} variant="outline" className="w-full py-4 md:py-6 rounded-2xl text-xs md:text-sm flex items-center justify-center gap-3">
                                            <Headphones size={18}/> Chat with Rentory Rep
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
            
            {activeTab === 'saved' && (
                <div className="py-6 md:py-12 space-y-8 md:space-y-16 animate-in fade-in max-w-6xl mx-auto pb-48">
                    {/* Saved Section */}
                    <section className="space-y-4 md:space-y-8">
                        <div className="flex justify-between items-end border-b border-slate-100 pb-3 md:pb-4">
                            <h2 className="text-2xl md:text-4xl font-bold tracking-tight">Saved</h2>
                            <p className="text-[10px] md:text-xs font-bold uppercase text-rose-500 tracking-widest">{favoriteProps.length} Items</p>
                        </div>
                        {favoriteProps.length === 0 ? (
                            <div className="p-10 md:p-20 border-2 border-dashed border-slate-200 rounded-2xl md:rounded-[3rem] flex flex-col items-center justify-center text-slate-300 text-center">
                                <Heart size={28} className="md:w-12 md:h-12 mb-2 md:mb-4"/>
                                <p className="text-[10px] md:text-sm font-bold uppercase tracking-widest">Collection empty</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
                                {favoriteProps.map(prop => (
                                    <Card key={prop.id} onClick={() => handleViewProperty(prop.id)} className="relative group rounded-xl md:rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer">
                                        <div className="aspect-[4/3] relative">
                                            <img src={prop.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={prop.title} />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                                            <div className="absolute bottom-3 md:bottom-6 left-4 md:left-8 right-4 md:right-8 text-white text-left">
                                                <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest truncate mb-0.5 opacity-70">{prop.address.split(',')[0]}</p>
                                                <h3 className="text-sm md:text-xl font-bold tracking-tight leading-none truncate">{prop.title}</h3>
                                                <p className="text-emerald-400 font-bold tracking-tighter mt-1 text-sm md:text-lg">₦{prop.price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Recently Viewed Section */}
                    <section className="space-y-4 md:space-y-8">
                        <div className="flex justify-between items-end border-b border-slate-100 pb-3 md:pb-4">
                            <h2 className="text-2xl md:text-4xl font-bold tracking-tight">Recently Viewed</h2>
                            <p className="text-[10px] md:text-xs font-bold uppercase text-emerald-600 tracking-widest">{historyProps.length} Items</p>
                        </div>
                        {historyProps.length === 0 ? (
                            <div className="p-10 md:p-20 border-2 border-dashed border-slate-200 rounded-2xl md:rounded-[3rem] flex flex-col items-center justify-center text-slate-300 text-center">
                                <Clock size={28} className="md:w-12 md:h-12 mb-2 md:mb-4"/>
                                <p className="text-[10px] md:text-sm font-bold uppercase tracking-widest">No view history yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
                                {historyProps.map(prop => (
                                    <Card key={prop.id} onClick={() => handleViewProperty(prop.id)} className="relative group rounded-xl md:rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer">
                                        <div className="aspect-[4/3] relative">
                                            <img src={prop.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={prop.title} />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                                            <div className="absolute bottom-3 md:bottom-6 left-4 md:left-8 right-4 md:right-8 text-white text-left">
                                                <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest truncate mb-0.5 opacity-70">{prop.address.split(',')[0]}</p>
                                                <h3 className="text-sm md:text-xl font-bold tracking-tight leading-none truncate">{prop.title}</h3>
                                                <p className="text-emerald-400 font-bold tracking-tighter mt-1 text-sm md:text-lg">₦{prop.price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            )}

            {activeTab === 'messages' && (
                <div className="py-6 md:py-12 space-y-6 md:space-y-8 animate-in fade-in max-w-4xl mx-auto pb-48">
                    <h2 className="text-2xl md:text-4xl font-bold tracking-tight border-b border-slate-100 pb-4 md:pb-6 text-left">Inbox</h2>
                    {chatSessions.length === 0 ? (
                        <div className="text-center py-20 opacity-30">
                            <MessageSquare size={40} className="md:w-20 md:h-20 mx-auto mb-4 md:mb-6 text-slate-200"/>
                            <p className="text-[10px] md:text-sm font-bold uppercase tracking-widest">No Messages</p>
                        </div>
                    ) : (
                        <div className="space-y-2 md:space-y-4">
                            {chatSessions.map(session => {
                                const lastMsg = session.messages[session.messages.length - 1];
                                const unreadInSession = session.messages.filter(m => !m.isRead && m.senderId !== user.id).length;
                                return (
                                    <Card 
                                        key={session.id} 
                                        onClick={() => handleOpenChat(session.id)} 
                                        className="p-4 md:p-8 flex items-center justify-between border-none shadow-sm bg-white rounded-xl md:rounded-[2.5rem] cursor-pointer hover:shadow-md hover:bg-slate-50 transition-all active:scale-[0.98] relative"
                                    >
                                        <div className="flex items-center gap-4 md:gap-6 min-w-0 flex-1">
                                            <div className="w-10 md:w-16 h-10 md:h-16 bg-emerald-950 rounded-xl flex items-center justify-center text-white font-bold text-base md:text-2xl shadow-inner shrink-0">
                                                {session.propertyTitle.charAt(0)}
                                            </div>
                                            <div className="min-w-0 flex-1 text-left">
                                                <h3 className="font-bold text-slate-900 text-sm md:text-xl tracking-tight truncate">{session.propertyTitle}</h3>
                                                <p className="text-slate-500 text-[11px] md:text-xs truncate mt-0.5">{lastMsg?.text || 'Secure channel active'}</p>
                                                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                                    <span className="w-1.5 md:w-2 h-1.5 md:h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                                    {session.propertyId === 'SUPPORT' ? 'Direct Support' : 'Direct Channel'}
                                                </p>
                                            </div>
                                        </div>
                                        {unreadInSession > 0 && (
                                            <div className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mr-4">
                                                {unreadInSession}
                                            </div>
                                        )}
                                        <ChevronRight size={18} className="text-slate-300 shrink-0 ml-4"/>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'leases' && (
                <div className="py-6 md:py-12 space-y-6 md:space-y-8 animate-in fade-in max-w-4xl mx-auto pb-48">
                    <h2 className="text-2xl md:text-4xl font-bold tracking-tight border-b border-slate-100 pb-4 md:pb-6 text-left">Leases</h2>
                    {leases.length === 0 ? (
                        <div className="text-center py-20 opacity-30">
                            <FileText size={40} className="md:w-20 md:h-20 mx-auto mb-4 md:mb-6 text-slate-200"/>
                            <p className="text-[10px] md:text-sm font-bold uppercase tracking-widest">No Contracts</p>
                        </div>
                    ) : (
                        <div className="space-y-2 md:space-y-4">
                            {leases.map(lease => (
                                <Card 
                                    key={lease.id} 
                                    onClick={() => setSelectedLeaseId(lease.id)} 
                                    className="p-4 md:p-8 flex items-center justify-between border-none shadow-sm bg-white rounded-xl md:rounded-[2.5rem] cursor-pointer hover:shadow-md hover:bg-slate-50 transition-all active:scale-[0.98]"
                                >
                                    <div className="flex items-center gap-4 md:gap-6 min-w-0 flex-1">
                                        <div className="w-10 md:w-16 h-10 md:h-16 bg-emerald-950 rounded-xl flex items-center justify-center text-white font-bold text-base md:text-2xl shadow-inner shrink-0">
                                            <FileText size={18} className="md:w-6 md:h-6"/>
                                        </div>
                                        <div className="min-w-0 flex-1 text-left">
                                            <h3 className="font-bold text-slate-900 text-sm md:text-xl tracking-tight truncate">{lease.propertyName}</h3>
                                            <Badge color={lease.status === 'FULLY_SIGNED' ? 'emerald' : 'amber'}>
                                                {lease.status === 'FULLY_SIGNED' ? 'AUTHORIZED' : 'ACTION REQUIRED'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className="text-slate-300 shrink-0 ml-4"/>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}
       </main>

       {/* --- Detail View Overlay --- */}
       {currentProperty && (
            <div 
              className="fixed inset-0 md:left-1/2 md:-translate-x-1/2 md:max-w-6xl bg-white z-[140] overflow-y-auto animate-in slide-in-from-bottom-10 overscroll-contain no-scrollbar scroll-smooth pb-48 md:pb-64"
              style={{ overscrollBehavior: 'contain' }}
              ref={detailScrollRef}
            >
                <div className="relative h-[45vh] md:h-[75vh] block shrink-0">
                    <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar h-full w-full">
                        {currentProperty.images.map((img, idx) => (
                            <img key={idx} src={img} className="w-full h-full object-cover shrink-0 snap-center" alt={`Gallery ${idx}`} />
                        ))}
                    </div>
                    <div className="absolute top-4 md:top-8 inset-x-4 md:inset-x-8 flex justify-between items-center z-20">
                        <button onClick={() => setSelectedPropertyId(null)} className="p-2.5 md:p-4 bg-white/95 backdrop-blur shadow-xl rounded-full text-slate-900 active:scale-90 transition-all"><ArrowLeft size={20} className="md:w-7 md:h-7"/></button>
                        <button onClick={() => onToggleFavorite(currentProperty.id)} className="p-2.5 md:p-4 bg-white/95 backdrop-blur shadow-xl rounded-full active:scale-90 transition-all">
                          <Heart size={20} className={user.favorites?.includes(currentProperty.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-300'} />
                        </button>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-20 md:h-40 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none"></div>
                </div>

                <div className="px-5 md:px-20 lg:px-40 space-y-8 md:space-y-16 bg-white -mt-10 md:-mt-20 rounded-t-[2.5rem] md:rounded-t-[5rem] relative z-10 shadow-lg min-h-screen pt-10 md:pt-16">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-5 md:gap-10">
                        <div className="space-y-2 md:space-y-4 max-w-2xl text-left">
                            <h2 className="text-2xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight">{currentProperty.title}</h2>
                            <p className="text-slate-400 font-bold text-[11px] md:text-base uppercase tracking-widest flex items-center gap-2"><MapPin size={16} className="text-emerald-600 md:w-[22px] md:h-[22px]"/> {currentProperty.address}</p>
                        </div>
                        <div className="bg-emerald-50 p-6 md:p-8 rounded-2xl md:rounded-[3rem] border border-emerald-100/50 shadow-sm w-full md:w-auto text-left md:text-right">
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5 md:mb-1">Investment</p>
                            <p className="text-emerald-800 font-bold text-2xl md:text-5xl tracking-tighter">₦{currentProperty.price.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 text-left">
                        <div className="space-y-6 md:space-y-12">
                            <Card className="p-6 md:p-10 bg-slate-50 border-none shadow-inner rounded-2xl md:rounded-[3.5rem]">
                                <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-6">
                                    <Sparkles size={18} className="text-emerald-600 md:w-6 md:h-6"/>
                                    <h3 className="font-bold text-emerald-950 uppercase tracking-widest text-[11px] md:text-xs">AI Insight</h3>
                                </div>
                                <p className="text-sm md:text-xl font-medium leading-relaxed text-slate-600">
                                    {(currentProperty as any).match?.reason || "This premium space aligns perfectly with your lifestyle needs and architectural taste."}
                                </p>
                            </Card>

                            <div className="space-y-4 md:space-y-8">
                                <h4 className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2 md:pb-3">Specifications</h4>
                                <div className="flex flex-wrap gap-2 md:gap-4">
                                    {currentProperty.features.map((f, i) => (
                                        <div key={i} className="px-4 md:px-7 py-2 md:py-4 bg-white border border-slate-100 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-900 shadow-sm">{f}</div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8 md:space-y-12 pb-24 md:pb-0">
                            <div className="space-y-4 md:space-y-6">
                                <h4 className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2 md:pb-3">The Narrative</h4>
                                <p className="text-sm md:text-xl font-medium leading-relaxed text-slate-500">{currentProperty.description}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="fixed bottom-0 md:left-1/2 md:-translate-x-1/2 w-full md:max-w-6xl p-6 md:p-10 bg-white/95 backdrop-blur-3xl border-t border-slate-100 flex justify-center z-[150] shadow-2xl rounded-t-[2.5rem]">
                    <div className="w-full max-w-4xl flex flex-col md:flex-row gap-4 md:gap-6">
                        {!unlockedProperties.includes(currentProperty.id) ? (
                            <Button onClick={() => onUnlockProperty(currentProperty.id)} className="flex-1 py-4 md:py-8 rounded-2xl md:rounded-[2.5rem] shadow-xl text-xs font-bold uppercase tracking-widest">
                                <Lock size={16} className="text-emerald-500 md:w-5 md:h-5"/> Unlock Contact (₦5,000)
                            </Button>
                        ) : (
                            <Button onClick={() => {
                                const s = chatSessions.find(s => s.propertyId === currentProperty.id);
                                if (s) setActiveChatSessionId(s.id);
                            }} className="flex-1 py-4 md:py-8 rounded-2xl md:rounded-[2.5rem] shadow-xl text-xs font-bold uppercase tracking-widest">
                                <MessageSquare size={16} className="text-emerald-500 md:w-5 md:h-5"/> Initiate Direct Dialogue
                            </Button>
                        )}
                    </div>
                </div>
            </div>
       )}

       {/* --- Chat System Layer --- */}
       {activeChatSessionId && currentChatSession && (
           <ChatSystem session={currentChatSession} currentUser={user} onSendMessage={onSendMessage} onClose={() => setActiveChatSessionId(null)} />
       )}
       
       {/* --- Lease Viewer Layer --- */}
       {selectedLeaseId && currentLease && (
           <LeaseViewer 
                lease={currentLease} 
                currentUser={user} 
                onClose={() => setSelectedLeaseId(null)} 
                onSign={onSignLease} 
            />
       )}

       {/* --- Bottom Navigation --- */}
        <nav className="fixed bottom-0 md:left-1/2 md:-translate-x-1/2 w-full md:max-w-6xl bg-white/95 backdrop-blur-3xl border-t border-slate-100 p-2 md:p-4 flex justify-around pb-8 z-50 rounded-t-[2rem] shadow-xl md:hidden">
            <button onClick={() => setActiveTab('discover')} className={`p-3 flex flex-col items-center gap-1 transition-all ${activeTab === 'discover' ? 'text-emerald-950 scale-105 font-bold' : 'text-slate-400'}`}>
                <Compass size={22} className={activeTab === 'discover' ? 'text-emerald-950' : 'text-slate-400'}/>
                <span className={`text-[10px] uppercase font-bold tracking-widest ${activeTab === 'discover' ? 'text-emerald-950' : 'text-slate-500'}`}>Discover</span>
            </button>
            <button onClick={() => setActiveTab('saved')} className={`p-3 flex flex-col items-center gap-1 transition-all ${activeTab === 'saved' ? 'text-emerald-950 scale-105 font-bold' : 'text-slate-400'}`}>
                <Heart size={22} className={activeTab === 'saved' ? 'text-rose-500' : 'text-slate-400'}/>
                <span className={`text-[10px] uppercase font-bold tracking-widest ${activeTab === 'saved' ? 'text-emerald-950' : 'text-slate-500'}`}>Saved</span>
            </button>
            <button onClick={() => setActiveTab('messages')} className={`p-3 flex flex-col items-center gap-1 transition-all relative ${activeTab === 'messages' ? 'text-emerald-950 scale-105 font-black' : 'text-slate-400'}`}>
                <MessageSquare size={22} className={activeTab === 'messages' ? 'text-emerald-950' : 'text-slate-400'}/>
                <NotificationBadge count={notificationCount} className="-top-1 -right-1" />
                <span className={`text-[10px] uppercase font-bold tracking-widest ${activeTab === 'messages' ? 'text-emerald-950' : 'text-slate-500'}`}>Inbox</span>
            </button>
            <button onClick={() => setActiveTab('leases')} className={`p-3 flex flex-col items-center gap-1 transition-all ${activeTab === 'leases' ? 'text-emerald-950 scale-105 font-bold' : 'text-slate-400'}`}>
                <FileText size={22} className={activeTab === 'leases' ? 'text-emerald-950' : 'text-slate-400'}/>
                <span className={`text-[10px] uppercase font-bold tracking-widest ${activeTab === 'leases' ? 'text-emerald-950' : 'text-slate-500'}`}>Leases</span>
            </button>
        </nav>
    </div>
  );
};
