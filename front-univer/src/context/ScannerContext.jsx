import { createContext, useState, useContext, useCallback } from 'react';

const ScannerContext = createContext();

export { ScannerContext };

export function ScannerProvider({ children }) {
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [scannerEventId, setScannerEventId] = useState(null);
    const [lastCheckIn, setLastCheckIn] = useState(null); // { registrationId, timestamp }

    const openScanner = useCallback((eventId = null) => {
        setScannerEventId(eventId);
        setIsScannerOpen(true);
    }, []);

    const closeScanner = useCallback(() => {
        setIsScannerOpen(false);
        setScannerEventId(null);
    }, []);

    const notifyCheckIn = useCallback((registrationId) => {
        setLastCheckIn({ registrationId, timestamp: Date.now() });
    }, []);

    return (
        <ScannerContext.Provider value={{ isScannerOpen, scannerEventId, openScanner, closeScanner, lastCheckIn, notifyCheckIn }}>
            {children}
        </ScannerContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useScanner() {
    const context = useContext(ScannerContext);
    if (!context) {
        throw new Error('useScanner must be used within a ScannerProvider');
    }
    return context;
}

