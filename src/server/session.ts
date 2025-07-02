export function getUserEmail(): string | null {
  try {
    return Session.getActiveUser().getEmail() || null;
  } catch (_e) {
    return null;
  }
}

export default getUserEmail;
