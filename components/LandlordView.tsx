
import React, { useState, useRef, useMemo } from 'react';
import { 
  Camera, ArrowLeft, X, Plus, Sparkles, LayoutDashboard, MessageSquare, 
  Settings, Home, TrendingUp, Image as ImageIcon, 
  FileText, ArrowRight, Trash2, ChevronRight, PenTool, ShieldAlert,
  ShieldCheck, UserCircle, Bell, Users, Calendar, Star, Wrench, Wallet
} from 'lucide-react';
import { User as UserType, ChatSession, Property, Lease } from '../types';
import { Button, Card, Input, Badge, LoadingScreen, NotificationBadge } from './UI';
import { analyzePropertyImage, generateLeaseAgreement } from '../services/geminiService';
import { ChatSystem } from './ChatSystem';
import { LeaseViewer } from './LeaseViewer';

interface LandlordViewProps {
    user: UserType;
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

export const LandlordView: React.FC<LandlordViewProps> = ({ 
    user, onLogout, myProperties, onAddProperty, onDeleteProperty, onUpdateProperty,
    chatSessions, leases, onCreateLease, onSendMessage 
}) => {
    const [step, setStep] = useState<'dashboard' | 'upload' | 'edit' | 'leases' | 'chats'>('dashboard');
    const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);
    const [wizardImages, setWizardImages] = useState<string[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [newProperty, setNewProperty] = useState<Partial<Property>>({ features: [] });
    const [selectedLeaseId, setSelectedLeaseId] = useState<string | null>(null);
    
    const [isCameraActive, setIsCameraActive] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    
    const [isGeneratingLease, setIsGeneratingLease] = useState(false);

    // Derived stats for dashboard
    const totalRevenue = useMemo(() => leases.filter(l => l.status === 'FULLY_SIGNED').length * 250000, [leases]);
    const unreadCount = useMemo(() => chatSessions.reduce((acc, s) => acc + s.messages.filter(m => !m.isRead && m.senderId !== user.id).length, 0), [chatSessions, user.id]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setWizardImages(prev => [...prev, reader.result as string]);
            reader.readAsDataURL(file);
        }
    };

    const startCamera = async () => {
        setIsCameraActive(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) { alert("Camera access denied."); setIsCameraActive(false); }
    };

