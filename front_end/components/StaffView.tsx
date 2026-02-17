
import React, { useState } from 'react';
import { 
  ShieldCheck, Activity, Users, MessageSquare, Navigation, FileCheck, 
  BarChart3, Settings, ClipboardList, Wallet, Search, ArrowLeft, Headphones
} from 'lucide-react';
import { Property, User, ChatSession, Lease, VerificationRequest, UserAccount } from '../types';
import { Badge, Card, NotificationBadge, Button } from './UI';
import { ChatSystem } from './ChatSystem';
import { LeaseViewer } from './LeaseViewer';

interface StaffViewProps {
  user: User;
  onLogout: () => void;
  properties: Property[];
  requests: VerificationRequest[];
  accounts: UserAccount[];
  chatSessions: ChatSession[];
  leases: Lease[];
  onSendMessage: (sessionId: string, text: string) => void;
  onApproveProperty: (id: string) => void;
  onApproveUser: (id: string) => void;
  onSignLease: (id: string) => void;
}

export const StaffView: React.FC<StaffViewProps> = (props) => {
  const [activeTab, setActiveTab] = useState<'ops' | 'compliance' | 'finance' | 'support'>('ops');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [selectedLeaseId, setSelectedLeaseId] = useState<string | null>(null);

  const { user, onLogout } = props;
  const positionLabel = user.position?.replace('_', ' ') || 'RENTORY STAFF';

  const currentChat = props.chatSessions.find(s => s.id === activeChatId);
  const currentLease = props.leases.find(l => l.id === selectedLeaseId);

  return (
    <div className="h-full flex flex-col bg-slate-50 font-['Plus_Jakarta_Sans'] overflow-hidden">
      {/* Internal Header */}
      <header className="px-6 md:px-12 py-4 bg-emerald-950 text-white flex justify-between items-center z-30 shrink-0 shadow-lg border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center font-black shadow-inner">
            <Activity size={22} />
          </div>
          <div className="text-left">
            <h1 className="text-lg font-black tracking-tight leading-none uppercase italic">Rentory Internal</h1>
            <p className="text-[9px] font-bold uppercase text-emerald-400 tracking-widest mt-1">NODE: {positionLabel}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex bg-white/5 p-1 rounded-xl border border-white/10">
            {[
              { id: 'ops', label: 'Operations', icon: <Navigation size={16}/> },
              { id: 'compliance', label: 'Compliance', icon: <FileCheck size={16}/> },
              { id: 'finance', label: 'Finance', icon: <Wallet size={16}/> },
              { id: 'support', label: 'Service', icon: <Headphones size={16}/> },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-emerald-400 hover:text-white'}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
          <button onClick={onLogout} className="p-2.5 bg-white/10 hover:bg-rose-600/20 rounded-xl transition-all border border-white/10 text-white">
            <Settings size={20}/>
          </button>
        </div>
      </header>

      {/* Workspace */}
      <main className="flex-1 overflow-y-auto p-4 md:p-12 no-scrollbar bg-slate-50/50 pb-32">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {activeTab === 'ops' && (
            <div className="space-y-8 animate-in fade-in text-left">
              <div className="flex justify-between items-end border-b border-slate-200 pb-6">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Dispatch Control</h2>
                  <p className="text-slate-500 font-medium">Coordinate field tour guides and property verification missions.</p>
                </div>
                <Badge color="emerald">{props.accounts.filter(a => a.role === 'TOUR_GUIDE').length} Active Guides</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {props.properties.filter(p => p.status === 'ACTIVE' && p.rentoryManaged).map(p => (
                  <Card key={p.id} className="p-6 bg-white border-none shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between mb-4">
                         <Badge color="indigo">MANAGED ASSET</Badge>
                         <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold">M</div>
                            <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold">E</div>
                         </div>
                      </div>
                      <h3 className="font-bold text-lg text-slate-900 truncate">{p.title}</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{p.address.split(',')[0]}</p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase text-slate-400">Guide Assigned:</span>
                      <span className="text-[9px] font-black uppercase text-emerald-600">Emeka Nwosu</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-8 animate-in slide-in-from-right text-left">
              <div className="flex justify-between items-end border-b border-slate-200 pb-6">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Risk & Compliance</h2>
                  <p className="text-slate-500 font-medium">Verify legal documentation and authorize digital lease agreements.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-8 bg-white border-none shadow-sm rounded-[3rem]">
                  <h3 className="text-xl font-black text-emerald-950 mb-6 flex items-center gap-2"><ClipboardList size={22}/> User Vetting</h3>
                  <div className="space-y-4">
                    {props.requests.filter(r => r.status === 'PENDING').map(req => (
                      <div key={req.id} className="p-5 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden">
                            <img src={req.faceScan} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">{req.name}</p>
                            <p className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">{req.roleRequested}</p>
                          </div>
                        </div>
                        <Button variant="secondary" className="px-4 py-2 text-[8px]" onClick={() => props.onApproveUser(req.id)}>Verify</Button>
                      </div>
                    ))}
                    {props.requests.filter(r => r.status === 'PENDING').length === 0 && <p className="text-center py-10 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Queue Clear</p>}
                  </div>
                </Card>

                <Card className="p-8 bg-white border-none shadow-sm rounded-[3rem]">
                  <h3 className="text-xl font-black text-emerald-950 mb-6 flex items-center gap-2"><FileCheck size={22}/> Lease Authorization</h3>
                  <div className="space-y-4">
                    {props.leases.filter(l => l.status === 'PENDING_ADMIN').map(l => (
                      <div key={l.id} className="p-5 bg-emerald-50 rounded-2xl flex items-center justify-between border border-emerald-100">
                         <div>
                            <p className="text-sm font-black text-emerald-950">{l.propertyName}</p>
                            <p className="text-[9px] font-bold uppercase text-emerald-600 tracking-widest">Awaiting Signature</p>
                         </div>
                         <Button onClick={() => setSelectedLeaseId(l.id)} className="px-4 py-2 text-[8px]">Sign & Finalize</Button>
                      </div>
                    ))}
                    {props.leases.filter(l => l.status === 'PENDING_ADMIN').length === 0 && <p className="text-center py-10 text-slate-400 font-bold uppercase text-[10px] tracking-widest">All Signed</p>}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="space-y-8 animate-in slide-in-from-bottom text-left">
              <div className="flex justify-between items-end border-b border-slate-200 pb-6">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Treasury Operations</h2>
                  <p className="text-slate-500 font-medium">Monitor ecosystem cashflow and authorized payouts.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-8 bg-emerald-950 text-white rounded-[2.5rem]">
                   <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest mb-2">Pool Balance</p>
                   <p className="text-4xl font-black tracking-tighter">₦850,000</p>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'support' && (
             <div className="space-y-8 animate-in slide-in-from-left text-left">
              <div className="flex justify-between items-end border-b border-slate-200 pb-6">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Service Hub</h2>
                  <p className="text-slate-500 font-medium">Real-time intervention for tenants and landlords.</p>
                </div>
                <Badge color="indigo">{props.chatSessions.length} Active Channels</Badge>
              </div>
              
              <div className="space-y-4">
                {props.chatSessions.map(s => (
                  <Card key={s.id} onClick={() => setActiveChatId(s.id)} className="p-8 flex items-center justify-between border-none shadow-sm rounded-3xl hover:shadow-xl transition-all cursor-pointer bg-white">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-emerald-950 text-white rounded-2xl flex items-center justify-center font-black text-xl">{s.propertyTitle.charAt(0)}</div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">{s.propertyTitle}</h3>
                        <p className="text-xs text-slate-400 mt-1">Tenant: Verified User • Last message 12m ago</p>
                      </div>
                    </div>
                    <button className="p-3 bg-slate-50 text-emerald-950 rounded-xl hover:bg-emerald-950 hover:text-white transition-all"><MessageSquare size={20}/></button>
                  </Card>
                ))}
              </div>
             </div>
          )}

        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-emerald-950 text-white p-3 flex justify-around pb-10 z-[200] rounded-t-[3rem] md:hidden border-t border-white/10 shadow-2xl">
         {[
           { id: 'ops', icon: <Navigation size={22}/> },
           { id: 'compliance', icon: <FileCheck size={22}/> },
           { id: 'finance', icon: <Wallet size={22}/> },
           { id: 'support', icon: <Headphones size={22}/> },
         ].map(nav => (
            <button 
              key={nav.id}
              onClick={() => setActiveTab(nav.id as any)}
              className={`p-4 transition-all ${activeTab === nav.id ? 'bg-white/10 rounded-2xl text-emerald-400 scale-110' : 'text-white/40'}`}
            >
              {nav.icon}
            </button>
         ))}
      </nav>

      {/* Layer Components */}
      {activeChatId && currentChat && (
        <ChatSystem session={currentChat} currentUser={user} onSendMessage={props.onSendMessage} onClose={() => setActiveChatId(null)} />
      )}

      {selectedLeaseId && currentLease && (
        <LeaseViewer 
            lease={currentLease} 
            currentUser={user} 
            onClose={() => setSelectedLeaseId(null)} 
            onSign={props.onSignLease} 
        />
      )}
    </div>
  );
};
