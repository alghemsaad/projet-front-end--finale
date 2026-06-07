import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Search, Filter, Plus,
    Calendar, MapPin, Users, Edit2, Trash2, ChevronRight
} from 'lucide-react';
import { eventsAPI } from '../services/api';

export default function EventManager() {
    const [activeTab, setActiveTab] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await eventsAPI.getByOrganizer({ status: activeTab, search: searchTerm });
                setEvents(res.data);
            } catch (err) {
                console.error('Failed to fetch events', err);
            }
        };
        fetchEvents();
    }, [activeTab, searchTerm]);

    const deleteEvent = async (id) => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            try {
                await eventsAPI.delete(id);
                setEvents(events.filter(e => e.id !== id));
            } catch (err) {
                console.error('Failed to delete event', err);
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700';
            case 'draft': return 'bg-gray-100 text-gray-700';
            case 'past': return 'bg-blue-100 text-blue-700';
            case 'completed': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    return (
        <div className="p-10 max-w-7xl mx-auto">

            <header className="flex justify-between items-end mb-8">
                <div>
                    <nav className="flex items-center gap-2 text-gray-500 mb-2">
                        <span className="text-xs font-medium">Organizer Portal</span>
                        <ChevronRight size={14} />
                        <span className="text-xs font-bold text-gray-900">Event Manager</span>
                    </nav>
                    <h2 className="text-3xl font-bold text-gray-900">Event Manager</h2>
                    <p className="text-gray-500 mt-1">View, edit, and manage all your campus events.</p>
                </div>
                <Link
                    to="/organizer/events/new"
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold hover:bg-blue-700 transition-all shadow-md"
                >
                    <Plus size={20} />
                    Create New Event
                </Link>
            </header>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">

                    <div className="flex gap-2 bg-gray-50 p-1 rounded-lg">
                        {['All', 'Active', 'Drafts', 'Past'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${
                                    activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-grow md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search events..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-sm"
                            />
                        </div>
                        <button className="px-4 py-2.5 border border-gray-200 rounded-xl flex items-center gap-2 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium">
                            <Filter size={16} /> Filter
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Event Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Registrations</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {events.map((event) => (
                            <tr key={event.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
                                            {event.title.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{event.title}</p>
                                            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                <MapPin size={12} /> {event.location}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                        <Calendar size={16} className="text-gray-400" />
                                        {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {new Date(event.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${getStatusColor(event.status)}`}>
                                      {getStatusLabel(event.status)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Users size={16} className="text-gray-400" />
                                        <span className="text-sm font-bold text-gray-900">{event.registeredCount}</span>
                                        <span className="text-xs font-medium text-gray-400">/ {event.capacity || '∞'}</span>
                                    </div>
                                    <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-2">
                                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${event.capacity > 0 ? (event.registeredCount / event.capacity) * 100 : 0}%` }}></div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2 text-gray-400">
                                        <button className="hover:text-blue-600 p-1.5 transition-colors rounded-lg hover:bg-blue-50"><Edit2 size={16} /></button>
                                        <Link to="/organizer/participants" className="hover:text-blue-600 p-1.5 transition-colors rounded-lg hover:bg-blue-50"><Users size={16} /></Link>
                                        <button
                                            onClick={() => deleteEvent(event.id)}
                                            className="hover:text-red-600 p-1.5 transition-colors rounded-lg hover:bg-red-50"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 bg-white border-t border-gray-100 flex justify-between items-center">
                    <p className="text-xs font-medium text-gray-500">Showing {events.length} events</p>
                </div>
            </div>
        </div>
    );
}