    const capturePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
            setWizardImages(prev => [...prev, canvas.toDataURL('image/jpeg')]);
            const stream = videoRef.current.srcObject as MediaStream;
            stream?.getTracks().forEach(t => t.stop());
            setIsCameraActive(false);
        }
    };

    const stopCamera = () => {
        const stream = videoRef.current?.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        setIsCameraActive(false);
    };

    const startAnalysis = async () => {
        if (wizardImages.length === 0) return;
        setIsAnalyzing(true);
        const result = await analyzePropertyImage(wizardImages);
        setNewProperty({
            ...newProperty,
            title: result.style,
            description: result.description,
            price: result.suggestedPrice,
            address: result.suggestedAddress,
            features: result.features,
            images: wizardImages,
            landlordId: user.id,
            status: 'PENDING',
            isVerified: true
        });
        setIsAnalyzing(false);
        setStep('edit');
    };

    const handleGenerateLeaseForChat = async (session: ChatSession) => {
        const prop = myProperties.find(p => p.id === session.propertyId);
        if (!prop) return;
        setIsGeneratingLease(true);
        const content = await generateLeaseAgreement("Verified Tenant", user.name, prop.address, prop.price);
        const newLease: Lease = {
            id: `lease_${Date.now()}`,
            propertyId: prop.id,
            propertyName: prop.title,
            tenantId: session.tenantId,
            tenantName: "Verified Tenant",
            landlordId: user.id,
            landlordName: user.name,
            content,
            status: 'SIGNED_BY_LANDLORD',
            createdAt: new Date().toISOString()
        };
        onCreateLease(newLease);
        setIsGeneratingLease(false);
        alert("Draft Agreement Created. Sent to Tenant for review.");
        setStep('leases');
    };

    const saveProperty = () => {
        if (newProperty.id) {
            onUpdateProperty?.(newProperty as Property);
        } else {
            onAddProperty({ 
                ...newProperty, 
                id: 'p' + Date.now(), 
                status: 'ACTIVE', 
                rentoryManaged: true, 
                isVerified: true, 
                availability: 'Daily',
                contactPreference: 'DIRECT'
            } as Property);
        }
        setStep('dashboard');
        setWizardImages([]);
        setNewProperty({ features: [] });
    };

    const handleManageProperty = (prop: Property) => {
        setNewProperty(prop);
        setStep('edit');
    };

    const currentChatSession = chatSessions.find(s => s.id === activeChatSessionId);
    const currentLease = leases.find(l => l.id === selectedLeaseId);

    if (isAnalyzing || isGeneratingLease) return <LoadingScreen message={isAnalyzing ? "AI Analyzing Photos..." : "Drafting Agreement..."} />;

    return (
        <div className="h-full flex flex-col bg-[#fdfdfd] font-['Plus_Jakarta_Sans'] text-slate-950 overflow-hidden">
            <header className="px-4 md:px-12 py-3 md:py-6 bg-white border-b border-slate-100 flex justify-between items-center z-10 shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-9 md:w-11 h-9 md:h-11 bg-emerald-950 rounded-lg md:rounded-2xl flex items-center justify-center text-white font-bold shadow-lg text-sm md:text-lg border border-emerald-900">L</div>
                    <div className="text-left">
                        <h1 className="text-sm md:text-2xl font-bold tracking-tight leading-none text-slate-900">Owner Portal</h1>
                        <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider mt-0.5 block">Portfolio Management</span>
                    </div>
                </div>

                <div className="hidden lg:flex gap-10 items-center mx-auto">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18}/> },
                        { id: 'chats', label: 'Inbox', icon: <MessageSquare size={18}/>, notify: unreadCount > 0 },
                        { id: 'leases', label: 'Leases', icon: <FileText size={18}/> }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setStep(tab.id as any)} 
                            className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all pb-2 border-b-4 relative ${step === tab.id ? 'text-emerald-950 border-emerald-950' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                        >
                            {tab.icon} {tab.label}
                            {tab.notify && <NotificationBadge count={unreadCount} className="-top-3 -right-3" />}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    <Button onClick={() => setStep('upload')} variant="primary" className="hidden md:flex px-6 h-12 rounded-2xl text-xs">
                        <Plus size={18}/> List New
                    </Button>
                    <button className="p-2 md:p-3 bg-slate-50 rounded-xl text-slate-900 border border-slate-200 active:scale-90 transition-all relative">
                        <Bell size={18} />
                        <NotificationBadge count={unreadCount} />
                    </button>
                    <button onClick={onLogout} className="p-2 md:p-3 bg-slate-50 rounded-xl text-slate-900 border border-slate-200 active:scale-90 transition-all">
                        <Settings size={18} className="md:w-[22px] md:h-[22px]"/>
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar relative bg-slate-50/20 pb-40 px-4 md:px-12 lg:px-20">
                {step === 'dashboard' && (
                    <div className="py-6 md:py-10 space-y-6 md:space-y-12 animate-in fade-in max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                            {/* Fixed Contrast: text-white on bg-emerald-950 card */}
                            <Card className="lg:col-span-2 p-6 md:p-14 bg-emerald-950 text-white border-none shadow-xl relative overflow-hidden rounded-2xl md:rounded-[3.5rem]">
                                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                                    <Home size={200} className="rotate-12" />
                                </div>
                                <div className="relative z-10 flex flex-col justify-between h-full text-left">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2 md:mb-4">
                                            <Badge color="emerald">VERIFIED OWNER</Badge>
                                        </div>
                                        <p className="text-6xl md:text-9xl font-black tracking-tighter mb-1 md:mb-2 text-white drop-shadow-md">
                                          {myProperties.length}
                                        </p>
                                        <h3 className="text-[11px] md:text-sm font-bold uppercase tracking-[2px] text-emerald-400">Total Registered Assets</h3>
                                    </div>
                                    <div className="mt-8 md:mt-12">
                                        <Button 
                                            onClick={() => {setNewProperty({features:[]}); setStep('upload');}} 
                                            variant="secondary"
                                            className="px-6 md:px-10 py-3 md:py-6 rounded-xl md:rounded-[2.5rem] text-[10px] md:text-[11px] shadow-2xl hover:scale-105"
                                        >
                                            <Plus size={20} className="md:w-[24px] md:h-[24px]"/> List Property
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                            
                            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 md:gap-6">
                                <Card className="p-4 md:p-8 bg-white border border-slate-100 shadow-sm rounded-xl md:rounded-[3rem] flex flex-col justify-center text-center">
                                    <Wallet size={24} className="md:w-12 md:h-12 text-emerald-600 mx-auto mb-2 md:mb-4"/>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Revenue</p>
                                    <p className="text-xl md:text-4xl font-bold text-emerald-950 tracking-tighter">₦{totalRevenue.toLocaleString()}</p>
                                </Card>
                                <Card className="p-4 md:p-8 bg-white border border-slate-100 shadow-sm rounded-xl md:rounded-[3rem] flex items-center gap-3 md:gap-6">
                                    <div className="w-10 h-10 md:w-14 md:h-14 bg-indigo-50 rounded-xl md:rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner"><Users size={20} className="md:w-[28px] md:h-[28px]"/></div>
                                    <div className="text-left min-w-0">
                                        <p className="text-xs md:text-sm font-bold text-slate-900 leading-none">Total Tenants</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 truncate">{leases.filter(l => l.status === 'FULLY_SIGNED').length} Active</p>
                                    </div>
                                </Card>
                            </div>
                        </div>

                        {/* Additional Parameters Dashboard */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            <Card className="p-6 text-left border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600"><Calendar size={20}/></div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Inspections</h4>
                                </div>
                                <p className="text-3xl font-black text-slate-900">0</p>
                                <p className="text-[10px] font-medium text-slate-400 mt-1 italic">None scheduled today</p>
                            </Card>
                            
                            <Card className="p-6 text-left border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600"><MessageSquare size={20}/></div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Inquiries</h4>
                                </div>
                                <p className="text-3xl font-black text-slate-900">{chatSessions.length}</p>
                                <p className="text-[10px] font-medium text-slate-400 mt-1 italic">{unreadCount} unread responses</p>
                            </Card>

                            <Card className="p-6 text-left border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600"><Wrench size={20}/></div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Maintenance</h4>
                                </div>
                                <p className="text-3xl font-black text-slate-900">0</p>
                                <p className="text-[10px] font-medium text-slate-400 mt-1 italic">Portfolio health clear</p>
                            </Card>

                            <Card className="p-6 text-left border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600"><Star size={20}/></div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Owner Rating</h4>
                                </div>
                                <p className="text-3xl font-black text-slate-900">5.0</p>
                                <p className="text-[10px] font-medium text-slate-400 mt-1 italic">Based on tenant reviews</p>
                            </Card>
                        </div>

                        <section className="space-y-4 md:space-y-8 text-left pt-6">
                            <div className="flex justify-between items-end border-b border-slate-100 pb-3 md:pb-4">
                                <h3 className="text-sm md:text-base font-bold uppercase tracking-widest text-slate-400">Property Inventory</h3>
                                <p className="text-[10px] font-bold uppercase text-emerald-600 tracking-widest">{myProperties.length} LISTINGS</p>
                            </div>
                            
                            {myProperties.length === 0 ? (
                                <div className="py-16 md:py-24 text-center bg-slate-50/50 rounded-2xl md:rounded-[3rem] border-2 border-dashed border-slate-100">
                                    <Home size={40} className="md:w-16 md:h-16 mx-auto text-slate-200 mb-4 md:mb-6"/>
                                    <p className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-slate-300">No properties in portfolio</p>
                                    <Button onClick={() => setStep('upload')} variant="primary" className="mt-6 md:mt-8 mx-auto px-6 md:px-8">List Your First Asset</Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                                    {myProperties.map(prop => (
                                        <Card key={prop.id} className="group relative border border-slate-100 shadow-sm bg-white rounded-xl md:rounded-[2.5rem] overflow-hidden transition-all">
                                            <div className="aspect-[4/3] relative overflow-hidden">
                                                <img src={prop.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={prop.title}/>
                                                <div className="absolute top-3 left-3 flex gap-1.5">
                                                    <Badge color="emerald">{prop.status}</Badge>
                                                </div>
                                            </div>
                                            <div className="p-4 md:p-8 text-left">
                                                <h3 className="font-bold text-slate-900 truncate text-base md:text-xl mb-1">{prop.title}</h3>
                                                <p className="text-[11px] md:text-xs font-bold text-emerald-800 uppercase tracking-widest mb-4 md:mb-6">₦{prop.price.toLocaleString()}/mo</p>
                                                <div className="flex gap-2 pt-4 md:pt-6 border-t border-slate-50">
                                                    <button onClick={() => onDeleteProperty(prop.id)} className="flex-1 py-3 md:py-4 text-rose-600 bg-rose-50 rounded-xl md:rounded-2xl active:scale-95 transition-all text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 border border-rose-100"><Trash2 size={14}/></button>
                                                    <button onClick={() => handleManageProperty(prop)} className="flex-1 py-3 md:py-4 bg-emerald-950 text-white rounded-xl md:rounded-2xl active:scale-95 transition-all text-[10px] font-bold uppercase tracking-widest hover:bg-black">Manage</button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                )}

                {step === 'chats' && (
                    <div className="py-6 md:py-12 space-y-6 md:space-y-10 animate-in fade-in pb-40 max-w-5xl mx-auto text-left">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-4 md:pb-6">
                            <h2 className="text-xl md:text-4xl font-bold tracking-tight text-slate-900">Active Conversations</h2>
                            <Badge color="indigo">{chatSessions.length} Total</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                            {chatSessions.map(session => {
                                const unreadInSession = session.messages.filter(m => !m.isRead && m.senderId !== user.id).length;
                                return (
                                    <Card key={session.id} onClick={() => setActiveChatSessionId(session.id)} className="p-4 md:p-8 border border-slate-100 shadow-sm bg-white flex items-center gap-4 md:gap-6 rounded-xl md:rounded-[3rem] hover:shadow-md transition-all group cursor-pointer active:scale-95 relative">
                                        <div className="w-10 h-10 md:w-16 md:h-16 bg-emerald-950 rounded-xl md:rounded-2xl flex items-center justify-center text-white font-bold text-base md:text-2xl shrink-0 shadow-sm">
                                            {session.propertyTitle.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-sm md:text-xl tracking-tight text-slate-900 truncate mb-0.5">{session.propertyTitle}</h3>
                                            <Badge color={session.assignedGuideId ? 'indigo' : 'emerald'}>
                                                {session.assignedGuideId ? 'GUIDE ASSIGNED' : 'DIRECT TENANT'}
                                            </Badge>
                                        </div>
                                        {unreadInSession > 0 && (
                                            <div className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                {unreadInSession}
                                            </div>
                                        )}
                                        <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-950 transition-all shrink-0"/>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}

                {step === 'leases' && (
                    <div className="py-6 md:py-12 space-y-6 md:space-y-10 animate-in fade-in pb-40 max-w-5xl mx-auto text-left">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-4 md:pb-6">
                            <h2 className="text-xl md:text-4xl font-bold tracking-tight">Contract Archives</h2>
                            <Badge color="emerald">{leases.length} Total</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                            {leases.map(l => (
                                <Card key={l.id} onClick={() => setSelectedLeaseId(l.id)} className="p-5 md:p-10 flex flex-col gap-5 md:gap-8 border border-slate-100 shadow-sm bg-white rounded-2xl md:rounded-[3.5rem] hover:shadow-md transition-all cursor-pointer">
                                    <div className="flex items-center gap-4 md:gap-6">
                                        <div className="w-10 h-10 md:w-14 md:h-14 bg-slate-50 text-emerald-950 rounded-xl md:rounded-2xl flex items-center justify-center shadow-inner border border-slate-100 shrink-0"><FileText size={20} className="md:w-7 md:h-7"/></div>
                                        <div className="text-left flex-1 min-w-0">
                                            <h3 className="text-base md:text-2xl font-bold text-slate-900 truncate leading-tight mb-0.5 md:mb-1">{l.tenantName}</h3>
                                            <p className="text-[10px] md:text-xs font-bold uppercase text-slate-400 tracking-widest truncate">{l.propertyName}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 md:pt-8 border-t border-slate-50">
                                        <Badge color={l.status === 'FULLY_SIGNED' ? 'emerald' : 'amber'}>{l.status.replace(/_/g, ' ')}</Badge>
                                        <button className="text-emerald-950 font-bold text-[10px] md:text-[11px] uppercase tracking-widest flex items-center gap-1.5 hover:underline">View <ArrowRight size={14}/></button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {step === 'upload' && (
                    <div className="py-6 md:py-12 space-y-6 md:space-y-10 animate-in slide-in-from-bottom-10 h-full max-w-4xl mx-auto text-left">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setStep('dashboard')} className="p-2.5 md:p-5 bg-white border border-slate-200 rounded-xl md:rounded-[2rem] text-slate-900 shadow-sm active:scale-90 transition-all"><ArrowLeft size={20} className="md:w-7 md:h-7"/></button>
                            <h2 className="text-xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">Digital Onboarding</h2>
                        </div>
                        
                        {isCameraActive ? (
                            <div className="relative aspect-square md:aspect-video bg-black rounded-2xl md:rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
                                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"/>
                                <div className="absolute inset-x-0 bottom-6 md:bottom-10 flex justify-center gap-6 md:gap-10">
                                    <button onClick={stopCamera} className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/30"><X size={24}/></button>
                                    <button onClick={capturePhoto} className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 md:border-6 border-white bg-emerald-600 active:scale-90 shadow-2xl transition-all"></button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                                {wizardImages.map((img, i) => (
                                    <div key={i} className="relative aspect-square rounded-xl md:rounded-3xl overflow-hidden border border-slate-100 shadow-sm group">
                                        <img src={img} className="w-full h-full object-cover" alt="Property Frame"/>
                                        <button onClick={() => setWizardImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 p-2 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all active:scale-90"><X size={14}/></button>
                                    </div>
                                ))}
                                <label className="aspect-square rounded-xl md:rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center bg-white cursor-pointer hover:bg-slate-50 transition-all group">
                                    <ImageIcon size={28} className="md:w-10 md:h-10 text-slate-200 group-hover:text-emerald-950 transition-colors mb-2 md:mb-3"/>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Add Media</span>
                                    <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                </label>
                                <button onClick={startCamera} className="aspect-square rounded-xl md:rounded-3xl bg-emerald-950 text-white flex flex-col items-center justify-center shadow-lg active:scale-95 transition-all hover:bg-black border border-emerald-900">
                                    <Camera size={28} className="md:w-10 md:h-10 mb-2 md:mb-3 text-emerald-400"/>
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Live Cam</span>
                                </button>
                            </div>
                        )}
                        
                        {!isCameraActive && wizardImages.length > 0 && (
                            <Button onClick={startAnalysis} className="w-full py-5 md:py-8 rounded-xl md:rounded-[2.5rem] shadow-xl text-xs font-bold uppercase tracking-widest">
                                <Sparkles size={18}/> Analyze with Gemini AI
                            </Button>
                        )}
                    </div>
                )}

                {step === 'edit' && (
                    <div className="py-6 md:py-12 space-y-8 md:space-y-12 animate-in slide-in-from-right max-w-4xl mx-auto pb-48 text-left">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setStep('upload')} className="p-2.5 md:p-5 bg-white border border-slate-200 rounded-xl md:rounded-[2rem] shadow-sm active:scale-90"><ArrowLeft size={20}/></button>
                            <h2 className="text-xl md:text-5xl font-bold tracking-tight text-slate-900">Digital Verification</h2>
                        </div>
                        
                        <Card className="p-6 md:p-12 space-y-6 md:space-y-10 border border-slate-100 shadow-sm bg-white rounded-2xl md:rounded-[3.5rem]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10">
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block px-1">Asset Name</label>
                                    <Input value={newProperty.title} onChange={(e: any) => setNewProperty({...newProperty, title: e.target.value})} className="rounded-xl md:rounded-2xl" />
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block px-1">Market Price (₦)</label>
                                    <Input type="number" value={newProperty.price} onChange={(e: any) => setNewProperty({...newProperty, price: parseInt(e.target.value)})} className="rounded-xl md:rounded-2xl" />
                                </div>
                            </div>
                            <div className="space-y-2 text-left">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block px-1">Location Details</label>
                                <Input value={newProperty.address} onChange={(e: any) => setNewProperty({...newProperty, address: e.target.value})} className="rounded-xl md:rounded-2xl" />
                            </div>
                        </Card>
                        
                        <div className="flex gap-4">
                            <Button variant="outline" onClick={() => setStep('upload')} className="flex-1 py-4 md:py-8 rounded-xl md:rounded-[2.5rem] text-[10px]">Back</Button>
                            <Button onClick={saveProperty} className="flex-[2] py-4 md:py-8 rounded-xl md:rounded-[2.5rem] text-[10px] shadow-emerald-200/20">Finalize Listing</Button>
                        </div>
                    </div>
                )}
            </main>

            <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-100 p-3 flex justify-around pb-8 z-50 rounded-t-[2rem] shadow-xl md:hidden">
                {[
                    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20}/> },
                    { id: 'chats', label: 'Messages', icon: <MessageSquare size={20}/>, notify: unreadCount > 0 },
                    { id: 'leases', label: 'Archives', icon: <FileText size={20}/> }
                ].map(nav => (
                    <button 
                        key={nav.id}
                        onClick={() => setStep(nav.id as any)} 
                        className={`p-3 flex flex-col items-center gap-1 transition-all relative ${step === nav.id ? 'text-emerald-950 scale-105 font-bold' : 'text-slate-400'}`}
                    >
                        <div className={`p-2 rounded-xl relative ${step === nav.id ? 'bg-emerald-50' : ''}`}>
                          {nav.icon}
                          {nav.notify && <NotificationBadge count={unreadCount} className="-top-1 -right-1" />}
                        </div>
                        <span className={`text-[10px] uppercase font-bold tracking-widest ${step === nav.id ? 'text-emerald-950' : 'text-slate-500'}`}>{nav.label}</span>
                    </button>
                ))}
            </nav>

            {activeChatSessionId && currentChatSession && (
                <ChatSystem 
                    session={currentChatSession} 
                    currentUser={user} 
                    onSendMessage={onSendMessage} 
                    onClose={() => setActiveChatSessionId(null)}
                    onGenerateLease={handleGenerateLeaseForChat}
                />
            )}
            
            {selectedLeaseId && currentLease && (
                <LeaseViewer 
                    lease={currentLease} 
                    currentUser={user} 
                    onClose={() => setSelectedLeaseId(null)} 
                    onSign={() => {}} 
                />
            )}
        </div>
    );
};
