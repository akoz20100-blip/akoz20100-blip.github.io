import { toggleLang, useLang } from '../lib/i18n';
import { useContent } from '../lib/content';

/**
 * Language toggle (EN ⇄ العربية). Shows the OTHER language's label and flips the
 * whole site — App's lang effect handles <html lang/dir>, the Thmanyah font, and
 * ScrollTrigger.refresh. The label always renders in its own script's font so the
 * Arabic "العربية" reads correctly even while the page is in English.
 */
export default function LangToggle({ className = '' }: { className?: string }) {
  const lang = useLang();
  const c = useContent();
  const toLang = lang === 'en' ? 'ar' : 'en';

  return (
    <button
      type="button"
      onClick={toggleLang}
      data-cursor="link"
      lang={toLang}
      aria-label={lang === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
      className={`pointer-events-auto inline-flex min-h-[40px] items-center justify-center border border-line/80 bg-ink/50 px-3 py-1.5 text-sm tracking-tight text-cream backdrop-blur transition-colors duration-200 hover:border-accent/60 hover:text-accent focus-visible:text-accent ${
        toLang === 'ar' ? 'font-arabic' : 'font-body'
      } ${className}`}
    >
      {c.langName}
    </button>
  );
}
