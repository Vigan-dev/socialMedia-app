'use client';

import { type FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import { registerUser } from '@/lib/authApi';
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from '@/lib/formValidation';

function getPasswordStrength(password: string) {
  const checks = [
    password.length >= 8,
    password.length >= 12,
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const ratio = Math.round((score / checks.length) * 100);

  if (!password) {
    return {
      className: 'bg-slate-700',
      label: 'No password yet',
      ratio: 0,
    };
  }

  if (ratio < 50) {
    return {
      className: 'bg-rose-500',
      label: 'Weak',
      ratio,
    };
  }

  if (ratio < 70) {
    return {
      className: 'bg-amber-400',
      label: 'Fair',
      ratio,
    };
  }

  if (ratio < 90) {
    return {
      className: 'bg-sky-400',
      label: 'Good',
      ratio,
    };
  }

  return {
    className: 'bg-emerald-400',
    label: 'Strong',
    ratio,
  };
}

export default function SignupPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const passwordStrength = getPasswordStrength(password);

  const signup = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    try {
      setError('');

      const nextFieldErrors = {
        username: validateUsername(username),
        email: validateEmail(email),
        password: validatePassword(password),
        confirmPassword:
          password === confirmPassword ? '' : 'Passwords do not match.',
      };

      setFieldErrors(nextFieldErrors);

      if (
        nextFieldErrors.username ||
        nextFieldErrors.email ||
        nextFieldErrors.password ||
        nextFieldErrors.confirmPassword
      ) {
        setError('Check the highlighted fields.');
        return;
      }

      setIsLoading(true);

      await registerUser({ username, email, password });

      router.push('/login');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Signup failed',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      description="Join the Versatile community."
    >
      <form className="space-y-5" onSubmit={signup}>
        <div>
          <label htmlFor="signup-username" className="mb-2 block text-sm text-slate-300">
            Username
          </label>

          <input
            id="signup-username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setFieldErrors((current) => ({ ...current, username: '' }));
            }}
            placeholder="Choose a username"
            autoComplete="username"
            maxLength={50}
            required
            aria-describedby={fieldErrors.username ? 'signup-username-error' : undefined}
            aria-invalid={Boolean(fieldErrors.username)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
          {fieldErrors.username && (
            <p id="signup-username-error" className="mt-2 text-xs text-rose-400">
              {fieldErrors.username}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="signup-email" className="mb-2 block text-sm text-slate-300">
            Email
          </label>

          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors((current) => ({ ...current, email: '' }));
            }}
            placeholder="you@example.com"
            autoComplete="email"
            required
            aria-describedby={fieldErrors.email ? 'signup-email-error' : undefined}
            aria-invalid={Boolean(fieldErrors.email)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
          {fieldErrors.email && (
            <p id="signup-email-error" className="mt-2 text-xs text-rose-400">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="signup-password" className="mb-2 block text-sm text-slate-300">
            Password
          </label>

          <div className="relative">
            <input
              id="signup-password"
              type={
                showPassword
                  ? 'text'
                  : 'password'
              }
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors((current) => ({
                  ...current,
                  password: '',
                  confirmPassword: '',
                }));
              }}
              placeholder="Create a password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
              aria-describedby={
                fieldErrors.password
                  ? 'signup-password-strength signup-password-error'
                  : 'signup-password-strength'
              }
              aria-invalid={Boolean(fieldErrors.password)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-16 text-white outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  !showPassword,
                )
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-white"
            >
              {showPassword
                ? 'Hide'
                : 'Show'}
            </button>
          </div>
          <div id="signup-password-strength" className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300">
                Password strength
              </span>
              <span className="text-slate-500">
                {passwordStrength.label} - {passwordStrength.ratio}%
              </span>
            </div>
            <div
              aria-hidden="true"
              className="h-2 overflow-hidden rounded-full bg-white/10"
            >
              <div
                className={`h-full rounded-full transition-all duration-300 ${passwordStrength.className}`}
                style={{ width: `${passwordStrength.ratio}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">
              Use 12+ characters with uppercase, lowercase, numbers, and symbols.
            </p>
          </div>
          {fieldErrors.password && (
            <p id="signup-password-error" className="mt-2 text-xs text-rose-400">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="signup-confirm-password" className="mb-2 block text-sm text-slate-300">
            Confirm Password
          </label>

          <div className="relative">
            <input
              id="signup-confirm-password"
              type={
                showConfirmPassword
                  ? 'text'
                  : 'password'
              }
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setFieldErrors((current) => ({
                  ...current,
                  confirmPassword: '',
                }));
              }}
              placeholder="Confirm password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
              aria-describedby={
                fieldErrors.confirmPassword ? 'signup-confirm-password-error' : undefined
              }
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-16 text-white outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(
                  !showConfirmPassword,
                )
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-white"
            >
              {showConfirmPassword
                ? 'Hide'
                : 'Show'}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <p
              id="signup-confirm-password-error"
              className="mt-2 text-xs text-rose-400"
            >
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        {error && (
          <div
            id="signup-error"
            role="alert"
            className="rounded-xl border border-red-500/20 bg-red-500/10 p-3"
          >
            <p className="flex items-center gap-2 text-sm text-red-400">
              Warning: {error}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white transition-all hover:scale-[1.02] hover:bg-indigo-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}

          <span>
            {isLoading
              ? 'Creating Account...'
              : 'Create Account'}
          </span>
        </button>

        <div className="text-center">
          <p className="text-sm text-slate-400">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() =>
                router.push('/login')
              }
              className="font-medium text-indigo-400 transition-colors hover:text-indigo-300"
            >
              Sign In
            </button>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
