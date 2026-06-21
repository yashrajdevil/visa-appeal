import { Router } from "express";
import { adminDb } from "./firebaseAdmin.js";
import slugify from "slugify";

const router = Router();

// ==== ADMIN ROUTES ====

// Settings
router.get("/admin/settings", async (req, res) => {
    try {
        const snapshot = await adminDb.collection("siteSettings").get();
        const settingsObj: Record<string, string> = {};
        snapshot.forEach(doc => {
            const data = doc.data();
            settingsObj[data.key] = data.value;
        });
        res.json(settingsObj);
    } catch(e) {
        res.status(500).json({ error: "Failed to fetch settings" });
    }
});

router.post("/admin/settings", async (req, res) => {
    const settings = req.body;
    try {
        const batch = adminDb.batch();
        for (const [key, value] of Object.entries(settings)) {
            const docRef = adminDb.collection("siteSettings").doc(key);
            batch.set(docRef, { key, value: value as string }, { merge: true });
        }
        await batch.commit();
        res.json({ success: true });
    } catch(e) {
        res.status(500).json({ error: "Failed to save settings" });
    }
});

// Media
router.get("/admin/media", async (req, res) => {
    try {
        const snapshot = await adminDb.collection("adminMedia").orderBy("uploadedAt", "desc").get();
        const media = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(media);
    } catch(e) {
        res.status(500).json({ error: "Failed to fetch media" });
    }
});

router.post("/admin/media", async (req, res) => {
    const { fileBase64, filename, mimeType } = req.body;
    if (!fileBase64 || !filename) return res.status(400).json({ error: "Missing fileData or filename" });
    
    const url = fileBase64.startsWith('data:') ? fileBase64 : `data:${mimeType || 'image/jpeg'};base64,${fileBase64}`;
    
    try {
        const ref = adminDb.collection("adminMedia").doc();
        const data = { id: ref.id, url, filename, altText: filename, uploadedAt: Date.now() };
        await ref.set(data);
        res.json(data);
    } catch(e) {
        res.status(500).json({ error: "Failed to upload media" });
    }
});

router.delete("/admin/media/:id", async (req, res) => {
    await adminDb.collection("adminMedia").doc(req.params.id).delete();
    res.json({ success: true });
});

// Categories
router.get("/admin/categories", async (req, res) => {
    const snapshot = await adminDb.collection("blogCategories").get();
    const sortedCategories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort logic could go here if needed
    res.json(sortedCategories);
});

router.post("/admin/categories", async (req, res) => {
    let { name, slug } = req.body;
    if (!slug) slug = slugify(name, { lower: true, strict: true });
    try {
        const ref = adminDb.collection("blogCategories").doc();
        const data = { id: ref.id, name, slug };
        await ref.set(data);
        res.json(data);
    } catch(e) {
        res.status(400).json({ error: "Failed to create category" });
    }
});

router.put("/admin/categories/:id", async (req, res) => {
    let { name, slug } = req.body;
    if (!slug) slug = slugify(name, { lower: true, strict: true });
    try {
        const ref = adminDb.collection("blogCategories").doc(req.params.id);
        const data = { name, slug };
        await ref.update(data);
        res.json({ id: req.params.id, ...data });
    } catch(e) {
        res.status(400).json({ error: "Failed to update category" });
    }
});

router.delete("/admin/categories/:id", async (req, res) => {
    await adminDb.collection("blogCategories").doc(req.params.id).delete();
    res.json({ success: true });
});

// Posts
router.get("/admin/posts", async (req, res) => {
    const snapshot = await adminDb.collection("blogPosts").orderBy("updatedAt", "desc").get();
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(posts);
});

router.get("/admin/posts/:id", async (req, res) => {
    const doc = await adminDb.collection("blogPosts").doc(req.params.id).get();
    if(!doc.exists) return res.status(404).json({error: 'Not found'});
    res.json({ id: doc.id, ...doc.data() });
});

