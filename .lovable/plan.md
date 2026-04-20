
The user is asking if WhatsApp opening works now. Looking at the current `src/lib/whatsapp.ts`, the `openWhatsApp` function tries `window.top.location.href = url` first. In the Lovable preview iframe, this is **cross-origin** (preview is on `id-preview--...lovable.app`, top is on `lovable.dev`), so accessing `window.top.location` throws a SecurityError silently caught — but assigning to it may also be blocked, OR it navigates the entire Lovable editor away to WhatsApp, which is bad UX.

The screenshot the user shared earlier showed `ERR_BLOCKED_BY_RESPONSE` — that's WhatsApp's `X-Frame-Options: DENY` header preventing it from rendering inside the iframe. The root cause: somewhere the link is opening **inside the iframe** instead of a new tab.

Best fix: stop trying to navigate `window.top` (it hijacks the editor). Instead, always open in a real new tab/window via a user-gesture-triggered `<a target="_blank">` click. The current code already does this as fallback — but the `window.top.location.href` branch runs first and likely either errors or navigates the editor.

## Plan

**Fix `src/lib/whatsapp.ts`:**
1. Remove the `window.top.location.href` branch (it either fails cross-origin or hijacks the Lovable editor).
2. Use the synchronous `<a target="_blank" rel="noopener">` click as the primary method — this is the most reliable way to escape an iframe to a new tab and is preserved as a user gesture.
3. Keep `window.open` and `window.location.href` as fallbacks.
4. Optionally pre-open `window.open('about:blank', '_blank')` synchronously and then set its `location` — this preserves the user-gesture popup permission even better.

**Verification:** After the fix, use browser tools to navigate to `/reminders` or open an invoice, click WhatsApp, and confirm it opens `wa.me` in a new tab without the blocked-iframe page.

### Technical change (single file)

```ts
export const openWhatsApp = (url: string): void => {
  // Synchronously open a blank tab during the user gesture, then redirect it.
  // This is the most reliable cross-iframe pattern and avoids hijacking window.top.
  try {
    const newWin = window.open('about:blank', '_blank', 'noopener,noreferrer');
    if (newWin) {
      newWin.location.href = url;
      return;
    }
  } catch {}

  // Fallback: anchor click
  try {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  } catch {}

  // Last resort
  window.location.href = url;
};
```

This addresses the screenshot exactly: the previous version was navigating the iframe (or top window) to `wa.me`, which WhatsApp refuses to render via `X-Frame-Options`. By forcing a real new tab, WhatsApp loads as a normal top-level page where its X-Frame-Options check doesn't apply.
