import { users, uploads, type User, type InsertUser, type Upload, type InsertUpload } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private uploads: Map<number, Upload>;
  private currentUserId: number;
  private currentUploadId: number;

  constructor() {
    this.users = new Map();
    this.uploads = new Map();
    this.currentUserId = 1;
    this.currentUploadId = 1;
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      rcImageId: insertUser.rcImageId || null,
      carbonCredits: insertUser.carbonCredits || "0",
      balanceINR: insertUser.balanceINR || "0",
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser: User = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async createUpload(insertUpload: InsertUpload): Promise<Upload> {
    const id = this.currentUploadId++;
    const upload: Upload = {
      ...insertUpload,
      id,
      createdAt: new Date(),
    };
    this.uploads.set(id, upload);
    
    // Update user's wallet
    const user = this.users.get(insertUpload.userId);
    if (user) {
      const newCarbonCredits = (parseFloat(user.carbonCredits) + parseFloat(insertUpload.carbonCredits.toString())).toFixed(6);
      const newBalance = (parseFloat(user.balanceINR) + parseFloat(insertUpload.rewardINR.toString())).toFixed(2);
      
      const updatedUser: User = {
        ...user,
        carbonCredits: newCarbonCredits,
        balanceINR: newBalance,
      };
      this.users.set(user.id, updatedUser);
    }
    
    return upload;
  }

  async getUploadsByUserId(userId: number): Promise<Upload[]> {
    return Array.from(this.uploads.values())
      .filter(upload => upload.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getUploadById(id: number): Promise<Upload | undefined> {
    return this.uploads.get(id);
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

export const storage = new MemStorage();
