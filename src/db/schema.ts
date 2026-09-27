import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  real,
} from "drizzle-orm/pg-core";

// ─── Users ─────────────────────────────────────────────
// Roles: customer | staff | manager | admin | super_admin
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 20 }).default("customer").notNull(),
  address: text("address"),
  district: varchar("district", { length: 50 }),
  avatarColor: varchar("avatar_color", { length: 30 }).default("from-emerald-500 to-teal-600"),
  emailVerified: boolean("email_verified").default(false).notNull(),
  emailVerificationToken: varchar("email_verification_token", { length: 128 }),
  emailVerificationExpires: timestamp("email_verification_expires"),
  passwordResetToken: varchar("password_reset_token", { length: 128 }),
  passwordResetExpires: timestamp("password_reset_expires"),
  isBlocked: boolean("is_blocked").default(false).notNull(),
  failedLoginAttempts: integer("failed_login_attempts").default(0).notNull(),
  lockedUntil: timestamp("locked_until"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Categories ─────────────────────────────────────────
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  nameBn: varchar("name_bn", { length: 100 }),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 20 }).default("📦"),
  imageUrl: text("image_url"),
  gradient: varchar("gradient", { length: 100 }).default("from-emerald-500 to-teal-600"),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Products ───────────────────────────────────────────
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  name: varchar("name", { length: 200 }).notNull(),
  nameBn: varchar("name_bn", { length: 200 }),
  slug: varchar("slug", { length: 220 }).notNull().unique(),
  description: text("description"),
  descriptionBn: text("description_bn"),
  price: integer("price").notNull(), // BDT in taka
  comparePrice: integer("compare_price"),
  costPrice: integer("cost_price"),
  stock: integer("stock").default(0).notNull(),
  sku: varchar("sku", { length: 50 }),
  images: jsonb("images").$type<string[]>().default([]),
  emoji: varchar("emoji", { length: 10 }).default("📦"),
  gradient: varchar("gradient", { length: 120 }).default("from-emerald-100 to-teal-100"),
  featured: boolean("featured").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  isNew: boolean("is_new").default(false).notNull(),
  discountPercent: integer("discount_percent").default(0).notNull(),
  ratingAvg: real("rating_avg").default(0).notNull(),
  ratingCount: integer("rating_count").default(0).notNull(),
  totalSold: integer("total_sold").default(0).notNull(),
  tags: jsonb("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Cart ───────────────────────────────────────────────
export const cartItems = pgTable("cart_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  guestId: varchar("guest_id", { length: 100 }),
  productId: uuid("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  quantity: integer("quantity").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Orders ─────────────────────────────────────────────
export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderNumber: varchar("order_number", { length: 20 }).notNull().unique(),
  invoiceNumber: varchar("invoice_number", { length: 40 }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  customerName: varchar("customer_name", { length: 100 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 20 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }),
  address: text("address").notNull(),
  district: varchar("district", { length: 50 }),
  thana: varchar("thana", { length: 50 }),
  paymentMethod: varchar("payment_method", { length: 20 }).default("cod").notNull(), // cod | bkash | nagad | rocket | card
  paymentStatus: varchar("payment_status", { length: 20 }).default("pending").notNull(), // pending | paid | failed | refunded
  paymentGateway: varchar("payment_gateway", { length: 40 }), // stripe | sslcommerz | cod
  paymentSessionId: varchar("payment_session_id", { length: 200 }),
  paymentTransactionId: varchar("payment_transaction_id", { length: 200 }),
  paidAt: timestamp("paid_at"),
  orderStatus: varchar("order_status", { length: 20 }).default("pending").notNull(), // pending | confirmed | packed | shipped | delivered | cancelled
  subtotal: integer("subtotal").notNull(),
  deliveryCharge: integer("delivery_charge").default(0).notNull(),
  discount: integer("discount").default(0).notNull(),
  total: integer("total").notNull(),
  couponCode: varchar("coupon_code", { length: 30 }),
  notes: text("notes"),
  // Courier Integration (Pathao / Steadfast / RedX)
  courierName: varchar("courier_name", { length: 40 }), // steadfast | pathao | redx | own
  courierConsignmentId: varchar("courier_consignment_id", { length: 100 }),
  courierTrackingCode: varchar("courier_tracking_code", { length: 100 }),
  courierStatus: varchar("courier_status", { length: 60 }),
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at"),
  // Cancellation & Refund
  cancelledAt: timestamp("cancelled_at"),
  cancelReason: text("cancel_reason"),
  refundStatus: varchar("refund_status", { length: 30 }).default("none").notNull(), // none | requested | approved | rejected | refunded
  refundReason: text("refund_reason"),
  refundAmount: integer("refund_amount").default(0).notNull(),
  refundedAt: timestamp("refunded_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  productId: uuid("product_id").references(() => products.id, {
    onDelete: "set null",
  }),
  productName: varchar("product_name", { length: 200 }).notNull(),
  productBn: varchar("product_bn", { length: 200 }),
  price: integer("price").notNull(),
  quantity: integer("quantity").notNull(),
  image: text("image"),
  emoji: varchar("emoji", { length: 10 }).default("📦"),
});

// ─── Order Tracking Timeline Events ─────────────────────
export const orderTrackingEvents = pgTable("order_tracking_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  orderNumber: varchar("order_number", { length: 20 }).notNull(),
  status: varchar("status", { length: 30 }).notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 120 }),
  actorName: varchar("actor_name", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Payment Transactions (Gateway & Webhook Verification) ───
export const paymentTransactions = pgTable("payment_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  orderNumber: varchar("order_number", { length: 20 }).notNull(),
  gateway: varchar("gateway", { length: 40 }).notNull(), // stripe | card_gateway | bkash | nagad
  sessionId: varchar("session_id", { length: 200 }).notNull().unique(),
  transactionId: varchar("transaction_id", { length: 200 }),
  amount: integer("amount").notNull(),
  currency: varchar("currency", { length: 10 }).default("BDT").notNull(),
  status: varchar("status", { length: 30 }).default("pending").notNull(), // pending | succeeded | failed | refunded
  cardBrand: varchar("card_brand", { length: 30 }),
  cardLast4: varchar("card_last4", { length: 8 }),
  verifiedByServer: boolean("verified_by_server").default(false).notNull(),
  rawPayload: jsonb("raw_payload").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Reviews ────────────────────────────────────────────
export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  userName: varchar("user_name", { length: 100 }).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  isApproved: boolean("is_approved").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Coupons ────────────────────────────────────────────
export const coupons = pgTable("coupons", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 30 }).notNull().unique(),
  type: varchar("type", { length: 10 }).default("percent").notNull(), // percent | flat
  value: integer("value").notNull(),
  minOrder: integer("min_order").default(0).notNull(),
  maxDiscount: integer("max_discount"),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Contact messages ───────────────────────────────────
export const contacts = pgTable("contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  subject: varchar("subject", { length: 200 }),
  message: text("message").notNull(),
  status: varchar("status", { length: 20 }).default("new").notNull(), // new | read | replied
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Admin Activity Logs (Audit Trail) ──────────────────
export const adminActivityLogs = pgTable("admin_activity_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
  actorName: varchar("actor_name", { length: 100 }).notNull(),
  actorEmail: varchar("actor_email", { length: 255 }).notNull(),
  actorRole: varchar("actor_role", { length: 30 }).notNull(),
  action: varchar("action", { length: 80 }).notNull(),
  entityType: varchar("entity_type", { length: 40 }).notNull(), // product | category | order | user | coupon | review | system
  entityId: varchar("entity_id", { length: 120 }),
  summary: text("summary").notNull(),
  details: jsonb("details").$type<Record<string, unknown>>().default({}),
  ipAddress: varchar("ip_address", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── API & Login Rate Limits ────────────────────────────
export const rateLimits = pgTable("rate_limits", {
  key: varchar("key", { length: 200 }).primaryKey(),
  endpoint: varchar("endpoint", { length: 60 }).notNull(),
  count: integer("count").default(1).notNull(),
  resetAt: timestamp("reset_at").notNull(),
  blockedUntil: timestamp("blocked_until"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Transactional Email Logs ───────────────────────────
export const emailLogs = pgTable("email_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  toEmail: varchar("to_email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  template: varchar("template", { length: 60 }).notNull(), // order_confirmation | order_status | email_verification | password_reset | refund_update
  orderNumber: varchar("order_number", { length: 30 }),
  bodyHtml: text("body_html").notNull(),
  status: varchar("status", { length: 30 }).default("sent").notNull(),
  provider: varchar("provider", { length: 40 }).default("smtp_log").notNull(),
  meta: jsonb("meta").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Uploaded Media (Cloudinary / S3 / R2 / Local) ──────
export const uploadedMedia = pgTable("uploaded_media", {
  id: uuid("id").defaultRandom().primaryKey(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  url: text("url").notNull(),
  storageProvider: varchar("storage_provider", { length: 40 }).default("local").notNull(),
  mimeType: varchar("mime_type", { length: 100 }),
  sizeBytes: integer("size_bytes").default(0).notNull(),
  uploadedBy: uuid("uploaded_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Analytics (who viewed / clicked / bought what) ──────────
export const visitorSessions = pgTable("visitor_sessions", {
  id: varchar("id", { length: 60 }).primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  userEmail: varchar("user_email", { length: 255 }),
  firstSeen: timestamp("first_seen").defaultNow().notNull(),
  lastSeen: timestamp("last_seen").defaultNow().notNull(),
  pageCount: integer("page_count").default(0).notNull(),
  device: varchar("device", { length: 100 }),
  referrer: text("referrer"),
});

export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: varchar("session_id", { length: 60 }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  type: varchar("type", { length: 30 }).notNull(),
  label: text("label"),
  path: text("path"),
  productSlug: varchar("product_slug", { length: 300 }),
  meta: jsonb("meta").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type VisitorSession = typeof visitorSessions.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type OrderTrackingEvent = typeof orderTrackingEvents.$inferSelect;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type AdminActivityLog = typeof adminActivityLogs.$inferSelect;
export type EmailLog = typeof emailLogs.$inferSelect;
export type UploadedMedia = typeof uploadedMedia.$inferSelect;
