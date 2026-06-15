'use client';

import { useState } from 'react';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { ReportReason, ReportTargetType } from '@/types/feed';

const reportOptions: Array<{
  label: string;
  value: ReportReason;
}> = [
  { label: 'Spam', value: 'spam' },
  { label: 'Harassment', value: 'harassment' },
  { label: 'Hate speech', value: 'hate' },
  { label: 'Self-harm', value: 'self_harm' },
  { label: 'Sexual content', value: 'sexual_content' },
  { label: 'Violence', value: 'violence' },
  { label: 'Other', value: 'other' },
];

type ConfirmActionModalProps = {
  confirmLabel?: string;
  description: string;
  intent?: 'danger' | 'warning';
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
};

export function ConfirmActionModal({
  confirmLabel = 'Confirm',
  description,
  intent = 'danger',
  onCancel,
  onConfirm,
  title,
}: ConfirmActionModalProps) {
  return (
    <Modal onClose={onCancel}>
      <div className="space-y-5">
        <div className="flex gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
              intent === 'danger'
                ? 'bg-rose-500/[0.12] text-rose-200'
                : 'bg-amber-400/[0.12] text-amber-200'
            }`}
          >
            <AppIcon name={intent === 'danger' ? 'trash' : 'block'} />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white">
              {title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              {description}
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

type ReportContentModalProps = {
  onCancel: () => void;
  onSubmit: (
    targetType: ReportTargetType,
    targetId: string,
    reason: ReportReason,
    details?: string,
  ) => void;
  targetId: string;
  targetLabel: string;
  targetType: ReportTargetType;
};

export function ReportContentModal({
  onCancel,
  onSubmit,
  targetId,
  targetLabel,
  targetType,
}: ReportContentModalProps) {
  const [reason, setReason] = useState<ReportReason>('spam');
  const [details, setDetails] = useState('');

  return (
    <Modal onClose={onCancel}>
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(targetType, targetId, reason, details.trim());
        }}
      >
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-400/[0.12] text-amber-200">
            <AppIcon name="flag" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white">
              Report {targetLabel}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Tell moderators what happened. Reports are reviewed before action
              is taken.
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="report-reason" className="mb-2 block text-sm font-semibold text-slate-300">
            Reason
          </label>
          <select
            id="report-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value as ReportReason)}
            className="w-full rounded-xl border border-white/[0.08] bg-[#051223] px-3 py-3 text-sm text-slate-100 outline-none transition focus:border-amber-300"
          >
            {reportOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="report-details" className="mb-2 block text-sm font-semibold text-slate-300">
            Details optional
          </label>
          <textarea
            id="report-details"
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            maxLength={300}
            placeholder="Add context for moderators..."
            className="min-h-28 w-full resize-none rounded-xl border border-white/[0.08] bg-[#051223] px-3 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-amber-300"
          />
          <p className="mt-2 text-xs text-slate-500">{details.length}/300</p>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-gradient-to-r from-amber-400 to-orange-400">
            Submit report
          </Button>
        </div>
      </form>
    </Modal>
  );
}
