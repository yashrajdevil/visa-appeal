import { useState, useEffect, useCallback } from 'react';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, query, orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import { BlogCategory } from '../types';
import slugify from 'slugify';

const COLLECTION = 'categories';

function docToCategory(d: any): BlogCategory {
  const data = d.data();
  return {
    id: d.id,
    name: data.name || '',
    slug: data.slug || '',
    description: data.description || '',
    createdAt: data.createdAt?.toMillis?.() || Date.now(),
  };
}

export function useCategories() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, COLLECTION), orderBy('name', 'asc'));
      const snap = await getDocs(q);
      setCategories(snap.docs.map(docToCategory));
    } catch { setCategories([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const createCategory = useCallback(async (name: string, slug?: string, description?: string): Promise<boolean> => {
    try {
      await addDoc(collection(db, COLLECTION), {
        name,
        slug: slug || slugify(name, { lower: true, strict: true }),
        description: description || '',
        createdAt: Timestamp.now(),
      });
      await fetchCategories();
      return true;
    } catch { return false; }
  }, [fetchCategories]);

  const updateCategory = useCallback(async (id: string, name: string, slug?: string, description?: string): Promise<boolean> => {
    try {
      await updateDoc(doc(db, COLLECTION, id), { name, slug: slug || slugify(name, { lower: true, strict: true }), description: description || '' });
      await fetchCategories();
      return true;
    } catch { return false; }
  }, [fetchCategories]);

  const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
      await fetchCategories();
      return true;
    } catch { return false; }
  }, [fetchCategories]);

  return { categories, loading, createCategory, updateCategory, deleteCategory, fetchCategories };
}
