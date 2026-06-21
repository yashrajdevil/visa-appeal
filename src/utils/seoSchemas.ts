export const getOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Visa Appeal Builder",
  "url": "https://visaappealbuilder.com",
  "logo": "https://visaappealbuilder.com/logo.png",
  "description": "AI-powered Visa Appeal Builder SaaS analyzing refusal letters to generate embassy-ready appeal packages.",
  "sameAs": [
    "https://twitter.com/visaappeal",
    "https://linkedin.com/company/visaappealbuilder"
  ]
});

export const getSoftwareAppSchema = () => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Visa Appeal Builder",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "9.99",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "bestRating": "5",
    "ratingCount": "1250"
  },
  "creator": {
    "@type": "Organization",
    "name": "Visa Appeal Builder"
  },
  "featureList": [
    "AI Refusal Letter Analysis",
    "Embassy-Ready Appeal Letters",
    "Personalized Document Checklists",
    "Reapplication Strategy Generator"
  ]
});

export const getFAQSchema = () => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is this legally guaranteed?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No, this is a document preparation tool. The final decision always rests with the respective consular officer. We provide structuring based on best practices."
      }
    },
    {
      "@type": "Question",
      "name": "Does it work for all countries?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, our engine utilizes country-specific formatting logic adaptable to major embassy requirements (Schengen, US, UK, Canada, Australia)."
      }
    },
    {
      "@type": "Question",
      "name": "Is my data stored?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We employ minimal storage with secure processing. Uploaded refusal documents are analyzed securely and are not used to train generic models."
      }
    },
    {
      "@type": "Question",
      "name": "Can I reuse this for multiple applications?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, you can generate fresh appeals with new inputs as needed based on your selected pricing tier."
      }
    }
  ]
});

export const getBreadcrumbsSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

export const getArticleSchema = (article: { title: string; description: string; url: string; datePublished: string; imageUrl?: string; authorName?: string }) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": article.url
  },
  "headline": article.title,
  "description": article.description,
  "image": article.imageUrl || "https://visaappealbuilder.com/og-image.jpg",
  "author": {
    "@type": "Person",
    "name": article.authorName || "Visa Appeal Team"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Visa Appeal Builder",
    "logo": {
      "@type": "ImageObject",
      "url": "https://visaappealbuilder.com/logo.png"
    }
  },
  "datePublished": article.datePublished,
  "dateModified": new Date().toISOString().split('T')[0]
});
