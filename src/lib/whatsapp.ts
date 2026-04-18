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
