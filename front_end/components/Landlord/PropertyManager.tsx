
import React from 'react';
import { Plus, Trash2, Home, Map, Building2, PartyPopper, Edit3 } from 'lucide-react';
import { Card, Badge, Button } from '../UI';
import { LandVisualizer } from '../LandVisualizer';

export const PropertyManager = ({ myProperties, onDeleteProperty, onAddProperty, onManageProperty }: any) => {
    return (
        <div className="py-12 space-y-12 animate-in fade-in max-w-7xl mx-auto pb-48 text-left">
            <div className="flex justify-between items-end border-b border-slate-100 pb-8">
                <div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900">My Houses</h2>
                    <p className="text-slate-500 font-medium mt-1">Direct management of your rental properties and land.</p>
                </div>
                <Button onClick={onAddProperty} className="bg-emerald-950 text-white rounded-xl py-3 px-6 shadow-lg">
                    <Plus size={18} className="mr-2"/> Add Property
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {myProperties.map((prop: any) => (
                    <Card key={prop.id} className="group border border-slate-200 shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
                        <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
                            {prop.category === 'LAND' && prop.images.length === 0 ? (
                                <LandVisualizer 
                                    size={prop.landDetails?.size || 1} 
                                    unit={prop.landDetails?.unit || 'Plots'} 
                                    dimensions={prop.landDetails?.dimensions}
                                    className="h-full"
                                />
                            ) : (
                                <img src={prop.images[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                            )}
                            <div className="absolute top-4 left-4 flex gap-2">
                                <Badge color="emerald">{prop.status}</Badge>
                                <div className="p-2 bg-white/20 backdrop-blur-xl rounded-xl text-white">
                                    {prop.category === 'LAND' ? <Map size={16}/> : prop.category === 'COMMERCIAL' ? <Building2 size={16}/> : prop.category === 'EVENT_CENTER' ? <PartyPopper size={16}/> : <Home size={16}/>}
                                </div>
                            </div>
                        </div>
                        <div className="p-8">
                            <h3 className="font-black text-slate-900 text-xl truncate leading-tight">{prop.title}</h3>
                            <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest mt-1 mb-6">₦{prop.price.toLocaleString()}{prop.category === 'LAND' ? '' : '/month'}</p>
                            <div className="flex gap-2 pt-6 border-t border-slate-100">
                                <button onClick={() => onDeleteProperty(prop.id)} className="flex-1 py-4 text-rose-600 bg-rose-50 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-rose-100 active:scale-95 transition-all">Delete</button>
                                <button onClick={() => onManageProperty(prop)} className="flex-1 py-4 bg-emerald-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2">
                                    <Edit3 size={14}/> Manage
                                </button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
            
            <button 
                onClick={onAddProperty}
                className="w-full py-10 border-4 border-dashed border-slate-100 rounded-[3rem] text-slate-300 hover:text-emerald-600 hover:border-emerald-100 transition-all flex flex-col items-center justify-center group"
            >
                <Plus size={40} className="mb-4 group-hover:scale-125 transition-transform" />
                <span className="font-black uppercase tracking-[4px] text-xs">Add New Property to Portfolio</span>
            </button>
        </div>
    );
};
