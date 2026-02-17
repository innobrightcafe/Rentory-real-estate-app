
import React, { useState, useRef, useMemo } from 'react';
import { 
  Camera, ArrowLeft, X, Plus, Sparkles, LayoutDashboard, MessageSquare, 
  Settings, Home, TrendingUp, Image as ImageIcon, User as UserIcon,
  FileText, ArrowRight, Trash2, ChevronRight, PenTool, Globe, Zap, Building2, Map, LayoutGrid, LogOut, Navigation, CheckCircle, ShieldCheck, Calendar, Hotel
} from 'lucide-react';
import { User, ChatSession, Property, Lease, PropertyCategory, UserAccount } from '../../types';
import { Button, Card, Input, Badge, LoadingScreen, NotificationBadge } from '../UI';
import { analyzePropertyImage } from '../../services/geminiService';
import { ChatSystem } from '../ChatSystem';
import { ProfileView } from '../ProfileView';
import { MOCK_GUIDES } from '../../constants';

interface LandlordViewProps {
    user: User;
    onLogout: () => void;
    myProperties: Property[];
    onAddProperty: (prop: Property) => void;
    onDeleteProperty: (id: string) => void;
    onUpdateProperty?: (prop: Property) => void;
    chatSessions: ChatSession[];
    leases: Lease[];
    onCreateLease: (lease: Lease) => void;
    onSendMessage: (sessionId: string, text: string) => void;
}

