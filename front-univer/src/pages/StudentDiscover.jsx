import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Calendar, ArrowRight, Ticket, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI } from '../services/api';

export default function StudentDiscover() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await eventsAPI.getPublic({ category: activeCategory, search: searchTerm });
                setEvents(res.data);
            } catch (err) {
                console.error('Failed to fetch events', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, [activeCategory, searchTerm]);

    return (
        <main className="w-full max-w-7xl mx-auto px-6 lg:px-10 py-10 animate-in fade-in duration-500">

            <div className="bg-gray-900 rounded-3xl p-10 text-white mb-12 relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-4xl font-bold mb-4">Discover Campus Events</h1>
                    <p className="text-gray-400 mb-8">Find workshops, clubs, and social gatherings happening near you.</p>
                    <div className="flex gap-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input type="text" placeholder="Search for an event..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-500 px-6 py-4 rounded-xl font-bold transition-colors shadow-lg flex items-center gap-2">
                            <Filter size={20} /> Filters
                        </button>
                    </div>
                </div>
                <div className="absolute right-0 top-0 w-1/2 h-full opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 100% 0%, #3b82f6 0%, transparent 70%)' }}></div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Categories</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 mb-10 no-scrollbar">
                {['All', 'Academic', 'Technology', 'Workshop', 'Sports', 'Arts & Culture', 'Career', 'Social'].map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-3 border rounded-full font-bold text-sm transition-colors whitespace-nowrap shadow-sm ${activeCategory === cat ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600'}`}>
                        {cat}
                    </button>
                ))}
            </div>

            <div className="flex justify-between items-end mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
                <button onClick={() => { setSearchTerm(''); setActiveCategory('All'); }} className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1">See all <ArrowRight size={16}/></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {events.length > 0 ? events.map((event) => (
                    <div key={event.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                        <div className="h-48 relative overflow-hidden">
                            {event.imageUrl ? (
                                <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-4xl">{event.title.charAt(0)}</div>
                            )}
                        </div>
                        <div className="p-5 flex flex-col flex-grow">
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">{event.category}</span>
                            <h3 className="font-bold text-gray-900 mb-3 text-lg">{event.title}</h3>
                            <div className="space-y-2 mb-6">
                                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                    <Calendar size={14} className="text-gray-400" /> {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                    <MapPin size={14} className="text-gray-400" /> {event.location}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-gray-50">
                                <button onClick={() => navigate(`/student/discover/${event.id}/ticket`)} className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                                    <Ticket size={16} /> Get a ticket
                                </button>
                                <button onClick={() => navigate(`/student/discover/${event.id}`)} className="w-full py-2.5 bg-gray-50 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                                    <Info size={16} /> More details
                                </button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500 font-medium">{loading ? 'Loading events...' : 'No events found matching your search.'}</p>
                    </div>
                )}
            </div>
        </main>
    );
}
