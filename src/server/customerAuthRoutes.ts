import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { adminAuth } from "./firebaseAdmin.js";

export const customerAuthRouter = Router();

export const requireCustomerAuth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.customer_token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    (req as any).user = { id: decodedToken.uid, email: decodedToken.email };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

customerAuthRouter.post("/sessionLogin", async (req, res) => {
  try {
    // Allows setting a session cookie if we want, but we can just ask the client to send the idToken in headers.
    // For now just echo success. Client sends token in header mostly.
    const { idToken } = req.body;
    const decoded = await adminAuth.verifyIdToken(idToken);
    res.json({ success: true, uid: decoded.uid });
  } catch (err: any) {
    res.status(401).json({ error: "Invalid ID Token" });
  }
});

