import { useState, useEffect } from 'react';
import { MapPin, QrCode, XCircle, Lock, X, Download } from 'lucide-react';
import { registrationsAPI } from '../services/api';

export default function StudentDashboard() {
    const [activeTab, setActiveTab] = useState('Upcoming');
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    const [qrPattern] = useState(() =>
        [...Array(400)].map((_, i) => ({
            id: i,
            filled: Math.random() > 0.5,
        }))
    );

    useEffect(() => {
        const fetchRegistrations = async () => {
            try {
                const res = await registrationsAPI.getMy();
                setRegistrations(res.data);
            } catch (err) {
                console.error('Failed to fetch registrations', err);
            } finally {
                setLoading(false);
            }
        };
        fetchRegistrations();
    }, []);

    const openTicket = (reg) => {
        setSelectedTicket(reg);
        setIsTicketModalOpen(true);
    };

    const cancelRegistration = async (id) => {
        if (window.confirm("Are you sure you want to cancel this registration?")) {
            try {
                await registrationsAPI.cancel(id);
                setRegistrations(registrations.filter(reg => reg.id !== id));
            } catch (err) {
                console.error('Failed to cancel registration', err);
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'waitlisted': return 'bg-yellow-100 text-yellow-800';
            case 'pending': return 'bg-orange-100 text-orange-800';
            case 'validated': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <main className="w-full max-w-7xl mx-auto px-6 lg:px-10 py-10 animate-in fade-in duration-500">
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">My Registrations</h1>
                    <p className="text-lg text-gray-500 max-w-2xl">Manage your upcoming campus events, view tickets, and stay connected with the student community.</p>
                </div>
                <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xl">
                    {['Upcoming', 'Past Events'].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === tab ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:bg-gray-200'}`}>
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {registrations.length > 0 ? registrations.map((reg) => (
                    <div key={reg.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group">
                        <div className="relative h-48 w-full overflow-hidden">
                            {reg.event?.imageUrl ? (
                                <img src={reg.event.imageUrl} alt={reg.event?.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-4xl">{reg.event?.title?.charAt(0) || '?'}</div>
                            )}
                            <div className="absolute top-3 right-3 flex flex-col items-center justify-center w-14 h-16 bg-gray-900 text-white rounded-xl shadow-md">
                                <span className="text-[10px] font-bold uppercase tracking-wider">{new Date(reg.event?.startDate).toLocaleDateString('en-US', { month: 'short' })}</span>
                                <span className="text-xl font-bold leading-none">{new Date(reg.event?.startDate).getDate()}</span>
                            </div>
                        </div>
                        <div className="p-6 flex-grow flex flex-col">
                            <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full w-fit mb-3 ${getStatusColor(reg.status)}`}>{reg.status}</span>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{reg.event?.title}</h3>
                            <p className="text-sm text-gray-500 flex items-center gap-2 mb-6"><MapPin size={16} /> {reg.event?.location}</p>

                            <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100">
                                {(reg.status === 'confirmed' || reg.status === 'validated') ? (
                                    <button onClick={() => openTicket(reg)} className="flex-grow py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                                        <QrCode size={18} /> View QR Ticket
                                    </button>
                                ) : (
                                    <button disabled className="flex-grow py-2.5 bg-gray-100 text-gray-400 rounded-xl font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2">
                                        <Lock size={18} /> Ticket Pending
                                    </button>
                                )}
                                <button onClick={() => cancelRegistration(reg.id)} className="p-2.5 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors">
                                    <XCircle size={22} />
                                </button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500 font-medium">{loading ? 'Loading...' : 'No registrations found.'}</p>
                    </div>
                )}
            </div>

            {isTicketModalOpen && selectedTicket && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-gray-900 p-6 text-white flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold">Your Ticket</h2>
                                <p className="text-sm text-gray-400 mt-1">{selectedTicket.event?.title}</p>
                            </div>
                            <button onClick={() => setIsTicketModalOpen(false)} className="text-gray-400 hover:text-white transition-colors"><X size={24} /></button>
                        </div>
                        <div className="p-8 flex flex-col items-center gap-6">
                            <div className="p-4 bg-white border-2 border-gray-100 rounded-2xl shadow-sm">
                                <div className="w-48 h-48 bg-white flex flex-wrap gap-0.5 overflow-hidden">
                                    {qrPattern.map((cell) => (
                                        <div key={cell.id} className={`w-2 h-2 rounded-[1px] ${cell.filled ? 'bg-gray-900' : 'bg-transparent'}`}></div>
                                    ))}
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Ticket ID</p>
                                <p className="text-2xl font-bold text-gray-900 tracking-tight">{selectedTicket.ticketId}</p>
                            </div>
                            <p className="text-sm text-gray-500 text-center leading-relaxed">
                                Please show this QR code at the entrance of <br/>
                                <span className="font-bold text-gray-900">{selectedTicket.event?.location}</span>.
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
                            <button onClick={() => window.print()} className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-2">
                                <Download size={18} /> Download Ticket
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
