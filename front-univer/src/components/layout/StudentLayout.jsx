import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
    LogOut,
    GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';

export default function StudentLayout() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };
    const navItems = [
        { name: 'My Tickets', path: '/student' },
        { name: 'Discover', path: '/student/discover' },
        { name: 'Calendar', path: '/student/calendar' },
    ];

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-gray-900">

            {/* Menu Latéral (Sidebar Étudiant) */}
            <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm z-10">

                {/* Logo et Titre */}
                <div className="p-6 flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-xl text-white shadow-sm">
                        <GraduationCap size={24} />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight text-gray-900">CampusPulse</h1>
                        <p className="text-xs text-blue-600 font-medium">Student Portal</p>
                    </div>
                </div>

                {/* Liens de navigation */}
                <nav className="flex-1 px-4 mt-2 space-y-1.5">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end={item.path === '/student'}
                            children={({ isActive }) => (
                                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                                    isActive
                                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}>
                                    <span>{item.name}</span>
                                </div>
                            )}
                        />
                    ))}
                </nav>

                {/* Liens du bas */}
                <div className="p-4 border-t border-gray-100 mt-auto">
                    <Link to="/" onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all font-medium text-sm">
                        <LogOut size={18} />
                        <span>Logout</span>
                    </Link>
                </div>
            </aside>

            {/* Contenu Principal */}
            <main className="flex-1 overflow-y-auto bg-gray-50">
                <Outlet />
            </main>

        </div>
    );
}