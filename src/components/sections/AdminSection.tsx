'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  apiDeleteVoid,
  apiJsonData,
  apiPatchData,
} from '@/lib/apiClient';
import {
  decodeAdminMetrics,
  decodeAdminReports,
  decodeAdminUser,
  decodeAdminUsers,
  decodeReportStatusUpdate,
  type AdminMetrics,
  type AdminReport,
  type AdminUser,
} from '@/lib/apiSchemas';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const reportStatuses = ['open', 'reviewed', 'dismissed', 'actioned', 'all'];

export function AdminSection({ onLogout }: { onLogout: () => void }) {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('open');
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'users' | 'reports'>('reports');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAdminData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const [nextMetrics, nextUsers, nextReports] = await Promise.all([
        apiJsonData('/admin/metrics', 'Admin metrics failed', decodeAdminMetrics),
        apiJsonData(
          `/admin/users${query ? `?q=${encodeURIComponent(query)}` : ''}`,
          'Admin users failed',
          decodeAdminUsers,
        ),
        apiJsonData(
          `/admin/reports?status=${status}`,
          'Admin reports failed',
          decodeAdminReports,
        ),
      ]);

      setMetrics(nextMetrics);
      setUsers(nextUsers);
      setReports(nextReports);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Admin data failed');
    } finally {
      setIsLoading(false);
    }
  }, [query, status]);

  useEffect(() => {
    void loadAdminData();
  }, [loadAdminData]);

  async function setSuspension(user: AdminUser, isSuspended: boolean) {
    const reason = isSuspended
      ? window.prompt('Suspension reason:', user.suspensionReason || 'Policy violation') ?? ''
      : '';

    await apiPatchData(
      `/admin/users/${user.id}/suspension`,
      {
        isSuspended,
        reason,
      },
      'Suspension update failed',
      decodeAdminUser,
    );
    await loadAdminData();
  }

  async function updateReport(report: AdminReport, nextStatus: string) {
    await apiPatchData(
      `/admin/reports/${report.id}`,
      {
        status: nextStatus,
      },
      'Report update failed',
      decodeReportStatusUpdate,
    );
    await loadAdminData();
  }

  async function removeTarget(report: AdminReport) {
    if (report.targetType === 'user') return;

    const path =
      report.targetType === 'post'
        ? `/admin/posts/${report.targetId}`
        : `/admin/comments/${report.targetId}`;

    await apiDeleteVoid(path, 'Target removal failed');
    await updateReport(report, 'actioned');
  }

  async function suspendReportedUser(report: AdminReport) {
    if (report.targetType !== 'user') return;

    await apiPatchData(
      `/admin/users/${report.targetId}/suspension`,
      {
        isSuspended: true,
        reason: `Report: ${report.reason}`,
      },
      'Suspension update failed',
      decodeAdminUser,
    );
    await updateReport(report, 'actioned');
  }

  const chartItems = [
    ['Users', metrics?.totalUsers ?? 0, 'from-sky-500 to-cyan-400'],
    ['Posts', metrics?.totalPosts ?? 0, 'from-emerald-500 to-teal-400'],
    ['Reports', metrics?.totalReports ?? 0, 'from-amber-500 to-orange-400'],
    ['Open', metrics?.openReports ?? 0, 'from-rose-500 to-pink-400'],
    ['Suspended', metrics?.suspendedUsers ?? 0, 'from-violet-500 to-indigo-400'],
  ] as const;
  const maxChartValue = Math.max(...chartItems.map((item) => item[1]), 1);

  return (
    <section className="space-y-5 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent)] p-5">
      {error && <p className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
            Control room
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-white">Admin Dashboard</h2>
          <p className="text-sm text-slate-500">
            {isLoading ? 'Syncing live moderation data...' : `${reports.length} reports loaded`}
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={onLogout}>
          Sign Out
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-5">
        {[
          ['Users', metrics?.totalUsers ?? 0],
          ['Suspended', metrics?.suspendedUsers ?? 0],
          ['Posts', metrics?.totalPosts ?? 0],
          ['Reports', metrics?.totalReports ?? 0],
          ['Open', metrics?.openReports ?? 0],
        ].map(([label, value]) => (
          <Card key={label} className="admin-pop-in overflow-hidden p-4 transition-colors hover:border-cyan-400/30 hover:bg-white/[0.05]">
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-cyan-400 transition-all duration-500"
                style={{ width: `${Math.max(8, (Number(value) / maxChartValue) * 100)}%` }}
              />
            </div>
          </Card>
        ))}
      </div>

      <Card className="admin-pop-in p-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Platform Statistics</h3>
            <p className="mt-1 text-xs text-slate-500">Relative volume by category</p>
          </div>
          <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
            Live
          </span>
        </div>
        <div className="mt-5 flex h-52 items-end gap-3">
          {chartItems.map(([label, value, gradient]) => (
            <div key={label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="flex h-40 w-full items-end rounded-lg bg-white/[0.03] px-2">
                <div
                  className={`admin-bar w-full rounded-t-lg bg-gradient-to-t ${gradient}`}
                  style={{ height: `${Math.max(8, (value / maxChartValue) * 100)}%` }}
                />
              </div>
              <p className="text-xs font-semibold text-white">{value}</p>
              <p className="truncate text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
        {(['reports', 'users'] as const).map((panel) => (
          <button
            key={panel}
            type="button"
            onClick={() => setActivePanel(panel)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold capitalize transition ${
              activePanel === panel
                ? 'bg-white text-slate-950 shadow-lg'
                : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
            }`}
          >
            {panel}
          </button>
        ))}
      </div>

      {activePanel === 'users' && (
        <Card className="space-y-3 p-4">
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search users"
              className="min-w-0 flex-1 rounded-lg border border-white/[0.08] bg-[#051223] px-3 py-2 text-sm text-slate-100 outline-none"
            />
            <Button type="button" onClick={loadAdminData}>Refresh</Button>
          </div>

          <div className="divide-y divide-white/[0.06]">
            {users.map((user) => (
              <div key={user.id} className="admin-pop-in flex items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-500 text-sm font-bold text-white">
                    {user.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{user.username}</p>
                    <p className="truncate text-xs text-slate-500">{user.email} - {user.role}</p>
                    {user.isSuspended && (
                      <p className="mt-1 text-xs text-rose-300">{user.suspensionReason || 'Suspended'}</p>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant={user.isSuspended ? 'secondary' : 'danger'}
                  onClick={() => void setSuspension(user, !user.isSuspended)}
                >
                  {user.isSuspended ? 'Unsuspend' : 'Suspend'}
                </Button>
              </div>
            ))}
            {!users.length && (
              <p className="rounded-lg border border-dashed border-white/[0.08] p-6 text-center text-sm text-slate-500">
                No users found.
              </p>
            )}
          </div>
        </Card>
      )}

      {activePanel === 'reports' && (
        <Card className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-white">Reports</h2>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsStatusMenuOpen((current) => !current)}
                className="min-w-36 rounded-lg border border-white/[0.08] bg-[#051223] px-3 py-2 text-left text-sm font-semibold capitalize text-slate-100 transition hover:border-indigo-400/50"
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
                      className={`block w-full px-3 py-2 text-left text-sm capitalize transition hover:bg-indigo-500/10 ${
                        status === item ? 'bg-indigo-500/20 text-indigo-200' : 'text-slate-300'
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
              <article key={report.id} className="admin-pop-in rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 transition hover:border-cyan-400/30 hover:bg-white/[0.04]">
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
                    {report.targetType === 'user' && (
                      <Button type="button" variant="danger" onClick={() => void suspendReportedUser(report)}>
                        Suspend
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
      )}
    </section>
  );
}
