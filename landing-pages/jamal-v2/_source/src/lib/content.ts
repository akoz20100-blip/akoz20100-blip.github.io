import { useLang, type Lang } from './i18n';

/**
 * Single source of truth for every visible string, in English and Arabic.
 * Components read `useContent()` and never hard-code copy.
 * Latin tokens that are intentionally NOT translated (the JAMAL wordmark,
 * the email, €, 360°, the 01–05 index numbers) stay literal in both trees.
 *
 * v2 additions: hero.cta, showcase.badges/priceFrame/sizeGuide/origin,
 * footer.newsletter, footer.appointment — added without breaking any existing
 * field names so all components continue to compile.
 */
export interface SiteContent {
  langName: string;
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
    /** v2: primary CTA button below the headline */
    cta: string;
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
    /** v2: trust signal chips below the price */
    badges: string[];
    /** v2: full price framing line */
    priceFrame: string;
    /** v2: size guide link label */
    sizeGuide: string;
    /** v2: origin line */
    origin: string;
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
    /** v2: newsletter form */
    newsletter: { label: string; placeholder: string; submit: string };
    /** v2: appointment booking form */
    appointment: { label: string; namePlaceholder: string; emailPlaceholder: string; submit: string };
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
    kicker: 'New Season — The Atelier Set',
    vol: 'Vol. 01 — Est. 2026',
    line1: 'One garment.',
    line2: 'Every angle',
    line2Accent: '.',
    chipKicker: 'The piece',
    chipBody: 'Garment-washed European linen · 360° in the light.',
    cue: 'Scroll to rotate',
    sectionAria: 'JAMAL — the linen set, rotating',
    zoomHint: 'Hold to look closer',
    cta: 'Shop the Collection',
  },
  manifesto: {
    index: '01 — Atelier',
    brief: 'The brief',
    statementPre:
      'We make one thing, and we make it completely — a single linen set, cut for ease and finished by hand. No seasons, no noise. Just cloth that breathes, softens with wear, and is meant to be ',
    statementAccent: 'lived in',
    statementPost: '.',
    figCaption: 'European linen · garment-washed · Lisbon',
    lead: 'Garment-washed European linen, a grandad-collar shirt and a relaxed trouser, drawn in one warm neutral. A two-person studio, considered from every angle — which is why you can turn it in the light above, and why nothing here is left to chance.',
  },
  showcase: {
    piece: 'The piece',
    index: '02 — The Collection',
    title: 'The Atelier Set',
    lead: 'One quietly complete outfit. A grandad-collar shirt that softens with every wash, worn with a relaxed drawstring trouser — both cut from the same garment-washed European linen, in a single warm neutral.',
    specs: [
      { label: 'Fabric', value: '100% European linen' },
      { label: 'Finish', value: 'Garment-washed, hand-pressed' },
      { label: 'Buttons', value: 'Hand-sewn coconut shell' },
      { label: 'Seams', value: 'Double-felled for longevity' },
      { label: 'Sizes', value: 'XS — XXL' },
      { label: 'Origin', value: 'Lisbon, Portugal' },
    ],
    price: 'From €280',
    enquire: 'Reserve Your Set',
    badges: ['European Linen', 'Garment Washed', 'Handcrafted'],
    priceFrame: 'Two-Piece Atelier Set · Starting at €280',
    sizeGuide: 'Size Guide',
    origin: 'Crafted in Lisbon by hand',
  },
  marquee: [
    'Garment-washed European linen',
    'Made by hand in Lisbon',
    'One considered set',
    'Since 2026',
    'Appointments welcome',
  ],
  loadingLabel: 'Loading the atelier',
  details: {
    index: '03 — In wear',
    band: 'Cut for ease. Worn in company.',
    kicker: 'Considered details',
    title: "The work is in the things you don't notice.",
    notes: [
      'Coconut buttons, hand-sewn one by one',
      'Side seams double-felled for softness that lasts',
      'Pre-washed — never shrinks, only softens',
      'One neutral, dyed in small batches · Lisbon',
    ],
  },
  gallery: {
    index: '04 — Lookbook',
    explore: 'Scroll to explore',
    title1: 'Worn,',
    title2: 'not displayed.',
    intro: 'One set, many lives. Shot in warm light and worn the way it should be.',
    outro: 'Claim your set.',
    enquire: 'Reserve Now',
    captions: [
      'Morning light, terrace',
      'Doorway, Alfama',
      'The set — front view',
      'Evening, worn loose',
      'Collar study, natural light',
      'The set — back view',
    ],
    regionAria: 'Lookbook — use arrow keys or scroll to browse six images',
  },
  footer: {
    index: '05 — Contact',
    title: 'Visit the',
    titleAccent: 'atelier.',
    email: 'atelier@jamal-linen.com',
    about:
      'A small studio in Lisbon. We make one thing at a time, in quantities that make sense. Studio visits by appointment — always welcome.',
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
        title: 'Information',
        links: [
          { label: 'Size Guide', href: '#collection' },
          { label: 'Care Instructions', href: '#atelier' },
          { label: 'Instagram', href: 'https://instagram.com' },
          { label: 'Pinterest', href: 'https://pinterest.com' },
        ],
      },
    ],
    backToTop: 'Back to top ↑',
    copyright: '© 2026 JAMAL Linen Atelier. All rights reserved.',
    newsletter: {
      label: 'New collections, first.',
      placeholder: 'your@email.com',
      submit: 'Subscribe',
    },
    appointment: {
      label: 'Book a studio visit',
      namePlaceholder: 'Your name',
      emailPlaceholder: 'your@email.com',
      submit: 'Request Appointment →',
    },
  },
};

