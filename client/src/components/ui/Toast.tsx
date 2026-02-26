import React, { useEffect, useState } from 'react';

interface ToastProps {
    message: string;
    visible: boolean;
    onClose: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, visible, onClose, duration = 1500 }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (visible) {
            // Trigger slide-in
            requestAnimationFrame(() => setShow(true));
            const timer = setTimeout(() => {
                setShow(false);
                setTimeout(onClose, 300); // Wait for slide-out animation
            }, duration);
            return () => clearTimeout(timer);
        } else {
            setShow(false);
        }
    }, [visible, duration, onClose]);

    if (!visible) return null;

    return (
        <div
            className={`fixed bottom-6 right-6 z-[9999] transition-all duration-300 ease-out ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                }`}
        >
            <div className="bg-black/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="font-inter text-sm font-medium">{message}</span>
            </div>
        </div>
    );
};

export default Toast;
