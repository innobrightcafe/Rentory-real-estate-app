
import React, { useState } from 'react';
import { KeyRound, ShieldCheck, UserPlus } from 'lucide-react';

interface LoginViewProps {
    onLogin: (pin: string) => void;
    onRegister: () => void;
    error?: string;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, onRegister, error }) => {
    const [pin, setPin] = useState('');

    const handleNumberClick = (num: number) => {
        if (pin.length < 4) setPin(p => p + num);
    };

    return (
        <div className="min-h-screen bg-emerald-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-['Plus_Jakarta_Sans']">
            <div className="w-full max-w-xs relative z-10 animate-in fade-in zoom-in-95 duration-500 text-center">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl mx-auto mb-8">
                    <KeyRound className="text-emerald-900" size={32} />
                </div>
                <h1 className="text-4xl font-black text-white mb-1 tracking-tighter">Rentory</h1>
                <p className="text-emerald-400 mb-10 font-bold uppercase tracking-widest text-[9px]">Direct Real Estate Concierge</p>
                
                {error && (
                    <div className="mb-6 p-3 bg-red-500/30 border border-red-500/50 rounded-xl text-red-100 text-[11px] font-bold">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[4px]">Enter Access Code</p>
                    <div className="flex justify-center gap-3 mb-6">
                        {[1, 2, 3, 4].map((_, i) => (
                            <div key={i} className={`w-3 h-3 rounded-full transition-all ${pin.length > i ? 'bg-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-white/20'}`}></div>
                        ))}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                            <button key={num} onClick={() => handleNumberClick(num)} className="h-16 rounded-xl bg-white/20 text-white text-2xl font-black active:scale-90 hover:bg-white/30 transition-all border border-white/5 shadow-lg">
                                {num}
                            </button>
                        ))}
                        <button onClick={() => setPin('')} className="h-16 text-white/70 font-black text-[11px] uppercase tracking-widest hover:text-white transition-colors">Clear</button>
                        <button onClick={() => handleNumberClick(0)} className="h-16 rounded-xl bg-white/20 text-white text-2xl font-black active:scale-90 hover:bg-white/30 transition-all border border-white/5 shadow-lg">0</button>
                        <button onClick={() => onLogin(pin)} className="h-16 rounded-xl bg-white text-emerald-950 flex items-center justify-center shadow-xl active:scale-90 hover:bg-slate-100 transition-all">
                            <ShieldCheck size={28}/>
                        </button>
                    </div>
                </div>

                <button onClick={onRegister} className="mt-10 w-full py-5 rounded-xl bg-white/10 text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-white/20 transition-all border border-white/10 shadow-sm">
                    <UserPlus size={18}/> Apply for Membership
                </button>
            </div>
        </div>
    );
};
