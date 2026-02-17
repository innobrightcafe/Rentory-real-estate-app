
import React, { useState } from 'react';
import { X, Loader2, CreditCard, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface PaystackModalProps {
  order: { id: string; title: string; amount: number; customerName: string };
  onClose: () => void;
  onSuccess: () => void;
}

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export const PaystackModal: React.FC<PaystackModalProps> = ({ order, onClose, onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePaystackPayment = () => {
    setIsProcessing(true);
    setErrorMessage(null);

    const publicKey = process.env.PAYSTACK_PUBLIC_KEY;

    // SIMULATION MODE if key is missing
    if (!publicKey || publicKey === "your_paystack_public_key") {
      setTimeout(() => {
          setIsProcessing(false);
          setIsSuccess(true);
          setTimeout(() => {
              onSuccess();
          }, 1500);
      }, 2000);
      return;
    }

    const handler = window.PaystackPop.setup({
      key: publicKey,
      email: `${order.customerName.replace(/\s+/g, '').toLowerCase()}@rentory.com`,
      amount: order.amount * 100, 
      currency: "NGN",
      ref: `RT-${Date.now()}`,
      metadata: {
        custom_fields: [{ display_name: "Property ID", variable_name: "property_id", value: order.id }]
      },
      callback: async (response: any) => {
        onSuccess();
      },
      onClose: () => setIsProcessing(false)
    });

    handler.openIframe();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-emerald-950/40 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-xl border border-white/40 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.2)] overflow-hidden">
        <div className="px-10 py-8 flex justify-between items-center border-b border-white/20 bg-white/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-[12px] font-black">P</div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-950">Gateway Node</span>
          </div>
          {!isProcessing && !isSuccess && <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors"><X size={24} /></button>}
        </div>
        <div className="p-12 text-center">
            {isSuccess ? (
                <div className="animate-in zoom-in-50 duration-500">
                    <CheckCircle2 size={80} className="mx-auto text-emerald-500 mb-6"/>
                    <h3 className="text-2xl font-black text-emerald-950 tracking-tighter">Mission Authorized</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase mt-2 tracking-widest">Redirecting to Secure Hub...</p>
                </div>
            ) : (
                <>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[4px] mb-2">Checkout Total</p>
                    <h3 className="text-5xl font-black text-emerald-950 tracking-tighter mb-4">₦{order.amount.toLocaleString()}</h3>
                    <p className="text-xs font-bold text-slate-500 mb-10 leading-relaxed px-4">{order.title}</p>
                  
                  {errorMessage && <div className="mb-6 p-4 bg-red-50 text-red-600 text-[10px] font-bold uppercase rounded-2xl">{errorMessage}</div>}
                  
                  <button 
                    disabled={isProcessing}
                    onClick={handlePaystackPayment} 
                    className="w-full py-6 bg-emerald-950 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                  >
                    {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Authorizing...</> : <><CreditCard size={20} /> Authorize Transaction</>}
                  </button>
                  
                  <div className="flex items-center justify-center gap-3 mt-12 opacity-30">
                    <ShieldCheck size={20} />
                    <span className="text-[9px] font-black uppercase tracking-[4px]">256-bit Secure Node</span>
                  </div>
                </>
            )}
        </div>
      </div>
    </div>
  );
};