export const LandlordView: React.FC<LandlordViewProps> = (props) => {
    const { user, myProperties, onLogout, onAddProperty, onDeleteProperty, chatSessions, leases } = props;
    const [step, setStep] = useState<'dashboard' | 'category' | 'upload' | 'edit' | 'guide_select' | 'chats' | 'leases'>('dashboard');
    const [showProfile, setShowProfile] = useState(false);
    const [wizardImages, setWizardImages] = useState<string[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [useGuide, setUseGuide] = useState(true);
    const [selectedGuide, setSelectedGuide] = useState<UserAccount | null>(null);
    const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);

    const [newProperty, setNewProperty] = useState<Partial<Property>>({ 
        category: 'RESIDENTIAL',
        amenities: [], 
        nearbyAttractions: [], 
        landDetails: { size: 0, unit: 'PLOTS', dimensions: '', zoning: 'Residential' },
        location: { lat: 6.5244, lng: 3.3792 } 
    });
    
    const [isCameraActive, setIsCameraActive] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const unreadCount = useMemo(() => 
      chatSessions.reduce((acc, s) => acc + s.messages.filter(m => !m.isRead && m.senderId !== user.id).length, 0), 
    [chatSessions, user.id]);

    const suggestedGuides = useMemo(() => {
        if (!newProperty.location) return MOCK_GUIDES.slice(0, 3);
        return [...MOCK_GUIDES].sort((a, b) => {
            const distA = Math.abs((a.location?.lat || 0) - newProperty.location!.lat) + Math.abs((a.location?.lng || 0) - newProperty.location!.lng);
            const distB = Math.abs((b.location?.lat || 0) - newProperty.location!.lat) + Math.abs((b.location?.lng || 0) - newProperty.location!.lng);
            return distA - distB;
        }).slice(0, 3);
    }, [newProperty.location]);

    const startAnalysis = async () => {
        if (wizardImages.length === 0) return;
        setIsAnalyzing(true);
        const result = await analyzePropertyImage(wizardImages);
        if (result) {
            setNewProperty({
                ...newProperty,
                title: result.style,
                description: result.description,
                neighborhoodDescription: result.neighborhoodDescription,
                price: result.suggestedPrice,
                address: result.suggestedAddress || "Lagos Island, Nigeria",
                features: result.features,
                nearbyAttractions: result.nearbyAttractions,
                images: wizardImages,
                landlordId: user.id
            });
        }
        setIsAnalyzing(false);
        setStep('edit');
    };

    const finalizeListing = () => {
        onAddProperty({ 
            ...newProperty, 
            id: 'p' + Date.now(), 
            status: 'ACTIVE', 
            rentoryManaged: true, 
            isVerified: true, 
            availability: 'Daily',
            contactPreference: useGuide ? 'STAFF_GUIDE' : 'DIRECT',
            assignedGuideId: selectedGuide?.id,
            ratings: { security: 5, power: 4, neighborhood: 5 }
        } as Property);
        setStep('dashboard');
        setWizardImages([]);
        setNewProperty({ category: 'RESIDENTIAL', amenities: [], nearbyAttractions: [] });
    };

    const showMenu = ['dashboard', 'chats', 'leases'].includes(step);

    if (isAnalyzing) return <LoadingScreen message="AI is preparing your listing..." />;

    return (
        <div className="h-full flex flex-col bg-white font-['Plus_Jakarta_Sans'] text-slate-950 overflow-hidden relative">
            {/* Header: Now part of the flex flow, so it naturally pushes content down */}
            <header className="shrink-0 h-auto min-h-[5rem] px-6 py-5 pt-[env(safe-area-inset-top,1.25rem)] bg-white border-b border-slate-100 flex justify-between items-center z-[160] shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-950 rounded-2xl flex items-center justify-center text-white font-black shadow-lg">L</div>
                    <div className="text-left">
                      <h1 className="text-lg font-black tracking-tight leading-none text-slate-900">Landlord Portal</h1>
                      <span className="text-[8px] font-black uppercase text-emerald-600 tracking-[1px] mt-1 block">Property Management</span>
                    </div>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => setShowProfile(true)} className="p-2.5 bg-slate-50 rounded-xl text-slate-400 active:scale-90 transition-all border border-slate-100"><UserIcon size={18}/></button>
                   <button onClick={onLogout} className="p-2.5 bg-slate-100 rounded-xl text-slate-400 active:scale-90 transition-all border border-slate-100"><LogOut size={18}/></button>
                </div>
            </header>

            {/* Main content: flex-1 ensures it takes all remaining space. No top padding needed now. */}
            <main className="flex-1 overflow-y-auto no-scrollbar relative bg-slate-50/10 pb-44">
                {step === 'dashboard' && (
                    <div className="p-6 pt-4 space-y-10 animate-in fade-in max-w-lg mx-auto text-left">
                        <Card className="p-10 bg-emerald-950 text-white border-none shadow-2xl relative overflow-hidden rounded-[3.5rem] min-h-[300px] flex flex-col justify-between">
                            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                              <Building2 size={180} className="rotate-12" />
                            </div>
                            
                            <div className="relative z-10">
                              <p className="text-[10px] font-black uppercase tracking-[5px] text-emerald-400 mb-6">Portfolio Summary</p>
                              <h2 className="text-5xl font-black tracking-tighter leading-none">{myProperties.length} Properties</h2>
                              <p className="text-emerald-400/60 font-bold text-sm mt-2 italic">Listed on Rentory</p>
                            </div>
                            
                            <div className="relative z-10 pt-8">
                                <Button 
                                  onClick={() => setStep('category')} 
                                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-5 rounded-[1.8rem] shadow-[0_15px_30px_rgba(5,150,105,0.3)] active:scale-95 transition-all border-none font-black text-xs uppercase"
                                >
                                  <Plus size={22} className="text-white"/> Add New Property
                                </Button>
                            </div>
                        </Card>
                        
                        <div className="space-y-4">
                            <h3 className="text-[11px] font-black uppercase tracking-[4px] text-slate-400 px-2 flex justify-between items-center">
                              My Current Listings
                              <Badge color="emerald">ACTIVE</Badge>
                            </h3>
                            {myProperties.map(prop => (
                                <Card key={prop.id} className="p-6 flex gap-5 items-center border-none shadow-sm bg-white rounded-[2.5rem] hover:shadow-md transition-all group">
                                    <img src={prop.images[0]} className="w-16 h-16 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-slate-900 truncate text-base">{prop.title}</h3>
                                        <div className="flex gap-2 mt-1.5"><Badge color="emerald">₦{prop.price.toLocaleString()}</Badge><Badge color="gray">{prop.category}</Badge></div>
                                    </div>
                                    <button onClick={() => onDeleteProperty(prop.id)} className="p-3 text-rose-500 bg-rose-50 rounded-xl active:scale-90 transition-all"><Trash2 size={18}/></button>
                                </Card>
                            ))}
                            {myProperties.length === 0 && (
                                <div className="py-20 text-center text-slate-300 italic font-medium">No properties listed yet.</div>
                            )}
                        </div>
                    </div>
                )}

                {step === 'category' && (
                    <div className="p-6 pt-4 space-y-10 animate-in slide-in-from-bottom-10 max-w-lg mx-auto">
                        <div className="space-y-3 text-left">
                            <h2 className="text-4xl font-black tracking-tighter leading-tight text-slate-900">What are you listing?</h2>
                            <p className="text-slate-500 font-bold">Select the best category for your new entry.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { id: 'RESIDENTIAL', icon: <Home/>, label: 'Apartment or House', sub: 'Flats, Villas, Lofts' },
                                { id: 'LAND', icon: <Map/>, label: 'Land Plot', sub: 'Residential or Commercial Land' },
                                { id: 'COMMERCIAL', icon: <Building2/>, label: 'Office Space', sub: 'Work Hubs, Retail' },
                                { id: 'EVENT_CENTER', icon: <Globe/>, label: 'Event Hall', sub: 'Gardens, Halls, Clubs' },
                                { id: 'SHORTLET', icon: <Hotel/>, label: 'Short Stay', sub: 'Airbnb, Guest Houses' }
                            ].map(cat => (
                                <button key={cat.id} onClick={() => {setNewProperty({...newProperty, category: cat.id as any}); setStep('upload');}} className="w-full p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-xl text-left flex items-center gap-6 hover:bg-emerald-50 active:scale-95 transition-all group">
                                    <div className="p-4 bg-emerald-950 text-white rounded-2xl transition-transform group-hover:scale-110">{cat.icon}</div>
                                    <div><p className="font-black text-xl text-slate-900 leading-none">{cat.label}</p><p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">{cat.sub}</p></div>
                                </button>
                            ))}
                        </div>
                        <Button variant="ghost" onClick={() => setStep('dashboard')} className="mt-4 py-4 rounded-2xl text-[10px] font-black uppercase">Cancel</Button>
                    </div>
                )}

                {step === 'upload' && (
                    <div className="p-6 pt-4 space-y-10 animate-in slide-in-from-right h-full max-w-lg mx-auto">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setStep('category')} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-900 shadow-sm active:scale-90"><ArrowLeft size={22}/></button>
                            <h2 className="text-3xl font-black tracking-tighter text-slate-900">Add Photos</h2>
                        </div>
                        {isCameraActive ? (
                            <div className="relative aspect-square bg-black rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
                                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"/>
                                <div className="absolute inset-x-0 bottom-10 flex justify-center gap-6">
                                    <button onClick={() => setIsCameraActive(false)} className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/30"><X size={24}/></button>
                                    <button onClick={() => {
                                        if (videoRef.current) {
                                            const canvas = document.createElement('canvas');
                                            canvas.width = videoRef.current.videoWidth;
                                            canvas.height = videoRef.current.videoHeight;
                                            canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
                                            setWizardImages(prev => [...prev, canvas.toDataURL('image/jpeg')]);
                                            setIsCameraActive(false);
                                        }
                                    }} className="w-20 h-20 rounded-full border-4 border-white bg-emerald-600 active:scale-90 shadow-2xl transition-all"></button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {wizardImages.map((img, i) => (
                                    <div key={i} className="relative aspect-square rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm"><img src={img} className="w-full h-full object-cover" /></div>
                                ))}
                                <button onClick={() => setIsCameraActive(true)} className="aspect-square rounded-[2rem] bg-emerald-950 text-white flex flex-col items-center justify-center shadow-2xl active:scale-95 transition-all hover:bg-black"><Camera size={32} className="mb-3"/><span className="text-[10px] font-black uppercase tracking-widest">Open Camera</span></button>
                                <label className="aspect-square rounded-[2rem] border-2 border-dashed border-emerald-200 flex flex-col items-center justify-center bg-emerald-50 cursor-pointer hover:bg-emerald-100 transition-all">
                                    <ImageIcon size={32} className="text-emerald-600 mb-3"/>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800">Upload Photo</span>
                                    <input type="file" className="hidden" onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => setWizardImages(prev => [...prev, reader.result as string]);
                                            reader.readAsDataURL(file);
                                        }
                                    }} accept="image/*" />
                                </label>
                            </div>
                        )}
                        {!isCameraActive && wizardImages.length > 0 && <Button onClick={startAnalysis} className="w-full py-6 rounded-[2rem] bg-emerald-950 text-white shadow-2xl font-black uppercase tracking-widest">Analyze with AI</Button>}
                    </div>
                )}

                {step === 'edit' && (
                    <div className="p-6 pt-4 space-y-12 animate-in slide-in-from-right h-full max-w-lg mx-auto text-left">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setStep('upload')} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-900 shadow-sm active:scale-90"><ArrowLeft size={22}/></button>
                            <h2 className="text-3xl font-black tracking-tighter text-slate-900">Confirm Details</h2>
                        </div>

                        <Card className="p-10 space-y-8 border-none shadow-2xl bg-white rounded-[3.5rem]">
                            <div className="space-y-2">
                              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Listing Name</label>
                              <Input placeholder="e.g. 3 Bedroom Flat Lekki" value={newProperty.title} onChange={(e: any) => setNewProperty({...newProperty, title: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Monthly Rent (₦)</label>
                              <Input placeholder="Price per month" type="number" value={newProperty.price} onChange={(e: any) => setNewProperty({...newProperty, price: parseInt(e.target.value)})} />
                            </div>
                            
                            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck size={20} className="text-emerald-600"/>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Assign a Guide</span>
                                </div>
                                <div 
                                    onClick={() => setUseGuide(!useGuide)}
                                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${useGuide ? 'bg-emerald-600' : 'bg-slate-300'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${useGuide ? 'translate-x-6' : ''}`}></div>
                                </div>
                            </div>

                            <Button onClick={() => setStep('guide_select')} className="w-full py-6 rounded-[2.5rem] bg-emerald-950 text-white font-black uppercase tracking-[4px]">Next Step</Button>
                        </Card>
                    </div>
                )}

                {step === 'guide_select' && (
                  <div className="p-6 pt-4 space-y-10 animate-in slide-in-from-bottom-10 max-w-lg mx-auto text-left">
                      <div className="flex items-center gap-4">
                          <button onClick={() => setStep('edit')} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-900 shadow-sm active:scale-90"><ArrowLeft size={22}/></button>
                          <h2 className="text-3xl font-black tracking-tighter text-slate-900">Nearby Guides</h2>
                      </div>
                      
                      {!useGuide ? (
                        <div className="p-10 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-center space-y-4">
                            <Zap size={48} className="mx-auto text-slate-300"/>
                            <p className="text-sm font-bold text-slate-500 px-4">Direct Contact enabled. You will handle all tours personally.</p>
                            <Button variant="ghost" onClick={() => setUseGuide(true)} className="text-[10px] font-black uppercase text-emerald-600">Assign a Guide instead</Button>
                            <Button onClick={finalizeListing} className="w-full py-5 rounded-2xl mt-8">Finish & Post Listing</Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[5px] text-emerald-600 px-2">Select Your Guide</p>
                            {suggestedGuides.map(guide => (
                              <Card 
                                key={guide.id} 
                                onClick={() => setSelectedGuide(guide)}
                                className={`p-6 flex items-center gap-5 border-2 transition-all cursor-pointer rounded-[2.5rem] ${selectedGuide?.id === guide.id ? 'border-emerald-600 bg-emerald-50 shadow-xl' : 'border-slate-50 bg-white hover:border-slate-100 shadow-sm'}`}
                              >
                                  <div className="w-14 h-14 bg-emerald-950 rounded-2xl flex items-center justify-center text-white font-black text-xl">
                                      {guide.name.charAt(0)}
                                  </div>
                                  <div className="flex-1">
                                      <h3 className="font-black text-slate-900">{guide.name}</h3>
                                      <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mt-1">Certified Guide • {guide.rating} ★</p>
                                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">Approx. 2km away</p>
                                  </div>
                                  {selectedGuide?.id === guide.id && <CheckCircle className="text-emerald-600"/>}
                              </Card>
                            ))}
                            <div className="pt-8">
                                <Button 
                                  onClick={finalizeListing} 
                                  disabled={!selectedGuide}
                                  className="w-full py-6 rounded-[2.5rem] bg-emerald-950 text-white font-black uppercase tracking-[4px] shadow-2xl"
                                >
                                  Publish Listing
                                </Button>
                            </div>
                        </div>
                      )}
                  </div>
                )}

                {step === 'chats' && (
                    <div className="p-6 pt-4 space-y-10 animate-in fade-in max-w-lg mx-auto text-left">
                        <h2 className="text-3xl font-black tracking-tighter px-2 text-slate-900">Chat History</h2>
                        {chatSessions.length > 0 ? chatSessions.map(session => (
                            <Card key={session.id} onClick={() => setActiveChatSessionId(session.id)} className="p-8 flex items-center justify-between bg-white border-none shadow-xl rounded-[2.5rem] cursor-pointer hover:bg-slate-50 transition-all active:scale-98">
                                <div className="flex items-center gap-6">
                                  <div className="w-16 h-16 bg-emerald-950 rounded-2xl flex items-center justify-center text-white font-black text-3xl">{session.propertyTitle.charAt(0)}</div>
                                  <div>
                                      <h3 className="text-xl font-black text-slate-900">{session.propertyTitle}</h3>
                                      <p className="text-sm text-slate-500 mt-1">Tenant message...</p>
                                  </div>
                                </div>
                                <ChevronRight className="text-slate-300"/>
                            </Card>
                        )) : (
                          <div className="py-40 text-center space-y-6 opacity-30">
                            <MessageSquare size={64} className="mx-auto" />
                            <p className="text-lg font-black uppercase tracking-widest">No active chats</p>
                          </div>
                        )}
                    </div>
                )}

                {step === 'leases' && (
                    <div className="p-6 pt-4 space-y-10 animate-in fade-in max-w-lg mx-auto text-left">
                        <h2 className="text-3xl font-black tracking-tighter px-2 text-slate-900">Lease Agreements</h2>
                        {leases.length > 0 ? leases.map(lease => (
                            <Card key={lease.id} className="p-10 flex items-center justify-between bg-white border-none shadow-2xl rounded-[3rem]">
                                <div className="flex items-center gap-6">
                                  <div className="p-5 bg-emerald-50 text-emerald-950 rounded-2xl"><FileText size={24}/></div>
                                  <div>
                                      <p className="font-black text-xl text-slate-900">{lease.tenantName}</p>
                                      <p className="text-[10px] font-black uppercase text-slate-400 mt-1">{lease.propertyName}</p>
                                      <div className="mt-3"><Badge color={lease.status === 'FULLY_SIGNED' ? 'emerald' : 'amber'}>{lease.status.replace(/_/g, ' ')}</Badge></div>
                                  </div>
                                </div>
                                <ArrowRight className="text-slate-200"/>
                            </Card>
                        )) : (
                          <div className="py-40 text-center space-y-6 opacity-30">
                            <FileText size={64} className="mx-auto" />
                            <p className="text-lg font-black uppercase tracking-widest">No leases yet</p>
                          </div>
                        )}
                    </div>
                )}
            </main>

            {/* Bottom Nav: Highest z-index to stay above main scroll area */}
            {showMenu && (
              <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 p-4 flex justify-around pb-12 z-[170] rounded-t-[3rem] shadow-[0_-15px_50px_rgba(0,0,0,0.08)] animate-in slide-in-from-bottom-10">
                  {[
                    {id:'dashboard', icon:<LayoutDashboard size={24}/>, label:'Dashboard'},
                    {id:'chats', icon:<MessageSquare size={24}/>, label:'Messages', count: unreadCount},
                    {id:'leases', icon:<FileText size={24}/>, label:'Leases'}
                  ].map(nav => (
                      <button 
                        key={nav.id} 
                        onClick={() => setStep(nav.id as any)} 
                        className={`p-4 flex flex-col items-center gap-1.5 transition-all relative ${step === nav.id ? 'text-emerald-950 scale-110 font-black' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                          <div className="relative">
                            {nav.icon}
                            {nav.count && nav.count > 0 ? (
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] flex items-center justify-center rounded-full border border-white font-black animate-pulse">
                                {nav.count}
                              </span>
                            ) : null}
                          </div>
                          <span className="text-[8px] uppercase font-black tracking-widest">{nav.label}</span>
                      </button>
                  ))}
              </nav>
            )}

            {showProfile && (
              <ProfileView 
                user={user} 
                onLogout={props.onLogout} 
                onClose={() => setShowProfile(false)} 
              />
            )}

            {activeChatSessionId && (
                <ChatSystem 
                  session={chatSessions.find(s => s.id === activeChatSessionId)!} 
                  currentUser={user} 
                  onSendMessage={props.onSendMessage} 
                  onClose={() => setActiveChatSessionId(null)} 
                />
            )}
        </div>
    );
};
