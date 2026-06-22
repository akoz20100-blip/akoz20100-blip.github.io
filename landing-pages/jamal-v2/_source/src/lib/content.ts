import { useLang, type Lang } from './i18n';

/**
 * Single source of truth for every visible string, in English and Arabic.
 * Components read `useContent()` and never hard-code copy, so the language
 * toggle swaps the whole site. Latin tokens that are intentionally NOT
 * translated (the JAMAL wordmark, the email, €, 360°, the 01–05 index numbers)
 * stay literal in both trees.
 */
export interface SiteContent {
  langName: string; // label shown on the toggle for the OTHER language
  nav: {
    items: { label: string; href: string }[];
    open: string;
    close: string;
    tagline: string;
    primary: string;
    mobile: string;
    backToTop: string;
    toAria: string;
  };
  hero: {
    kicker: string;
    vol: string;
    line1: string;
    line2: string;
    line2Accent: string;
    chipKicker: string;
    chipBody: string;
    cue: string;
    sectionAria: string;
    zoomHint: string;
  };
  manifesto: {
    index: string;
    brief: string;
    statementPre: string;
    statementAccent: string;
    statementPost: string;
    figCaption: string;
    lead: string;
  };
  showcase: {
    piece: string;
    index: string;
    title: string;
    lead: string;
    specs: { label: string; value: string }[];
    price: string;
    enquire: string;
  };
  marquee: string[];
  loadingLabel: string;
  details: {
    index: string;
    band: string;
    kicker: string;
    title: string;
    notes: string[];
  };
  gallery: {
    index: string;
    explore: string;
    title1: string;
    title2: string;
    intro: string;
    outro: string;
    enquire: string;
    captions: string[];
    regionAria: string;
  };
  footer: {
    index: string;
    title: string;
    titleAccent: string;
    email: string;
    about: string;
    place: string;
    columns: { title: string; links: { label: string; href: string }[] }[];
    backToTop: string;
    copyright: string;
  };
}

