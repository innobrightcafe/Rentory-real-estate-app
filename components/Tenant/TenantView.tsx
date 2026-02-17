
import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, MapPin, Sparkles, MessageSquare, Compass, 
  Search, ArrowRight, Lock, User as UserIcon,
  FileText, ArrowLeft, Heart, Mic, Star, LogOut, Send, Activity, ShieldCheck
} from 'lucide-react';
import { Property, MatchResult, User, ChatSession, Lease, Review } from '../../types';
import { Button, Card, Badge, LoadingScreen, Input, EnhancedImage } from '../UI';
import { calculateMatchScore, runAIConciergeSession, processVoiceSearch } from '../../services/geminiService';
import { ChatSystem } from '../ChatSystem';
import { ProfileView } from '../ProfileView';

interface TenantViewProps {
  user: User;
  onLogout: () => void;
  properties: Property[];
  chatSessions: ChatSession[];
  leases: Lease[];
  onSignLease: (id: string) => void;
  onSendMessage: (sessionId: string, text: string) => void;
  onUnlockProperty: (propertyId: string) => void;
  // Fix: Added onInitiateSupportChat to match expected props in App.tsx
  onInitiateSupportChat: () => string;
  onUpdatePreferences: (prefs: string) => void;
  unlockedProperties: string[];
  viewedHistory: string[];
  onAddToHistory: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const TenantView: React.FC<TenantViewProps> = (props) => {
  const { user, properties, onUpdatePreferences, chatSessions, onSendMessage, onInitiateSupportChat } = props;

  // Mode states
  const [viewMode, setViewMode] = useState<'DASHBOARD' | 'AI_SETUP'>(user.preferences ? 'DASHBOARD' : 'AI_SETUP');
  const [showProfile, setShowProfile] = useState(false);
  const [searchMode, setSearchMode] = useState<'QUICK' | 'ADVANCED'>('QUICK');
  const [setupStep, setSetupStep] = useState(0);
  const [activeTab, setActiveTab] = useState<'find' | 'saved' | 'messages' | 'leases'>('find');
  
  // Interaction states
  const [isListening, setIsListening] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  // AI States
  const [conciergeHistory, setConciergeHistory] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [conciergeInput, setConciergeInput] = useState('');
  const [conciergeQuestion, setConciergeQuestion] = useState("Hi! I'm your property assistant. What kind of home are you looking for?");
  
  // Data states
  const [selections, setSelections] = useState<{category?: string, location?: string, budget?: string}>({});
  const [feedProperties, setFeedProperties] = useState<(Property & { match?: MatchResult })[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);

  // Load properties with Location Priority
  useEffect(() => {
    if (feedProperties.length === 0 && properties.length > 0) {
      const sorted = [...properties].sort((a, b) => {
          const userLoc = selections.location?.toLowerCase() || "";
          const aMatch = a.address.toLowerCase().includes(userLoc) ? 1 : 0;
          const bMatch = b.address.toLowerCase().includes(userLoc) ? 1 : 0;
          return bMatch - aMatch;
      });
      setFeedProperties(sorted.map(p => ({ ...p, match: { score: 100, reason: "Best match in your area" } })));
    }
  }, [properties, selections.location]);

  const setupScreens = [
    { 
      title: "Property Type", 
      subtitle: "What are you looking for today?", 
      options: ["Apartment or House", "Land Plots", "Office Space", "Event Halls", "Short Stay"], 
      key: "category", 
      bg: "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80" 
    },
    { 
      title: "Location", 
      subtitle: "Which area do you prefer?", 
      options: ["Lagos Islands", "Abuja FCT", "Port Harcourt", "Lekki Hub"], 
      key: "location", 
      bg: "https://images.unsplash.com/photo-1590059132718-56c67bfad665?auto=format&fit=crop&w=1200&q=80" 
    },
    { 
      title: "Monthly Budget", 
      subtitle: "What is your comfortable limit?", 
      options: ["Under 250k", "250k - 600k", "600k - 1.5M", "Luxury Homes"], 
      key: "budget", 
      bg: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80" 
    }
  ];

  const handleEnterAiSetup = () => {
    setSetupStep(0);
    setConciergeHistory([]);
    setSelections({});
    setViewMode('AI_SETUP');
  };

  const handleResetAiFromProfile = () => {
    onUpdatePreferences("");
    setSetupStep(0);
    setConciergeHistory([]);
    setSelections({});
    setViewMode('AI_SETUP');
    setShowProfile(false);
  };

  const performMatching = async (prefStr: string, limit: number = 20) => {
    setLoadingMatches(true);
    setViewMode('DASHBOARD');
    const results = await Promise.all(properties.map(async (p) => {
        const matchData = await calculateMatchScore(prefStr, p);
        return { ...p, match: matchData };
    }));
    
    const sorted = results.sort((a, b) => {
        const userLoc = selections.location?.toLowerCase() || "";
        const aLocBonus = a.address.toLowerCase().includes(userLoc) ? 20 : 0;
        const bLocBonus = b.address.toLowerCase().includes(userLoc) ? 20 : 0;
        
        const aScore = (a.match?.score || 0) + aLocBonus;
        const bScore = (b.match?.score || 0) + bLocBonus;
        return bScore - aScore;
    });
    
    setFeedProperties(sorted.slice(0, limit));
    setTimeout(() => setLoadingMatches(false), 2000);
  };

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window)) { alert("Voice search not supported."); return; }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      const parsedPrefs = await processVoiceSearch(transcript);
      performMatching(parsedPrefs);
    };
    recognition.start();
  };

  const handleConciergeSend = async () => {
    if (!conciergeInput.trim()) return;
    const newHistory = [...conciergeHistory, { role: 'user' as const, text: conciergeInput }];
    setConciergeHistory(newHistory);
    setConciergeInput('');
    const result = await runAIConciergeSession(newHistory);
    if (result.profileFound) {
      onUpdatePreferences(result.profileFound);
      performMatching(result.profileFound, 10);
    } else {
      setConciergeQuestion(result.question);
      setConciergeHistory([...newHistory, { role: 'model', text: result.question }]);
    }
  };

  const handleInitiateChat = (property: Property) => {
    const deterministicId = `chat_${property.id}_${user.id}`;
    const existing = chatSessions.find(s => s.id === deterministicId || (s.propertyId === property.id && s.tenantId === user.id));
    if (existing) { 
      setActiveChatSessionId(existing.id); 
    } else { 
      onSendMessage(deterministicId, `Hi, I'm interested in "${property.title}". Could you tell me more?`); 
      setActiveChatSessionId(deterministicId);
    }
    setActiveTab('messages');
    setSelectedPropertyId(null);
  };

  // Fix: Implemented handleSupportClick using the onInitiateSupportChat prop
  const handleSupportClick = () => {
    const sid = onInitiateSupportChat();
    setActiveTab('messages');
    setActiveChatSessionId(sid);
  };

  const favoriteProperties = useMemo(() => properties.filter(p => user.favorites?.includes(p.id)), [properties, user.favorites]);

  if (viewMode === 'AI_SETUP') {
    const screen = setupScreens[setupStep];
    return (
      <div className="h-full relative overflow-hidden bg-slate-900 flex flex-col text-white animate-in fade-in duration-700 font-['Plus_Jakarta_Sans']">
        <div className="absolute inset-0 z-0">
            <EnhancedImage src={screen.bg} className="w-full h-full opacity-40 scale-105" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/10 via-slate-900/60 to-slate-950"></div>
        </div>
        
        <header className="relative z-[60] px-6 pt-24 pb-12 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-12">
            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="w-12 h-12 bg-white text-emerald-950 rounded-2xl flex items-center justify-center font-black shadow-2xl animate-bounce">R</div>
              <span className="font-black tracking-[3px] uppercase text-[10px] text-emerald-400">Finding your next home</span>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
              <button 
                onClick={() => setViewMode('DASHBOARD')} 
                className="w-full md:w-auto px-8 py-4 bg-white/10 backdrop-blur-3xl rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest border border-white/20 hover:bg-emerald-600 active:scale-95 transition-all shadow-2xl"
              >
                Skip to Feed
              </button>
              <button 
                onClick={() => setSearchMode(searchMode === 'QUICK' ? 'ADVANCED' : 'QUICK')} 
                className="w-full md:w-auto px-8 py-4 bg-white/10 backdrop-blur-3xl rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest border border-white/20 flex items-center justify-center gap-3 active:scale-95 transition-all shadow-2xl"
              >
                <Sparkles size={16} className={searchMode === 'ADVANCED' ? 'text-emerald-400' : ''}/> {searchMode === 'QUICK' ? 'Chat with AI' : 'Use Quick Filters'}
              </button>
            </div>
        </header>

        {searchMode === 'QUICK' ? (
          <div className="relative z-10 flex-1 flex flex-col justify-end px-8 pb-16 space-y-12 animate-in slide-in-from-bottom-10 max-w-2xl mx-auto w-full">
              <div className="space-y-4 text-center md:text-left">
                  <p className="text-[10px] font-black uppercase tracking-[8px] text-emerald-400">Step 0{setupStep + 1}</p>
                  <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">{screen.title}</h2>
                  <p className="text-base md:text-lg font-bold text-slate-300">{screen.subtitle}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {screen.options.map((opt) => (
                      <button key={opt} onClick={() => {
                          const newSels = {...selections, [screen.key]: opt};
                          setSelections(newSels);
                          if (setupStep < setupScreens.length - 1) setSetupStep(prev => prev + 1);
                          else performMatching(Object.values(newSels).join(' '));
                      }} className="w-full py-6 md:py-8 px-8 rounded-[2rem] bg-black/40 backdrop-blur-3xl border border-white/10 text-left text-sm md:text-base font-black hover:bg-emerald-600/40 active:scale-[0.98] transition-all flex justify-between items-center group">
                          {opt} <ArrowRight size={22} className="opacity-40 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0" />
                      </button>
                  ))}
              </div>
          </div>
        ) : (
          <div className="relative z-10 flex-1 flex flex-col p-8 space-y-8 animate-in fade-in max-w-2xl mx-auto w-full">
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pt-10">
                  {conciergeHistory.map((h, i) => (
                    <div key={i} className={`flex ${h.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-6 rounded-[2rem] font-bold shadow-2xl ${h.role === 'user' ? 'bg-emerald-600 rounded-br-none' : 'bg-white text-slate-900 rounded-bl-none shadow-emerald-950/20'}`}>{h.text}</div>
                    </div>
                  ))}
                  {conciergeHistory.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
                      <div className="relative">
                        <Sparkles size={80} className="text-emerald-400 animate-pulse"/>
                        <div className="absolute inset-0 bg-emerald-400 blur-[40px] opacity-20"></div>
                      </div>
                      <h4 className="text-3xl md:text-4xl font-black tracking-tighter leading-tight">{conciergeQuestion}</h4>
                    </div>
                  )}
              </div>
              <div className="flex gap-3 bg-white/10 backdrop-blur-3xl p-4 rounded-[2.5rem] border border-white/20 shadow-2xl">
                <input value={conciergeInput} onChange={(e) => setConciergeInput(e.target.value)} placeholder="Tell me about your dream home..." className="flex-1 bg-transparent border-none outline-none text-white font-bold placeholder:text-white/40 px-4" onKeyDown={(e) => e.key === 'Enter' && handleConciergeSend()} />
                <button onClick={handleConciergeSend} className="w-14 h-14 bg-emerald-400 text-emerald-950 rounded-2xl flex items-center justify-center shrink-0 active:scale-90 transition-all shadow-lg shadow-emerald-400/20"><Send/></button>
              </div>
          </div>
        )}
      </div>
    );
  }

  const currentProperty = properties.find(p => p.id === selectedPropertyId);

  return (
    <div className="h-full flex flex-col bg-white relative overflow-hidden text-slate-950 font-['Plus_Jakarta_Sans']">
       <header className="px-6 py-4 bg-white border-b border-slate-100 flex justify-between items-center z-10 shrink-0 shadow-sm">
           <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-emerald-950 rounded-2xl flex items-center justify-center text-white font-black shadow-lg">R</div>
               <div className="text-left">
                  <span className="font-black text-xl tracking-tighter block leading-none text-slate-900">Rentory</span>
                  <span className="text-[8px] font-black uppercase text-emerald-600 tracking-wider">Tenant Portal</span>
               </div>
           </div>
           <div className="flex gap-2">
              <button onClick={handleEnterAiSetup} className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl active:scale-90 transition-all border border-emerald-100"><Sparkles size={20}/></button>
              <button onClick={() => setShowProfile(true)} className="p-3 bg-slate-100 rounded-2xl text-slate-400 active:scale-90 transition-all border border-slate-200"><UserIcon size={20}/></button>
           </div>
       </header>

       <main className="flex-1 overflow-y-auto no-scrollbar relative bg-slate-50/10 pb-40 px-6">
            {activeTab === 'find' && (
                <div className="py-8 space-y-10 animate-in fade-in max-w-lg mx-auto">
                    <div className="relative group">
                        <Input placeholder="Search location or house type..." className="pr-14 h-16 rounded-[2rem] shadow-xl border-slate-200" onKeyDown={(e:any) => e.key === 'Enter' && performMatching(e.target.value)} />
                        <button onClick={handleVoiceSearch} className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-2xl transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-50 text-slate-400'}`}><Mic size={20}/></button>
                    </div>
                    <div className="space-y-6">
                        <h3 className="text-2xl font-black tracking-tight text-slate-900 px-2 flex justify-between items-center">
                          {selections.location ? `Houses in ${selections.location}` : 'Available Properties'}
                          <Badge color="emerald">LIVE</Badge>
                        </h3>
                        {loadingMatches ? <LoadingScreen message="Searching for the best matches..." /> : feedProperties.length > 0 ? feedProperties.map(prop => (
                            <Card key={prop.id} onClick={() => {props.onAddToHistory(prop.id); setSelectedPropertyId(prop.id);}} className="mb-8 group overflow-hidden border-none shadow-2xl bg-white rounded-[3rem] transition-all hover:translate-y-[-4px]">
                                <div className="aspect-[4/3] relative">
                                    <EnhancedImage src={prop.images[0]} className="w-full h-full group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute top-6 left-6 flex gap-2"><Badge color="emerald">{prop.match?.score}% MATCH</Badge></div>
                                    <button onClick={(e) => { e.stopPropagation(); props.onToggleFavorite(prop.id); }} className="absolute top-6 right-6 w-12 h-12 bg-white/20 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white"><Heart size={20} className={user.favorites?.includes(prop.id) ? 'fill-rose-500 text-rose-500' : ''}/></button>
                                </div>
                                <div className="p-8 text-left space-y-4">
                                    <div className="space-y-1">
                                      <h3 className="text-2xl font-black tracking-tight text-slate-900 truncate leading-none">{prop.title}</h3>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><MapPin size={12} className="text-emerald-600"/> {prop.address}</p>
                                    </div>
                                    <div className="flex justify-between items-center border-t border-slate-50 pt-4">
                                      <div className="flex flex-col">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Price</p>
                                        <p className="text-3xl font-black text-emerald-950 tracking-tighter leading-none">₦{prop.price.toLocaleString()}<span className="text-[10px] text-slate-400 font-bold ml-1">/mo</span></p>
                                      </div>
                                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-900 rounded-xl"><Star size={14} className="fill-emerald-600 text-emerald-600"/><span className="text-sm font-black">4.9</span></div>
                                    </div>
                                    <p className="text-sm text-slate-500 line-clamp-2 font-medium leading-relaxed italic">"{prop.description}"</p>
                                </div>
                            </Card>
                        )) : (
                          <div className="py-20 text-center space-y-8 animate-in fade-in">
                            <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Search size={48} className="text-slate-200" />
                            </div>
                            <h4 className="text-2xl font-black text-slate-900">No properties found here...</h4>
                            <p className="text-sm font-bold text-slate-400 max-w-[250px] mx-auto">Try widening your search or chat with our experts for custom requests.</p>
                            <Button onClick={handleSupportClick} variant="outline" className="mx-auto flex items-center gap-3 py-4">
                                <Activity size={18} /> Speak with Support
                            </Button>
                          </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'saved' && (
                <div className="py-8 space-y-10 animate-in fade-in max-w-lg mx-auto">
                    <h2 className="text-3xl font-black tracking-tighter px-2 text-slate-900">Saved Homes</h2>
                    {favoriteProperties.length > 0 ? favoriteProperties.map(prop => (
                        <Card key={prop.id} onClick={() => setSelectedPropertyId(prop.id)} className="mb-8 border-none shadow-2xl overflow-hidden rounded-[2.5rem]">
                            <div className="aspect-[16/9] relative"><EnhancedImage src={prop.images[0]} className="w-full h-full" /></div>
                            <div className="p-8 text-left space-y-2">
                                <h3 className="text-2xl font-black text-slate-900">{prop.title}</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><MapPin size={12}/>{prop.address}</p>
                                <p className="text-3xl font-black text-emerald-900 mt-4 tracking-tighter">₦{prop.price.toLocaleString()}</p>
                            </div>
                        </Card>
                    )) : (
                      <div className="py-40 text-center space-y-6">
                        <Heart size={64} className="mx-auto text-slate-200" />
                        <p className="text-lg font-black text-slate-400">Your collection is empty.</p>
                        <Button onClick={() => setActiveTab('find')} className="mx-auto rounded-2xl">Start Exploring</Button>
                      </div>
                    )}
                </div>
            )}

            {activeTab === 'messages' && (
                <div className="py-8 space-y-10 animate-in fade-in max-w-lg mx-auto">
                    <h2 className="text-3xl font-black tracking-tighter px-2 text-slate-900">Messages</h2>
                    {chatSessions.length > 0 ? chatSessions.map(session => (
                        <Card key={session.id} onClick={() => setActiveChatSessionId(session.id)} className="p-8 flex items-center gap-6 cursor-pointer active:scale-95 transition-all bg-white border-none shadow-xl rounded-[2.5rem]">
                            <div className="w-16 h-16 bg-emerald-950 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg shrink-0">{session.propertyTitle.charAt(0)}</div>
                            <div className="flex-1 text-left min-w-0">
                                <h3 className="text-xl font-black text-slate-900 truncate">{session.propertyTitle}</h3>
                                <p className="text-sm text-slate-500 truncate mt-1">{session.messages[session.messages.length - 1]?.text || 'Channel open...'}</p>
                                <Badge color="emerald" className="mt-3">VERIFIED OWNER</Badge>
                            </div>
                            <ArrowRight size={20} className="text-slate-200" />
                        </Card>
                    )) : (
                        <div className="py-40 text-center space-y-6">
                          <MessageSquare size={64} className="mx-auto text-slate-200" />
                          <p className="text-lg font-black text-slate-400">No active messages.</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'leases' && (
              <div className="py-8 space-y-10 animate-in fade-in max-w-lg mx-auto">
                  <h2 className="text-3xl font-black tracking-tighter px-2 text-slate-900">Lease Agreements</h2>
                  {props.leases.length > 0 ? props.leases.map(lease => (
                      <Card key={lease.id} className="p-10 flex items-center justify-between bg-white border-none shadow-2xl rounded-[3rem]">
                          <div className="flex items-center gap-6 text-left">
                            <div className="p-5 bg-emerald-50 text-emerald-900 rounded-2xl shadow-inner"><FileText size={24}/></div>
                            <div>
                                <p className="font-black text-xl text-slate-900">{lease.propertyName}</p>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Legally Binding Agreement</p>
                                <div className="mt-4"><Badge color={lease.status === 'FULLY_SIGNED' ? 'emerald' : 'amber'}>{lease.status.replace(/_/g, ' ')}</Badge></div>
                            </div>
                          </div>
                          <button onClick={() => setShowReviewModal(true)} className="p-4 bg-emerald-950 text-white rounded-2xl shadow-lg active:scale-90 hover:bg-black transition-all"><Star size={22}/></button>
                      </Card>
                  )) : (
                      <div className="py-40 text-center space-y-6">
                         <FileText size={64} className="mx-auto text-slate-200" />
                         <p className="text-lg font-black text-slate-400">No agreements found.</p>
                      </div>
                  )}
              </div>
            )}
       </main>

       {currentProperty && (
            <div className="fixed inset-0 bg-white z-[140] overflow-y-auto flex flex-col animate-in slide-in-from-bottom-10 no-scrollbar pb-48">
                <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl px-6 py-4 border-b border-slate-50 flex justify-between items-center">
                    <button onClick={() => setSelectedPropertyId(null)} className="p-3.5 bg-slate-50 rounded-2xl text-slate-400 shadow-sm active:scale-90"><ArrowLeft size={22}/></button>
                    <div className="text-center"><h3 className="font-black text-slate-900 leading-none text-sm">{currentProperty.title}</h3><p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">{currentProperty.category}</p></div>
                    <button onClick={() => props.onToggleFavorite(currentProperty.id)} className="p-3.5 bg-slate-50 rounded-2xl text-rose-500"><Heart size={22} className={user.favorites?.includes(currentProperty.id) ? 'fill-rose-500' : ''}/></button>
                </header>
                <div className="max-w-xl mx-auto space-y-12 p-6">
                    <div className="aspect-[4/3] rounded-[4rem] overflow-hidden shadow-2xl"><EnhancedImage src={currentProperty.images[0]} className="w-full h-full" /></div>
                    <div className="text-left space-y-12 pb-20">
                        <section className="flex justify-between items-end border-b border-slate-100 pb-8">
                            <div><h2 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">{currentProperty.title}</h2><p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest flex items-center gap-2 mt-3"><MapPin size={16}/> {currentProperty.address}</p></div>
                            <div className="text-right">
                              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-2">Asking Price</p>
                              <p className="text-4xl font-black text-emerald-950 tracking-tighter leading-none">₦{currentProperty.price.toLocaleString()}</p>
                            </div>
                        </section>
                        <section className="p-10 bg-slate-950 rounded-[3rem] text-white space-y-8 relative overflow-hidden shadow-2xl">
                            <h4 className="text-[11px] font-black uppercase tracking-[5px] text-emerald-400">About this area</h4>
                            <p className="text-xl font-bold text-slate-200 leading-relaxed z-10 relative">{currentProperty.neighborhoodDescription || "A great choice in a highly sought-after location with complete security and modern amenities."}</p>
                            <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none"><Compass size={120} className="rotate-12" /></div>
                        </section>
                        <section className="space-y-6">
                            <h4 className="text-[11px] font-black uppercase tracking-[4px] text-slate-400">Ratings</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <Card className="p-8 bg-slate-50 border-none rounded-[2rem] text-left"><p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Security</p><div className="flex gap-1 text-emerald-600"><Star size={16} className="fill-current"/><Star size={16} className="fill-current"/><Star size={16} className="fill-current"/><Star size={16} className="fill-current"/><Star size={16} className="fill-current"/></div></Card>
                                <Card className="p-8 bg-slate-50 border-none rounded-[2rem] text-left"><p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Power Supply</p><div className="flex gap-1 text-amber-500"><Star size={16} className="fill-current"/><Star size={16} className="fill-current"/><Star size={16} className="fill-current"/><Star size={16} className="fill-current"/><Star size={16} className="opacity-30"/></div></Card>
                            </div>
                        </section>
                        <section className="space-y-6">
                            <div className="flex justify-between items-center">
                              <h4 className="text-[11px] font-black uppercase tracking-[4px] text-slate-400">Tenant Feedback</h4>
                              <button onClick={() => setShowReviewModal(true)} className="text-[10px] font-black uppercase text-emerald-600 hover:underline">Write a Review</button>
                            </div>
                            {currentProperty.reviews && currentProperty.reviews.length > 0 ? currentProperty.reviews.map(rev => (
                              <Card key={rev.id} className="p-8 bg-white border border-slate-50 shadow-sm rounded-[2rem] text-left">
                                <div className="flex justify-between items-center mb-4"><p className="font-black text-base">{rev.userName}</p><Badge color="indigo">Verified Tenant</Badge></div>
                                <p className="text-sm font-bold text-slate-600 italic leading-relaxed">"{rev.comment}"</p>
                              </Card>
                            )) : (
                              <p className="text-sm font-bold text-slate-400 px-2 italic">Be the first to review this property!</p>
                            )}
                        </section>
                    </div>
                </div>
                <div className="fixed bottom-0 inset-x-0 p-8 bg-white/95 backdrop-blur-3xl border-t border-slate-100 flex justify-center z-[150] shadow-2xl rounded-t-[3.5rem]">
                    <div className="w-full max-w-lg flex flex-col gap-4">
                      {props.unlockedProperties.includes(currentProperty.id) ? (
                        <Button onClick={() => handleInitiateChat(currentProperty)} className="w-full py-7 rounded-[2rem] bg-emerald-950 text-white font-black uppercase tracking-[4px] flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all"><MessageSquare size={22}/> Contact Owner</Button>
                      ) : (
                        <Button onClick={() => props.onUnlockProperty(currentProperty.id)} className="w-full py-7 rounded-[2rem] bg-emerald-600 text-white font-black uppercase tracking-[4px] flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all"><ShieldCheck size={22}/> Unlock Contacts (₦5,000)</Button>
                      )}
                    </div>
                </div>
            </div>
       )}

       {showReviewModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
            <Card className="w-full max-w-md bg-white p-10 rounded-[3rem] space-y-8 text-left relative overflow-hidden shadow-2xl">
              <button onClick={() => setShowReviewModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 transition-colors"><X/></button>
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tighter">Your Review</h2>
                <p className="text-sm font-bold text-slate-400">Share your thoughts about this property.</p>
              </div>
              <div className="space-y-6">
                 <div><p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">The Property</p><div className="flex gap-2 text-amber-500"><Star/><Star/><Star/><Star/><Star className="text-slate-100"/></div></div>
                 <div><p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">The Landlord</p><div className="flex gap-2 text-amber-500"><Star/><Star/><Star/><Star/><Star/></div></div>
                 <textarea className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] text-sm font-bold min-h-[120px] focus:border-emerald-950 outline-none" placeholder="Write your feedback here..." />
              </div>
              <Button onClick={() => {alert("Review submitted!"); setShowReviewModal(false);}} className="w-full py-6 rounded-2xl">Submit Review</Button>
            </Card>
          </div>
       )}

       {showProfile && (
          <ProfileView 
             user={user} 
             onLogout={props.onLogout} 
             onClose={() => setShowProfile(false)} 
             onResetPreferences={handleResetAiFromProfile} 
          />
       )}

       <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 p-4 flex justify-around pb-12 z-50 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            {[{id:'find', icon:<Compass size={24}/>, label:'Discover'}, {id:'saved', icon:<Heart size={24}/>, label:'Saved'}, {id:'messages', icon:<MessageSquare size={24}/>, label:'Inbox'}, {id:'leases', icon:<FileText size={24}/>, label:'Contracts'}].map(nav => (
                <button key={nav.id} onClick={() => setActiveTab(nav.id as any)} className={`p-4 flex flex-col items-center gap-1 transition-all ${activeTab === nav.id ? 'text-emerald-950 scale-110 font-black' : 'text-slate-400 hover:text-slate-600'}`}>
                    {nav.icon} <span className="text-[8px] uppercase font-black tracking-widest">{nav.label}</span>
                </button>
            ))}
        </nav>

        {activeChatSessionId && (
            <ChatSystem session={props.chatSessions.find(s => s.id === activeChatSessionId)!} currentUser={user} onSendMessage={props.onSendMessage} onClose={() => setActiveChatSessionId(null)} />
        )}
    </div>
  );
};
