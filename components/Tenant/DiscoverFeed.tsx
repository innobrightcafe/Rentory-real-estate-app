
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Heart, ChevronRight, Sparkles } from 'lucide-react';
import { Property, MatchResult } from '../../types';
import { Card, Badge, LoadingScreen } from '../UI';
import { calculateMatchScore } from '../../services/geminiService';

export const DiscoverFeed = ({ user, properties, onUnlockProperty, onAddToHistory, onToggleFavorite }: any) => {
    const [feed, setFeed] = useState<(Property & { match?: MatchResult })[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchMatches = async () => {
            setLoading(true);
            const results = await Promise.all(properties.map(async (p: Property) => {
                const match = await calculateMatchScore(user.preferences || "", `${p.title} ${p.description}`);
                return { ...p, match };
            }));
            setFeed(results.sort((a, b) => (b.match?.score || 0) - (a.match?.score || 0)));
            setLoading(false);
        };
        fetchMatches();
    }, [properties, user.preferences]);

    if (loading) return <LoadingScreen message="AI Orchestrating Matches..." />;

    return (
        <div className="py-8 space-y-8 animate-in fade-in max-w-6xl mx-auto pb-48 text-left">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-100 pb-8">
                <div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 leading-tight">Curated Nodes</h2>
                    <p className="text-slate-500 font-medium text-sm md:text-lg">AI-mapped assets based on your architectural preferences.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {feed.map(prop => (
                    <Card key={prop.id} className="group relative border border-slate-200 shadow-sm bg-white rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all cursor-pointer" onClick={() => onAddToHistory(prop.id)}>
                        <div className="aspect-[4/3] relative overflow-hidden">
                            <img src={prop.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                            <div className="absolute top-4 left-4"><Badge color="emerald">{prop.match?.score}% MATCH</Badge></div>
                            <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(prop.id); }} className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20">
                                <Heart size={20} className={user.favorites?.includes(prop.id) ? 'fill-rose-500 text-rose-500' : ''}/>
                            </button>
                        </div>
                        <div className="p-8">
                            <h3 className="font-black text-slate-900 text-xl truncate">{prop.title}</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 mb-6 flex items-center gap-2">
                                <MapPin size={14} className="text-emerald-600"/> {prop.address.split(',')[0]}
                            </p>
                            <p className="text-2xl font-black text-emerald-800 tracking-tighter mb-8">₦{prop.price.toLocaleString()}<span className="text-xs text-slate-400 font-medium">/mo</span></p>
                            <div className="flex gap-2">
                                <button onClick={(e) => { e.stopPropagation(); onUnlockProperty(prop.id); }} className="flex-1 py-4 bg-emerald-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95">Unlock Agent</button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
