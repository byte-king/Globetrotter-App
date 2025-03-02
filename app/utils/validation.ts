/**
 * Validates if a username contains only letters (no numbers or special characters)
 */
export function isValidUsername(username: string): boolean {
  const lettersOnlyRegex = /^[a-zA-Z]+$/;
  return lettersOnlyRegex.test(username);
}

/**
 * Normalizes a username by converting it to lowercase for case-insensitive comparison
 */
export function normalizeUsername(username: string): string {
  return username.toLowerCase();
}

/**
 * Validates if an email address has a valid format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
} 