import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ConfirmModal, AlertModal } from '@/components/admin/shared/CustomModals';

interface ConfirmOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDangerous?: boolean;
}

interface AlertOptions {
    title?: string;
    message: string;
    type?: 'success' | 'error' | 'info';
}

interface ModalContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
    alert: (options: AlertOptions) => Promise<void>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Confirm State
    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        options: ConfirmOptions;
        resolve: (value: boolean) => void;
    }>({
        isOpen: false,
        options: { message: '' },
        resolve: () => { },
    });

    // Alert State
    const [alertState, setAlertState] = useState<{
        isOpen: boolean;
        options: AlertOptions;
        resolve: () => void;
    }>({
        isOpen: false,
        options: { message: '' },
        resolve: () => { },
    });

    const confirm = useCallback((options: ConfirmOptions) => {
        return new Promise<boolean>((resolve) => {
            setConfirmState({
                isOpen: true,
                options,
                resolve,
            });
        });
    }, []);

    const alert = useCallback((options: AlertOptions) => {
        return new Promise<void>((resolve) => {
            setAlertState({
                isOpen: true,
                options,
                resolve,
            });
        });
    }, []);

    // Close handlers
    const closeConfirm = (result: boolean) => {
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
        confirmState.resolve(result);
    };

    const closeAlert = () => {
        setAlertState((prev) => ({ ...prev, isOpen: false }));
        alertState.resolve();
    };

    return (
        <ModalContext.Provider value={{ confirm, alert }}>
            {children}

            {/* Global Confirm Modal */}
            <ConfirmModal
                isOpen={confirmState.isOpen}
                onClose={() => closeConfirm(false)}
                onConfirm={() => closeConfirm(true)}
                title={confirmState.options.title || 'Confirmation'}
                message={confirmState.options.message}
                confirmText={confirmState.options.confirmText}
                cancelText={confirmState.options.cancelText}
                isDangerous={confirmState.options.isDangerous}
            />

            {/* Global Alert Modal */}
            <AlertModal
                isOpen={alertState.isOpen}
                onClose={closeAlert}
                title={alertState.options.title || 'Information'}
                message={alertState.options.message}
                type={alertState.options.type}
            />
        </ModalContext.Provider>
    );
};
