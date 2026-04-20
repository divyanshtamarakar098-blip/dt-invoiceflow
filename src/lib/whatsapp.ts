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
 * In the Lovable preview, WhatsApp can be blocked if it tries to render inside the iframe,
 * so we first navigate the top window. Outside the preview, we keep the normal new-tab flow.
 */
export const openWhatsApp = (url: string): void => {
  try {
    if (window.top && window.top !== window.self) {
      window.top.location.href = url;
      return;
    }
  } catch {
    // Cross-frame access can fail in some environments; continue to safe fallbacks.
  }

  try {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch {
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      window.location.href = url;
    }
  }
};
