import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title: string;
  description: string;
  type?: 'website' | 'article' | 'SoftwareApplication' | 'FAQPage';
  imageUrl?: string;
  canonicalUrl?: string;
  schema?: Record<string, any>;
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
}

const SITE_NAME = 'Visa Appeal Builder';
const DEFAULT_IMAGE = 'https://visaappealbuilder.com/og-image.jpg';

export default function SEO({
  title,
  description,
  type = 'website',
  imageUrl = DEFAULT_IMAGE,
  canonicalUrl,
  schema,
  noindex = false,
  publishedTime,
  modifiedTime,
}: SEOProps) {
  const location = useLocation();
  const currentUrl = canonicalUrl || `https://visaappealbuilder.com${location.pathname}`;
  const ogType = type === 'article' ? 'article' : type === 'FAQPage' ? 'website' : type === 'SoftwareApplication' ? 'website' : 'website';

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={currentUrl} />
      {noindex ? <meta name="robots" content="noindex, nofollow" /> : <meta name="robots" content="index, follow" />}

      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:site" content="@visaappeal" />

      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
