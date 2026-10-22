import React from "react";
import { reportClientError } from "../../lib/diagnostics";

// Keep runtime failures from exposing exception details or leaving a blank page.
export default class ErrorBoundary extends React.Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    reportClientError("render_error");
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 p-6 text-white">
        <section role="alert" className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-2xl font-bold">This page couldn’t load</h1>
          <p className="mt-3 text-slate-300">Please reload the page. If the problem continues, try again later.</p>
          <button type="button" onClick={() => window.location.reload()} className="mt-6 rounded-2xl bg-cyan-300 px-5 py-3 font-bold text-slate-950">Reload page</button>
        </section>
      </main>
    );
  }
}
