
import React, { useState, useRef } from 'react';
import { 
  User as UserIcon, Shield, Bell, Lock, RotateCcw, 
  CreditCard, Globe, LogOut, ChevronRight, X, 
  MapPin, CheckCircle, Activity, Star, Camera,
  Settings, Server, Database, Eye, Map, Briefcase
} from 'lucide-react';
import { User, UserRole } from '../types';
import { Button, Card, Badge, Input } from './UI';

interface ProfileViewProps {
  user: User;
  onLogout: () => void;
  onClose: () => void;
  onUpdateUser?: (updated: Partial<User>) => void;
  onResetPreferences?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ 
  user, onLogout, onClose, onUpdateUser, onResetPreferences 
}) => {
  const [activeSection, setActiveSection] = useState<'GENERAL' | 'SECURITY' | 'ROLE_SPECIFIC'>('GENERAL');
  const [isEditing, setIsEditing] = useState(false);
  const [profileImg, setProfileImg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isTenant = user.role === UserRole.TENANT;
  const isLandlord = user.role === UserRole.LANDLORD;
  const isGuide = user.role === UserRole.TOUR_GUIDE;
  const isAdmin = user.role === UserRole.ADMIN;

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImg(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleResetAI = () => {
    if (onResetPreferences) {
      onResetPreferences();
      alert("AI Assistant has been reset to step one.");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-white flex flex-col animate-in slide-in-from-right duration-500 font-['Plus_Jakarta_Sans']">
      <header className="px-6 py-8 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-3 bg-slate-50 rounded-2xl text-slate-400 active:scale-90 transition-all">
            <X size={20}/>
          </button>
          <div className="text-left">
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Your Profile</h2>
            <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">{user.role} Account</p>
          </div>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 p-3 px-5 bg-rose-50 text-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-90 transition-all">
          <LogOut size={16}/> Sign Out
        </button>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-32 max-w-lg mx-auto w-full">
        {/* Profile Identity Section */}
        <section className="flex flex-col items-center text-center space-y-6 pt-4">
          <div className="relative group">
            <div 
              onClick={handleImageClick}
              className="w-32 h-32 md:w-40 md:h-40 bg-slate-100 rounded-[2.5rem] md:rounded-[3rem] p-1 shadow-2xl border-4 border-slate-50 cursor-pointer overflow-hidden relative"
            >
              {profileImg ? (
                <img src={profileImg} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <UserIcon size={48} />
                </div>
              )}
              {/* Overlay for editing */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                <Camera size={24} className="mb-1" />
                <span className="text-[8px] font-black uppercase">Change Photo</span>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageChange} 
            />
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-950 text-white rounded-2xl flex items-center justify-center shadow-lg border-4 border-white">
               <Shield size={16}/>
            </div>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{user.name}</h3>
            <p className="text-sm font-bold text-slate-400 italic">Connected via Rentory Node</p>
            <div className="flex gap-2 justify-center mt-3">
              <Badge color="emerald">VERIFIED</Badge>
              {isGuide && <Badge color="indigo">SENIOR AGENT</Badge>}
              {isAdmin && <Badge color="gray">SUPERUSER</Badge>}
            </div>
          </div>
        </section>

        {/* Tab Selection */}
        <nav className="flex bg-slate-100 p-1.5 rounded-[2rem] gap-1">
          {['GENERAL', 'SECURITY', 'ROLE_SPECIFIC'].map(sec => (
             <button 
                key={sec} 
                onClick={() => setActiveSection(sec as any)}
                className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${activeSection === sec ? 'bg-white text-emerald-950 shadow-md' : 'text-slate-400'}`}
             >
               {sec.replace('_', ' ')}
             </button>
          ))}
        </nav>

        {activeSection === 'GENERAL' && (
          <div className="space-y-4 animate-in fade-in">
             <Card className="p-8 space-y-6 border-none shadow-sm bg-slate-50/50 rounded-[2.5rem] text-left">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Display Name</label>
                   <Input value={user.name} readOnly={!isEditing} className="bg-white border-none shadow-sm" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Contact Email</label>
                   <Input value={`${user.name.toLowerCase().replace(' ', '.')}@rentory.com`} readOnly className="bg-slate-100 border-none opacity-50" />
                </div>
                <Button onClick={() => setIsEditing(!isEditing)} variant="ghost" className="w-full py-4 rounded-2xl">
                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                </Button>
             </Card>

             <Card className="p-8 border-none shadow-sm bg-slate-50/50 rounded-[2.5rem] text-left">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6">Notifications</h4>
                <div className="space-y-6">
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Bell size={18}/></div>
                        <p className="text-sm font-bold text-slate-700">Push Alerts</p>
                      </div>
                      <div className="w-12 h-6 bg-emerald-500 rounded-full flex items-center justify-end p-1"><div className="w-4 h-4 bg-white rounded-full"></div></div>
                   </div>
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Globe size={18}/></div>
                        <p className="text-sm font-bold text-slate-700">Critical Events</p>
                      </div>
                      <div className="w-12 h-6 bg-slate-200 rounded-full flex items-center justify-start p-1"><div className="w-4 h-4 bg-white rounded-full"></div></div>
                   </div>
                </div>
             </Card>
          </div>
        )}

        {activeSection === 'SECURITY' && (
          <div className="space-y-4 animate-in fade-in">
             <Card className="p-8 border-none shadow-sm bg-slate-50/50 rounded-[2.5rem] text-left space-y-8">
                <div className="flex items-center gap-6">
                  <div className="p-5 bg-rose-50 text-rose-600 rounded-2xl"><Lock size={24}/></div>
                  <div>
                    <p className="font-black text-slate-900">Access Key</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">**** (End-to-End Encrypted)</p>
                  </div>
                </div>
                <Button variant="ghost" className="w-full py-4 rounded-2xl border border-slate-200">Reset Access Code</Button>
             </Card>

             <Card className="p-8 border-none shadow-sm bg-slate-50/50 rounded-[2.5rem] text-left space-y-8">
                <div className="flex items-center gap-6">
                  <div className="p-5 bg-emerald-50 text-emerald-600 rounded-2xl"><Shield size={24}/></div>
                  <div>
                    <p className="font-black text-slate-900">Device Biometrics</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Authorized Face Scan</p>
                  </div>
                </div>
                <Badge color="emerald">IDENTITY VERIFIED 2024</Badge>
             </Card>
          </div>
        )}

        {activeSection === 'ROLE_SPECIFIC' && (
          <div className="space-y-4 animate-in fade-in">
             {isAdmin && (
               <>
                 <Card className="p-8 border-none shadow-sm bg-emerald-950 text-white rounded-[2.5rem] text-left space-y-6 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none"><Server size={100}/></div>
                    <h4 className="text-[11px] font-black uppercase tracking-[5px] text-emerald-400">System Command</h4>
                    <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-center py-2 border-b border-white/10">
                            <span className="text-sm font-bold">Mainframe Health</span>
                            <span className="text-xs font-black text-emerald-400">OPTIMAL</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/10">
                            <span className="text-sm font-bold">API Latency</span>
                            <span className="text-xs font-black text-emerald-400">42ms</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/10">
                            <span className="text-sm font-bold">Maintenance Mode</span>
                            <div className="w-10 h-5 bg-white/20 rounded-full flex items-center justify-start p-0.5"><div className="w-4 h-4 bg-white rounded-full"></div></div>
                        </div>
                    </div>
                 </Card>
                 <Card className="p-8 border-none shadow-sm bg-slate-50/50 rounded-[2.5rem] text-left">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6">Database Audit</h4>
                    <div className="space-y-4">
                       <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl hover:bg-slate-100 transition-all">
                          <div className="flex items-center gap-3">
                             <Database size={18} className="text-indigo-600" />
                             <span className="text-sm font-bold">Export User Registry</span>
                          </div>
                          <ChevronRight size={16}/>
                       </button>
                       <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl hover:bg-slate-100 transition-all">
                          <div className="flex items-center gap-3">
                             <Eye size={18} className="text-emerald-600" />
                             <span className="text-sm font-bold">View Global Logs</span>
                          </div>
                          <ChevronRight size={16}/>
                       </button>
                    </div>
                 </Card>
               </>
             )}

             {isGuide && (
               <>
                 <Card className="p-8 border-none shadow-sm bg-amber-500 text-white rounded-[2.5rem] text-left space-y-6 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-10 opacity-20 pointer-events-none"><Map size={100}/></div>
                    <h4 className="text-[11px] font-black uppercase tracking-[5px] text-amber-900">Agent Readiness</h4>
                    <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-center py-2 border-b border-white/20">
                            <span className="text-sm font-black">Mission Availability</span>
                            <div className="w-12 h-6 bg-white/20 rounded-full flex items-center justify-end p-1"><div className="w-4 h-4 bg-white rounded-full"></div></div>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/20">
                            <span className="text-sm font-black">Active Territory</span>
                            <span className="text-xs font-black uppercase tracking-widest">LAGOS ISLANDS</span>
                        </div>
                    </div>
                 </Card>
                 <Card className="p-8 border-none shadow-sm bg-slate-50/50 rounded-[2.5rem] text-left">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6">Payout Node</h4>
                    <div className="flex items-center justify-between p-6 bg-white rounded-3xl shadow-sm">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Briefcase size={20}/></div>
                          <div>
                             <p className="text-sm font-black text-slate-900">Direct Settlement</p>
                             <p className="text-[10px] font-bold text-slate-400">KUDA BANK • 4423</p>
                          </div>
                       </div>
                       <button className="text-[10px] font-black text-emerald-600 uppercase hover:underline">Update</button>
                    </div>
                 </Card>
               </>
             )}

             {isTenant && (
               <>
                 <Card className="p-10 border-none shadow-2xl bg-emerald-950 text-white rounded-[3rem] text-left relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-20"><RotateCcw size={80}/></div>
                    <div className="relative z-10 space-y-4">
                      <h4 className="text-[11px] font-black uppercase tracking-[5px] text-emerald-400">AI Concierge Control</h4>
                      <p className="text-sm font-bold text-slate-200 leading-relaxed">Restart your discovery journey to find new asset matches from the AI interview.</p>
                      <Button onClick={handleResetAI} variant="secondary" className="bg-white text-emerald-950 border-none px-6 rounded-2xl font-black">Restart Search Wizard</Button>
                    </div>
                 </Card>
               </>
             )}

             {isLandlord && (
               <>
                 <Card className="p-8 border-none shadow-sm bg-slate-50/50 rounded-[2.5rem] text-left">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6">Asset Automation</h4>
                    <div className="flex justify-between items-center py-4 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-700">Auto-Draft Agreements</p>
                      <div className="w-12 h-6 bg-emerald-500 rounded-full flex items-center justify-end p-1"><div className="w-4 h-4 bg-white rounded-full"></div></div>
                    </div>
                 </Card>
               </>
             )}
          </div>
        )}
      </main>
    </div>
  );
};
