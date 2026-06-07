import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, Mail, Globe, User, BookOpen, Settings } from 'lucide-react';
import { useAuth } from '../context/useAuth';

export default function Login() {
    const [isRegister, setIsRegister] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState('student');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { login, register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const email = e.target.email.value;
            const password = e.target.password.value;

            if (isRegister) {
                const name = e.target.name.value;
                const confirmPassword = e.target['confirm-password'].value;
                if (password !== confirmPassword) {
                    setError('Passwords do not match');
                    setIsLoading(false);
                    return;
                }
                const userData = await register({ name, email, password, role: selectedRole });
                navigate(userData.role === 'student' ? '/student' : '/organizer');
            } else {
                const userData = await login(email, password);
                navigate(userData.role === 'student' ? '/student' : '/organizer');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            const amount = 5;
            const x = (e.clientX / window.innerWidth - 0.5) * amount;
            const y = (e.clientY / window.innerHeight - 0.5) * amount;
            document.body.style.backgroundPosition = `${x}px ${y}px`;
        };
        document.addEventListener('mousemove', handleMouseMove);
        return () => document.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div
            className="min-h-screen flex flex-col bg-gray-50"
            style={{
                backgroundImage: 'radial-gradient(#d2e4fb 1px, transparent 1px)',
                backgroundSize: '24px 24px',
                transition: 'background-position 0.1s ease-out'
            }}
        >
            <main className="flex-grow flex items-center justify-center p-4 md:p-10">
                <div className="w-full max-w-[480px] animate-in fade-in slide-in-from-bottom-4 duration-700">

                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gray-900 flex items-center justify-center rounded-xl shadow-md text-white">
                                <GraduationCap size={28} />
                            </div>
                            <span className="text-2xl font-bold text-gray-900 tracking-tight">CampusPulse</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {isRegister ? "Create an account" : "Welcome back"}
                        </h1>
                        <p className="text-gray-500 text-sm px-8">
                            {isRegister
                                ? "Join us to discover and manage university events."
                                : "Access your university event management portal."}
                        </p>
                    </div>

                    <div className="bg-white/90 backdrop-blur-md mt-8 p-8 md:p-10 rounded-2xl border border-white/40 shadow-xl transition-all duration-300">

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                                {error}
                            </div>
                        )}

                        <div className="flex flex-col gap-3 mb-8">
                            <button className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-gray-700 font-bold text-sm shadow-sm">
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                Continue with Google
                            </button>
                            <button className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-gray-700 font-bold text-sm shadow-sm">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"></path>
                                </svg>
                                Continue with GitHub
                            </button>
                        </div>

                        <div className="relative flex items-center mb-8">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase tracking-widest font-bold">or</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>

                            {isRegister && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="block text-sm font-bold text-gray-900 mb-2" htmlFor="name">Full Name</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="name"
                                            required={isRegister}
                                            placeholder="Jihane Diouri"
                                            className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none text-sm text-gray-900"
                                        />
                                        <User className="absolute right-3 top-3.5 text-gray-400" size={18} />
                                    </div>
                                </div>
                            )}

                            {isRegister && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="block text-sm font-bold text-gray-900 mb-2">I am a</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedRole('student')}
                                            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${selectedRole === 'student' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            <BookOpen size={18} />
                                            Student
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedRole('organizer')}
                                            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${selectedRole === 'organizer' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            <Settings size={18} />
                                            Organizer
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2" htmlFor="email">Academic Email</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        id="email"
                                        required
                                        placeholder="jihane.diouri@etu.uae.ac.ma"
                                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none text-sm text-gray-900"
                                    />
                                    <Mail className="absolute right-3 top-3.5 text-gray-400" size={18} />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-bold text-gray-900" htmlFor="password">Password</label>
                                    {!isRegister && (
                                        <a href="#" className="text-blue-600 text-sm font-bold hover:underline">Forgot password?</a>
                                    )}
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        required
                                        placeholder="••••••••"
                                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none text-sm text-gray-900"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {isRegister && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="block text-sm font-bold text-gray-900 mb-2" htmlFor="confirm-password">Confirm Password</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            id="confirm-password"
                                            required={isRegister}
                                            placeholder="••••••••"
                                            className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none text-sm text-gray-900"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {!isRegister && (
                                <div className="flex items-center gap-3 pt-1">
                                    <input type="checkbox" id="remember" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                                    <label htmlFor="remember" className="text-sm font-medium text-gray-600 cursor-pointer">Remember me</label>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 mt-2 disabled:opacity-50"
                            >
                                {isLoading ? 'Please wait...' : isRegister ? "Create Account" : "Sign in"}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-sm">
              <span className="text-gray-500 font-medium">
                {isRegister ? "Already have an account? " : "New to CampusPulse? "}
              </span>
                            <button
                                onClick={() => { setIsRegister(!isRegister); setError(''); }}
                                className="text-blue-600 font-bold hover:underline"
                            >
                                {isRegister ? "Sign in" : "Create an account"}
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-wrap justify-center gap-6">
                        <a href="#" className="text-gray-400 text-xs font-bold hover:text-gray-600 transition-colors">Help & Support</a>
                        <a href="#" className="text-gray-400 text-xs font-bold hover:text-gray-600 transition-colors">Privacy Policy</a>
                        <a href="#" className="text-gray-400 text-xs font-bold hover:text-gray-600 transition-colors">Terms of Service</a>
                    </div>
                </div>
            </main>

            <footer className="w-full py-4 bg-white/50 border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <span className="text-xs font-medium text-gray-500">© 2024 University Events. All Rights Reserved.</span>
                    <div className="flex items-center gap-2 text-gray-500 hover:text-gray-900 cursor-pointer transition-colors">
                        <Globe size={16} />
                        <span className="text-xs font-bold">English (EN)</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
