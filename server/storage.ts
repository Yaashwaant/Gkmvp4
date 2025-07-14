import { users, uploads, type User, type InsertUser, type Upload, type InsertUpload } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sum, count } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  // Upload operations
  createUpload(upload: InsertUpload): Promise<Upload>;
  getUploadsByUserId(userId: number): Promise<Upload[]>;
  getUploadById(id: number): Promise<Upload | undefined>;
  
  // Stats operations
  getUserStats(userId: number): Promise<{
    totalUploads: number;
    totalKm: number;
    totalEarned: number;
    totalCarbonSaved: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        rcImageId: insertUser.rcImageId || null,
        carbonCredits: insertUser.carbonCredits || "0",
        balanceINR: insertUser.balanceINR || "0",
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async createUpload(insertUpload: InsertUpload): Promise<Upload> {
    const [upload] = await db
      .insert(uploads)
      .values(insertUpload)
      .returning();
    
    // Update user's wallet
    const user = await this.getUserById(insertUpload.userId);
    if (user) {
      const newCarbonCredits = (parseFloat(user.carbonCredits) + parseFloat(insertUpload.carbonCredits.toString())).toFixed(6);
      const newBalance = (parseFloat(user.balanceINR) + parseFloat(insertUpload.rewardINR.toString())).toFixed(2);
      
      await db
        .update(users)
        .set({
          carbonCredits: newCarbonCredits,
          balanceINR: newBalance,
        })
        .where(eq(users.id, user.id));
    }
    
    return upload;
  }

  async getUploadsByUserId(userId: number): Promise<Upload[]> {
    return await db
      .select()
      .from(uploads)
      .where(eq(uploads.userId, userId))
      .orderBy(desc(uploads.createdAt));
  }

  async getUploadById(id: number): Promise<Upload | undefined> {
    const [upload] = await db.select().from(uploads).where(eq(uploads.id, id));
    return upload || undefined;
  }

  async getUserStats(userId: number): Promise<{
    totalUploads: number;
    totalKm: number;
    totalEarned: number;
    totalCarbonSaved: number;
  }> {
    const userUploads = await this.getUploadsByUserId(userId);
    
    return {
      totalUploads: userUploads.length,
      totalKm: userUploads.reduce((sum, upload) => sum + upload.estimatedKm, 0),
      totalEarned: userUploads.reduce((sum, upload) => sum + parseFloat(upload.rewardINR), 0),
      totalCarbonSaved: userUploads.reduce((sum, upload) => sum + parseFloat(upload.carbonSavedKg), 0),
    };
  }
}

export const storage = new DatabaseStorage();
