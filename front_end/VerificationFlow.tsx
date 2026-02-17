
import React, { useState, useRef } from 'react';
import { Camera, Upload, Check, User, ScanFace, ChevronRight, AlertCircle, ShieldCheck, Navigation, X, ArrowLeft, MapPin } from 'lucide-react';
import { Button, Input, Card, LoadingScreen } from './UI';
import { VerificationRequest, UserRole } from '../types';

interface VerificationFlowProps {
    onComplete: (request: VerificationRequest) => void;
    onCancel: () => void;
}

export const VerificationFlow: React.FC<VerificationFlowProps> = ({ onComplete, onCancel }) => {
    const [step, setStep] = useState(1);
    const [role, setRole] = useState<UserRole>(UserRole.TENANT);
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [idImage, setIdImage] = useState<string | null>(null);
    const [faceImage, setFaceImage] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setIdImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const startCamera = async () => {
        setIsScanning(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            alert("Camera access denied. Please allow camera access in your settings.");
            setIsScanning(false);
        }
    };

    const captureFace = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
            setFaceImage(canvas.toDataURL('image/jpeg'));
            
            const stream = videoRef.current.srcObject as MediaStream;
            stream?.getTracks().forEach(track => track.stop());
            setIsScanning(false);
        }
    };

    const handleSubmit = () => {
        const request: VerificationRequest = {
            id: `req_${Date.now()}`,
            name: formData.name,
            email: formData.email,
            idImage: idImage!,
            faceScan: faceImage!,
            status: 'PENDING',
            roleRequested: role,
            timestamp: new Date().toISOString()
        };
        onComplete(request);
    };

    const renderStep1 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create Account</h2>
                <p className="text-slate-500 text-sm font-medium">Choose your designation within the Rentory network.</p>
            </div>
            
            <div className="space-y-3">
                <button 
                    onClick={() => setRole(UserRole.TENANT)}
                    className={`w-full p-6 rounded-3xl border-2 transition-all flex items-center justify-between group ${role === UserRole.TENANT ? 'border-emerald-600 bg-emerald-50 text-emerald-950' : 'border-slate-100 bg-white text-slate-400'}`}
                >
                    <div className="flex items-center gap-4">
                        <User size={24} className={role === UserRole.TENANT ? 'text-emerald-600' : 'text-slate-300'}/>
                        <div className="text-left">
                            <p className="font-black text-lg tracking-tight leading-none">I'm a Tenant</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1">Looking for a home</p>
                        </div>
                    </div>
                    {role === UserRole.TENANT && <Check size={20} className="text-emerald-600"/>}
                </button>
                <button 
                    onClick={() => setRole(UserRole.LANDLORD)}
                    className={`w-full p-6 rounded-3xl border-2 transition-all flex items-center justify-between group ${role === UserRole.LANDLORD ? 'border-emerald-600 bg-emerald-50 text-emerald-950' : 'border-slate-100 bg-white text-slate-400'}`}
                >
                    <div className="flex items-center gap-4">
                        <ShieldCheck size={24} className={role === UserRole.LANDLORD ? 'text-emerald-600' : 'text-slate-300'}/>
                        <div className="text-left">
                            <p className="font-black text-lg tracking-tight leading-none">I'm a Landlord</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1">Rent out my property</p>
                        </div>
                    </div>
                    {role === UserRole.LANDLORD && <Check size={20} className="text-emerald-600"/>}
                </button>
                <button 
                    onClick={() => setRole(UserRole.TOUR_GUIDE)}
                    className={`w-full p-6 rounded-3xl border-2 transition-all flex items-center justify-between group ${role === UserRole.TOUR_GUIDE ? 'border-emerald-600 bg-emerald-50 text-emerald-950' : 'border-slate-100 bg-white text-slate-400'}`}
                >
                    <div className="flex items-center gap-4">
                        <Navigation size={24} className={role === UserRole.TOUR_GUIDE ? 'text-emerald-600' : 'text-slate-300'}/>
                        <div className="text-left">
                            <p className="font-black text-lg tracking-tight leading-none">I'm a Tour Guide</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1">Provide tours and audits</p>
                        </div>
                    </div>
                    {role === UserRole.TOUR_GUIDE && <Check size={20} className="text-emerald-600"/>}
                </button>
            </div>

            <div className="space-y-4 pt-4">
                <Input 
                    placeholder="Legal Full Name" 
                    value={formData.name}
                    onChange={(e: any) => setFormData({...formData, name: e.target.value})}
                />
                <Input 
                    placeholder="Email Address" 
                    value={formData.email}
                    onChange={(e: any) => setFormData({...formData, email: e.target.value})}
                />
            </div>
            
            <Button 
                onClick={() => setStep(2)} 
                disabled={!formData.name || !formData.email}
                className="w-full mt-4 py-5 rounded-2xl"
            >
                Next Step <ChevronRight size={20}/>
            </Button>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-1">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Verify ID</h2>
                <p className="text-slate-500 text-sm font-medium">Please upload a clear photo of your identity document.</p>
            </div>

            <div className="relative group cursor-pointer aspect-[1.6/1]">
                <input type="file" accept="image/*" onChange={handleIdUpload} className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"/>
                <div className={`border-2 border-dashed rounded-[2.5rem] h-full flex flex-col items-center justify-center transition-all ${idImage ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                    {idImage ? (
                        <>
                            <img src={idImage} alt="ID Preview" className="h-[70%] object-contain rounded-xl shadow-lg"/>
                            <p className="text-emerald-700 font-black text-[10px] uppercase tracking-widest mt-4 flex items-center gap-2"><Check size={14}/> ID Scanned</p>
                        </>
                    ) : (
                        <>
                            <div className="w-14 h-14 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-3">
                                <Upload size={28}/>
                            </div>
                            <p className="font-black text-slate-900 text-sm">Tap to scan ID</p>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">NIN, Passport, or DL</p>
                        </>
                    )}
                </div>
            </div>

            <div className="flex gap-4">
                 <Button variant="secondary" onClick={() => setStep(1)} className="flex-1 py-4 rounded-2xl">Back</Button>
                 <Button onClick={() => setStep(3)} disabled={!idImage} className="flex-1 py-4 rounded-2xl">Next Step</Button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-1">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Biometric Audit</h2>
                <p className="text-slate-500 text-sm font-medium">Verify your face matches your provided document.</p>
            </div>

            <div className="relative aspect-[1/1] bg-black rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white mx-auto w-full max-w-[300px]">
                {!faceImage && !isScanning && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center bg-slate-900">
                        <ScanFace size={56} className="mb-6 text-emerald-400"/>
                        <p className="mb-8 font-black uppercase tracking-widest text-[10px]">Photo Verification</p>
                        <Button onClick={startCamera} className="w-full py-4 rounded-2xl bg-white text-slate-900">Open Camera</Button>
                    </div>
                )}
                
                {isScanning && (
                    <>
                        <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover"/>
                        <div className="absolute inset-0 border-[40px] border-black/60 rounded-[45%] scale-105"></div>
                        <div className="absolute inset-0 flex items-end justify-center p-8">
                            <button onClick={captureFace} className="w-16 h-16 rounded-full border-4 border-white bg-emerald-600 shadow-2xl active:scale-90 transition-all"></button>
                        </div>
                    </>
                )}

                {faceImage && (
                    <>
                        <img src={faceImage} className="w-full h-full object-cover" alt="Face"/>
                        <div className="absolute inset-0 bg-emerald-900/20 backdrop-blur-[2px] flex items-center justify-center">
                             <Check size={80} className="text-white drop-shadow-lg"/>
                        </div>
                        <button onClick={() => {setFaceImage(null); setIsScanning(false);}} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur px-4 py-2 rounded-full text-[9px] font-black uppercase text-white">Retake</button>
                    </>
                )}
            </div>

            <div className="flex gap-4">
                 <Button variant="secondary" onClick={() => setStep(2)} className="flex-1 py-4 rounded-2xl">Back</Button>
                 <Button onClick={handleSubmit} disabled={!faceImage} className="flex-1 py-4 rounded-2xl">Finish Registry</Button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-white z-[200] flex flex-col font-['Plus_Jakarta_Sans']">
            <header className="px-6 py-6 flex items-center gap-4 bg-white border-b border-slate-50">
                <button onClick={onCancel} className="p-2.5 bg-slate-50 rounded-full text-slate-400 active:scale-90 transition-all">
                    <X size={20}/>
                </button>
                <div className="flex-1">
                    <span className="block font-black text-slate-900 tracking-tight leading-none">Onboarding</span>
                    <span className="text-[9px] font-black uppercase text-slate-300 tracking-[2px] mt-1">Network Access</span>
                </div>
                <div className="flex gap-1.5">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-4 bg-emerald-600' : 'w-1.5 bg-slate-100'}`}></div>
                    ))}
                </div>
            </header>
            
            <div className="flex-1 overflow-y-auto p-8 max-w-md mx-auto w-full no-scrollbar">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </div>
        </div>
    );
};
