import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import OrganizerLayout from './components/layout/OrganizerLayout';
import OrganizerDashboard from './pages/OrganizerDashboard';
import EventManager from './pages/EventManager';
import CreateEvent from './pages/CreateEvent';
import Participants from './pages/Participants';
import Login from './pages/Login';
import StudentLayout from './components/layout/StudentLayout';
import StudentDashboard from './pages/StudentDashboard';
import { ScannerProvider } from './context/ScannerContext';
import { AuthProvider } from './context/AuthContext';
import StudentDiscover from './pages/StudentDiscover';
import StudentCalendar from './pages/StudentCalendar';
import EventDetails from './pages/EventDetails';
import TicketForm from './pages/TicketForm';

export default function App() {
    return (
        <Router>
            <AuthProvider>
                <ScannerProvider>
                    <Routes>
                        <Route path="/" element={<Login />} />

                        {/* Espace Organisateur avec son Menu Latéral */}
                        <Route path="/organizer" element={<OrganizerLayout />}>
                            <Route index element={<OrganizerDashboard />} />
                            <Route path="events" element={<EventManager />} />
                            <Route path="events/new" element={<CreateEvent />} />
                            <Route path="participants" element={<Participants />} />
                        </Route>

                        {/* Espace Étudiant avec son Top NavBar */}
                        <Route path="/student" element={<StudentLayout />}>
                            <Route index element={<StudentDashboard />} />
                            <Route path="discover" element={<StudentDiscover />} />
                            <Route path="discover/:id" element={<EventDetails />} />
                            <Route path="discover/:id/ticket" element={<TicketForm />} />
                            <Route path="calendar" element={<StudentCalendar />} />
                        </Route>

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </ScannerProvider>
            </AuthProvider>
        </Router>
    );
}
