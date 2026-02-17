
import React, { useState } from 'react';
import { 
  Users, BarChart3, Database, ClipboardCheck, Wallet, MessageSquare, 
  Settings, Search, ShieldCheck, UserPlus, X, User as UserIcon, LogOut
} from 'lucide-react';
import { VerificationRequest, UserAccount, Property, Lease, ChatSession, User, UserRole, StaffPosition } from '../types';
import { NotificationBadge, Card, Input, Button } from './UI';
import { ChatSystem } from './ChatSystem';
import { LeaseViewer } from './LeaseViewer';
import { ProfileView } from './ProfileView';

// Sub-component Imports
import { AdminStats } from './Admin/AdminStats';
import { UserManagement } from './Admin/UserManagement';
import { PropertyInventory } from './Admin/PropertyInventory';
import { FinanceCommand } from './Admin/FinanceCommand';
import { SupportInbox } from './Admin/SupportInbox';

interface AdminViewProps {
    requests: VerificationRequest[];
    accounts: UserAccount[];
    properties: Property[];
    leases: Lease[];
    chatSessions: ChatSession[];
    currentUser: User;
    onDeleteProperty: (id: string) => void;
    onApprove: (id: string, pin: string) => void;
    onReject: (id: string) => void;
    onRegeneratePin: (accountId: string) => string;
    onToggleUserStatus: (id: string) => void;
    onSendMessage: (sessionId: string, text: string) => void;
    onLogout: () => void;
    onSignLease: (id: string) => void;
    onAddStaff: (staff: UserAccount) => void;
}

