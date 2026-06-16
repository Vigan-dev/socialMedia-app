'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  apiDeleteVoid,
  apiJsonData,
  apiPatchData,
} from '@/lib/apiClient';
import {
  decodeAdminReports,
  decodeReportStatusUpdate,
  type AdminReport,
} from '@/lib/apiSchemas';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const reportStatuses = ['open', 'reviewed', 'dismissed', 'actioned', 'all'];

export function ModerationSection({ onLogout }: { onLogout: () => void }) {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [status, setStatus] = useState('open');
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReports = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      setReports(
        await apiJsonData(
          `/moderation/reports?status=${status}`,
          'Moderation reports failed',
          decodeAdminReports,
        ),
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Moderation data failed');
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  async function updateReport(report: AdminReport, nextStatus: string) {
    await apiPatchData(
      `/moderation/reports/${report.id}`,
      {
        status: nextStatus,
      },
      'Report update failed',
      decodeReportStatusUpdate,
    );
    await loadReports();
  }

  async function removeTarget(report: AdminReport) {
    if (report.targetType === 'user') return;

    const path =
      report.targetType === 'post'
        ? `/moderation/posts/${report.targetId}`
        : `/moderation/comments/${report.targetId}`;

    await apiDeleteVoid(path, 'Target removal failed');
    await updateReport(report, 'actioned');
  }

  return (
    <section className="space-y-5 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.16),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent)] p-5">
      {error && <p className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-300/80">
            Moderation
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-white">Report Queue</h2>
          <p className="text-sm text-slate-500">
            {isLoading ? 'Loading reports...' : `${reports.length} reports loaded`}
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={onLogout}>
          Sign Out
        </Button>
      </div>

      <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-white">Reports</h2>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsStatusMenuOpen((current) => !current)}
              className="min-w-36 rounded-lg border border-white/[0.08] bg-[#051223] px-3 py-2 text-left text-sm font-semibold capitalize text-slate-100 transition hover:border-teal-400/50"
            >
              {status}
              <span className="float-right text-slate-500">{isStatusMenuOpen ? 'Up' : 'Down'}</span>
            </button>

            {isStatusMenuOpen && (
              <div className="admin-pop-in absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-lg border border-white/[0.08] bg-[#07101f] shadow-xl">
                {reportStatuses.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setStatus(item);
                      setIsStatusMenuOpen(false);
                    }}
                    className={`block w-full px-3 py-2 text-left text-sm capitalize transition hover:bg-teal-500/10 ${
                      status === item ? 'bg-teal-500/20 text-teal-200' : 'text-slate-300'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {reports.map((report) => (
            <article key={report.id} className="admin-pop-in rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 transition hover:border-teal-400/30 hover:bg-white/[0.04]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {report.targetType} - {report.reason}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    by {report.reporter?.username ?? 'Unknown'} - {report.status}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" onClick={() => void updateReport(report, 'reviewed')}>
                    Review
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => void updateReport(report, 'dismissed')}>
                    Dismiss
                  </Button>
                  {report.targetType !== 'user' && (
                    <Button type="button" variant="danger" onClick={() => void removeTarget(report)}>
                      Remove
                    </Button>
                  )}
                </div>
              </div>
              {report.details && <p className="mt-3 text-sm text-slate-300">{report.details}</p>}
              <p className="mt-2 break-all text-xs text-slate-600">{report.targetId}</p>
            </article>
          ))}
          {!reports.length && (
            <p className="rounded-lg border border-dashed border-white/[0.08] p-8 text-center text-sm text-slate-500">
              No reports in this status.
            </p>
          )}
        </div>
      </Card>
    </section>
  );
}
