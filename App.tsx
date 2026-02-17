
import React, { useState } from 'react';
import { UserRole, User, VerificationRequest, UserAccount, ChatSession, Property, Lease } from './types';
import { TenantView } from './components/Tenant/TenantView';
import { LandlordView } from './components/Landlord/LandlordView';
import { GuideView } from './components/GuideView';
import { VerificationFlow } from './components/Auth/VerificationFlow';
import { AdminView } from './components/AdminView';
import { LoginView } from './components/Auth/LoginView';
import { StaffView } from './components/StaffView';
import { PaystackModal } from './components/PaystackModal';
import { MOCK_PROPERTIES, MOCK_GUIDES, MOCK_CHATS } from './constants';
import { apiService } from './services/apiService';

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'LOGIN' | 'REGISTER' | 'APP'>('LOGIN');
  const [error, setError] = useState('');
  const [paystackOrder, setPaystackOrder] = useState<any>(null);

  const [accounts, setAccounts] = useState<UserAccount[]>([
    { id: 'u1', name: 'Demo Tenant', email: 'tenant@rentory.com', role: UserRole.TENANT, pin: '1111', status: 'ACTIVE', joinedAt: new Date().toISOString() },
    { id: 'u2', name: 'Demo Landlord', email: 'landlord@rentory.com', role: UserRole.LANDLORD, pin: '5555', status: 'ACTIVE', joinedAt: new Date().toISOString() },
    { id: 'u3', name: 'Super Admin', email: 'admin@rentory.com', role: UserRole.ADMIN, pin: '1414', status: 'ACTIVE', joinedAt: new Date().toISOString() },
    { id: 'u4', name: 'Tour Guide', email: 'guide@rentory.com', role: UserRole.TOUR_GUIDE, pin: '0000', status: 'ACTIVE', joinedAt: new Date().toISOString(), balance: 12500 },
    // Internal Staff
    { id: 's1', name: 'Sarah Ahmed', email: 'sarah@rentory.com', role: UserRole.STAFF, position: 'COMPLIANCE_OFFICER', pin: '1010', status: 'ACTIVE', joinedAt: new Date().toISOString() },
    { id: 's2', name: 'John Okoro', email: 'john@rentory.com', role: UserRole.STAFF, position: 'OPERATIONS_MANAGER', pin: '2020', status: 'ACTIVE', joinedAt: new Date().toISOString() },
    ...MOCK_GUIDES
  ]);

  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(MOCK_CHATS);
  const [unlockedProperties, setUnlockedProperties] = useState<string[]>(['p1']); 
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [viewedHistory, setViewedHistory] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [tenantPreferences, setTenantPreferences] = useState<Record<string, string>>({
    'u1': 'Modern Loft Lagos Islands ₦250k - ₦600k'
  });

  const handleLogout = () => {
    setUser(null);
    setView('LOGIN');
    setError('');
  };

  const handleLogin = (pin: string) => {
    const account = accounts.find(a => a.pin === pin && a.status === 'ACTIVE');
    if (account) {
        setUser({ id: account.id, name: account.name, role: account.role, preferences: tenantPreferences[account.id], position: account.position });
        setView('APP');
        setError('');
    } else {
        setError('Incorrect PIN. Please try again.');
    }
  };

  const handleSendMessage = (sessionId: string, text: string, senderId?: string) => {
      const activeUser = senderId || user?.id;
      if (!activeUser) return;
      
      const newMessage = {
          id: `msg_${Date.now()}`,
          senderId: activeUser,
          text: text,
          timestamp: new Date().toISOString(),
          isRead: senderId ? false : true,
          isAdminIntervention: user?.role === UserRole.ADMIN || user?.role === UserRole.STAFF
      };
      
      setChatSessions(prev => {
          const exists = prev.find(s => s.id === sessionId);
          if (!exists) {
              const newSession: ChatSession = {
                  id: sessionId,
                  propertyId: 'SUPPORT',
                  propertyTitle: 'Direct Support',
                  tenantId: sessionId.includes('u1') ? 'u1' : activeUser,
                  landlordId: 'u3',
                  messages: [newMessage],
                  lastUpdated: new Date().toISOString()
              };
              return [newSession, ...prev];
          }
          return prev.map(session => session.id === sessionId ? {
              ...session,
              messages: [...session.messages, newMessage],
              lastUpdated: new Date().toISOString()
          } : session);
      });
  };

  const handleSignLease = (id: string) => {
    setLeases(prev => prev.map(l => {
      if (l.id !== id) return l;
      
      if (user?.role === UserRole.TENANT) {
        return { ...l, status: 'PENDING_ADMIN', tenantSignedAt: new Date().toISOString() };
      }
      if (user?.role === UserRole.ADMIN || (user?.role === UserRole.STAFF && user?.position === 'COMPLIANCE_OFFICER')) {
        return { ...l, status: 'FULLY_SIGNED', adminSignature: user.name, adminSignedAt: new Date().toISOString() };
      }
      return l;
    }));
  };

  const handlePaymentSuccess = () => {
    if (paystackOrder && user) {
      setUnlockedProperties(prev => [...prev, paystackOrder.id]);
    }
    setPaystackOrder(null);
  };

  if (view === 'LOGIN') return <LoginView onLogin={handleLogin} onRegister={() => setView('REGISTER')} error={error} />;

  if (view === 'REGISTER') {
      return <VerificationFlow 
        onComplete={async (req) => {
          await apiService.submitVerification(req);
          setRequests(prev => [...prev, req]);
          setView('LOGIN');
          alert("Registration submitted for review.");
        }} 
        onCancel={() => setView('LOGIN')} 
      />;
  }

  if (view === 'APP' && user) {
      const commonProps = {
          user: { ...user, favorites },
          onLogout: handleLogout,
          chatSessions,
          leases,
          onSendMessage: handleSendMessage,
      };

      return (
        <div className="h-[100dvh] bg-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] overflow-hidden">
          <div className="w-full max-w-6xl mx-auto h-full relative flex flex-col bg-white md:shadow-[0_0_100px_rgba(0,0,0,0.1)]">
            {user.role === UserRole.ADMIN && (
              <AdminView 
                  {...commonProps}
                  requests={requests} 
                  accounts={accounts} 
                  properties={properties}
                  currentUser={user}
                  onDeleteProperty={(id) => setProperties(prev => prev.filter(p => p.id !== id))}
                  onApprove={(id, pin) => {}} 
                  onReject={(id) => setRequests(prev => prev.filter(r => r.id !== id))} 
                  onRegeneratePin={(id) => "8888"} 
                  onToggleUserStatus={(id) => setAccounts(prev => prev.map(a => a.id === id ? {...a, status: a.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'} : a))}
                  onSignLease={handleSignLease}
                  onAddStaff={(staff) => setAccounts(prev => [staff, ...prev])}
              />
            )}
            {user.role === UserRole.STAFF && (
              <StaffView 
                  {...commonProps}
                  properties={properties}
                  requests={requests}
                  accounts={accounts}
                  onApproveProperty={(id) => setProperties(prev => prev.map(p => p.id === id ? {...p, status: 'ACTIVE'} : p))}
                  onApproveUser={(id) => setRequests(prev => prev.map(r => r.id === id ? {...r, status: 'APPROVED'} : r))}
                  onSignLease={handleSignLease}
              />
            )}
            {user.role === UserRole.TENANT && (
              <TenantView 
                  {...commonProps}
                  properties={properties}
                  onSignLease={handleSignLease}
                  onUnlockProperty={(id) => setPaystackOrder({ id, title: 'Unlock Contact', amount: 5000, customerName: user.name })}
                  onInitiateSupportChat={() => 'chat_support_u1'}
                  onUpdatePreferences={(prefs) => { setTenantPreferences({...tenantPreferences, [user.id]: prefs}); setUser({...user, preferences: prefs}); }}
                  unlockedProperties={unlockedProperties}
                  viewedHistory={viewedHistory}
                  onAddToHistory={(id) => setViewedHistory([id, ...viewedHistory.filter(v => v !== id)].slice(0, 10))}
                  onToggleFavorite={(id) => setFavorites(favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id])}
              />
            )}
            {user.role === UserRole.LANDLORD && (
              <LandlordView 
                  {...commonProps}
                  myProperties={properties.filter(p => p.landlordId === user.id)}
                  onAddProperty={(p) => setProperties([p, ...properties])}
                  onDeleteProperty={(id) => setProperties(properties.filter(p => p.id !== id))}
                  onCreateLease={(l) => setLeases([l, ...leases])}
              />
            )}
            {user.role === UserRole.TOUR_GUIDE && (
              <GuideView 
                  {...commonProps}
                  properties={properties} 
              />
            )}
            {paystackOrder && (
              <PaystackModal order={paystackOrder} onClose={() => setPaystackOrder(null)} onSuccess={handlePaymentSuccess} />
            )}
          </div>
        </div>
      );
  }

  return <div className="h-screen bg-white flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-950 border-t-transparent rounded-full animate-spin"></div></div>;
};

export default App;
