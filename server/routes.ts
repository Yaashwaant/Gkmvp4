import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { z } from "zod";
import { onboardingSchema, insertUploadSchema } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

// Emission factors for different vehicle types
const emissionFactors = {
  "E-Rickshaw": 0.05,
  "EV Bike": 0.06,
  "EV Car": 0.12
};

// Verna formula calculation
function calculateReward(kmDriven: number, vehicleType: string) {
  const factor = emissionFactors[vehicleType as keyof typeof emissionFactors] || 0.05;
  const carbonSavedKg = kmDriven * factor;
  const carbonCredits = carbonSavedKg / 1000;
  const rewardINR = carbonCredits * 1500;
  
  return {
    carbonSavedKg,
    carbonCredits,
    rewardINR
  };
}

// Mock OCR function to extract KM from filename
function extractKmFromFilename(filename: string): number {
  // Simple mock: extract numbers from filename
  const match = filename.match(/(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  // Default random value between 50-200 for demo
  return Math.floor(Math.random() * 150) + 50;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/user/:email", async (req, res) => {
    try {
      const { email } = req.params;
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/user", async (req, res) => {
    try {
      const userData = onboardingSchema.parse(req.body);
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "User already exists" });
      }
      
      const user = await storage.createUser({
        ...userData,
        email,
        carbonCredits: "0",
        balanceINR: "0",
      });
      
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid user data", details: error.errors });
      }
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // Upload routes
  app.post("/api/upload", upload.single('image'), async (req, res) => {
    try {
      const { userId } = req.body;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ error: "No image file provided" });
      }
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      const user = await storage.getUserById(parseInt(userId));
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Mock OCR - extract KM from filename
      const estimatedKm = extractKmFromFilename(file.originalname);
      
      // Calculate reward using Verna formula
      const { carbonSavedKg, carbonCredits, rewardINR } = calculateReward(estimatedKm, user.vehicleType);
      
      // Create upload record
      const upload = await storage.createUpload({
        userId: parseInt(userId),
        imageId: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Mock image ID
        estimatedKm,
        carbonSavedKg: carbonSavedKg.toFixed(3),
        carbonCredits: carbonCredits.toFixed(6),
        rewardINR: rewardINR.toFixed(2),
      });
      
      res.status(201).json(upload);
    } catch (error) {
      res.status(500).json({ error: "Failed to process upload" });
    }
  });

  app.get("/api/uploads/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const uploads = await storage.getUploadsByUserId(parseInt(userId));
      res.json(uploads);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch uploads" });
    }
  });

  // Stats route
  app.get("/api/stats/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const stats = await storage.getUserStats(parseInt(userId));
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Withdrawal routes (mocked for MVP)
  app.post("/api/withdraw", async (req, res) => {
    try {
      const { userId, amount, method } = req.body;
      
      if (!userId || !amount || !method) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const user = await storage.getUserById(parseInt(userId));
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const currentBalance = parseFloat(user.balanceINR);
      const withdrawAmount = parseFloat(amount);
      
      if (withdrawAmount > currentBalance) {
        return res.status(400).json({ error: "Insufficient balance" });
      }
      
      // Mock withdrawal - in real app, integrate with payment gateway
      res.json({ 
        success: true, 
        message: `Withdrawal of ₹${withdrawAmount} via ${method} initiated successfully`,
        transactionId: `TXN${Date.now()}`
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to process withdrawal" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
