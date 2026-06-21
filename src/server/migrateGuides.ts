import { adminDb } from "./firebaseAdmin.js";
import { seoGuides } from "../data/seoGuides.js";
import slugify from "slugify";

async function migrateGuides() {
    console.log("Starting Guides Migration...");
    
    // Create 'Guides' category if it doesn't exist
    const categorySlug = 'guides';
    const catQuery = await adminDb.collection("blogCategories").where("slug", "==", categorySlug).get();
    let category: any;
    
    if (catQuery.empty) {
        const ref = adminDb.collection("blogCategories").doc();
        category = { id: ref.id, name: "Guides", slug: categorySlug };
        await ref.set(category);
    } else {
        category = { id: catQuery.docs[0].id, ...catQuery.docs[0].data() };
    }
    
    let count = 0;
    
    for (const guide of seoGuides) {
        const existing = await adminDb.collection("blogPosts").where("slug", "==", guide.slug).get();
        let htmlContent = "";
        if (typeof guide.content === 'string') {
            htmlContent = guide.content;
        } else {
            const c = guide.content;
            htmlContent += `<h2>What This Refusal Really Means</h2>\n<p>${c.meaning}</p>\n\n`;
            htmlContent += `<h2>Why It Happens (Visa Officer Logic)</h2>\n<p>${c.whyItHappens}</p>\n\n`;
            htmlContent += `<h2>Common Mistakes Applicants Make</h2>\n<ul>\n`;
            c.commonMistakes.forEach((m: string) => htmlContent += `<li>${m}</li>\n`);
            htmlContent += `</ul>\n\n`;
            htmlContent += `<h2>What to Fix Before Reapplying</h2>\n<ul>\n`;
            c.whatToFix.forEach((m: string) => htmlContent += `<li>${m}</li>\n`);
            htmlContent += `</ul>\n\n`;
            
            htmlContent += `<h2>Strategic Document Checklist</h2>\n`;
            htmlContent += `<h3>Required Core Evidence</h3>\n<ul>\n`;
            c.documentChecklist.required.forEach((doc: any) => htmlContent += `<li><strong>${doc.item}:</strong> ${doc.why}</li>\n`);
            htmlContent += `</ul>\n\n`;
            htmlContent += `<h3>Recommended Strengthening Evidence</h3>\n<ul>\n`;
            c.documentChecklist.recommended.forEach((doc: any) => htmlContent += `<li><strong>${doc.item}:</strong> ${doc.why}</li>\n`);
            htmlContent += `</ul>\n\n`;
            
            if (c.documentChecklist.optional?.length > 0) {
                htmlContent += `<h3>Optional Contextual Evidence</h3>\n<ul>\n`;
                c.documentChecklist.optional.forEach((doc: any) => htmlContent += `<li><strong>${doc.item}:</strong> ${doc.why}</li>\n`);
                htmlContent += `</ul>\n\n`;
            }

            htmlContent += `<h2>Step-by-Step Reapplication Strategy</h2>\n<ol>\n`;
            c.reapplicationStrategy.forEach((strat: any) => htmlContent += `<li><strong>${strat.step}:</strong> ${strat.description}</li>\n`);
            htmlContent += `</ol>\n\n`;
        }
        
        if (existing.empty) {
            const ref = adminDb.collection("blogPosts").doc();
            await ref.set({
                id: ref.id,
                title: guide.seoTitle,
                slug: guide.slug,
                metaTitle: guide.seoTitle || '',
                metaDescription: guide.metaDescription || '',
                categoryId: category.id,
                excerpt: guide.metaDescription || '',
                content: htmlContent,
                postType: 'guide',
                status: 'published',
                publishedAt: Date.now()
            });
            count++;
            console.log(`Migrated: ${guide.slug}`);
        } else {
            console.log(`Skipped existing: ${guide.slug}`);
            await adminDb.collection("blogPosts").doc(existing.docs[0].id).update({ postType: 'guide' });
        }
    }
    
    console.log(`Migration completed. Migrated ${count} guides.`);
}

migrateGuides().catch(console.error);
