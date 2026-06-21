import express from "express";
import { adminAuth, adminDb } from "./firebaseAdmin.js";
import crypto from "crypto";

export const creemRouter = express.Router();
export const creemWebhookRouter = express.Router();

const CREEM_API_KEY = process.env.CREEM_API_KEY;
const CREEM_WEBHOOK_SECRET = process.env.CREEM_WEBHOOK_SECRET;
const APP_URL = process.env.APP_URL || "https://visa-appeal.vercel.app";

const planToProduct: Record<string, string> = {
  starter: "prod_28e3zUtJWlnoA7jOvtCgmO",
  standard: "prod_7FJjHtO6CUOaVjGaUxZtF5",
  premium: "prod_yTAZ4JcqXOL1GtNCaIfZ1"
};

// Mount with raw body for webhook verification
creemWebhookRouter.post("/creem", express.raw({ type: "application/json" }), async (req, res) => {
    try {
        console.log("CREEM WEBHOOK RECEIVED");
        
        const signature = req.headers['x-creem-signature'] as string;
        
        if (signature && CREEM_WEBHOOK_SECRET) {
            const hmac = crypto.createHmac("sha256", CREEM_WEBHOOK_SECRET);
            const digest = hmac.update(req.body).digest("hex");
            
            if (signature !== digest) {
                console.error("Invalid Creem webhook signature");
                return res.status(401).send("Invalid signature");
            }
            console.log("Signature verification succeeded");
        } else {
            console.log("Signature verification skipped (missing signature or secret)");
        }

        const bodyString = req.body.toString();
        console.log("REAL WEBHOOK PAYLOAD", JSON.stringify(JSON.parse(bodyString), null, 2));
        const event = JSON.parse(bodyString);

        if (event.type === 'checkout.completed') {
            const metadata = event.data?.metadata || event.metadata || {};
            const uid = metadata.uid;
            const plan = metadata.plan;
            const caseId = metadata.caseId;
            const checkoutId = event.data?.id || event.id;
            const productId = event.data?.product_id || event.product_id;
            const customerEmail = event.data?.customer?.email || event.customer?.email;

            console.log("UID:", uid);
            console.log("PLAN:", plan);
            console.log("CASEID:", caseId);

            if (uid && plan) {
                console.log("Firebase Admin initialized:", !!adminDb);
                
                try {
                    const purchaseId = checkoutId || `creem_${Date.now()}`;
                    console.log("Writing purchase to:", `users/${uid}/purchases/${purchaseId}`);
                    await adminDb.collection('users').doc(uid).collection('purchases').doc(purchaseId).set({
                        purchaseId: purchaseId,
                        caseId: caseId || null,
                        plan: plan,
                        status: 'paid',
                        checkoutId: checkoutId || null,
                        createdAt: Date.now()
                    });
                    
                    // Unlock the specific case if a caseId was provided in metadata
                    if (caseId) {
                        try {
                            console.log("Writing case unlock to:", `users/${uid}/cases/${caseId}`);
                            await adminDb.collection('users').doc(uid).collection('cases').doc(caseId).set({
                                purchasedPlan: plan,
                                paymentStatus: "paid",
                                updatedAt: Date.now()
                            }, { merge: true });
                            console.log(`WEBHOOK UPDATED CASE: ${caseId}`);
                        } catch (caseErr) {
                            console.error("Failed to update case with unlocked plan:", caseErr);
                        }
                    }

                    console.log("Firestore write success");
                    console.log(`Unlocked ${plan} for case ${caseId} under user ${uid}. Paths: users/${uid}/purchases/${purchaseId} and users/${uid}/cases/${caseId}`);
                } catch (writeErr) {
                    console.error("Firestore write failed", writeErr);
                    return res.status(500).send("Firestore write failed");
                }
            } else {
                console.log("Missing uid or plan in metadata:", metadata);
            }
        }
        
        res.status(200).send("OK");
    } catch (err: any) {
        console.error("Creem webhook error:", err.message);
        res.status(500).send("Webhook Error");
    }
});

creemRouter.post("/create-checkout", async (req, res) => {
    try {
        const isTestMode = CREEM_API_KEY?.startsWith("creem_test_");
        const CREEM_BASE_URL = isTestMode ? "https://test-api.creem.io" : "https://api.creem.io";
        
        console.log("CREEM MODE:", isTestMode ? "TEST" : "LIVE");
        console.log("CREEM ENDPOINT:", CREEM_BASE_URL);
        console.log("CREEM_WEBHOOK_SECRET exists:", !!CREEM_WEBHOOK_SECRET);

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Missing auth token" });
        }
        const token = authHeader.split("Bearer ")[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        const uid = decodedToken.uid;
        
        const { plan, caseId } = req.body;
        const productId = planToProduct[plan];
        
        if (!productId) {
            return res.status(400).json({ error: "Invalid plan" });
        }
        
        console.log("CASE ID SENT TO CHECKOUT:", caseId);
        
        const metadata = {
            uid: uid,
            plan: plan,
            caseId: caseId || ''
        };
        
        console.log("METADATA SENT TO CREEM:");
        console.log(JSON.stringify(metadata, null, 2));

        const creemRes = await fetch(`${CREEM_BASE_URL}/v1/checkouts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": CREEM_API_KEY as string,
            },
            body: JSON.stringify({
                product_id: productId,
                success_url: `${APP_URL}/payment-success${caseId ? `?caseId=${caseId}` : ''}`,
                metadata: metadata
            })
        });
        
        console.log("CREEM STATUS:", creemRes.status);
        
        if (!creemRes.ok) {
            const err = await creemRes.text();
            console.log("CREEM RESPONSE:", err);
            console.error("Creem API error", err);
            return res.status(500).json({ error: "Failed to create checkout" });
        }
        
        const textRes = await creemRes.text();
        console.log("CREEM RESPONSE:", textRes);
        const data = JSON.parse(textRes);
        
        const checkoutUrl = data.checkout_url || data.url || data.checkoutUrl;
        
        res.json({ checkoutUrl });
    } catch (err) {
        console.error("Create checkout error:", err);
        res.status(500).json({ error: "Internal error" });
    }
});
