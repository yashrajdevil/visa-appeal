import { useState, useEffect, useCallback } from 'react';
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter, Timestamp, increment, DocumentSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';
import { Article } from '../types';
import slugify from 'slugify';

const ARTICLES_COLLECTION = 'articles';
const PAGE_SIZE = 12;

function docToArticle(doc: any): Article {
  const d = doc.data();
  return {
    id: doc.id,
    title: d.title || '',
    slug: d.slug || '',
    excerpt: d.excerpt || '',
    content: d.content || '',
    featuredImage: d.featuredImage || '',
    status: d.status || 'draft',
    author: d.author || 'Admin',
    categories: d.categories || [],
    tags: d.tags || [],
    seoTitle: d.seoTitle || '',
    seoDescription: d.seoDescription || '',
    ogImage: d.ogImage || '',
    canonicalUrl: d.canonicalUrl || '',
    publishedAt: d.publishedAt?.toMillis?.() || d.publishedAt || null,
    createdAt: d.createdAt?.toMillis?.() || d.createdAt || Date.now(),
    updatedAt: d.updatedAt?.toMillis?.() || d.updatedAt || Date.now(),
    views: d.views || 0,
    readingTime: d.readingTime || 0,
  };
}

function generateSlug(title: string): string {
  return slugify(title, { lower: true, strict: true }) || 'untitled';
}

function calculateReadingTime(content: string): number {
  const text = content.replace(/<[^>]*>/g, '');
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [publishedCount, setPublishedCount] = useState(0);
  const [draftCount, setDraftCount] = useState(0);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, ARTICLES_COLLECTION),
        orderBy('updatedAt', 'desc')
      );
      const snap = await getDocs(q);
      const items = snap.docs.map(docToArticle);
      setArticles(items);
      setTotalCount(items.length);
      setPublishedCount(items.filter(a => a.status === 'published').length);
      setDraftCount(items.filter(a => a.status === 'draft').length);
    } catch (err) {
      console.error('[Articles] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const getArticle = useCallback(async (id: string): Promise<Article | null> => {
    try {
      const snap = await getDoc(doc(db, ARTICLES_COLLECTION, id));
      if (!snap.exists()) return null;
      return docToArticle(snap);
    } catch { return null; }
  }, []);

  const getArticleBySlug = useCallback(async (slug: string): Promise<Article | null> => {
    try {
      const q = query(collection(db, ARTICLES_COLLECTION), where('slug', '==', slug), limit(1));
      const snap = await getDocs(q);
      if (snap.empty) return null;
      return docToArticle(snap.docs[0]);
    } catch { return null; }
  }, []);

  const saveArticle = useCallback(async (data: Partial<Article> & { title: string }): Promise<string | null> => {
    try {
      const slug = data.slug || generateSlug(data.title);
      const readingTime = calculateReadingTime(data.content || '');
      const now = Timestamp.now();

      if (data.id) {
        const updateData: any = { ...data, slug, readingTime, updatedAt: now };
        delete updateData.id;
        delete updateData.createdAt;
        if (updateData.status === 'published' && !updateData.publishedAt) {
          updateData.publishedAt = now;
        }
        await updateDoc(doc(db, ARTICLES_COLLECTION, data.id), updateData);
        return data.id;
      } else {
        const docRef = await addDoc(collection(db, ARTICLES_COLLECTION), {
          ...data,
          slug,
          readingTime,
          status: data.status || 'draft',
          views: 0,
          createdAt: now,
          updatedAt: now,
          publishedAt: data.status === 'published' ? now : null,
        });
        return docRef.id;
      }
    } catch (err) {
      console.error('[Articles] save error:', err);
      return null;
    }
  }, []);

  const deleteArticle = useCallback(async (id: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, ARTICLES_COLLECTION, id));
      return true;
    } catch { return false; }
  }, []);

  const incrementViews = useCallback(async (id: string) => {
    try {
      await updateDoc(doc(db, ARTICLES_COLLECTION, id), { views: increment(1) });
    } catch {}
  }, []);

  return {
    articles, loading, totalCount, publishedCount, draftCount,
    fetchArticles, getArticle, getArticleBySlug, saveArticle, deleteArticle, incrementViews,
  };
}

export function useBlogPosts() {
  const [posts, setPosts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);

  const fetchPublished = useCallback(async (category?: string, tag?: string, search?: string) => {
    setLoading(true);
    try {
      const constraints: any[] = [where('status', '==', 'published'), orderBy('publishedAt', 'desc')];
      if (category) constraints.push(where('categories', 'array-contains', category));
      if (tag) constraints.push(where('tags', 'array-contains', tag));

      const q = query(collection(db, ARTICLES_COLLECTION), ...constraints, limit(PAGE_SIZE));
      const snap = await getDocs(q);
      let items = snap.docs.map(docToArticle);

      if (search) {
        const s = search.toLowerCase();
        items = items.filter(a => a.title.toLowerCase().includes(s) || a.excerpt.toLowerCase().includes(s));
      }

      setPosts(items);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch (err) {
      console.error('[Blog] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!lastDoc || !hasMore) return;
    try {
      const q = query(
        collection(db, ARTICLES_COLLECTION),
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc'),
        startAfter(lastDoc),
        limit(PAGE_SIZE)
      );
      const snap = await getDocs(q);
      const items = snap.docs.map(docToArticle);
      setPosts(prev => [...prev, ...items]);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch {}
  }, [lastDoc, hasMore]);

  return { posts, loading, hasMore, fetchPublished, loadMore };
}

export function useMediaLibrary() {
  const [media, setMedia] = useState<{ id: string; url: string; name: string; uploadedAt: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'media'), orderBy('uploadedAt', 'desc'));
      const snap = await getDocs(q);
      setMedia(snap.docs.map(d => ({
        id: d.id,
        url: d.data().url || '',
        name: d.data().name || 'unnamed',
        uploadedAt: d.data().uploadedAt?.toMillis?.() || Date.now(),
      })));
    } catch { setMedia([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    try {
      const path = `media/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await addDoc(collection(db, 'media'), { url, name: file.name, uploadedAt: Timestamp.now() });
      await fetchMedia();
      return url;
    } catch (err) {
      console.error('[Media] upload error:', err);
      return null;
    }
  }, [fetchMedia]);

  const deleteMedia = useCallback(async (id: string, url: string) => {
    try {
      const storageRef = ref(storage, url);
      await deleteObject(storageRef);
      await deleteDoc(doc(db, 'media', id));
      await fetchMedia();
    } catch (err) {
      console.error('[Media] delete error:', err);
    }
  }, [fetchMedia]);

  return { media, loading, uploadFile, deleteMedia, fetchMedia };
}
