export interface DocumentItem {
  item: string;
  why: string;
}

export interface SeoGuideContent {
  meaning: string;
  whyItHappens: string;
  commonMistakes: string[];
  whatToFix: string[];
  documentChecklist: {
    required: DocumentItem[];
    recommended: DocumentItem[];
    optional: DocumentItem[];
  };
  reapplicationStrategy: { step: string; description: string }[];
}

export interface SeoGuide {
  id: string;
  slug: string;
  seoTitle: string;
  metaDescription: string;
  primaryKeyword: string;
  country: string;
  visaType: string;
  refusalReason: string;
  content: SeoGuideContent | string;
  relatedSlugs: string[];
}
