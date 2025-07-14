import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  vehicleType: text("vehicle_type").notNull(),
  rcImageId: text("rc_image_id"),
  carbonCredits: decimal("carbon_credits", { precision: 10, scale: 6 }).notNull().default("0"),
  balanceINR: decimal("balance_inr", { precision: 10, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const uploads = pgTable("uploads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  imageId: text("image_id").notNull(),
  estimatedKm: integer("estimated_km").notNull(),
  carbonSavedKg: decimal("carbon_saved_kg", { precision: 10, scale: 3 }).notNull(),
  carbonCredits: decimal("carbon_credits", { precision: 10, scale: 6 }).notNull(),
  rewardINR: decimal("reward_inr", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  uploads: many(uploads),
}));

export const uploadsRelations = relations(uploads, ({ one }) => ({
  user: one(users, {
    fields: [uploads.userId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertUploadSchema = createInsertSchema(uploads).omit({
  id: true,
  createdAt: true,
});

export const onboardingSchema = insertUserSchema.pick({
  name: true,
  vehicleType: true,
}).extend({
  vehicleType: z.enum(["E-Rickshaw", "EV Bike", "EV Car"]),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertUpload = z.infer<typeof insertUploadSchema>;
export type OnboardingData = z.infer<typeof onboardingSchema>;
export type User = typeof users.$inferSelect;
export type Upload = typeof uploads.$inferSelect;
