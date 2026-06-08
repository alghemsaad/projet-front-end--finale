import { useState, useEffect } from 'react';
import {
    ChevronRight, QrCode, Search, Download,
    MoreVertical, CheckCircle, Clock, Sparkles, Users, AlertCircle
} from 'lucide-react';
import { useScanner } from '../context/ScannerContext';
import { participantsAPI, eventsAPI } from '../services/api';

export default function Participants() {
    const { openScanner, lastCheckIn, lastScannedData } = useScanner();
    const [currentPage, setCurrentPage] = useState(1);
    const [participants, setParticipants] = useState([]);
    const [stats, setStats] = useState({ total: 0, checkedIn: 0, pending: 0 });
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationData, setNotificationData] = useState(null);
    const [debugError, setDebugError] = useState(null);
    const [debugLoading, setDebugLoading] = useState(false);
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [eventsLoading, setEventsLoading] = useState(true);
    const itemsPerPage = 5;

    // Fetch available events
    useEffect(() => {
        const fetchEvents = async () => {
            setEventsLoading(true);
            try {
                console.log('📡 Fetching events...');
                const eventsRes = await eventsAPI.getByOrganizer();
                console.log('✅ Events fetched:', eventsRes.data);
                setEvents(eventsRes.data);
                
                // Auto-select first event if available
                if (eventsRes.data && eventsRes.data.length > 0) {
                    setSelectedEventId(eventsRes.data[0].id);
                }
            } catch (err) {
                const errorMsg = `Failed to fetch events: ${err.message}`;
                console.error('❌', errorMsg, err);
                setDebugError(errorMsg);
            } finally {
                setEventsLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const fetchData = async () => {
        if (!selectedEventId) return;
        
        setDebugLoading(true);
        setDebugError(null);
        try {
            console.log(`📡 Fetching participants for event ${selectedEventId}...`);
            const [participantsRes, statsRes] = await Promise.all([
                participantsAPI.getByEvent(selectedEventId),
                participantsAPI.getEventStats(selectedEventId),
            ]);
            console.log('✅ Participants fetched:', participantsRes.data);
            console.log('✅ Stats fetched:', statsRes.data);
            setParticipants(participantsRes.data);
            setStats(statsRes.data);
        } catch (err) {
            const errorMsg = `Failed to fetch participants: ${err.message}`;
            console.error('❌', errorMsg, err);
            setDebugError(errorMsg);
        } finally {
            setDebugLoading(false);
        }
    };

    // Fetch participants when selectedEventId changes
    useEffect(() => {
        if (selectedEventId) {
            fetchData();
        }
    }, [selectedEventId]);

    // Refetch when a QR scan check-in happens
    useEffect(() => {
        if (lastCheckIn || lastScannedData) {
            console.log('🔔 Check-in detected:', { lastCheckIn, lastScannedData });
            setIsRefreshing(true);
            setShowNotification(true);
            
            // Find the newly checked-in participant
            const fetchUpdatedData = async () => {
                try {
                    const [participantsRes, statsRes] = await Promise.all([
                        participantsAPI.getByEvent(selectedEventId),
                        participantsAPI.getEventStats(selectedEventId),
                    ]);
                    console.log('🔄 Updated participants:', participantsRes.data);

                    // Find the newly checked-in or scanned participant
                    const targetId = lastCheckIn?.registrationId || lastScannedData?.id;
                    const newParticipant = participantsRes.data.find(p => p.id === targetId);
                    console.log(`Looking for participant ${targetId}, found:`, newParticipant);

                    if (newParticipant) {
                        setNotificationData(newParticipant);
                    }
                    setParticipants(participantsRes.data);
                    setStats(statsRes.data);
                } catch (err) {
                    console.error('❌ Failed to fetch updated participants', err);
                } finally {
                    setTimeout(() => {
                        setIsRefreshing(false);
                        setShowNotification(false);
                    }, 3000);
                }
            };
            fetchUpdatedData();
        }
    }, [lastCheckIn, lastScannedData]);

    const totalPages = Math.ceil(participants.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentParticipants = participants.slice(indexOfFirstItem, indexOfLastItem);

    const exportToCSV = async () => {
        if (!selectedEventId) return;
        try {
            const res = await participantsAPI.exportCSV(selectedEventId);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'participants.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Failed to export CSV', err);
        }
    };

    const handleCheckIn = async (id) => {
        try {
            await participantsAPI.checkIn(id);
            setParticipants(participants.map(p => p.id === id ? { ...p, checkedIn: true, status: 'validated' } : p));
            setStats({ ...stats, checkedIn: stats.checkedIn + 1, pending: stats.pending - 1 });
        } catch (err) {
            console.error('Failed to check in', err);
        }
    };

    return (
        <div className="p-10 max-w-7xl mx-auto relative">

            <header className="flex justify-between items-end mb-8">
                <div>
                    <nav className="flex items-center gap-2 text-gray-500 mb-2">
                        <span className="text-xs font-medium">Events</span>
                        <ChevronRight size={14} />
                        <span className="text-xs font-bold text-gray-900">Participants</span>
                    </nav>
                    <h2 className="text-3xl font-bold text-gray-900">Participants</h2>
                    <p className="text-gray-500 mt-1">Manage registrations and check-in status for all attendees.</p>
                </div>
                <div className="flex gap-3">
                    {/* Event Selector */}
                    <select 
                        value={selectedEventId || ''} 
                        onChange={(e) => setSelectedEventId(Number(e.target.value))}
                        disabled={eventsLoading || events.length === 0}
                        className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-sm font-medium bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                        {eventsLoading ? (
                            <option value="">Loading events...</option>
                        ) : events.length === 0 ? (
                            <option value="">No events available</option>
                        ) : (
                            events.map(event => (
                                <option key={event.id} value={event.id}>
                                    {event.title || event.name}
                                </option>
                            ))
                        )}
                    </select>
                    <button 
                        onClick={() => selectedEventId && openScanner(selectedEventId)} 
                        disabled={!selectedEventId}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold hover:bg-blue-700 transition-all shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <QrCode size={20} /> Scan QR Code
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Attendance Progress</span>
                        <span className="font-bold text-gray-900">{stats.checkedIn} / {stats.total} <span className="text-gray-400 font-medium text-sm">({stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0}%)</span></span>
                    </div>
                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${stats.total > 0 ? (stats.checkedIn / stats.total) * 100 : 0}%` }}></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Pending</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pending} Students</p>
                    </div>
                </div>
            </div>

            <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 ${
                isRefreshing ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
            }`}>
                {/* DEBUG SECTION */}
                {(debugError || lastScannedData) && (
                    <div className="p-4 border-b border-gray-200 bg-amber-50 space-y-2">
                        {debugError && (
                            <div className="text-sm text-red-700 bg-red-50 p-2 rounded border border-red-200">
                                <strong>❌ Error:</strong> {debugError}
                            </div>
                        )}
                        {lastScannedData && (
                            <div className="text-sm text-blue-700 bg-blue-50 p-2 rounded border border-blue-200">
                                <strong>✅ Last Scanned:</strong> {lastScannedData.fullName || lastScannedData.email || `ID ${lastScannedData.id}`}
                            </div>
                        )}
                        {lastCheckIn && (
                            <div className="text-sm text-green-700 bg-green-50 p-2 rounded border border-green-200">
                                <strong>🔔 Last Check-in:</strong> Registration ID {lastCheckIn.registrationId}
                            </div>
                        )}
                    </div>
                )}

                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Search by name or ID..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-sm"/>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2.5 border border-gray-200 rounded-xl flex items-center gap-2 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium">
                            Department
                        </button>
                        <button onClick={exportToCSV} className="px-4 py-2.5 border border-gray-200 rounded-xl flex items-center gap-2 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium">
                            <Download size={16} /> Export CSV
                        </button>
                    </div>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Participant Name</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Department</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Registration Date</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Check-in Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {debugLoading ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                                Loading participants...
                            </td>
                        </tr>
                    ) : currentParticipants.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-16 text-center">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                        <Users size={40} className="text-gray-400" />
                                    </div>
                                    <p className="font-bold text-gray-700 text-lg mb-2">No participants yet</p>
                                    <p className="text-sm text-gray-500 mb-1">
                                        {selectedEventId 
                                            ? `Event "${events.find(e => e.id === selectedEventId)?.title || events.find(e => e.id === selectedEventId)?.name}" has no registrations` 
                                            : 'No event selected'}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Participants will appear here once students register for this event
                                    </p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                    currentParticipants.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">
                                        {p.fullName?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">{p.fullName}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">ID: {p.studentId || p.id}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-600">{p.department || '-'}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-600">{new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                            <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 w-fit ${p.checkedIn ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {p.checkedIn ? <CheckCircle size={14} /> : <Clock size={14} />}
                      {p.checkedIn ? 'Validated' : 'Pending'}
                  </span>
                            </td>
                            <td className="px-6 py-4">
                                {!p.checkedIn ? (
                                    <button onClick={() => handleCheckIn(p.id)} className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-800 transition-all">Check-in</button>
                                ) : (
                                    <button className="text-gray-400 hover:text-blue-600 transition-colors p-1"><MoreVertical size={18} /></button>
                                )}
                            </td>
                        </tr>
                    ))
                    )}
                    </tbody>
                </table>

                {totalPages > 1 && (
                    <div className="p-4 bg-white border-t border-gray-100 flex justify-between items-center">
                        <p className="text-xs font-medium text-gray-500">
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, participants.length)} of {participants.length} participants
                        </p>
                        <div className="flex gap-1">
                            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-1 border border-gray-200 rounded-md text-gray-600 disabled:text-gray-300 disabled:bg-gray-50 hover:bg-gray-50 transition-colors">
                                <ChevronRight size={18} className="rotate-180" />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1 rounded-md text-sm transition-colors ${currentPage === page ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-100 text-gray-600 font-medium'}`}>
                                    {page}
                                </button>
                            ))}
                            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-1 border border-gray-200 rounded-md text-gray-600 disabled:text-gray-300 disabled:bg-gray-50 hover:bg-gray-50 transition-colors">
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Success Notification Toast */}
            {showNotification && notificationData && (
                <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 z-50">
                    <div className="bg-white/20 p-2 rounded-full">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <p className="font-bold text-sm">Successfully Checked In!</p>
                        <p className="text-xs text-green-100">{notificationData.fullName}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
