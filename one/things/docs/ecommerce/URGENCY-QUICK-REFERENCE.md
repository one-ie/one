# Urgency Elements - Quick Reference Guide

## 🚀 Quick Start

### 1. Countdown Timer
```tsx
import { CountdownTimer } from '@/components/ecommerce/interactive/CountdownTimer';

<CountdownTimer
  client:load
  endDate={new Date('2025-12-31T23:59:59')}
  label="Sale ends in"
  size="md"
/>
```

**Sizes:** `sm` | `md` | `lg`
**Urgency:** Turns red when < 1 hour remaining

---

### 2. Viewers Counter
```tsx
import { ViewersCounter } from '@/components/ecommerce/interactive/ViewersCounter';

<ViewersCounter
  client:load
  productId="product-123"
  size="sm"
/>
```

**Default:** 2-15 random viewers, updates every 8s
**Sizes:** `sm` | `md` | `lg`

---

### 3. Social Proof Notifications
```tsx
import { SocialProofNotification } from '@/components/ecommerce/interactive/SocialProofNotification';

{/* Add once at layout/page level */}
<SocialProofNotification client:load />
```

**Default:** Appears every 30-90s, auto-dismisses after 5s
**Location:** Bottom-right corner

---

### 4. Low Stock Warning
```tsx
// Automatic in ProductCard component
// Just set inventory < 10 in product data
const product = {
  ...productData,
  inventory: 5, // Shows "Only 5 left!" badge
  inStock: true
};
```

**Triggers:** When `inventory < 10` and `inStock === true`
**Features:** Pulsing red badge + warning message

---

## 📊 Customization

### Countdown Timer Props
```typescript
interface CountdownTimerProps {
  endDate: Date;           // Required: Sale end date
  label?: string;          // Optional: "Sale ends in"
  size?: 'sm'|'md'|'lg';  // Optional: "md"
  onComplete?: () => void; // Optional: Callback when done
}
```

### Viewers Counter Props
```typescript
interface ViewersCounterProps {
  productId: string;       // Required: Unique ID
  size?: 'sm'|'md'|'lg';  // Optional: "sm"
  minViewers?: number;     // Optional: 2
  maxViewers?: number;     // Optional: 15
  updateInterval?: number; // Optional: 8000ms
}
```

### Social Proof Props
```typescript
interface SocialProofNotificationProps {
  enabled?: boolean;       // Optional: true
  minInterval?: number;    // Optional: 30000ms (30s)
  maxInterval?: number;    // Optional: 90000ms (90s)
  duration?: number;       // Optional: 5000ms (5s)
}
```

---

## 🎨 Styling

All components use Tailwind CSS and adapt to your theme:

**Light Mode:**
- Countdown: Foreground text, red when urgent
- Viewers: Primary eye icon, green pulse
- Social Proof: White background, green accents
- Low Stock: Red badge, orange warning

**Dark Mode:**
- Automatically adapts using `dark:` classes
- Maintains urgency colors for psychology
- Ensures readability in all contexts

---

## 📱 Responsive Behavior

**Mobile (< 640px):**
- Countdown: Smaller font, vertical stacking
- Viewers: Compact layout
- Social Proof: Full-width on mobile
- Low Stock: Same visibility

**Tablet (640px - 1024px):**
- All elements scale proportionally
- Touch-friendly sizing

**Desktop (> 1024px):**
- Full size and spacing
- Hover effects enabled

---

## 🎯 Best Practices

### Countdown Timers
✅ Use for flash sales, daily deals, limited offers
✅ Set realistic end times (24-48 hours works best)
✅ Place above the fold on sale pages
❌ Don't use multiple countdowns on same page
❌ Don't fake the countdown (always use real dates)

### Viewers Counter
✅ Use on product detail pages and popular items
✅ Set realistic ranges (2-15 for niche, 10-50 for popular)
✅ Place near product title or add-to-cart button
❌ Don't show on out-of-stock items
❌ Don't use same count across all products

### Social Proof
✅ Enable site-wide for consistent social proof
✅ Use realistic names, cities, and products
✅ Keep intervals random (30-90s feels natural)
❌ Don't show too frequently (< 20s feels spammy)
❌ Don't block important UI elements

### Low Stock
✅ Show when inventory < 10 units
✅ Update in real-time as stock depletes
✅ Combine with "hurry" copy for urgency
❌ Don't fake low stock warnings
❌ Don't show on pre-order items

---

## 🔧 Implementation Checklist

- [ ] Install Framer Motion: `bun add framer-motion`
- [ ] Import components in your page/layout
- [ ] Add `client:load` directive for interactivity
- [ ] Set product inventory data (< 10 for warnings)
- [ ] Configure countdown end dates
- [ ] Test on mobile and desktop
- [ ] Verify dark mode styling
- [ ] Check performance (Lighthouse score)

---

## 📈 Expected Impact

Based on ecommerce research:

**Countdown Timers:** +15-30% conversions
**Low Stock Warnings:** +20-40% sales
**Social Proof:** +15-25% conversions
**Viewers Counter:** +10-20% engagement

**Combined Effect:** +30-50% overall conversion improvement

---

## 🐛 Troubleshooting

### Countdown not updating?
- Ensure `client:load` directive is present
- Check endDate is in the future
- Verify timezone settings

### Viewers count not changing?
- Counter updates every 8s by default
- Set custom `updateInterval` if needed
- Check React DevTools for component mount

### Social proof not appearing?
- Wait 5-15s after page load (initial delay)
- Check browser console for errors
- Ensure component is mounted once per page

### Low stock badge not showing?
- Verify `inventory < 10`
- Check `inStock === true`
- Ensure ProductCard is using latest version

---

## 📚 Related Documentation

- `/ecommerce/demo-urgency` - Live demo page
- `URGENCY-IMPLEMENTATION-SUMMARY.md` - Full technical details
- `ECOMMERCE-HIGH-CONVERTING-ELEMENTS.md` - Research basis

---

## 💡 Pro Tips

1. **A/B Test:** Try different countdown durations (24h vs 48h)
2. **Timing:** Show social proof more frequently during peak hours
3. **Copy:** "Only X left" outperforms "Low stock"
4. **Position:** Place countdown above fold for max impact
5. **Color:** Red/orange urgency colors proven most effective

---

**Need Help?** Check the demo page: `/ecommerce/demo-urgency`
