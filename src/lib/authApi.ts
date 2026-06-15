import { apiPostData, apiPostVoid } from '@/lib/apiClient';
import {
  decodeAuthOk,
  decodeMessageResponse,
  decodePasswordResetRequest,
  decodeRefreshSession,
} from '@/lib/apiSchemas';
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from '@/lib/formValidation';

function clearLegacyAuthTokenCookie() {
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

export async function loginUser(input: {
  email: string;
  password: string;
  rememberMe?: boolean;
}) {
  const emailError = validateEmail(input.email);
  if (emailError) throw new Error(emailError);

  if (!input.password.trim()) throw new Error('Password is required.');

  const data = await apiPostData(
    '/auth/login',
    {
      email: input.email.trim(),
      password: input.password,
      rememberMe: Boolean(input.rememberMe),
    },
    'Login failed',
    decodeAuthOk,
  );

  clearLegacyAuthTokenCookie();

  return data;
}

export async function registerUser(input: {
  username: string;
  email: string;
  password: string;
}) {
  const usernameError = validateUsername(input.username);
  if (usernameError) throw new Error(usernameError);

  const emailError = validateEmail(input.email);
  if (emailError) throw new Error(emailError);

  const passwordError = validatePassword(input.password);
  if (passwordError) throw new Error(passwordError);

  return apiPostVoid(
    '/auth/register',
    {
      username: input.username.trim(),
      email: input.email.trim(),
      password: input.password,
    },
    'Signup failed',
  );
}

export async function refreshSession() {
  return apiPostData(
    '/auth/refresh',
    undefined,
    'Session refresh failed',
    decodeRefreshSession,
  );
}

export async function logoutSession() {
  await apiPostVoid('/auth/logout', undefined, 'Logout failed');
  clearLegacyAuthTokenCookie();
}

export async function requestPasswordReset(email: string) {
  const emailError = validateEmail(email);
  if (emailError) throw new Error(emailError);

  return apiPostData(
    '/auth/forgot-password',
    {
      email: email.trim(),
    },
    'Password reset request failed',
    decodePasswordResetRequest,
  );
}

export async function resetPassword(input: {
  email: string;
  password: string;
  token: string;
}) {
  const emailError = validateEmail(input.email);
  if (emailError) throw new Error(emailError);

  const passwordError = validatePassword(input.password);
  if (passwordError) throw new Error(passwordError);

  if (!input.token.trim()) throw new Error('Reset token is required.');

  return apiPostData(
    '/auth/reset-password',
    {
      email: input.email.trim(),
      password: input.password,
      token: input.token.trim(),
    },
    'Password reset failed',
    decodeMessageResponse,
  );
}
