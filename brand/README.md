# Brand images — production manifest

The real عدة creatives live here. The site reads them through
`src/lib/brandImages.ts`; until a file exists, an elegant labelled placeholder
is shown in its place (see `src/components/ui/BrandImage.tsx`).

## Production assets (light, bright identity)

| filename                 | where it shows                         | content                                   |
| ------------------------ | -------------------------------------- | ----------------------------------------- |
| `hero-technician.png`    | Hero (main visual)                     | الفنّي وحقيبة عدّته — أفق الرياض           |
| `service-plumbing.png`   | Services → السباكة + Showcase «ثقة»    | إصلاح سباكة تحت الحوض                      |
| `service-electrical.png` | Services → الكهرباء                    | صيانة لوحة كهربائية                        |
| `service-ac.png`         | Services → التكييف                     | صيانة وحدة تكييف جدارية                    |
| `tools-showcase.png`     | Services (أدوات) + CTA backdrop        | الأدوات الطائرة + اليد                     |
| `precision-workshop.png` | Showcase «دقّة لا تغلط»                | طاولة الفحص والمحابس + الشعار على الجدار   |
| `laban-map.png`          | نطاق الخدمة (قسم الخريطة)               | خريطة حي لبن مع الدبوس البرتقالي والشعار   |
| `logo-eddah.png`         | Footer brand tile · favicon · OG image | شعار عدة (أبيض على برتقالي)                |
| `eddah-logo-official.png`| Nav/Footer Logo component              | شعار عدة الرسمي الشفاف                     |

## Notes

- Originals were uploaded with random hashes (e.g. `DA784F67-…png`); the files
  above are the renamed production copies, kept alongside the originals.
- Recommended: ~1600px on the long edge, optimized. PNG/JPG/WebP all work — just
  keep the filename in sync with `src/lib/brandImages.ts`.
- Old dark/cinematic assets (brand-loop.mp4, craftsman/master/precision/
  products/silent-work/toolbag/tools-float/trust-water) were removed — the new
  bright creatives define the identity now.
