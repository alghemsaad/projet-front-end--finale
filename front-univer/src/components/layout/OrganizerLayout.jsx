import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    CalendarDays,
    Users,
    QrCode,
    HelpCircle,
    LogOut,
    GraduationCap,
    Plus
} from 'lucide-react';
import { useScanner } from '../../context/ScannerContext';
import { useAuth } from '../../context/useAuth';

export default function OrganizerLayout() {
    const { openScanner } = useScanner();
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/organizer' },
        { name: 'Event Manager', icon: CalendarDays, path: '/organizer/events' },
        { name: 'Participants', icon: Users, path: '/organizer/participants' },
        { name: 'QR Check-in', icon: QrCode, onClick: (e) => { e.preventDefault(); openScanner(); } },
    ];

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-gray-900">

            {/* Menu Latéral (Sidebar) */}
            <aside className="w-64 bg-gray-50 flex flex-col"> {/* Suppression de la bordure droite pour coller à la maquette */}

                {/* Logo et Titre */}
                <div className="p-6 flex items-center gap-3">
                    <div className="bg-gray-900 p-2 rounded-xl text-white shadow-sm">
                        <GraduationCap size={24} />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight">CampusPulse</h1>
                        <p className="text-xs text-gray-500">Organizer Portal</p>
                    </div>
                </div>

                {/* Liens de navigation */}
                <nav className="flex-1 px-4 mt-2 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end={item.path === '/organizer'}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                                }`
                            }
                        >
                            <item.icon size={20} />
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Bouton Create Event + Liens du bas */}
                <div className="p-4 space-y-4 border-t border-gray-200 mt-auto">
                    {/* NOUVEAU BOUTON ICI */}
                    <Link to="/organizer/events/new" className="flex w-full items-center justify-center gap-2 bg-gray-900 text-white px-4 py-3 rounded-xl font-semibold hover:bg-gray-800 transition shadow-sm">
                        <Plus size={20} />
                        <span>Create Event</span>
                    </Link>

                    <div className="space-y-1">
                        <button className="flex w-full items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-200 hover:text-gray-900 rounded-xl transition-all font-medium text-sm">
                            <HelpCircle size={18} />
                            <span>Help Center</span>
                        </button>
                        <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all font-medium text-sm">
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Contenu Principal */}
            <main className="flex-1 overflow-y-auto bg-gray-50 border-l border-gray-200 shadow-sm rounded-tl-3xl">
                <Outlet />
            </main>

        </div>
    );
}