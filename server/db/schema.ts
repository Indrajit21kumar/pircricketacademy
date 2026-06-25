import { pgTable, serial, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  childName: text("child_name").notNull(),
  ageGroup: text("age_group").notNull(),
  source: text("source"),
  message: text("message"),
  status: text("status").default("new").notNull(), // new | contacted | converted
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const admissions = pgTable("admissions", {
  id: serial("id").primaryKey(),
  studentName: text("student_name").notNull(),
  dob: text("dob").notNull(),
  ageGroup: text("age_group").notNull(),
  school: text("school"),
  parentName: text("parent_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address"),
  bloodGroup: text("blood_group"),
  allergies: text("allergies"),
  asthma: boolean("asthma").default(false).notNull(),
  medicalNotes: text("medical_notes"),
  emergencyName: text("emergency_name").notNull(),
  emergencyPhone: text("emergency_phone").notNull(),
  isTrial: boolean("is_trial").default(false).notNull(),
  trialDate: text("trial_date"),
  message: text("message"),
  source: text("source"),
  status: text("status").default("new").notNull(), // new | trial_scheduled | joined | rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  ref: text("ref").notNull().unique(),
  facility: text("facility").notNull(),      // box | turf | cement
  facilityName: text("facility_name").notNull(),
  date: text("date").notNull(),
  slot: text("slot").notNull(),
  duration: integer("duration").notNull(),
  rate: integer("rate").notNull(),
  total: integer("total").notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  status: text("status").default("confirmed").notNull(), // confirmed | completed | cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull(),   // admin | coach
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Inquiry    = typeof inquiries.$inferSelect;
export type Admission  = typeof admissions.$inferSelect;
export type Booking    = typeof bookings.$inferSelect;
export type User       = typeof users.$inferSelect;
