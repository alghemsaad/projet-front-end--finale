import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Info, Image as ImageIcon, UploadCloud, Calendar, MapPin, UserPlus, Users } from 'lucide-react';
import { eventsAPI } from '../services/api';

export default function CreateEvent() {
    const navigate = useNavigate();
    const [imagePreview, setImagePreview] = useState(null);
    const [locationType, setLocationType] = useState('on-campus');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState({
        title: '',
        category: 'Academic',
        visibility: 'public',
        description: '',
        startDate: '',
        endDate: '',
        location: '',
        capacity: '',
        registrationDeadline: '',
        requireApproval: false,
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;
        setForm({ ...form, [id]: type === 'checkbox' ? checked : value });
        if (errors[id]) {
            setErrors({ ...errors, [id]: null });
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!form.title.trim()) newErrors.title = 'Event title is required';
        if (!form.startDate) newErrors.startDate = 'Start date is required';
        if (!form.endDate) newErrors.endDate = 'End date is required';
        if (!form.location.trim()) newErrors.location = 'Location is required';
        if (form.startDate && form.endDate && new Date(form.startDate) >= new Date(form.endDate)) {
            newErrors.endDate = 'End date must be after start date';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (status = 'active') => {
        if (!validate()) return;
        setLoading(true);
        try {
            const payload = {
                ...form,
                status,
                locationType,
                capacity: form.capacity ? parseInt(form.capacity) : 0,
                imageUrl: imagePreview || '',
                registrationDeadline: form.registrationDeadline || undefined,
            };
            await eventsAPI.create(payload);
            navigate('/organizer/events');
        } catch (err) {
            const serverErrors = err.response?.data?.message;
            if (Array.isArray(serverErrors)) {
                setErrors(prev => ({ ...prev, server: serverErrors.join(', ') }));
            } else if (typeof serverErrors === 'string') {
                setErrors(prev => ({ ...prev, server: serverErrors }));
            } else {
                setErrors(prev => ({ ...prev, server: 'Failed to create event. Please try again.' }));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-10 max-w-4xl mx-auto">

            <div className="mb-8 flex justify-between items-end">
                <div>
                    <nav className="flex items-center gap-2 text-gray-500 mb-2">
                        <span className="text-xs font-medium">Event Manager</span>
                        <ChevronRight size={14} />
                        <span className="text-xs font-bold text-blue-600">New Event</span>
                    </nav>
                    <h2 className="text-3xl font-bold text-gray-900">Create New Event</h2>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => handleSubmit('draft')} disabled={loading} className="px-5 py-2.5 border-2 border-gray-900 text-gray-900 font-bold text-sm rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50">
                        Save as Draft
                    </button>
                    <button onClick={() => handleSubmit('active')} disabled={loading} className="px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50">
                        {loading ? 'Publishing...' : 'Publish Event'}
                    </button>
                </div>
            </div>

            <div className="space-y-6">

                <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <Info className="text-blue-600" size={24} />
                        <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 block" htmlFor="title">Event Title <span className="text-red-500">*</span></label>
                            <input type="text" id="title" value={form.title} onChange={handleChange} placeholder="e.g., Annual Tech Symposium 2024" className={`w-full bg-white border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all ${errors.title ? 'border-red-400' : 'border-gray-200'}`} />
                            {errors.title && <p className="text-xs text-red-500 font-medium">{errors.title}</p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 block" htmlFor="category">Category</label>
                                <select id="category" value={form.category} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all">
                                    <option>Academic</option>
                                    <option>Workshop</option>
                                    <option>Social</option>
                                    <option>Career</option>
                                    <option>Sports</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 block">Visibility</label>
                                <div className="flex gap-6 h-full items-center">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="visibility" checked={form.visibility === 'public'} onChange={() => setForm({...form, visibility: 'public'})} className="w-4 h-4 text-blue-600 focus:ring-blue-600" />
                                        <span className="text-sm text-gray-700 font-medium">Public</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="visibility" checked={form.visibility === 'private'} onChange={() => setForm({...form, visibility: 'private'})} className="w-4 h-4 text-blue-600 focus:ring-blue-600" />
                                        <span className="text-sm text-gray-700 font-medium">Private</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 block" htmlFor="description">Description</label>
                            <textarea id="description" value={form.description} onChange={handleChange} rows="4" placeholder="Tell students what this event is about..." className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all resize-none"></textarea>
                        </div>
                    </div>
                </section>

                <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <ImageIcon className="text-blue-600" size={24} />
                        <h3 className="text-xl font-bold text-gray-900">Event Banner</h3>
                    </div>
                    <div className="relative group h-64 w-full border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all overflow-hidden">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                            <div className="text-center space-y-3 p-6">
                                <UploadCloud className="mx-auto text-gray-400" size={48} />
                                <div className="space-y-1">
                                    <p className="text-gray-900 font-bold">Click to upload or drag and drop</p>
                                    <p className="text-xs text-gray-500 font-medium">Recommended size: 1200 x 630 pixels (PNG, JPG up to 5MB)</p>
                                </div>
                            </div>
                        )}
                        <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                            <Calendar className="text-blue-600" size={24} />
                            <h3 className="text-xl font-bold text-gray-900">Date & Time</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 block" htmlFor="startDate">Start Date & Time <span className="text-red-500">*</span></label>
                                <input type="datetime-local" id="startDate" value={form.startDate} onChange={handleChange} className={`w-full bg-white border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all ${errors.startDate ? 'border-red-400' : 'border-gray-200'}`} />
                                {errors.startDate && <p className="text-xs text-red-500 font-medium">{errors.startDate}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 block" htmlFor="endDate">End Date & Time <span className="text-red-500">*</span></label>
                                <input type="datetime-local" id="endDate" value={form.endDate} onChange={handleChange} className={`w-full bg-white border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all ${errors.endDate ? 'border-red-400' : 'border-gray-200'}`} />
                                {errors.endDate && <p className="text-xs text-red-500 font-medium">{errors.endDate}</p>}
                            </div>
                        </div>
                    </section>

                    <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                            <MapPin className="text-blue-600" size={24} />
                            <h3 className="text-xl font-bold text-gray-900">Location</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 block">Location Type</label>
                                <div className="flex bg-gray-100 rounded-xl p-1">
                                    <button type="button" onClick={() => setLocationType('on-campus')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${locationType === 'on-campus' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>On-Campus</button>
                                    <button type="button" onClick={() => setLocationType('online')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${locationType === 'online' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>Online</button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 block" htmlFor="location">{locationType === 'online' ? 'Meeting Link' : 'Building & Room'} <span className="text-red-500">*</span></label>
                                <input type="text" id="location" value={form.location} onChange={handleChange} placeholder={locationType === 'online' ? "e.g., zoom.us/j/123456789" : "e.g., Engineering Hall, Rm 302"} className={`w-full bg-white border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all ${errors.location ? 'border-red-400' : 'border-gray-200'}`} />
                                {errors.location && <p className="text-xs text-red-500 font-medium">{errors.location}</p>}
                            </div>
                        </div>
                    </section>
                </div>

                <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <UserPlus className="text-blue-600" size={24} />
                        <h3 className="text-xl font-bold text-gray-900">Registration Settings</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 block" htmlFor="capacity">Attendee Capacity</label>
                            <div className="relative">
                                <input type="number" id="capacity" value={form.capacity} onChange={handleChange} placeholder="No limit" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all" />
                                <Users className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 block" htmlFor="registrationDeadline">Registration Deadline</label>
                            <input type="date" id="registrationDeadline" value={form.registrationDeadline} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all" />
                        </div>
                    </div>
                    <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-start gap-3">
                        <div className="pt-0.5">
                            <input type="checkbox" id="requireApproval" checked={form.requireApproval} onChange={handleChange} className="w-5 h-5 rounded text-blue-600 focus:ring-blue-600 border-gray-300" />
                        </div>
                        <label htmlFor="requireApproval" className="cursor-pointer">
                            <span className="text-sm font-bold text-gray-900 block">Require Organizer Approval</span>
                            <span className="text-xs font-medium text-gray-500">Attendees will be added to a waitlist until you manually approve their registration.</span>
                        </label>
                    </div>
                </section>

                {errors.server && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
                        {errors.server}
                    </div>
                )}

                <div className="pt-6 flex justify-end items-center gap-4">
                    <button onClick={() => handleSubmit('draft')} disabled={loading} className="px-6 py-3 border-2 border-gray-900 text-gray-900 font-bold text-sm rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50">Save Draft</button>
                    <button onClick={() => handleSubmit('active')} disabled={loading} className="px-8 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50">{loading ? 'Publishing...' : 'Publish Event'}</button>
                </div>
            </div>
        </div>
    );
}
