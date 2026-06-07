import { useState, useEffect } from 'react';
import { Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { eventsAPI } from '../services/api';

export default function StudentCalendar() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await eventsAPI.getPublic();
                setEvents(res.data);
            } catch (err) {
                console.error('Failed to fetch events', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    // Group events by date
    const groupedByDate = events.reduce((acc, event) => {
        const dayName = new Date(event.startDate).toLocaleDateString('en-US', { weekday: 'short' });
        const month = new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' });
        const day = new Date(event.startDate).getDate();
        const key = `${day}-${month}`;

        if (!acc[key]) {
            acc[key] = { date: day, day: dayName, month, events: [] };
        }
        acc[key].events.push(event);
        return acc;
    }, {});

    const schedule = Object.values(groupedByDate);

    return (
        <main className="w-full max-w-7xl mx-auto px-6 lg:px-10 py-10 animate-in fade-in duration-500">

            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Campus Calendar</h1>
                    <p className="text-gray-500">Plan your week and never miss an important event.</p>
                </div>
                <div className="flex items-center gap-4 bg-white border border-gray-200 p-2 rounded-xl shadow-sm">
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"><ChevronLeft size={20} /></button>
                    <span className="font-bold text-gray-900 min-w-[120px] text-center">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"><ChevronRight size={20} /></button>
                </div>
            </div>

            <div className="space-y-8">
                {schedule.length > 0 ? schedule.map((dayBlock, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-32 flex-shrink-0">
                            <div className="sticky top-24 text-center md:text-right">
                                <span className="block text-sm font-bold text-blue-600 uppercase tracking-wider">{dayBlock.day}</span>
                                <span className="block text-4xl font-bold text-gray-900">{dayBlock.date}</span>
                                <span className="block text-sm font-medium text-gray-500">{dayBlock.month}</span>
                            </div>
                        </div>

                        <div className="flex-grow space-y-4">
                            {dayBlock.events.map(event => (
                                <div key={event.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group border-l-4 border-l-blue-600">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">{event.category}</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                            <Clock size={16} className="text-blue-500" /> {new Date(event.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - {new Date(event.endDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                            <MapPin size={16} className="text-blue-500" /> {event.location}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )) : (
                    <div className="py-20 text-center">
                        <p className="text-gray-500 font-medium">{loading ? 'Loading events...' : 'No upcoming events found.'}</p>
                    </div>
                )}
            </div>
        </main>
    );
}