const en: SiteContent = {
  langName: 'العربية',
  nav: {
    items: [
      { label: 'Collection', href: '#collection' },
      { label: 'Atelier', href: '#atelier' },
      { label: 'Gallery', href: '#gallery' },
      { label: 'Contact', href: '#contact' },
    ],
    open: 'Open menu',
    close: 'Close menu',
    tagline: 'Linen Atelier · Lisbon',
    primary: 'Primary',
    mobile: 'Mobile',
    backToTop: 'Back to top ↑',
    toAria: 'JAMAL — Linen Atelier, back to top',
  },
  hero: {
    kicker: 'Linen Atelier',
    vol: 'Vol. 01 — Est. 2026',
    line1: 'One garment.',
    line2: 'Every angle',
    line2Accent: '.',
    chipKicker: 'The piece',
    chipBody: 'Garment-washed European linen · 360° in the light.',
    cue: 'Scroll to rotate',
    sectionAria: 'JAMAL — the linen set, rotating',
    zoomHint: 'Hold to look closer',
  },
  manifesto: {
    index: '01 — Manifesto',
    brief: 'The brief',
    statementPre:
      'We make one thing, and we make it completely — a single linen set, cut for ease and finished by hand. No seasons, no noise. Just cloth that breathes, softens with wear, and is meant to be ',
    statementAccent: 'lived in',
    statementPost: '.',
    figCaption: 'European linen · garment-washed',
    lead: 'Garment-washed European linen, a grandad-collar shirt and a relaxed trouser, drawn in one neutral. Considered from every angle — which is why you can turn it in the light above, and why nothing here is left to chance.',
  },
  showcase: {
    piece: 'The piece',
    index: '02 — The Collection',
    title: 'The Atelier Set',
    lead: 'One quietly complete outfit. A grandad-collar shirt that softens with every wash, worn with a relaxed drawstring trouser — both cut from the same garment-washed European linen, in a single warm neutral.',
    specs: [
      { label: 'Fabric', value: '100% European linen' },
      { label: 'Finish', value: 'Garment-washed, hand-pressed' },
      { label: 'Collar', value: 'Grandad / band' },
      { label: 'Fit', value: 'Relaxed, drawstring trouser' },
    ],
    price: 'From €280',
    enquire: 'Enquire',
  },
  marquee: [
    'Garment-washed linen',
    'Made by hand',
    'One considered set',
    'Lisbon',
    'Est. 2026',
  ],
  loadingLabel: 'Loading the atelier',
  details: {
    index: '03 — In wear',
    band: 'Cut for ease. Worn in company.',
    kicker: 'Considered details',
    title: 'The work is in the things you don’t notice.',
    notes: [
      'Coconut buttons, sewn by hand',
      'Side seams felled for softness',
      'Pre-washed so it never shrinks on you',
      'One neutral, dyed in small batches',
    ],
  },
  gallery: {
    index: '04 — Gallery',
    explore: 'Scroll to explore',
    title1: 'The',
    title2: 'lookbook',
    intro: 'One set, many lives. Shot in warm light and worn the way it should be.',
    outro: 'Make it yours.',
    enquire: 'Enquire',
    captions: [
      'At rest',
      'Doorway',
      'The set — front',
      'Evening',
      'Collar study',
      'The set — back',
    ],
    regionAria: 'Lookbook — use arrow keys or scroll to browse',
  },
  footer: {
    index: '05 — Contact',
    title: 'Let’s talk',
    titleAccent: '.',
    email: 'atelier@jamal-linen.com',
    about: 'JAMAL is a linen atelier making one considered set, by hand, in small batches. Studio visits by appointment.',
    place: 'Lisbon · By appointment',
    columns: [
      {
        title: 'Explore',
        links: [
          { label: 'Collection', href: '#collection' },
          { label: 'Atelier', href: '#atelier' },
          { label: 'Gallery', href: '#gallery' },
        ],
      },
      {
        title: 'Social',
        links: [
          { label: 'Instagram', href: 'https://instagram.com' },
          { label: 'Pinterest', href: 'https://pinterest.com' },
          { label: 'Journal', href: '#atelier' },
        ],
      },
    ],
    backToTop: 'Back to top ↑',
    copyright: '© 2026 JAMAL Linen Atelier. All rights reserved.',
  },
};

