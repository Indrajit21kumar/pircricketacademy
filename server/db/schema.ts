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
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  status: text("status").default("pending_payment").notNull(), // pending_payment | confirmed | completed | cancelled
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

export const batches = pgTable("batches", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ageGroup: text("age_group").notNull(),
  schedule: text("schedule").notNull(), // e.g. "Mon Wed Fri 6:00-8:00am"
  coachName: text("coach_name").notNull(),
  maxStudents: integer("max_students").default(25).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  dob: text("dob").notNull(),
  ageGroup: text("age_group").notNull(),
  batchId: integer("batch_id").references(() => batches.id),
  parentName: text("parent_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address"),
  bloodGroup: text("blood_group"),
  qrToken: text("qr_token").notNull().unique(), // unique token for QR code
  status: text("status").default("active").notNull(), // active | inactive | trial
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  batchId: integer("batch_id").references(() => batches.id),
  sessionDate: text("session_date").notNull(), // YYYY-MM-DD
  status: text("status").default("present").notNull(), // present | absent | late
  markedBy: text("marked_by").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messageTemplates = pgTable("message_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // attendance | fees | general | trial | welcome
  content: text("content").notNull(),   // supports {{childName}}, {{parentName}}, {{phone}}, {{batch}}, {{date}}
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messageCampaigns = pgTable("message_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  templateId: integer("template_id").references(() => messageTemplates.id),
  audience: text("audience").notNull(),   // all | batch:<id> | active | trial | fee_due
  message: text("message").notNull(),     // resolved message text
  sentCount: integer("sent_count").default(0).notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const followUps = pgTable("follow_ups", {
  id: serial("id").primaryKey(),
  inquiryId: integer("inquiry_id").references(() => inquiries.id).notNull(),
  notes: text("notes").notNull(),
  nextFollowUpDate: text("next_follow_up_date"), // YYYY-MM-DD
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const fees = pgTable("fees", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  month: text("month").notNull(),        // YYYY-MM
  amount: integer("amount").notNull(),   // in rupees
  paid: boolean("paid").default(false).notNull(),
  paidDate: text("paid_date"),
  receiptNo: text("receipt_no"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  audience: text("audience").default("all").notNull(), // all | batch:<id> | student:<id>
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessionNotes = pgTable("session_notes", {
  id: serial("id").primaryKey(),
  batchId: integer("batch_id").references(() => batches.id),
  sessionDate: text("session_date").notNull(),
  coachName: text("coach_name").notNull(),
  drills: text("drills"),          // what was practiced
  highlights: text("highlights"),  // positive moments
  improvements: text("improvements"), // areas to work on
  notes: text("notes"),            // general notes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const playerRatings = pgTable("player_ratings", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  batchId: integer("batch_id").references(() => batches.id),
  sessionDate: text("session_date").notNull(),
  coachName: text("coach_name").notNull(),
  batting: integer("batting"),    // 1-10
  bowling: integer("bowling"),    // 1-10
  fielding: integer("fielding"),  // 1-10
  fitness: integer("fitness"),    // 1-10
  attitude: integer("attitude"),  // 1-10
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), // practice | match | tournament | holiday | cancellation | ground_booking | other
  date: text("date").notNull(),        // YYYY-MM-DD
  startTime: text("start_time"),       // HH:MM (24h)
  endTime: text("end_time"),           // HH:MM (24h)
  batchId: integer("batch_id").references(() => batches.id), // null = all batches
  venue: text("venue"),
  description: text("description"),
  createdBy: text("created_by").notNull().default("admin"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Inquiry      = typeof inquiries.$inferSelect;
export type Admission    = typeof admissions.$inferSelect;
export type Booking      = typeof bookings.$inferSelect;
export type User         = typeof users.$inferSelect;
export type Batch        = typeof batches.$inferSelect;
export type Student      = typeof students.$inferSelect;
export type Attendance   = typeof attendance.$inferSelect;
export type SessionNote    = typeof sessionNotes.$inferSelect;
export type PlayerRating   = typeof playerRatings.$inferSelect;
export type Fee            = typeof fees.$inferSelect;
export type Notification   = typeof notifications.$inferSelect;
export type FollowUp          = typeof followUps.$inferSelect;
export type MessageTemplate   = typeof messageTemplates.$inferSelect;
export type MessageCampaign   = typeof messageCampaigns.$inferSelect;
