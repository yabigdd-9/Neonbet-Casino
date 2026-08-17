// Root error boundary (P36). If any part of the tree throws during render, we
// show a recoverable panel instead of a blank screen. One crash in a demo game
// or panel must not take down the whole app.
import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  label?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // In a real deployment, forward to an error tracker here.
    console.error("ErrorBoundary caught:", error);
  }

  handleRetry = () => this.setState({ hasError: false });

  handleReturn = () => {
    this.setState({ hasError: false });
    document.getElementById("lobby")?.scrollIntoView({ behavior: "smooth" });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="m-6 rounded-[2rem] border border-rose-300/30 bg-rose-400/10 p-8 text-center"
        >
          <h2 className="text-2xl font-black text-white">Something went wrong</h2>
          <p className="mt-3 text-sm text-slate-300">
            {this.props.label
              ? `The ${this.props.label} hit an unexpected error.`
              : "An unexpected error occurred."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={this.handleRetry}
              className="rounded-2xl bg-cyan-400 px-5 py-3 font-black text-slate-950"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={this.handleReturn}
              className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 font-bold text-white"
            >
              Return to lobby
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
