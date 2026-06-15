'use client';

type InlineErrorProps = {
  message: string;
  onDismiss: () => void;
};

export function InlineError({ message, onDismiss }: InlineErrorProps) {
  return (
    <div className="border-b border-rose-400/10 bg-rose-950/30 px-5 py-3">
      <div
        role="alert"
        className="flex items-start justify-between gap-3 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100"
      >
        <p>{message}</p>

        <button
          type="button"
          onClick={onDismiss}
          className="rounded-full px-2 text-xs font-bold uppercase tracking-wider text-rose-200 transition hover:bg-rose-300/10 hover:text-white"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
