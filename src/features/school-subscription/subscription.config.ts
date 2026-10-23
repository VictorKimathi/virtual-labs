export const MONTHLY_PRICE_KES = 5000;

// A yearly plan is billed for fewer months than it covers.
export const YEARLY_MONTHS_CHARGED = 10;

export const YEARLY_PRICE_KES = MONTHLY_PRICE_KES * YEARLY_MONTHS_CHARGED;
export const YEARLY_FREE_MONTHS = 12 - YEARLY_MONTHS_CHARGED;
export const YEARLY_SAVING_KES = MONTHLY_PRICE_KES * 12 - YEARLY_PRICE_KES;

export const PAYMENT_POLL_INTERVAL_MS = 3000;
export const PAYMENT_POLL_TIMEOUT_MS = 120_000;