router.post("/admin/posts", async (req, res) => {
    let { title, slug, status, postType } = req.body;
    if (!slug && title) {
        slug = slugify(title, { lower: true, strict: true });
        if (title === 'New Draft') slug += '-' + Date.now();
    }
    if (!slug) slug = "draft-" + Date.now();
    try {
        const ref = adminDb.collection("blogPosts").doc();
        const data = {
            id: ref.id,
            title: title || 'Untitled', 
            slug, 
            status: status || 'draft',
            postType: postType || 'blog',
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        await ref.set(data);
        res.json(data);
    } catch(e) {
        res.status(400).json({ error: "Failed to create post" });
    }
});

router.put("/admin/posts/:id", async (req, res) => {
    const { title, slug, metaTitle, metaDescription, featuredImage, categoryId, tagsJson, author, excerpt, content, faqsJson, status, postType } = req.body;
    
    const dbData: any = {
        title, slug, metaTitle, metaDescription, featuredImage, categoryId, tagsJson, author, excerpt, content, faqsJson, status, postType, updatedAt: Date.now()
    };
    try {
        const docRef = adminDb.collection("blogPosts").doc(req.params.id);
        const doc = await docRef.get();
        if (doc.exists) {
            if (status === 'published' && !doc.data()?.publishedAt) {
                dbData.publishedAt = Date.now();
            }
            await docRef.update(dbData);
            res.json({ id: req.params.id, ...(doc.data() || {}), ...dbData });
        } else {
            res.status(404).json({ error: "Not found" });
        }
    } catch(e) {
        res.status(400).json({ error: "Update failed" });
    }
});

router.delete("/admin/posts/:id", async (req, res) => {
    await adminDb.collection("blogPosts").doc(req.params.id).delete();
    res.json({ success: true });
});

// ==== PUBLIC ROUTES ====

router.get("/posts", async (req, res) => {
    const { search, type } = req.query;
    
    let query: any = adminDb.collection("blogPosts").where("status", "==", "published");
    if (type) {
        query = query.where("postType", "==", type);
    }

    const snapshot = await query.get();
    let posts = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    // Mock join with categories
    const catSnapshot = await adminDb.collection("blogCategories").get();
    const categories: any = {};
    catSnapshot.forEach(doc => categories[doc.id] = doc.data());

    posts = posts.map((p: any) => {
        const category = categories[p.categoryId || ""];
        return {
            ...p,
            category: category?.name,
            categorySlug: category?.slug
        };
    });

    if (search) {
        const searchTerms = (search as string).toLowerCase();
        posts = posts.filter((p: any) => 
            (p.title && p.title.toLowerCase().includes(searchTerms)) || 
            (p.content && p.content.toLowerCase().includes(searchTerms))
        );
    }

    posts.sort((a: any, b: any) => (b.publishedAt || 0) - (a.publishedAt || 0));
    res.json(posts);
});

router.get("/posts/:slug", async (req, res) => {
    const snapshot = await adminDb.collection("blogPosts")
        .where("slug", "==", req.params.slug)
        .where("status", "==", "published")
        .limit(1).get();
        
    if(snapshot.empty) return res.status(404).json({error: 'Not found'});
    
    const post = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as any;

    let category = null;
    if (post.categoryId) {
        const catDoc = await adminDb.collection("blogCategories").doc(post.categoryId).get();
        if (catDoc.exists) category = { id: catDoc.id, ...catDoc.data() };
    }
    
    res.json({ post, category });
});

router.post("/track-cta", async (req, res) => {
    const { action, articleId, headline, buttonText, destinationUrl } = req.body;
    
    if (!headline || !buttonText || !destinationUrl || !action) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const bannerId = Buffer.from(headline + buttonText + destinationUrl + (articleId || '')).toString('base64');
        const docRef = adminDb.collection("ctaBannerStats").doc(bannerId);
        
        await adminDb.runTransaction(async (t) => {
            const doc = await t.get(docRef);
            if (!doc.exists) {
                t.set(docRef, {
                    articleId: articleId || null,
                    headline, buttonText, destinationUrl,
                    views: action === 'view' ? 1 : 0,
                    clicks: action === 'click' ? 1 : 0,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                });
            } else {
                const data = doc.data() as any;
                t.update(docRef, {
                    views: data.views + (action === 'view' ? 1 : 0),
                    clicks: data.clicks + (action === 'click' ? 1 : 0),
                    updatedAt: Date.now()
                });
            }
        });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Tracking failed" });
    }
});

router.get("/admin/analytics/cta", async (req, res) => {
    try {
        const snapshot = await adminDb.collection("ctaBannerStats").get();
        const stats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Mock join with posts
        const postsSnapshot = await adminDb.collection("blogPosts").get();
        const posts: any = {};
        postsSnapshot.forEach(doc => posts[doc.id] = doc.data());

        const enrichedStats = stats.map((s: any) => ({
            ...s,
            articleTitle: s.articleId && posts[s.articleId] ? posts[s.articleId].title : null
        }));
        
        enrichedStats.sort((a: any, b: any) => (b.clicks || 0) - (a.clicks || 0));
        res.json(enrichedStats);
    } catch(e) {
        res.status(500).json({ error: "Failed to fetch analytics" });
    }
});

export { router as blogRouter };
