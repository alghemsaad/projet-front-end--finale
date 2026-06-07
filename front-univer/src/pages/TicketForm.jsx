import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Ticket, CheckCircle2, AlertCircle } from 'lucide-react';
import { eventsAPI, registrationsAPI } from '../services/api';
import { useAuth } from '../context/useAuth';

export default function TicketForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [event, setEvent] = useState(null);
    const [formData, setFormData] = useState({
        fullName: user?.name || '',
        studentId: user?.studentId || '',
        email: user?.email || '',
        department: user?.department || '',
        reason: ''
    });

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await eventsAPI.getOne(id);
                setEvent(res.data);
            } catch (err) {
                console.error('Failed to fetch event', err);
            }
        };
        fetchEvent();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await registrationsAPI.register({
                eventId: parseInt(id),
                ...formData,
            });
            setSubmitted(true);
        } catch (err) {
            alert(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <main className="w-full max-w-2xl mx-auto px-6 py-20 text-center animate-in zoom-in-95 duration-500">
                <div className="bg-white p-12 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 size={40} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Registration Successful!</h1>
                    <p className="text-gray-600 mb-8 max-w-md">
                        Your ticket for <span className="font-bold text-gray-900">{event?.title}</span> has been confirmed.
                        You can find it in your dashboard under "My Tickets".
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                        <button onClick={() => navigate('/student')} className="flex-1 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all">
                            Go to My Tickets
                        </button>
                        <button onClick={() => navigate('/student/discover')} className="flex-1 py-4 bg-white border border-gray-200 text-gray-900 rounded-xl font-bold hover:bg-gray-50 transition-all">
                            Browse More Events
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="w-full max-w-3xl mx-auto px-6 lg:px-10 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-8 group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Event</span>
            </button>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gray-900 p-8 text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <Ticket className="text-blue-500" size={24} />
                        <span className="text-blue-500 font-bold uppercase tracking-widest text-xs">Event Registration</span>
                    </div>
                    <h1 className="text-3xl font-bold">{event?.title || 'Loading...'}</h1>
                    <p className="text-gray-400 mt-2">Fill out the form below to secure your entry ticket.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 lg:p-10 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                            <input required type="text" placeholder="John Doe" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Student ID</label>
                            <input required type="text" placeholder="e.g. 20261234" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={formData.studentId} onChange={(e) => setFormData({...formData, studentId: e.target.value})} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">University Email</label>
                        <input required type="email" placeholder="john.doe@university.edu" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Department / Major</label>
                        <select required className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}>
                            <option value="">Select your department</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Engineering">Engineering</option>
                            <option value="Business">Business</option>
                            <option value="Arts & Design">Arts & Design</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Why do you want to attend? (Optional)</label>
                        <textarea rows="4" placeholder="Tell us about your interest in this event..." className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none" value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})}></textarea>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-2xl flex gap-3 text-blue-700 text-sm">
                        <AlertCircle size={20} className="shrink-0" />
                        <p>By clicking "Submit Registration", you agree to the event's terms and conditions. A digital ticket will be generated and added to your profile.</p>
                    </div>

                    <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg active:scale-[0.98] disabled:opacity-50">
                        {loading ? 'Submitting...' : 'Submit Registration'}
                    </button>
                </form>
            </div>
        </main>
    );
}
