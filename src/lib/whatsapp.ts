// Helpers for building WhatsApp click-to-chat links.
// wa.me requires the full international number with country code,
// digits only, and NO leading "+" or zeros.

export const normalizePhoneForWhatsApp = (raw: string): string => {
  if (!raw) return '';
  let digits = raw.replace(/\D/g, '');
  // Strip leading zeros (e.g. "00" international prefix or local "0")
  digits = digits.replace(/^0+/, '');
  return digits;
};

export const buildWhatsAppUrl = (phone: string, message: string): string | null => {
  const normalized = normalizePhoneForWhatsApp(phone);
  if (!normalized || normalized.length < 8) return null;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
};

/**
 * Opens WhatsApp reliably across browsers / popup blockers / preview iframes.
 * WhatsApp sends X-Frame-Options: DENY, so it cannot render inside an iframe.
 * We must open it in a real top-level new tab. We never touch window.top.location
 * because in cross-origin embeds (like the Lovable preview) that either throws
 * or hijacks the parent editor.
 */
export const openWhatsApp = (url: string): void => {
  // Primary: synchronous anchor click with target="_blank" — preserves the user
  // gesture and is the most reliable way to escape an iframe into a new tab.
  try {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  } catch {
    // fall through
  }

  // Fallback: window.open in a new tab.
  try {
    const newWin = window.open(url, '_blank', 'noopener,noreferrer');
    if (newWin) return;
  } catch {
    // fall through
  }

  // Last resort: navigate current frame.
  window.location.href = url;
};
