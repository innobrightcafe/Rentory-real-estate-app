
import React from 'react';
import { Heart, Compass } from 'lucide-react';
import { Card } from '../UI';

export const SavedGallery = ({ user, properties, onAddToHistory }: any) => {
    const favoriteProps = properties.filter((p: any) => user.favorites?.includes(p.id));

    return (
        <div className="py-12 space-y-12 animate-in fade-in max-w-6xl mx-auto pb-48 text-left">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 leading-tight">Your Collection</h2>
            {favoriteProps.length === 0 ? (
                <div className="text-center py-32 opacity-30">
                    <Heart size={80} className="mx-auto mb-6"/>
                    <p className="text-[12px] font-black uppercase tracking-[6px]">Gallery Empty</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {favoriteProps.map((prop: any) => (
                        <Card key={prop.id} onClick={() => onAddToHistory(prop.id)} className="relative group rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer">
                            <div className="aspect-square relative">
                                <img src={prop.images[0]} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                <div className="absolute bottom-8 left-8 right-8 text-white">
                                    <h3 className="text-xl font-black tracking-tight truncate leading-none">{prop.title}</h3>
                                    <p className="text-emerald-400 font-black tracking-tighter mt-2 text-lg">₦{prop.price.toLocaleString()}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
