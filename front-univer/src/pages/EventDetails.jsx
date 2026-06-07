import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, ArrowLeft, Ticket, Share2 } from 'lucide-react';
import { eventsAPI } from '../services/api';

export default function EventDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await eventsAPI.getOne(id);
                setEvent(res.data);
            } catch (err) {
                console.error('Failed to fetch event', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    if (loading) return <div className="flex items-center justify-center h-64"><p className="text-gray-500">Loading...</p></div>;
    if (!event) return <div className="flex items-center justify-center h-64"><p className="text-gray-500">Event not found</p></div>;

    return (
        <main className="w-full max-w-5xl mx-auto px-6 lg:px-10 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-8 group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Discover</span>
            </button>

            <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">
                <div className="h-80 w-full relative">
                    {event.imageUrl ? (
                        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-6xl">{event.title.charAt(0)}</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-8 left-8 right-8">
                        <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold uppercase tracking-widest rounded-full mb-4 inline-block">{event.category}</span>
                        <h1 className="text-4xl font-bold text-white">{event.title}</h1>
                    </div>
                </div>

                <div className="p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">About this Event</h2>
                        <p className="text-gray-600 leading-relaxed text-lg mb-8">{event.description || 'No description available.'}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600"><Calendar size={24} /></div>
                                <div><p className="text-sm font-bold text-gray-900">Date</p><p className="text-sm text-gray-500">{new Date(event.startDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600"><Clock size={24} /></div>
                                <div><p className="text-sm font-bold text-gray-900">Time</p><p className="text-sm text-gray-500">{new Date(event.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - {new Date(event.endDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p></div>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600"><MapPin size={24} /></div>
                                <div><p className="text-sm font-bold text-gray-900">Location</p><p className="text-sm text-gray-500">{event.location}</p></div>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600"><Users size={24} /></div>
                                <div><p className="text-sm font-bold text-gray-900">Capacity</p><p className="text-sm text-gray-500">{event.capacity > 0 ? `${event.capacity} spots` : 'Unlimited'}</p></div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <div className="p-6 bg-gray-900 rounded-2xl text-white shadow-lg">
                                <h3 className="text-xl font-bold mb-4 text-center">Interested?</h3>
                                <p className="text-gray-400 text-sm text-center mb-6">Secure your spot before it's too late!</p>
                                <button onClick={() => navigate(`/student/discover/${id}/ticket`)} className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 mb-4 group">
                                    <Ticket size={20} className="group-hover:rotate-12 transition-transform" /> Get Your Ticket
                                </button>
                                <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                                    <Share2 size={20} /> Share Event
                                </button>
                            </div>

                            {event.organizer && (
                                <div className="p-6 bg-white border border-gray-200 rounded-2xl">
                                    <h4 className="font-bold text-gray-900 mb-4">Organizer</h4>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                            {event.organizer.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{event.organizer.name}</p>
                                            <p className="text-xs text-gray-500">University Department</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
