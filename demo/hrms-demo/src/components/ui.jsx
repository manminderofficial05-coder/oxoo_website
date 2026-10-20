import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export function Avatar({ name = '?', size = 'md' }) {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-16 w-16 text-xl' };
  return (
    <div
      className={`grid shrink-0 place-items-center rounded-full bg-brand/10 font-bold text-brand ${sizes[size]}`}
    >
      {name.trim().charAt(0).toUpperCase()}
    </div>
  );
}

export function StatusBadge({ status }) {
  const active = status === 'active';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
        active ? 'bg-emerald-50 text-emerald-700' : 'bg-black/5 text-black/50'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-black/30'}`} />
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

const MODAL_WIDTHS = { md: 'max-w-xl', lg: 'max-w-2xl', xl: 'max-w-4xl' };

/**
 * Props:
 *  title, subtitle, icon (a lucide icon component), onClose
 *  size   'md' (default), 'lg' or 'xl'
 *  flush  false (default): the modal pads and scrolls its content (simple dialogs).
 *         true: the dialog gets a fixed height and the child manages its own layout
 *         (a flex column: scrolling middle + fixed footer, like EmployeeForm).
 *
 * The dialog is rendered in a portal on document.body, so it is always positioned
 * against the screen (not a scrolling page container) and sits above the top bar.
 */
export function Modal({ title, subtitle, icon: Icon, onClose, size = 'md', flush = false, children }) {
  // Close on Escape
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Stop the page behind the dialog from scrolling
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
      // Only a click on the dark backdrop itself closes the dialog
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Never taller than the screen. A form dialog (flush) gets a definite height so its
          middle area is guaranteed to scroll and its footer is guaranteed to stay visible. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ animation: 'rise 0.25s ease-out both' }}
        className={`flex w-full ${MODAL_WIDTHS[size] || MODAL_WIDTHS.md} flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 ${
          flush ? 'h-[min(46rem,calc(100dvh-2rem))]' : 'max-h-[min(46rem,calc(100dvh-2rem))]'
        }`}
      >
        <div className="flex shrink-0 items-center gap-4 border-b border-black/5 px-6 py-4 sm:px-8">
          {Icon && (
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-role/10 text-role">
              <Icon size={20} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-extrabold leading-tight">{title}</h2>
            {subtitle && <p className="mt-0.5 truncate text-sm text-black/50">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-black/50 hover:bg-surface hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <div
          className={
            flush
              ? 'flex min-h-0 flex-1 flex-col'
              : 'min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6 sm:px-8'
          }
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}