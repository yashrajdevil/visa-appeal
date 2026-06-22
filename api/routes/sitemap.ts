import { Router, Request, Response } from 'express';
import { getDb } from '../firebase.js';

const router = Router();

function getSiteUrl(): string {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  if (process.env.APP_URL && !process.env.APP_URL.includes('localhost')) return process.env.APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return 'https://visa-appeal.vercel.app';
}

const staticPages = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/sample-report', changefreq: 'monthly', priority: '0.6' },
  { loc: '/guides', changefreq: 'weekly', priority: '0.8' },
  { loc: '/blog', changefreq: 'daily', priority: '0.9' },
  { loc: '/contact', changefreq: 'monthly', priority: '0.5' },
  { loc: '/about', changefreq: 'monthly', priority: '0.5' },
  { loc: '/privacy', changefreq: 'yearly', priority: '0.3' },
  { loc: '/terms', changefreq: 'yearly', priority: '0.3' },
  { loc: '/refund', changefreq: 'yearly', priority: '0.3' },
  { loc: '/why-choose-us', changefreq: 'monthly', priority: '0.6' },
];

router.get('/sitemap.xml', async (_req: Request, res: Response) => {
  try {
    const SITE_URL = getSiteUrl();
    const urls: string[] = [];

    for (const page of staticPages) {
      urls.push(`  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
    }

    try {
      const db = getDb();
      const articlesSnap = await db.collection('articles')
        .where('status', '==', 'published')
        .orderBy('publishedAt', 'desc')
        .get();

      for (const doc of articlesSnap.docs) {
        const data = doc.data();
        const slug = data.slug || doc.id;
        const lastmod = data.updatedAt
          ? new Date(data.updatedAt.seconds * 1000).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];
        urls.push(`  <url>
    <loc>${SITE_URL}/blog/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
      }
    } catch (dbErr) {
      console.error('[Sitemap] Firestore unavailable, serving static sitemap:', (dbErr as Error).message);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    return res.send(xml);
  } catch (err: any) {
    console.error('[Sitemap Error]', err);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
