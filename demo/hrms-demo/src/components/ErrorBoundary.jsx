import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Page crashed:', error, info?.componentStack);
  }

  handleReset = () => {
    try {
      // Clear demo storage keys
      Object.keys(localStorage)
        .filter((k) => k.startsWith('employee360_demo_'))
        .forEach((k) => localStorage.removeItem(k));
    } catch {
      // Ignore
    }
    this.setState({ error: null });
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="rounded-3xl bg-white p-8 border border-black/5 shadow-xl">
          <h1 className="text-xl font-extrabold text-slate-900">Something went wrong on this page</h1>
          <p className="mt-2 text-sm text-black/55">
            The rest of the app is still working. Try again, or go back to the dashboard.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => this.setState({ error: null })}
              className="rounded-full bg-sky-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-700 transition"
            >
              Try again
            </button>
            <button
              onClick={this.handleReset}
              className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Reset Demo Data
            </button>
            <a href="/" className="rounded-full bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-200 transition">
              Dashboard
            </a>
          </div>
        </div>
      </main>
    );
  }
}