
import React from 'react';
import { Ruler, Maximize } from 'lucide-react';

interface LandVisualizerProps {
  size: number;
  unit: string;
  dimensions?: string;
  className?: string;
}

export const LandVisualizer: React.FC<LandVisualizerProps> = ({ size, unit, dimensions, className = "" }) => {
  return (
    <div className={`relative bg-emerald-50 rounded-2xl md:rounded-[2.5rem] overflow-hidden flex flex-col items-center justify-center border-2 border-emerald-100/50 shadow-inner group ${className}`}>
      {/* 3D Isometric Plot Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      
      {/* Isometric Cube Shape for Land */}
      <div className="relative w-48 h-48 md:w-64 md:h-64 transition-transform duration-700 group-hover:scale-110">
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
          <path d="M100 30 L170 65 L100 100 L30 65 Z" fill="#34d399" /> {/* Top Surface */}
          <path d="M30 65 L100 100 L100 140 L30 105 Z" fill="#059669" /> {/* Left Side */}
          <path d="M170 65 L100 100 L100 140 L170 105 Z" fill="#065f46" /> {/* Right Side */}
          {/* Grid lines on surface */}
          <path d="M65 47 L135 83 M135 47 L65 83" stroke="white" strokeWidth="0.5" opacity="0.3" />
        </svg>
        
        {/* Dimension Callouts */}
        <div className="absolute top-[20%] right-0 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-lg border border-emerald-100 flex items-center gap-2 animate-bounce">
            <Ruler size={12} className="text-emerald-600"/>
            <span className="text-[10px] font-black text-emerald-900">{size} {unit}</span>
        </div>
      </div>

      <div className="absolute bottom-6 inset-x-0 flex flex-col items-center">
         <div className="bg-emerald-950 text-white px-6 py-2 rounded-full flex items-center gap-2 shadow-2xl border border-emerald-800">
            <Maximize size={14} className="text-emerald-400" />
            <span className="text-[9px] font-black uppercase tracking-widest">{dimensions || 'Standard Plot Dimensions'}</span>
         </div>
         <p className="text-[10px] font-bold text-emerald-800/40 uppercase tracking-[4px] mt-4">Authorized Land Map</p>
      </div>
    </div>
  );
};
