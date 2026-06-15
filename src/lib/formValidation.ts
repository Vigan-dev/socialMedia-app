const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernamePattern = /^[a-zA-Z0-9][a-zA-Z0-9._ -]{2,49}$/;

export function validateEmail(email: string) {
  if (!email.trim()) return 'Email is required.';
  if (!emailPattern.test(email.trim())) return 'Enter a valid email address.';
  return '';
}

export function validateUsername(username: string) {
  const value = username.trim();

  if (!value) return 'Display name is required.';
  if (value.length < 3) return 'Display name must be at least 3 characters.';
  if (value.length > 50) return 'Display name must be 50 characters or less.';
  if (!usernamePattern.test(value)) {
    return 'Use letters, numbers, spaces, dots, underscores, or hyphens.';
  }

  return '';
}

export function validatePassword(password: string) {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (password.length > 128) return 'Password must be 128 characters or less.';
  if (!/[A-Z]/.test(password)) return 'Add at least one uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Add at least one lowercase letter.';
  if (!/\d/.test(password)) return 'Add at least one number.';

  return '';
}

export function validateBio(bio: string) {
  if (bio.length > 280) return 'Bio must be 280 characters or less.';
  return '';
}