const ar: SiteContent = {
  langName: 'EN',
  nav: {
    items: [
      { label: 'المجموعة', href: '#collection' },
      { label: 'الأتيليه', href: '#atelier' },
      { label: 'المعرض', href: '#gallery' },
      { label: 'تواصل', href: '#contact' },
    ],
    open: 'افتح القائمة',
    close: 'أغلق القائمة',
    tagline: 'أتيليه الكتّان · لشبونة',
    primary: 'الرئيسية',
    mobile: 'الجوال',
    backToTop: 'إلى الأعلى ↑',
    toAria: 'جمال — أتيليه الكتّان، العودة إلى الأعلى',
  },
  hero: {
    kicker: 'أتيليه الكتّان',
    vol: 'العدد 01 — منذ 2026',
    line1: 'قطعةٌ واحدة.',
    line2: 'من كل زاوية',
    line2Accent: '.',
    chipKicker: 'القطعة',
    chipBody: 'كتّان أوروبي مغسول · 360° في الضوء.',
    cue: 'مرّر للدوران',
    sectionAria: 'جمال — طقم الكتّان، يدور',
    zoomHint: 'اضغط مطوّلاً للتقريب',
  },
  manifesto: {
    index: '01 — البيان',
    brief: 'الموجز',
    statementPre:
      'نصنع شيئاً واحداً، ونُتقنه كاملاً — طقم كتّانٍ واحد، مقصوصٌ للراحة ومُنجَزٌ باليد. لا مواسم، ولا ضجيج. مجرّد قماشٍ يتنفّس، يلين مع الارتداء، وصُنِع ',
    statementAccent: 'لِيُعاش فيه',
    statementPost: '.',
    figCaption: 'كتّان أوروبي · مغسول',
    lead: 'كتّان أوروبي مغسول، قميصٌ بياقة الجَدّ وبنطالٌ مريح، بلونٍ محايدٍ واحد. مدروسٌ من كل زاوية — لذا يمكنك تدويره في الضوء أعلاه، ولذا لا شيء هنا متروكٌ للصدفة.',
  },
  showcase: {
    piece: 'القطعة',
    index: '02 — المجموعة',
    title: 'طقم الأتيليه',
    lead: 'إطلالةٌ مكتملةٌ بهدوء. قميصٌ بياقة الجَدّ يلين مع كل غسلة، يُرتدى مع بنطالٍ مريحٍ برباط — كلاهما مقصوصان من الكتّان الأوروبي المغسول نفسه، بلونٍ محايدٍ دافئٍ واحد.',
    specs: [
      { label: 'الخامة', value: 'كتّان أوروبي 100%' },
      { label: 'التشطيب', value: 'مغسول، مكويٌّ باليد' },
      { label: 'الياقة', value: 'ياقة الجَدّ' },
      { label: 'القَصّة', value: 'مريحة، بنطال برباط' },
    ],
    price: 'يبدأ من €280',
    enquire: 'استفسر',
  },
  marquee: [
    'كتّان مغسول',
    'صُنِع باليد',
    'طقمٌ مدروس',
    'لشبونة',
    'منذ 2026',
  ],
  loadingLabel: 'جارٍ تحضير الأتيليه',
  details: {
    index: '03 — في الارتداء',
    band: 'مقصوصٌ للراحة. يُرتدى بصُحبة.',
    kicker: 'تفاصيل مدروسة',
    title: 'الإتقان في ما لا تُلاحظه.',
    notes: [
      'أزرار جوز الهند، مخيطة باليد',
      'خياطةٌ جانبية مطويّة للنعومة',
      'مغسولٌ مسبقاً فلا ينكمش عليك',
      'لونٌ محايدٌ واحد، مصبوغٌ بدفعاتٍ صغيرة',
    ],
  },
  gallery: {
    index: '04 — المعرض',
    explore: 'مرّر للاستكشاف',
    title1: 'دفتر',
    title2: 'الإطلالات',
    intro: 'طقمٌ واحد، حيواتٌ كثيرة. مُصوّرٌ في ضوءٍ دافئ ومُرتدى كما ينبغي.',
    outro: 'اجعله لك.',
    enquire: 'استفسر',
    captions: [
      'في سكون',
      'عند الباب',
      'الطقم — أمام',
      'مساءً',
      'دراسة الياقة',
      'الطقم — خلف',
    ],
    regionAria: 'دفتر الإطلالات — استخدم مفاتيح الأسهم أو مرّر للتصفح',
  },
  footer: {
    index: '05 — تواصل',
    title: 'لنتحدّث',
    titleAccent: '.',
    email: 'atelier@jamal-linen.com',
    about: 'جمال أتيليه كتّان يصنع طقماً واحداً مدروساً، باليد، بدفعاتٍ صغيرة. زيارات الأتيليه بموعدٍ مسبق.',
    place: 'لشبونة · بموعدٍ مسبق',
    columns: [
      {
        title: 'استكشف',
        links: [
          { label: 'المجموعة', href: '#collection' },
          { label: 'الأتيليه', href: '#atelier' },
          { label: 'المعرض', href: '#gallery' },
        ],
      },
      {
        title: 'تابعنا',
        links: [
          { label: 'إنستغرام', href: 'https://instagram.com' },
          { label: 'بنترست', href: 'https://pinterest.com' },
          { label: 'المجلّة', href: '#atelier' },
        ],
      },
    ],
    backToTop: 'إلى الأعلى ↑',
    copyright: '© 2026 جمال أتيليه الكتّان. جميع الحقوق محفوظة.',
  },
};

export const CONTENT: Record<Lang, SiteContent> = { en, ar };

/** The content object for the active language. */
export function useContent(): SiteContent {
  return CONTENT[useLang()];
}
