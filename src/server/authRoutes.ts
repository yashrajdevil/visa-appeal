import { Router, Request, Response, NextFunction } from "express";
import { adminDb } from "./firebaseAdmin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || "default_insecure_jwt_secret";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.admin_token;
    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        (req as any).user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Unauthorized" });
    }
};

authRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        const usersSnapshot = await adminDb.collection("adminUsers").where("email", "==", email).limit(1).get();
        if (usersSnapshot.empty) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const userDoc = usersSnapshot.docs[0];
        const user = { id: userDoc.id, ...userDoc.data() } as any;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role || 'admin' }, JWT_SECRET, {
            expiresIn: "7d"
        });

        res.cookie("admin_token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ success: true, email: user.email });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

authRouter.post("/logout", (req, res) => {
    res.clearCookie("admin_token", {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    });
    res.json({ success: true });
});

authRouter.get("/me", requireAuth, (req, res) => {
    res.json({ user: (req as any).user });
});

authRouter.get("/users", requireAuth, async (req, res) => {
    try {
        const snapshot = await adminDb.collection("adminUsers").get();
        const users = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                email: data.email,
                role: data.role || 'admin',
                createdAt: data.createdAt
            };
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});
