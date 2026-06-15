'use client';

import { Suspense, type FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import { loginUser } from '@/lib/authApi';
import { markLoginSuccess } from '@/lib/authUiState';
import { validateEmail } from '@/lib/formValidation';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout
          title="Welcome back"
          description="Continue where you left off."
        >
          <div className="h-72 animate-pulse rounded-xl bg-white/5" />
        </AuthLayout>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
  });

  const login = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    const nextFieldErrors = {
      email: validateEmail(email),
      password: password.trim() ? '' : 'Password is required.',
    };

    setFieldErrors(nextFieldErrors);

    if (nextFieldErrors.email || nextFieldErrors.password) {
      setError('Check the highlighted fields.');
      return;
    }

    try {
      setError('');
      setIsLoading(true);

      await loginUser({ email, password, rememberMe });
      markLoginSuccess(localStorage, sessionStorage);

      router.replace(searchParams.get('callbackUrl') || '/');
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Login failed',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
   <AuthLayout
  title="Welcome back"
  description="Continue where you left off."
>
  <form className="space-y-5" onSubmit={login}>
    <div>
      <label htmlFor="login-email" className="mb-2 block text-sm text-slate-300">
        Email
      </label>

      <input
        id="login-email"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setFieldErrors((current) => ({ ...current, email: '' }));
        }}
        placeholder="you@example.com"
        autoComplete="email"
        required
        aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
        aria-invalid={Boolean(fieldErrors.email)}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
      />
      {fieldErrors.email && (
        <p id="login-email-error" className="mt-2 text-xs text-rose-400">
          {fieldErrors.email}
        </p>
      )}
    </div>

    <div>
      <label htmlFor="login-password" className="mb-2 block text-sm text-slate-300">
        Password
      </label>

      <div className="relative">
        <input
          id="login-password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setFieldErrors((current) => ({ ...current, password: '' }));
          }}
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
          aria-invalid={Boolean(fieldErrors.password)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-16 text-white outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-white"
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      </div>
      {fieldErrors.password && (
        <p id="login-password-error" className="mt-2 text-xs text-rose-400">
          {fieldErrors.password}
        </p>
      )}
    </div>

    {error && (
      <div
        id="login-error"
        role="alert"
        className="rounded-xl border border-red-500/20 bg-red-500/10 p-3"
      >
        <p className="flex items-center gap-2 text-sm text-red-400">
          Warning: {error}
        </p>
      </div>
    )}

    <label
      className={`group relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-2xl border p-4 text-sm transition-all duration-200 ${
        rememberMe
          ? 'border-cyan-300/30 bg-cyan-400/[0.08] shadow-[0_16px_42px_rgba(14,165,233,0.12)]'
          : 'border-white/10 bg-white/[0.035] hover:border-cyan-300/25 hover:bg-white/[0.055]'
      }`}
    >
      <span className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-cyan-300 to-teal-300 opacity-0 transition-opacity group-has-[:checked]:opacity-100" />
      <input
        type="checkbox"
        checked={rememberMe}
        onChange={(event) => setRememberMe(event.target.checked)}
        className="peer sr-only"
      />

      <span
        aria-hidden="true"
        className={`relative flex h-7 w-12 shrink-0 items-center rounded-full border p-1 shadow-inner transition-all duration-300 ${
          rememberMe
            ? 'border-cyan-300/50 bg-cyan-400/20'
            : 'border-white/10 bg-slate-900/80'
        }`}
      >
        <span
          className={`h-5 w-5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.35)] transition-all duration-300 ease-out ${
            rememberMe
              ? 'translate-x-5 bg-gradient-to-br from-cyan-200 to-teal-300'
              : 'translate-x-0 bg-slate-400'
          }`}
        />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-3">
          <span className="font-semibold text-slate-100">Remember this device</span>
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition ${
              rememberMe
                ? 'bg-cyan-300/15 text-cyan-200'
                : 'bg-white/[0.06] text-slate-500'
            }`}
          >
            {rememberMe ? '30 days' : 'Off'}
          </span>
        </span>
        <span className="mt-1 block text-xs leading-5 text-slate-500">
          Stay signed in on this browser. Leave it off on shared computers.
        </span>
      </span>
    </label>

   <button
  type="submit"
  disabled={isLoading}
  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white transition-all hover:scale-[1.02] hover:bg-indigo-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
>
  {isLoading && (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
  )}

  <span>
    {isLoading ? 'Signing In...' : 'Sign In'}
  </span>
</button>

    <div className="text-center">
      <button
        type="button"
        onClick={() => router.push('/forgot-password')}
        className="mb-3 text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300"
      >
        Forgot password?
      </button>

      <p className="text-sm text-slate-400">
        Dont have an account?{' '}
        <button
          type="button"
          onClick={() => router.push('/signup')}
          className="font-medium text-indigo-400 transition-colors hover:text-indigo-300"
        >
          Create Account
        </button>
      </p>
    </div>
  </form>
</AuthLayout>
  );
}
