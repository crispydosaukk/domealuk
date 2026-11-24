/**
 * Subscription Scheduling & Recurring Billing Utilities for DoMeal
 */

/**
 * Returns the upcoming Saturday at 23:59:59.999 (UK billing cut-off).
 * If today is Saturday, moves to next week's Saturday unless specified otherwise.
 */
export function getNextSaturdayMidnight(fromDate: Date = new Date()): Date {
  const d = new Date(fromDate);
  const currentDay = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  let daysUntilSaturday = (6 - currentDay + 7) % 7;
  if (daysUntilSaturday === 0) {
    daysUntilSaturday = 7;
  }
  d.setDate(d.getDate() + daysUntilSaturday);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Formats a Date object to a readable date string: e.g. "Saturday, 21 Nov at 11:59 PM"
 */
export function formatRenewalDateString(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  return date.toLocaleDateString('en-GB', options);
}

/**
 * Calculates upcoming delivery dates for a renewed cycle based on plan frequency.
 */
export function calculateNextDeliveryDates(baseDates: string[] = [], frequency: string = 'Delivery every 1 Week'): string[] {
  const isBiWeekly = frequency.toLowerCase().includes('2 week');
  const isMonthly = frequency.toLowerCase().includes('4 week') || frequency.toLowerCase().includes('month');
  const daysToAdd = isMonthly ? 28 : isBiWeekly ? 14 : 7;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (baseDates.length > 0) {
    return baseDates.map((dStr: string) => {
      const d = new Date(dStr);
      if (isNaN(d.getTime())) {
        const fallback = new Date();
        fallback.setDate(fallback.getDate() + daysToAdd);
        return fallback.toISOString().split('T')[0];
      }
      d.setDate(d.getDate() + daysToAdd);
      // Ensure the renewed delivery date is strictly in the future
      while (d <= today) {
        d.setDate(d.getDate() + 7);
      }
      return d.toISOString().split('T')[0];
    });
  }

  // Fallback: Default to Monday & Thursday of next week
  const nextMonday = new Date();
  const day = nextMonday.getDay();
  const daysToMon = (1 - day + 7) % 7 || 7;
  nextMonday.setDate(nextMonday.getDate() + daysToMon);
  
  const nextThursday = new Date(nextMonday);
  nextThursday.setDate(nextMonday.getDate() + 3);

  return [nextMonday.toISOString().split('T')[0], nextThursday.toISOString().split('T')[0]];
}

/**
 * Determines whether an order is an active recurring subscription.
 */
export function isSubscriptionOrder(order: any): boolean {
  if (!order) return false;
  if (order.subscriptionStatus === 'cancelled' || order.status === 'Cancelled') return false;
  
  const hasFrequency = Boolean(order.subscriptionFrequency && order.subscriptionFrequency !== 'none');
  const isActiveStatus = order.subscriptionStatus === 'active';
  const isSubscriptionFlag = order.isSubscription === true;
  const hasStripeSub = Boolean(order.stripeSubscriptionId);

  return hasFrequency && (isActiveStatus || isSubscriptionFlag || hasStripeSub);
}

