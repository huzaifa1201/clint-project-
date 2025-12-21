
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 p-4">
                    <div className="max-w-md w-full bg-zinc-50 dark:bg-zinc-900 border border-red-500/20 rounded-3xl p-8 text-center shadow-2xl">
                        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <AlertCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2 text-zinc-900 dark:text-white">System Malfunction</h2>
                        <p className="text-zinc-500 mb-6 text-sm font-medium">Something went wrong while rendering this module.</p>

                        <div className="bg-zinc-100 dark:bg-zinc-950 p-4 rounded-xl text-left mb-6 overflow-auto max-h-32 border border-zinc-200 dark:border-zinc-800">
                            <p className="font-mono text-[10px] text-red-500 break-all">
                                {this.state.error?.message || 'Unknown Error'}
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                this.setState({ hasError: false, error: null });
                                window.location.reload();
                            }}
                            className="w-full bg-green-500 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-green-400 transition-all uppercase tracking-widest text-xs"
                        >
                            <RefreshCw size={16} /> Reboot System
                        </button>
                        <div className="mt-4">
                            <a href="/" className="text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-widest hover:underline">Return to Home</a>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
