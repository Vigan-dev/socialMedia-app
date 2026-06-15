'use client';

import { type FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import { requestPasswordReset, resetPassword } from '@/lib/authApi';
import { validateEmail, validatePassword } from '@/lib/formValidation';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    token: '',
    password: '',
    confirmPassword: '',
  });

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const emailError = validateEmail(email);
    setFieldErrors((current) => ({ ...current, email: emailError }));

    if (emailError) {
      setError('Check the highlighted fields.');
      return;
    }

    try {
      setError('');
      setMessage('');
      setIsRequesting(true);
      const response = await requestPasswordReset(email);
      setMessage(response.message);

      if (response.resetToken) {
        setToken(response.resetToken);
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Password reset request failed',
      );
    } finally {
      setIsRequesting(false);
    }
  }

  async function submitReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextFieldErrors = {
      email: validateEmail(email),
      token: token.trim() ? '' : 'Reset token is required.',
      password: validatePassword(password),
      confirmPassword:
        password === confirmPassword ? '' : 'Passwords do not match.',
    };
    setFieldErrors(nextFieldErrors);

    if (
      nextFieldErrors.email ||
      nextFieldErrors.token ||
      nextFieldErrors.password ||
      nextFieldErrors.confirmPassword
    ) {
      setError('Check the highlighted fields.');
      return;
    }

    try {
      setError('');
      setMessage('');
      setIsResetting(true);
      const response = await resetPassword({ email, password, token });
      setMessage(response.message);
      setPassword('');
      setConfirmPassword('');
      setToken('');
    } catch (resetError) {
      setError(
        resetError instanceof Error ? resetError.message : 'Password reset failed',
      );
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      description="Request a reset token, then set a new password."
    >
      <div className="space-y-6">
        <form className="space-y-4" onSubmit={submitRequest}>
          <div>
            <label htmlFor="reset-email" className="mb-2 block text-sm text-slate-300">
              Email
            </label>
            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setFieldErrors((current) => ({ ...current, email: '' }));
              }}
              autoComplete="email"
              required
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'reset-email-error' : undefined}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="you@example.com"
            />
            {fieldErrors.email && (
              <p id="reset-email-error" className="mt-2 text-xs text-rose-400">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isRequesting}
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRequesting ? 'Sending reset token...' : 'Send reset token'}
          </button>
        </form>

        <form className="space-y-4 border-t border-white/10 pt-6" onSubmit={submitReset}>
          <div>
            <label htmlFor="reset-token" className="mb-2 block text-sm text-slate-300">
              Reset Token
            </label>
            <input
              id="reset-token"
              value={token}
              onChange={(event) => {
                setToken(event.target.value);
                setFieldErrors((current) => ({ ...current, token: '' }));
              }}
              autoComplete="one-time-code"
              required
              aria-invalid={Boolean(fieldErrors.token)}
              aria-describedby={fieldErrors.token ? 'reset-token-error' : undefined}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Paste the reset token"
            />
            {fieldErrors.token && (
              <p id="reset-token-error" className="mt-2 text-xs text-rose-400">
                {fieldErrors.token}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="new-password" className="mb-2 block text-sm text-slate-300">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setFieldErrors((current) => ({ ...current, password: '' }));
              }}
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? 'new-password-error' : undefined}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Create a new password"
            />
            {fieldErrors.password && (
              <p id="new-password-error" className="mt-2 text-xs text-rose-400">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirm-new-password"
              className="mb-2 block text-sm text-slate-300"
            >
              Confirm New Password
            </label>
            <input
              id="confirm-new-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setFieldErrors((current) => ({
                  ...current,
                  confirmPassword: '',
                }));
              }}
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
              aria-describedby={
                fieldErrors.confirmPassword
                  ? 'confirm-new-password-error'
                  : undefined
              }
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Confirm the new password"
            />
            {fieldErrors.confirmPassword && (
              <p
                id="confirm-new-password-error"
                className="mt-2 text-xs text-rose-400"
              >
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isResetting}
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isResetting ? 'Resetting password...' : 'Reset password'}
          </button>
        </form>

        {message && (
          <p role="status" className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
            {message}
          </p>
        )}

        {error && (
          <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={() => router.push('/login')}
          className="w-full text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300"
        >
          Back to sign in
        </button>
      </div>
    </AuthLayout>
  );
}
