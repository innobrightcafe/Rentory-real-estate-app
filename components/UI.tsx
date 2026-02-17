
import React, { useState, useEffect } from 'react';

export const EnhancedImage = ({ src, alt, className = "", objectFit = "cover" }: { src: string, alt?: string, className?: string, objectFit?: "cover" | "contain" }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
      {/* Shimmer Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] shadow-inner" />
      )}
      
      {/* The Prestige Image */}
      <img
        src={src}
        alt={alt || "Property"}
        onLoad={() => setIsLoaded(true)}
        className={`
          w-full h-full transition-all duration-1000 ease-out
          ${objectFit === 'cover' ? 'object-cover' : 'object-contain'}
          ${isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-sm'}
          [filter:contrast(1.06)_brightness(1.03)_saturate(1.05)_sharpness(1.1)]
        `}
        style={{
          // Custom sharpening filter simulation
          filter: isLoaded ? 'contrast(1.08) brightness(1.02) saturate(1.1)' : 'none'
        }}
      />
      
      {/* Glass Gloss Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/10 via-transparent to-white/5 opacity-40 mix-blend-overlay" />
    </div>
  );
};

export const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }: any) => {
  const baseStyle = "px-4 md:px-6 py-2.5 md:py-4 rounded-xl md:rounded-2xl font-bold uppercase tracking-widest text-[10px] md:text-[11px] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 shadow-md hover:shadow-xl border-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-emerald-950 text-white border-emerald-950 hover:bg-black",
    secondary: "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700",
    outline: "bg-white text-emerald-950 border-emerald-950 hover:bg-emerald-50",
    ghost: "bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300",
    danger: "bg-rose-700 text-white border-rose-800 hover:bg-rose-800"
  };

  const selectedVariant = variants[variant as keyof typeof variants] || variants.primary;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${selectedVariant} ${className}`}
    >
      {children}
    </button>
  );
};

export const Card = ({ children, className = '', onClick }: any) => {
  const hasBg = className.includes('bg-');
  const bgClass = hasBg ? '' : 'bg-white';
  
  return (
    <div 
      onClick={onClick}
      className={`${bgClass} rounded-2xl md:rounded-[2.5rem] shadow-[0_4px_15px_rgba(0,0,0,0.05)] border-2 border-slate-100 overflow-hidden transition-all duration-300 ${onClick ? 'cursor-pointer active:scale-[0.99] hover:border-emerald-950/20 hover:shadow-lg' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export const Badge = ({ children, color = 'emerald' }: any) => {
    const colors: any = {
        emerald: 'bg-emerald-50 text-emerald-950 border-emerald-200/50',
        indigo: 'bg-indigo-50 text-indigo-950 border-indigo-200/50',
        amber: 'bg-amber-50 text-amber-950 border-amber-200/50',
        gray: 'bg-slate-100 text-slate-950 border-slate-200/50'
    }
    return (
        <span className={`px-2.5 py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest border shadow-sm ${colors[color] || colors.emerald}`}>
            {children}
        </span>
    )
}

export const NotificationBadge = ({ count, className = "" }: { count: number, className?: string }) => {
  if (count <= 0) return null;
  return (
    <span className={`absolute bg-rose-600 text-white text-[9px] font-black w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in-50 ${className}`}>
      {count > 9 ? '9+' : count}
    </span>
  );
};

export const Input = ({ value, onChange, placeholder, type = "text", className = "", readOnly = false, onKeyDown }: any) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    readOnly={readOnly}
    onKeyDown={onKeyDown}
    className={`w-full px-4 md:px-6 py-3 md:py-5 rounded-xl md:rounded-2xl bg-white border-2 border-slate-300 focus:outline-none focus:border-emerald-950 transition-all text-slate-950 text-sm md:text-base font-bold placeholder:text-slate-500 shadow-sm ${readOnly ? 'bg-slate-50 cursor-not-allowed opacity-80' : ''} ${className}`}
  />
);

export const LoadingScreen = ({ message = "Analyzing Network..." }: { message?: string }) => (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-2xl z-[500] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500 p-8 text-center">
        {/* Glassmorphic Container */}
        <div className="relative w-full max-w-sm p-12 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[3rem] shadow-2xl flex flex-col items-center gap-8 overflow-hidden">
            {/* Animated Glow behind the scanner */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-emerald-500/20 blur-[60px] animate-pulse"></div>

            {/* AI Scanning Visual */}
            <div className="relative w-24 h-24 md:w-32 md:h-32">
                <div className="absolute inset-0 rounded-full border-[3px] border-white/10"></div>
                <div className="absolute inset-0 rounded-full border-[3px] border-emerald-400 border-t-transparent animate-spin duration-[1.5s]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 bg-emerald-400 rounded-full animate-ping"></div>
                </div>
                {/* Horizontal Scanning Line */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent top-0 animate-[scan_2s_infinite_ease-in-out]"></div>
            </div>

            <div className="space-y-3 relative z-10">
                <p className="text-emerald-400 font-black uppercase tracking-[5px] text-[10px] animate-pulse">{message}</p>
                <div className="h-1.5 w-48 bg-white/10 rounded-full overflow-hidden mx-auto">
                    <div className="h-full bg-emerald-400 animate-[progress_3s_infinite_linear] shadow-[0_0_10px_#10b981]"></div>
                </div>
                <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest pt-2">Rentory AI Node v2.0</p>
            </div>
        </div>

        <style>{`
          @keyframes scan {
            0%, 100% { transform: translateY(0); opacity: 0; }
            50% { transform: translateY(96px); opacity: 1; }
          }
          @keyframes progress {
            0% { width: 0%; transform: translateX(-100%); }
            100% { width: 100%; transform: translateX(100%); }
          }
        `}</style>
    </div>
);