export const AdminView: React.FC<AdminViewProps> = (props) => {
    const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'requests' | 'properties' | 'finance' | 'support'>('stats');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);
    const [selectedLeaseId, setSelectedLeaseId] = useState<string | null>(null);
    const [showAddStaff, setShowAddStaff] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    const [staffForm, setStaffForm] = useState({ name: '', email: '', position: 'SUPPORT_LEAD' as StaffPosition });

    const handleCreateStaff = () => {
        const pin = Math.floor(1000 + Math.random() * 9000).toString();
        const newStaff: UserAccount = {
            id: 's' + Date.now(),
            name: staffForm.name,
            email: staffForm.email,
            role: UserRole.STAFF,
            position: staffForm.position,
            pin,
            status: 'ACTIVE',
            joinedAt: new Date().toISOString()
        };
        props.onAddStaff(newStaff);
        alert(`Account created for ${staffForm.name}. Position: ${staffForm.position}. ACCESS CODE: ${pin}`);
        setShowAddStaff(false);
        setStaffForm({ name: '', email: '', position: 'SUPPORT_LEAD' });
    };

    const handleInitiateSupport = (targetId: string) => {
        const sessionId = `chat_support_${targetId}`;
        setActiveChatSessionId(sessionId);
        setActiveTab('support');
    };

    const currentChatSession = props.chatSessions.find(s => s.id === activeChatSessionId);
    const currentLease = props.leases.find(l => l.id === selectedLeaseId);

    return (
        <div className="h-full bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans'] text-slate-900 overflow-hidden">
            <header className="sticky top-0 px-6 md:px-12 py-4 md:py-8 bg-white border-b border-slate-200 flex justify-between items-center z-30 shrink-0 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-emerald-950 rounded-xl md:rounded-2xl flex items-center justify-center text-white font-black shadow-xl border border-emerald-900">
                        <Database size={24} className="md:w-7 md:h-7" />
                    </div>
                    <div className="text-left">
                        <h1 className="text-lg md:text-3xl font-black text-slate-900 tracking-tighter leading-none">Admin Panel</h1>
                        <p className="text-[9px] md:text-[11px] font-bold uppercase text-emerald-600 tracking-widest mt-1">Rentory Management Hub</p>
                    </div>
                </div>

                <div className="hidden lg:flex items-center gap-2 bg-slate-50 rounded-2xl px-4 py-2 border border-slate-200">
                    <Search size={18} className="text-slate-400" />
                    <input 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search system resources..." 
                        className="bg-transparent border-none focus:ring-0 text-sm font-medium w-64"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={() => setShowAddStaff(true)} className="hidden md:flex items-center gap-2 p-3 px-6 bg-emerald-950 text-white rounded-xl shadow-lg hover:bg-black active:scale-95 transition-all">
                        <UserPlus size={18}/>
                        <span className="text-[10px] font-black uppercase tracking-widest">Add Staff</span>
                    </button>
                    <button onClick={() => setShowProfile(true)} className="p-3 bg-slate-50 rounded-xl text-slate-900 border border-slate-200 active:scale-95 transition-all">
                        <UserIcon size={22}/>
                    </button>
                    <button onClick={props.onLogout} className="p-3 bg-rose-50 rounded-xl text-rose-600 border border-rose-100 active:scale-95 transition-all">
                        <LogOut size={22}/>
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar relative bg-slate-50/50 pb-40 px-4 md:px-12 lg:px-20 pt-6">
                {activeTab === 'stats' && <AdminStats {...props} onSelectLease={setSelectedLeaseId} />}
                {activeTab === 'users' && <UserManagement {...props} onMessageUser={handleInitiateSupport} />}
                {activeTab === 'properties' && <PropertyInventory {...props} onAuditOwner={handleInitiateSupport} />}
                {activeTab === 'finance' && <FinanceCommand {...props} />}
                {activeTab === 'support' && <SupportInbox {...props} onSelectSession={setActiveChatSessionId} />}
                
                {activeTab === 'requests' && (
                    <div className="py-6 md:py-12 animate-in slide-in-from-left max-w-5xl mx-auto text-left">
                        <h2 className="text-2xl md:text-5xl font-black tracking-tighter text-slate-900 mb-8 leading-tight">Verification Queue</h2>
                        {props.requests.length === 0 ? (
                            <div className="text-center py-32 opacity-30">
                                <ShieldCheck size={80} className="mx-auto mb-6" />
                                <p className="text-[12px] font-black uppercase tracking-[6px]">Secure Perimeter</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {props.requests.map(req => (
                                    <div key={req.id} className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-xl space-y-6 text-left">
                                        <div className="flex justify-between">
                                            <h3 className="text-xl font-bold">{req.name}</h3>
                                            <span className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black rounded-full">{req.roleRequested}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <img src={req.idImage} className="rounded-2xl aspect-video object-cover" alt="ID" />
                                            <img src={req.faceScan} className="rounded-2xl aspect-video object-cover" alt="Face" />
                                        </div>
                                        <div className="flex gap-4 pt-4">
                                            <button onClick={() => props.onReject(req.id)} className="flex-1 py-4 text-rose-600 bg-rose-50 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-rose-100">Reject</button>
                                            <button onClick={() => props.onApprove(req.id, "1111")} className="flex-1 py-4 bg-emerald-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Approve</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-3xl border-t border-slate-200 p-3 flex justify-around pb-10 z-50 rounded-t-[3.5rem] shadow-2xl md:max-w-4xl md:mx-auto md:mb-6 md:border-2 md:rounded-full">
                {[
                    { id: 'stats', label: 'Stats', icon: <BarChart3 size={22}/> },
                    { id: 'users', label: 'Users', icon: <Users size={22}/> },
                    { id: 'requests', label: 'Verifications', icon: <ClipboardCheck size={22}/>, notify: props.requests.length },
                    { id: 'finance', label: 'Earnings', icon: <Wallet size={22}/> },
                    { id: 'support', label: 'Inbox', icon: <MessageSquare size={22}/> },
                ].map(nav => (
                    <button 
                        key={nav.id}
                        onClick={() => setActiveTab(nav.id as any)} 
                        className={`p-4 flex flex-col items-center gap-1.5 transition-all relative ${activeTab === nav.id ? 'text-emerald-950 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <div className={`p-2 rounded-2xl relative ${activeTab === nav.id ? 'bg-emerald-50' : ''}`}>
                          {nav.icon}
                          {nav.notify ? <NotificationBadge count={nav.notify} className="-top-1 -right-1" /> : null}
                        </div>
                        <span className={`text-[8px] md:text-[9px] uppercase font-black tracking-widest ${activeTab === nav.id ? 'text-emerald-950' : 'text-slate-500'}`}>{nav.label}</span>
                    </button>
                ))}
            </nav>

            {/* Hire Staff Modal */}
            {showAddStaff && (
                <div className="fixed inset-0 z-[1000] bg-emerald-950/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in">
                    <Card className="w-full max-w-md bg-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl space-y-8 relative overflow-hidden text-left">
                        <button onClick={() => setShowAddStaff(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900"><X/></button>
                        <div className="text-left">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Add Staff Member</h2>
                            <p className="text-slate-400 text-sm font-medium mt-1">Grant new permissions for Rentory operations.</p>
                        </div>
                        <div className="space-y-4">
                            <Input placeholder="Full Legal Name" value={staffForm.name} onChange={(e:any) => setStaffForm({...staffForm, name: e.target.value})} />
                            <Input placeholder="Business Email" value={staffForm.email} onChange={(e:any) => setStaffForm({...staffForm, email: e.target.value})} />
                            <select 
                                value={staffForm.position}
                                onChange={(e:any) => setStaffForm({...staffForm, position: e.target.value})}
                                className="w-full px-6 py-5 rounded-2xl bg-slate-50 border-2 border-slate-100 text-sm font-black uppercase tracking-widest text-emerald-950 focus:border-emerald-950 focus:outline-none"
                            >
                                <option value="COMPLIANCE_OFFICER">Compliance Officer</option>
                                <option value="OPERATIONS_MANAGER">Operations Manager</option>
                                <option value="FINANCIAL_CONTROLLER">Financial Controller</option>
                                <option value="SUPPORT_LEAD">Support Lead</option>
                            </select>
                        </div>
                        <Button onClick={handleCreateStaff} className="w-full py-6 text-sm">Create Account & Send PIN</Button>
                    </Card>
                </div>
            )}

            {showProfile && (
                <ProfileView 
                    user={props.currentUser} 
                    onLogout={props.onLogout} 
                    onClose={() => setShowProfile(false)} 
                />
            )}

            {activeChatSessionId && currentChatSession && (
                <ChatSystem 
                    session={currentChatSession} 
                    currentUser={props.currentUser} 
                    onSendMessage={props.onSendMessage} 
                    onClose={() => setActiveChatSessionId(null)} 
                />
            )}

            {selectedLeaseId && currentLease && (
                <LeaseViewer 
                    lease={currentLease} 
                    currentUser={props.currentUser} 
                    onClose={() => setSelectedLeaseId(null)} 
                    onSign={props.onSignLease} 
                />
            )}
        </div>
    );
};
