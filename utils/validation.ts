export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;

export function isValidUsername(username: string): { isValid: boolean; error?: string } {
  // Check length
  if (username.length < USERNAME_MIN_LENGTH) {
    return {
      isValid: false,
      error: `Username must be at least ${USERNAME_MIN_LENGTH} characters long`
    };
  }

  if (username.length > USERNAME_MAX_LENGTH) {
    return {
      isValid: false,
      error: `Username cannot be longer than ${USERNAME_MAX_LENGTH} characters`
    };
  }

  // Check if contains only letters (no numbers, no special characters)
  if (!/^[a-zA-Z]+$/.test(username)) {
    return {
      isValid: false,
      error: 'Username can only contain letters (no numbers or special characters)'
    };
  }

  return { isValid: true };
}

export function normalizeUsername(username: string): string {
  // Convert to lowercase for case-insensitive uniqueness
  return username.toLowerCase();
} 