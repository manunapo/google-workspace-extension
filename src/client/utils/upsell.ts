/**
 * Helper function to determine if the upsell modal should be shown
 * @param remainingCredits - The user's current credit balance
 * @returns true if modal should be shown, false otherwise
 */
export function shouldShowUpsell(remainingCredits: number): boolean {
  // Check if credits are below threshold
  if (remainingCredits > 15) {
    return false;
  }

  // Check localStorage for last shown timestamp
  const lastShownAt = localStorage.getItem('lastUpsellShownAt');

  if (!lastShownAt) {
    // Never shown before
    return true;
  }

  // Check if 24 hours have passed
  const lastShownDate = new Date(lastShownAt);
  const now = new Date();
  const hoursSinceLastShown =
    (now.getTime() - lastShownDate.getTime()) / (1000 * 60 * 60);

  return hoursSinceLastShown > 24;
}

/**
 * Mark that the upsell modal has been shown
 */
export function markUpsellShown(): void {
  localStorage.setItem('lastUpsellShownAt', new Date().toISOString());
}
