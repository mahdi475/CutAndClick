import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('[ErrorBoundary]', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8 text-center">
                    <div className="text-[64px] mb-4 text-black font-inter font-bold">!</div>
                    <h1 className="font-inter font-bold text-[26px] text-black mb-2">
                        Något gick fel
                    </h1>
                    <p className="font-inter text-[15px] text-gray-400 mb-8 max-w-sm">
                        Appen stötte på ett oväntat fel. Prova att ladda om sidan.
                    </p>
                    {this.state.error && (
                        <p className="font-mono text-[11px] text-red-300 bg-red-50 px-4 py-2 rounded-xl mb-8 max-w-sm break-all">
                            {this.state.error.message}
                        </p>
                    )}
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full max-w-[240px] h-[52px] bg-black rounded-2xl text-white font-inter font-semibold text-[16px] hover:bg-gray-800 transition-colors"
                    >
                        Ladda om appen
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
