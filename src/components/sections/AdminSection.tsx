'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  apiDeleteVoid,
  apiJsonData,
  apiPatchData,
} from '@/lib/apiClient';
import {
  decodeAdminAuditLogs,
  decodeAdminMetrics,
  decodeAdminReports,
  decodeAdminUser,
  decodeAdminUsers,
  decodeReportStatusUpdate,
  type AdminAuditLog,
  type AdminMetrics,
  type AdminReport,
  type AdminUser,
} from '@/lib/apiSchemas';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const reportStatuses = ['open', 'reviewed', 'dismissed', 'actioned', 'all'];

function formatAction(action: string) {
  return action.replace(/_/g, ' ');
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export function AdminSection({ onLogout }: { onLogout: () => void }) {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('open');
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'reports' | 'users'>(
    'reports',
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isChartVisible, setIsChartVisible] = useState(false);
  const [error, setError] = useState('');

  const loadAdminData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const [nextMetrics, nextUsers, nextReports, nextAuditLogs] =
        await Promise.all([
          apiJsonData(
            '/admin/metrics',
            'Admin metrics failed',
            decodeAdminMetrics,
          ),
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
          apiJsonData(
            '/admin/audit-logs',
            'Admin audit logs failed',
            decodeAdminAuditLogs,
          ),
        ]);

      setMetrics(nextMetrics);
      setUsers(nextUsers);
      setReports(nextReports);
      setAuditLogs(nextAuditLogs);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Admin data failed');
    } finally {
      setIsLoading(false);
    }
  }, [query, status]);

  useEffect(() => {
    void loadAdminData();
  }, [loadAdminData]);

  useEffect(() => {
    if (isLoading) return;

    setIsChartVisible(false);
    let timeoutId: number | undefined;
    const frameId = window.requestAnimationFrame(() => {
      timeoutId = window.setTimeout(() => setIsChartVisible(true), 80);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [isLoading, metrics]);

  async function setSuspension(user: AdminUser, isSuspended: boolean) {
    const reason = isSuspended
      ? window.prompt(
          'Suspension reason:',
          user.suspensionReason || 'Policy violation',
        ) ?? ''
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

  const metricItems = [
    ['Users', metrics?.totalUsers ?? 0],
    ['Suspended', metrics?.suspendedUsers ?? 0],
    ['Posts', metrics?.totalPosts ?? 0],
    ['Reports', metrics?.totalReports ?? 0],
    ['Open', metrics?.openReports ?? 0],
  ] as const;
  const chartItems = [
    ['Users', metrics?.totalUsers ?? 0, 'from-sky-500 to-cyan-300'],
    ['Posts', metrics?.totalPosts ?? 0, 'from-emerald-500 to-teal-300'],
    ['Reports', metrics?.totalReports ?? 0, 'from-amber-500 to-orange-300'],
    ['Open', metrics?.openReports ?? 0, 'from-rose-500 to-pink-300'],
    ['Suspended', metrics?.suspendedUsers ?? 0, 'from-violet-500 to-indigo-300'],
  ] as const;
  const maxChartValue = Math.max(...chartItems.map((item) => item[1]), 1);

  return (
    <section className="space-y-5 p-5">
      {error && (
        <p className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-[#07101f]/70 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300/80">
            Admin
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-white">
            Control Center
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isLoading
              ? 'Syncing platform data...'
              : `${reports.length} reports in the current queue`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={loadAdminData}>
            Refresh
          </Button>
          <Button type="button" variant="ghost" onClick={onLogout}>
            Sign Out
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {metricItems.map(([label, value]) => (
          <Card
            key={label}
            className="admin-pop-in p-4 transition-colors hover:border-cyan-400/30 hover:bg-white/[0.05]"
          >
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              {label}
            </p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-cyan-400 transition-all duration-700 ease-out"
                style={{
                  width: isChartVisible
                    ? `${Math.max(8, (value / maxChartValue) * 100)}%`
                    : '0%',
                }}
              />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <Card className="admin-pop-in p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Platform Statistics
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Relative platform volume across users, content, and reports.
              </p>
            </div>
            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
              Live
            </span>
          </div>

          <div className="mt-6 flex h-56 items-end gap-3">
            {chartItems.map(([label, value, gradient], index) => {
              const height = Math.max(8, (value / maxChartValue) * 100);

              return (
                <div
                  key={label}
                  className="flex min-w-0 flex-1 flex-col items-center gap-2"
                >
                  <div className="flex h-44 w-full items-end rounded-lg border border-white/[0.05] bg-white/[0.03] px-2">
                    <div
                      className={`w-full rounded-t-lg bg-gradient-to-t ${gradient}`}
                      style={{
                        height: isChartVisible ? `${height}%` : '0%',
                        transition:
                          'height 760ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                        transitionDelay: `${index * 90}ms`,
                      }}
                    />
                  </div>
                  <p className="text-xs font-semibold text-white">{value}</p>
                  <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {label}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="admin-pop-in p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Recent Audit Trail
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Latest admin and moderator actions.
              </p>
            </div>
          </div>

          <div className="mt-4 max-h-72 divide-y divide-white/[0.06] overflow-y-auto pr-1">
            {auditLogs.slice(0, 12).map((log) => (
              <div key={log.id} className="py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold capitalize text-slate-100">
                    {formatAction(log.action)}
                  </p>
                  <p className="shrink-0 text-[11px] text-slate-600">
                    {formatDate(log.createdAt)}
                  </p>
                </div>
                <p className="mt-1 truncate text-xs text-slate-400">
                  {log.actorEmail} ({log.actorRole})
                </p>
                <p className="mt-1 truncate text-[11px] text-slate-600">
                  {log.targetType}: {log.targetId}
                </p>
              </div>
            ))}
            {!auditLogs.length && (
              <p className="rounded-lg border border-dashed border-white/[0.08] p-6 text-center text-sm text-slate-500">
                No moderation actions recorded yet.
              </p>
            )}
          </div>
        </Card>
      </div>

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
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search users"
              className="min-w-0 flex-1 rounded-lg border border-white/[0.08] bg-[#051223] px-3 py-2 text-sm text-slate-100 outline-none"
            />
            <Button type="button" onClick={loadAdminData}>
              Search
            </Button>
          </div>

          <div className="divide-y divide-white/[0.06]">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-500 text-sm font-bold text-white">
                    {user.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {user.username}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {user.email} - {user.role}
                    </p>
                    {user.isSuspended && (
                      <p className="mt-1 text-xs text-rose-300">
                        {user.suspensionReason || 'Suspended'}
                      </p>
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Reports</h2>
              <p className="mt-1 text-xs text-slate-500">
                Review, dismiss, remove content, or suspend reported users.
              </p>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsStatusMenuOpen((current) => !current)}
                className="min-w-40 rounded-lg border border-white/[0.08] bg-[#051223] px-3 py-2 text-left text-sm font-semibold capitalize text-slate-100 transition hover:border-cyan-400/50"
              >
                {status}
                <span className="float-right text-slate-500">
                  {isStatusMenuOpen ? 'Up' : 'Down'}
                </span>
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
                      className={`block w-full px-3 py-2 text-left text-sm capitalize transition hover:bg-cyan-500/10 ${
                        status === item
                          ? 'bg-cyan-500/20 text-cyan-200'
                          : 'text-slate-300'
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
              <article
                key={report.id}
                className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 transition hover:border-cyan-400/30 hover:bg-white/[0.04]"
              >
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold capitalize text-white">
                      {report.targetType} - {report.reason}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      by {report.reporter?.username ?? 'Unknown'} -{' '}
                      {report.status}
                    </p>
                    {report.details && (
                      <p className="mt-3 text-sm leading-6 text-slate-300">
                        {report.details}
                      </p>
                    )}
                    <p className="mt-2 break-all text-xs text-slate-600">
                      {report.targetId}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => void updateReport(report, 'reviewed')}
                    >
                      Review
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => void updateReport(report, 'dismissed')}
                    >
                      Dismiss
                    </Button>
                    {report.targetType !== 'user' && (
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => void removeTarget(report)}
                      >
                        Remove
                      </Button>
                    )}
                    {report.targetType === 'user' && (
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => void suspendReportedUser(report)}
                      >
                        Suspend
                      </Button>
                    )}
                  </div>
                </div>
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