const ar: SiteContent = {
  langName: 'EN',
  nav: {
    items: [
      { label: 'المجموعة', href: '#collection' },
      { label: 'الأتيليه', href: '#atelier' },
      { label: 'المعرض', href: '#gallery' },
      { label: 'تواصل معنا', href: '#contact' },
    ],
    open: 'فتح القائمة',
    close: 'إغلاق القائمة',
    tagline: 'أتيليه الكتّان · لشبونة',
    primary: 'الرئيسية',
    mobile: 'الجوال',
    backToTop: 'إلى الأعلى ↑',
    toAria: 'جمال — أتيليه الكتّان، العودة إلى الأعلى',
  },
  hero: {
    kicker: 'الموسم الجديد — طقم الأتيليه',
    vol: 'العدد ٠١ — منذ ٢٠٢٦',
    line1: 'قطعةٌ واحدة،',
    line2: 'من كل زاوية',
    line2Accent: '.',
    chipKicker: 'القطعة',
    chipBody: 'كتّان أوروبي مغسول · ٣٦٠° في الضوء.',
    cue: 'مرّر للدوران',
    sectionAria: 'جمال — طقم الكتّان، يدور',
    zoomHint: 'اضغط مطوّلاً للتقريب',
    cta: 'تسوّق المجموعة',
  },
  manifesto: {
    index: '٠١ — الأتيليه',
    brief: 'الموجز',
    statementPre:
      'نصنع شيئاً واحداً، ونُتقنه كاملاً — طقم كتّانٍ واحد، مقصوصٌ للراحة ومُنجَزٌ باليد. لا مواسم، ولا ضجيج. مجرّد قماشٍ يتنفّس، يلين مع الارتداء، وصُنِع ',
    statementAccent: 'لِيُعاش فيه',
    statementPost: '.',
    figCaption: 'كتّان أوروبي · مغسول · لشبونة',
    lead: 'كتّان أوروبي مغسول، قميصٌ بياقة الجَدّ وبنطالٌ مريح، بلونٍ محايدٍ دافئٍ واحد. استوديو من شخصَين، مدروسٌ من كل زاوية — لذا يمكنك تدويره في الضوء أعلاه، ولذا لا شيء هنا متروكٌ للصدفة.',
  },
  showcase: {
    piece: 'القطعة',
    index: '٠٢ — المجموعة',
    title: 'طقم الأتيليه',
    lead: 'إطلالةٌ مكتملةٌ بهدوء. قميصٌ بياقة الجَدّ يلين مع كل غسلة، يُرتدى مع بنطالٍ مريحٍ برباط — كلاهما مقصوصان من الكتّان الأوروبي المغسول نفسه، بلونٍ محايدٍ دافئٍ واحد.',
    specs: [
      { label: 'الخامة', value: 'كتّان أوروبي ١٠٠٪' },
      { label: 'التشطيب', value: 'مغسول يدوياً، مكويٌّ باليد' },
      { label: 'الأزرار', value: 'جوز الهند، مخيط يدوياً' },
      { label: 'الخياطة', value: 'مزدوجة مطويّة للمتانة' },
      { label: 'المقاسات', value: 'XS — XXL' },
      { label: 'المنشأ', value: 'لشبونة، البرتغال' },
    ],
    price: 'يبدأ من €280',
    enquire: 'احجز طقمك',
    badges: ['كتّان أوروبي', 'مغسول يدوياً', 'مصنوع حرفياً'],
    priceFrame: 'طقم الأتيليه — قطعتان · يبدأ من €280',
    sizeGuide: 'دليل المقاسات',
    origin: 'مصنوع في لشبونة باليد',
  },
  marquee: [
    'كتّان أوروبي مغسول',
    'صُنِع باليد في لشبونة',
    'طقمٌ مدروس واحد',
    'منذ ٢٠٢٦',
    'الزيارات بالموعد',
  ],
  loadingLabel: 'جارٍ تحضير الأتيليه',
  details: {
    index: '٠٣ — في الارتداء',
    band: 'مقصوصٌ للراحة. يُرتدى بصُحبة.',
    kicker: 'تفاصيل مدروسة',
    title: 'الإتقان في ما لا تُلاحظه.',
    notes: [
      'أزرار جوز الهند، مخيطة باليد واحدةً واحدة',
      'خياطةٌ جانبية مزدوجة مطويّة — نعومةٌ تدوم',
      'مغسولٌ مسبقاً — لا ينكمش، فقط يلين',
      'لونٌ محايدٌ واحد، مصبوغٌ بدفعاتٍ صغيرة · لشبونة',
    ],
  },
  gallery: {
    index: '٠٤ — المعرض',
    explore: 'مرّر للاستكشاف',
    title1: 'يُرتدى،',
    title2: 'لا يُعرَض.',
    intro: 'طقمٌ واحد، حيواتٌ كثيرة. مُصوّرٌ في ضوءٍ دافئ ومُرتدى كما ينبغي.',
    outro: 'اجعله لك.',
    enquire: 'احجز الآن',
    captions: [
      'في سكون، صباحاً',
      'عند العتبة، ألفاما',
      'الطقم — من الأمام',
      'مساءً، منسدل بحرية',
      'دراسة الياقة في الضوء الطبيعي',
      'الطقم — من الخلف',
    ],
    regionAria: 'دفتر الإطلالات — استخدم مفاتيح الأسهم أو مرّر لتصفح ست صور',
  },
  footer: {
    index: '٠٥ — تواصل',
    title: 'زُر',
    titleAccent: 'الأتيليه.',
    email: 'atelier@jamal-linen.com',
    about:
      'استوديو صغير في لشبونة. نصنع قطعة واحدة في كل مرة، بكمياتٍ تعكس قيمة الصنعة. زيارات الأتيليه بموعدٍ مسبق — أهلاً دائماً.',
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
        title: 'معلومات',
        links: [
          { label: 'دليل المقاسات', href: '#collection' },
          { label: 'العناية بالقماش', href: '#atelier' },
          { label: 'إنستغرام', href: 'https://instagram.com' },
          { label: 'بنترست', href: 'https://pinterest.com' },
        ],
      },
    ],
    backToTop: 'إلى الأعلى ↑',
    copyright: '© ٢٠٢٦ جمال أتيليه الكتّان. جميع الحقوق محفوظة.',
    newsletter: {
      label: 'كُن أول من يعلم بالمجموعات الجديدة.',
      placeholder: 'بريدك الإلكتروني',
      submit: 'اشترك',
    },
    appointment: {
      label: 'احجز زيارة للاستوديو',
      namePlaceholder: 'اسمك',
      emailPlaceholder: 'بريدك الإلكتروني',
      submit: 'طلب موعد ←',
    },
  },
};

export const CONTENT: Record<Lang, SiteContent> = { en, ar };

/** The content object for the active language. */
export function useContent(): SiteContent {
  return CONTENT[useLang()];
}
