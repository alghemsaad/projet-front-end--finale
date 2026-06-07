import { createContext, useState, useContext, useCallback } from 'react';

const ScannerContext = createContext();

export { ScannerContext };

export function ScannerProvider({ children }) {
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    const openScanner = useCallback(() => {
        setIsScannerOpen(true);
    }, []);

    const closeScanner = useCallback(() => {
        setIsScannerOpen(false);
    }, []);

    return (
        <ScannerContext.Provider value={{ isScannerOpen, openScanner, closeScanner }}>
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
