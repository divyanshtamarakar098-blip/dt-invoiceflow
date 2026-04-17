
The user wants three changes:
1. Remove the pricing/Pro/paid tier — make all features free for everyone.
2. Hide the "Edit with Lovable" badge on the published app.
3. On first sign-in or guest entry, ask once whether the user is from India or outside, then format currency as ₹ (INR) for India and $ (USD) otherwise.

Badge hiding requires Pro plan — I'll call `set_badge_visibility` and surface that to the user if needed.

## Plan

### 1. Make everything free (remove Pro gating)
- **Delete** `src/pages/Pricing.tsx` and `src/components/ProGate.tsx`.
- **Remove** `Pricing` route from `src/App.tsx`.
- **Remove** "Pricing" link from `src/components/AppSidebar.tsx` and `src/components/MobileNav.tsx` (if present).
- **`src/pages/Invoices.tsx`**: drop `FREE_INVOICE_LIMIT`, `isPro`, `atLimit`, and "Upgrade" button — always show "New Invoice".
- **`src/pages/Analytics.tsx`** and **`src/pages/Reminders.tsx`**: remove any `ProGate` wrappers so all users get full access.
- **`src/context/SubscriptionContext.tsx`**: simplify to always return `isPro: true` (keeps existing imports working without breaking) OR remove the provider from `App.tsx` and delete the file. I'll go with deletion + removing the import for cleanliness.
- Remove any "Upgrade" CTAs from dashboard/sidebar.

### 2. Hide "Edit with Lovable" badge
- Call `set_badge_visibility(hide_badge: true)`. If the workspace is not on Pro, the tool will report it and I'll let the user know they need to upgrade their Lovable plan to hide it (this is separate from the app's own pricing).

### 3. One-time region picker → currency formatting
- **New component** `src/components/RegionPickerDialog.tsx`: modal dialog with two choices — "I'm from India (₹)" and "Outside India ($)". Cannot be dismissed without choosing.
- **New context** `src/context/RegionContext.tsx`:
  - State: `region: 'IN' | 'INTL' | null`, `currency: 'INR' | 'USD'`, `formatCurrency(n)` helper.
  - Persist to `localStorage` under key `user_region`.
  - On mount, if no stored value → show the dialog.
  - Wrap app with `<RegionProvider>` in `App.tsx`.
- **Replace currency formatting** across the app (currently hardcoded `Intl.NumberFormat('en-US', {currency:'USD'})` in `Invoices.tsx`, `Dashboard.tsx`, `Analytics.tsx`, `Payments.tsx`, `InvoiceDetailDialog.tsx`) with `formatCurrency` from the region context.
- Note: this is a **display-only** conversion — amounts stored in the DB stay as the raw number; we just change the symbol/locale. (No FX conversion is performed; the same numeric value is shown with the chosen currency symbol. If you want actual FX conversion, say so and I'll add a fixed rate.)

### Files touched
```text
DELETE  src/pages/Pricing.tsx
DELETE  src/components/ProGate.tsx
DELETE  src/context/SubscriptionContext.tsx
NEW     src/components/RegionPickerDialog.tsx
NEW     src/context/RegionContext.tsx
EDIT    src/App.tsx                 (routes, providers)
EDIT    src/components/AppSidebar.tsx, MobileNav.tsx  (remove Pricing link)
EDIT    src/pages/Invoices.tsx      (remove limit/upgrade, use region currency)
EDIT    src/pages/Dashboard.tsx     (region currency)
EDIT    src/pages/Analytics.tsx     (remove ProGate, region currency)
EDIT    src/pages/Reminders.tsx     (remove ProGate)
EDIT    src/pages/Payments.tsx      (region currency)
EDIT    src/components/InvoiceDetailDialog.tsx (region currency)
TOOL    set_badge_visibility(hide_badge=true)
```

### Behavior summary
- Every user (signed-in or guest) gets unlimited invoices, analytics, and reminders.
- First app entry shows a blocking modal: "Where are you based?" → India or Outside India.
- Choice saved in localStorage; all amounts shown with ₹ or $ accordingly.
- "Edit with Lovable" badge hidden on the published site (subject to Lovable plan).
