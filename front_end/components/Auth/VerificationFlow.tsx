
import React, { useState, useRef } from 'react';
import { Camera, Upload, Check, User, ScanFace, ChevronRight, ShieldCheck, Navigation, X } from 'lucide-react';
import { Button, Input } from '../UI';
import { VerificationRequest, UserRole } from '../../types';

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
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) {
            alert("Camera access denied.");
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

    return (
        <div className="fixed inset-0 bg-white z-[200] flex flex-col font-['Plus_Jakarta_Sans']">
            <header className="px-6 py-6 flex items-center gap-4 border-b border-slate-100 bg-white">
                <button onClick={onCancel} className="p-2.5 bg-slate-100 rounded-full text-slate-600 hover:text-slate-900 transition-colors"><X size={20}/></button>
                <div className="flex-1 text-left">
                    <span className="block font-black text-slate-900 tracking-tight leading-none">Onboarding</span>
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-[2px] mt-1">Network Access</span>
                </div>
                <div className="flex gap-1.5">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-4 bg-emerald-600' : 'w-1.5 bg-slate-300'}`}></div>
                    ))}
                </div>
            </header>
            
            <div className="flex-1 overflow-y-auto p-8 max-w-md mx-auto w-full no-scrollbar">
                {step === 1 && (
                    <div className="space-y-6 text-left animate-in fade-in slide-in-from-bottom-4">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Designation</h2>
                        <div className="space-y-3">
                            {[UserRole.TENANT, UserRole.LANDLORD, UserRole.TOUR_GUIDE].map(r => (
                                <button key={r} onClick={() => setRole(r)} className={`w-full p-6 rounded-3xl border-2 transition-all flex items-center justify-between ${role === r ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={role === r ? 'text-emerald-600' : 'text-slate-500'}>
                                            {r === UserRole.TENANT ? <User size={24}/> : r === UserRole.LANDLORD ? <ShieldCheck size={24}/> : <Navigation size={24}/>}
                                        </div>
                                        <div className="text-left">
                                            <p className={`font-black text-lg tracking-tight leading-none ${role === r ? 'text-emerald-950' : 'text-slate-900'}`}>{r}</p>
                                        </div>
                                    </div>
                                    {role === r && <Check size={20} className="text-emerald-600"/>}
                                </button>
                            ))}
                        </div>
                        <div className="space-y-4 pt-4">
                            <Input placeholder="Full Legal Name" value={formData.name} onChange={(e: any) => setFormData({...formData, name: e.target.value})} />
                            <Input placeholder="Email Address" value={formData.email} onChange={(e: any) => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <Button onClick={() => setStep(2)} disabled={!formData.name || !formData.email} className="w-full mt-4">Next Step <ChevronRight size={20}/></Button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 text-left animate-in fade-in slide-in-from-bottom-4">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Identity</h2>
                        <div className="aspect-[1.6/1] relative group border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center bg-slate-50 overflow-hidden">
                            <input type="file" accept="image/*" onChange={handleIdUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                            {idImage ? <img src={idImage} className="w-full h-full object-contain" /> : <div className="text-center"><Upload size={40} className="mx-auto text-slate-400 mb-2"/><p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Upload ID Card</p></div>}
                        </div>
                        <div className="flex gap-4">
                             <Button variant="ghost" onClick={() => setStep(1)} className="flex-1">Back</Button>
                             <Button onClick={() => setStep(3)} disabled={!idImage} className="flex-1">Next Step</Button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 text-left animate-in fade-in slide-in-from-bottom-4">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Audit</h2>
                        <div className="aspect-square bg-slate-900 rounded-[3rem] overflow-hidden relative border-4 border-white shadow-2xl">
                             {isScanning ? (
                                <>
                                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 flex items-end justify-center pb-8">
                                        <button onClick={captureFace} className="w-16 h-16 rounded-full border-4 border-white bg-emerald-600 shadow-2xl active:scale-90 transition-all"></button>
                                    </div>
                                </>
                             ) : faceImage ? (
                                <img src={faceImage} className="w-full h-full object-cover" />
                             ) : (
                                <div className="flex flex-col items-center justify-center h-full text-white p-10 text-center">
                                    <ScanFace size={60} className="mb-6 text-emerald-400"/>
                                    <Button onClick={startCamera} className="bg-white text-emerald-950 px-8">Scan Face</Button>
                                </div>
                             )}
                        </div>
                        <div className="flex gap-4">
                             <Button variant="ghost" onClick={() => setStep(2)} className="flex-1">Back</Button>
                             <Button onClick={handleSubmit} disabled={!faceImage} className="flex-1">Complete</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
