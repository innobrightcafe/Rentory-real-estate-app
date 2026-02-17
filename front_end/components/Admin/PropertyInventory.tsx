
import React, { useState } from 'react';
import { Trash2, Users, Navigation, ShieldCheck, X, CheckCircle } from 'lucide-react';
import { Card, Badge, Button } from '../UI';
import { MOCK_GUIDES } from '../../constants';

export const PropertyInventory = ({ properties, onDeleteProperty, onAuditOwner }: any) => {
    const [auditProp, setAuditProp] = useState<any>(null);

    return (
        <div className="py-6 md:py-12 space-y-8 animate-in fade-in max-w-7xl mx-auto text-left">
            <h2 className="text-2xl md:text-5xl font-black tracking-tighter text-slate-900 leading-tight mb-8">Ecosystem Inventory</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map((prop: any) => (
                    <Card key={prop.id} className="group border border-slate-200 shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
                        <div className="aspect-[4/3] relative overflow-hidden">
                            <img src={prop.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={prop.title}/>
                            <div className="absolute top-4 left-4 flex gap-2">
                                <Badge color="emerald">{prop.status}</Badge>
                                <div className="p-2 bg-white/20 backdrop-blur-xl rounded-xl text-white">
                                    <ShieldCheck size={16}/>
                                </div>
                            </div>
                        </div>
                        <div className="p-8">
                            <h3 className="font-black text-slate-900 truncate text-xl mb-1">{prop.title}</h3>
                            <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-6">₦{prop.price.toLocaleString()}/mo</p>
                            
                            <div className="bg-slate-50 p-4 rounded-2xl mb-6 flex items-center justify-between border border-slate-100">
                                <div className="flex items-center gap-2">
                                    <Navigation size={14} className="text-amber-600"/>
                                    <span className="text-[10px] font-black uppercase text-slate-400">Assigned Guide:</span>
                                </div>
                                <span className="text-[10px] font-black uppercase text-slate-900">{prop.assignedGuideId ? 'ACTIVE UNIT' : 'NONE'}</span>
                            </div>

                            <div className="flex flex-col gap-2 pt-6 border-t border-slate-100">
                                <div className="flex gap-2">
                                    <button onClick={() => setAuditProp(prop)} className="flex-1 py-4 bg-emerald-950 text-white rounded-2xl active:scale-95 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl">
                                        <Navigation size={16}/> Perimeter Audit
                                    </button>
                                    <button onClick={() => onAuditOwner(prop.landlordId)} className="p-4 bg-slate-50 text-slate-900 rounded-2xl active:scale-95 border border-slate-200">
                                        <Users size={16}/>
                                    </button>
                                </div>
                                <button onClick={() => onDeleteProperty(prop.id)} className="w-full py-4 text-rose-600 bg-rose-50 rounded-2xl active:scale-95 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-rose-100">
                                    <Trash2 size={16}/> Remove Asset
                                </button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Audit Modal */}
            {auditProp && (
              <div className="fixed inset-0 z-[1000] bg-emerald-950/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in">
                  <Card className="w-full max-w-xl bg-white p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                      <button onClick={() => setAuditProp(null)} className="absolute top-8 right-8 text-slate-300 hover:text-emerald-950 transition-colors"><X/></button>
                      
                      <div className="text-left mb-10">
                          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Perimeter Audit</h2>
                          <p className="text-slate-400 font-medium text-sm mt-1">Dispatch the nearest guide for inspection of {auditProp.title}.</p>
                      </div>

                      <div className="space-y-4">
                          <p className="text-[10px] font-black uppercase tracking-[5px] text-emerald-600 px-2">Guides in Territory</p>
                          {MOCK_GUIDES.slice(0, 3).map(guide => (
                            <div key={guide.id} className="p-6 bg-slate-50 rounded-[2.5rem] flex items-center justify-between border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer group">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-emerald-950 text-white rounded-2xl flex items-center justify-center font-black text-xl">
                                        {guide.name.charAt(0)}
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-black text-slate-900">{guide.name}</h3>
                                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Proximal Unit • {guide.rating} ★</p>
                                    </div>
                                </div>
                                <button onClick={() => {alert(`Guide ${guide.name} dispatched!`); setAuditProp(null);}} className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-90 transition-all">
                                    <Navigation size={20}/>
                                </button>
                            </div>
                          ))}
                      </div>

                      <div className="mt-12 pt-8 border-t border-slate-50 text-center">
                          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Mission authorized by platform administrator</p>
                      </div>
                  </Card>
              </div>
            )}
        </div>
    );
};
