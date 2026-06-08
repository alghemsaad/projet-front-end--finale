import { useEffect, useRef, useState, useCallback } from 'react';
import { X, QrCode, CheckCircle, AlertCircle, Loader2, CameraOff, UserPlus, Users, Clock, CheckCircle2 } from 'lucide-react';
import jsQR from 'jsqr';
import { useScanner } from '../context/ScannerContext';
import { registrationsAPI, participantsAPI } from '../services/api';

export default function ScannerModal() {
    const { isScannerOpen, scannerEventId, closeScanner, notifyCheckIn } = useScanner();
    const [scanResult, setScanResult] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [scannerError, setScannerError] = useState(null);
    const [showRegistrationForm, setShowRegistrationForm] = useState(false);
    const [pendingQRData, setPendingQRData] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        studentId: '',
        department: '',
    });
    const [participants, setParticipants] = useState([]);
    const [stats, setStats] = useState({ total: 0, checkedIn: 0, pending: 0 });
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const animFrameRef = useRef(null);
    const scannedRef = useRef(false);

    const stopCamera = useCallback(() => {
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, []);

    const resetAndClose = useCallback(() => {
        stopCamera();
        setScanResult(null);
        setIsProcessing(false);
        setScannerError(null);
        setShowRegistrationForm(false);
        setPendingQRData(null);
        setFormData({ fullName: '', email: '', studentId: '', department: '' });
        setParticipants([]);
        setStats({ total: 0, checkedIn: 0, pending: 0 });
        scannedRef.current = false;
        closeScanner();
    }, [stopCamera, closeScanner]);

    const performCheckIn = useCallback(async (registrationId) => {
        try {
            const res = await registrationsAPI.checkIn(registrationId);
            setScanResult({
                success: true,
                message: `Successfully checked in! Welcome, ${res.data?.fullName || 'Participant'}.`,
                data: res.data,
            });
            notifyCheckIn(registrationId);
            // Refresh participants list
            if (scannerEventId) {
                const [participantsRes, statsRes] = await Promise.all([
                    participantsAPI.getByEvent(scannerEventId),
                    participantsAPI.getEventStats(scannerEventId),
                ]);
                setParticipants(participantsRes.data);
                setStats(statsRes.data);
            }
        } catch (err) {
            // If not found, ask for registration
            if (err.response?.status === 404) {
                setShowRegistrationForm(true);
                setPendingQRData({ registrationId });
                return;
            }
            setScanResult({
                success: false,
                message: err.response?.data?.message || `Check-in failed for ID #${registrationId}.`,
            });
        }
    }, [notifyCheckIn, scannerEventId]);

    const handleRegistrationSubmit = async (e) => {
        e.preventDefault();
        const eventId = scannerEventId || pendingQRData?.eventId;
        if (!eventId) {
            setScanResult({
                success: false,
                message: 'No event selected. Please go to the Participants page first.',
            });
            setShowRegistrationForm(false);
            return;
        }

        setIsProcessing(true);
        try {
            const res = await registrationsAPI.scan({
                eventId,
                ...formData,
            });
            setScanResult({
                success: true,
                message: `Registered and checked in! Welcome, ${res.data?.fullName || 'Participant'}.`,
                data: res.data,
            });
            notifyCheckIn(res.data.id);
            // Refresh participants list
            if (scannerEventId) {
                const [participantsRes, statsRes] = await Promise.all([
                    participantsAPI.getByEvent(scannerEventId),
                    participantsAPI.getEventStats(scannerEventId),
                ]);
                setParticipants(participantsRes.data);
                setStats(statsRes.data);
            }
        } catch (err) {
            setScanResult({
                success: false,
                message: err.response?.data?.message || 'Registration failed. Please try again.',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const parseAndCheckIn = useCallback(async (decodedText) => {
        const registrationId = parseInt(decodedText, 10);
        if (!isNaN(registrationId)) {
            await performCheckIn(registrationId);
            return;
        }

        let parsed = decodedText;
        try {
            parsed = JSON.parse(decodedText);
        } catch {
            // not JSON, treat as plain text
        }

        if (parsed?.registrationId) {
            await performCheckIn(parsed.registrationId);
        } else if (parsed?.id) {
            await performCheckIn(parsed.id);
        } else {
            setScanResult({
                success: false,
                message: `Invalid QR code format: "${decodedText}"`,
            });
        }
    }, [performCheckIn]);

    const startScanning = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        const ctx = canvas.getContext('2d');

        const scanFrame = () => {
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: 'dontInvert',
                });

                if (code && !scannedRef.current) {
                    scannedRef.current = true;
                    setIsProcessing(true);
                    stopCamera();

                    parseAndCheckIn(code.data)
                        .catch((err) => {
                            setScanResult({
                                success: false,
                                message: err.response?.data?.message || 'Check-in failed. Please try again.',
                            });
                        })
                        .finally(() => {
                            setIsProcessing(false);
                        });

                    return;
                }
            }
            animFrameRef.current = requestAnimationFrame(scanFrame);
        };

        animFrameRef.current = requestAnimationFrame(scanFrame);
    }, [parseAndCheckIn, stopCamera]);

    useEffect(() => {
        if (!isScannerOpen) {
            stopCamera();
            return;
        }

        // Fetch participants if eventId is provided
        if (scannerEventId) {
            const fetchData = async () => {
                try {
                    const [participantsRes, statsRes] = await Promise.all([
                        participantsAPI.getByEvent(scannerEventId),
                        participantsAPI.getEventStats(scannerEventId),
                    ]);
                    setParticipants(participantsRes.data);
                    setStats(statsRes.data);
                } catch (err) {
                    console.error('Failed to fetch participants', err);
                }
            };
            fetchData();
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional reset when scanner opens
        setScanResult(null);
        setIsProcessing(false);
        setScannerError(null);
        scannedRef.current = false;

        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' },
                });
                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.setAttribute('playsinline', 'true');
                    await videoRef.current.play();
                    startScanning();
                }
            } catch (err) {
                console.error('Camera init error:', err);
                setScannerError(
                    err.name === 'NotAllowedError'
                        ? 'Camera access denied. Please allow camera permissions and try again.'
                        : err.name === 'NotFoundError'
                            ? 'No camera found on this device.'
                            : 'Could not start camera. Please try again.'
                );
            }
        };

        startCamera();

        return () => {
            stopCamera();
        };
    }, [isScannerOpen, startScanning, stopCamera]);

    const handleRescan = async () => {
        setScanResult(null);
        setIsProcessing(false);
        setScannerError(null);
        setShowRegistrationForm(false);
        setPendingQRData(null);
        setFormData({ fullName: '', email: '', studentId: '', department: '' });
        scannedRef.current = false;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
            });
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.setAttribute('playsinline', 'true');
                await videoRef.current.play();
                startScanning();
            }
        } catch {
            setScannerError('Could not restart camera.');
        }
    };

    if (!isScannerOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gray-900 p-6 text-white flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <QrCode size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">QR Check-in Scanner</h2>
                            <p className="text-sm text-gray-400 mt-1">Scan a student ticket to validate entry</p>
                        </div>
                    </div>
                    <button onClick={resetAndClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Participants Stats & List */}
                {scannerEventId && participants.length > 0 && (
                    <div className="border-b border-gray-200 bg-gray-50 p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Users size={18} className="text-gray-600" />
                            <h3 className="font-bold text-gray-900 text-sm">Participants ({stats.total})</h3>
                            <div className="ml-auto flex gap-3 text-xs">
                                <span className="flex items-center gap-1 text-green-600 font-medium">
                                    <CheckCircle2 size={14} /> {stats.checkedIn} Checked-in
                                </span>
                                <span className="flex items-center gap-1 text-yellow-600 font-medium">
                                    <Clock size={14} /> {stats.pending} Pending
                                </span>
                            </div>
                        </div>

                        <div className="max-h-32 overflow-y-auto space-y-2">
                            {participants.slice(0, 5).map((p) => (
                                <div key={p.id} className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-gray-200">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                        {p.fullName?.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-gray-900 truncate">{p.fullName}</p>
                                        <p className="text-xs text-gray-500">{p.studentId || p.email}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${
                                        p.checkedIn
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {p.checkedIn ? 'Checked' : 'Pending'}
                                    </span>
                                </div>
                            ))}
                            {participants.length > 5 && (
                                <p className="text-xs text-gray-500 text-center">+{participants.length - 5} more participants</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Scanner Area */}
                <div className="p-6">
                    {showRegistrationForm ? (
                        <div className="flex flex-col gap-4 py-2">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <UserPlus size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Register Participant</h3>
                                    <p className="text-sm text-gray-500">This student isn't registered yet</p>
                                </div>
                            </div>

                            <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm"
                                        placeholder="Enter full name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm"
                                        placeholder="student@university.edu"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                                        <input
                                            type="text"
                                            value={formData.studentId}
                                            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm"
                                            placeholder="Optional"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                        <input
                                            type="text"
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm"
                                            placeholder="Optional"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={isProcessing}
                                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isProcessing ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <UserPlus size={18} />
                                        )}
                                        Register & Check-in
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowRegistrationForm(false);
                                            setPendingQRData(null);
                                            handleRescan();
                                        }}
                                        className="flex-1 py-3 bg-white border border-gray-200 text-gray-900 rounded-xl font-bold hover:bg-gray-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : scanResult ? (
                        <div className="flex flex-col items-center gap-6 py-4">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                                scanResult.success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}>
                                {scanResult.success ? <CheckCircle size={40} /> : <AlertCircle size={40} />}
                            </div>
                            <div className="text-center">
                                <h3 className={`text-2xl font-bold ${
                                    scanResult.success ? 'text-green-700' : 'text-red-700'
                                }`}>
                                    {scanResult.success ? 'Check-in Successful!' : 'Check-in Failed'}
                                </h3>
                                <p className="text-gray-500 mt-2">{scanResult.message}</p>
                            </div>

                            {scanResult.success && scanResult.data && (
                                <div className="w-full bg-gray-50 rounded-xl p-4 text-sm">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-gray-400 font-medium">Name</p>
                                            <p className="font-bold text-gray-900">{scanResult.data.fullName}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 font-medium">Student ID</p>
                                            <p className="font-bold text-gray-900">{scanResult.data.studentId || scanResult.data.id}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 font-medium">Department</p>
                                            <p className="font-bold text-gray-900">{scanResult.data.department || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 font-medium">Status</p>
                                            <p className="font-bold text-green-600">Validated</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 w-full">
                                <button onClick={handleRescan} className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                                    <QrCode size={18} /> Scan Again
                                </button>
                                <button onClick={resetAndClose} className="flex-1 py-3 bg-white border border-gray-200 text-gray-900 rounded-xl font-bold hover:bg-gray-50 transition-all">
                                    Close
                                </button>
                            </div>
                        </div>
                    ) : scannerError ? (
                        <div className="flex flex-col items-center gap-6 py-8">
                            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                <CameraOff size={32} />
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-bold text-gray-900">Camera Error</h3>
                                <p className="text-gray-500 mt-2 text-sm">{scannerError}</p>
                            </div>
                            <button onClick={resetAndClose} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all">
                                Close
                            </button>
                        </div>
                    ) : isProcessing ? (
                        <div className="flex flex-col items-center gap-4 py-8">
                            <Loader2 size={40} className="text-blue-600 animate-spin" />
                            <p className="text-gray-500 font-medium">Processing check-in...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-900" style={{ minHeight: '280px' }}>
                                <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                                {/* Scanning overlay */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-48 h-48 border-2 border-white/60 rounded-xl relative">
                                        <div className="absolute top-0 left-0 w-6 h-6 border-t-3 border-l-3 border-blue-500 rounded-tl-md"></div>
                                        <div className="absolute top-0 right-0 w-6 h-6 border-t-3 border-r-3 border-blue-500 rounded-tr-md"></div>
                                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-3 border-l-3 border-blue-500 rounded-bl-md"></div>
                                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-3 border-r-3 border-blue-500 rounded-br-md"></div>
                                    </div>
                                </div>
                            </div>
                            <canvas ref={canvasRef} className="hidden" />
                            <p className="text-sm text-gray-400 text-center">Point your camera at the student's QR ticket</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}