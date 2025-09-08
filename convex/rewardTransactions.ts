import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId, getAuthUser } from "./utils";

// Get all reward transactions (for overview/admin purposes)
export const list = query({
  args: {},
  handler: async (ctx) => {
    const transactions = await ctx.db
      .query("rewardTransactions")
      .order("desc")
      .collect();
    return transactions;
  },
});

// Get user's reward transactions
export const getMyTransactions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await getAuthUser(ctx);
    if (!user) return [];

    const transactions = await ctx.db
      .query("rewardTransactions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return transactions;
  },
});

// Get a specific transaction
export const getTransaction = query({
  args: { transactionId: v.id("rewardTransactions") },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get(args.transactionId);
    return transaction;
  },
});

// Create a new reward transaction
export const createTransaction = mutation({
  args: {
    transactionType: v.union(v.literal("contribution_reward"), v.literal("api_usage"), v.literal("subscription_payment"), v.literal("withdrawal")),
    amount: v.number(),
    description: v.string(),
    relatedId: v.optional(v.string()),
    status: v.optional(v.union(v.literal("pending"), v.literal("completed"), v.literal("failed"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await getAuthUser(ctx);
    if (!user) throw new Error("User not found");

    const now = Date.now();
    const transactionId = await ctx.db.insert("rewardTransactions", {
      ...args,
      userId: user._id,
      status: args.status || "pending",
      createdAt: now,
    });

    return transactionId;
  },
});

// Update transaction status
export const updateTransactionStatus = mutation({
  args: {
    transactionId: v.id("rewardTransactions"),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
    stellarTxHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const transaction = await ctx.db.get(args.transactionId);
    if (!transaction) throw new Error("Transaction not found");

    const updates: any = {
      status: args.status,
    };

    if (args.stellarTxHash !== undefined) updates.stellarTxHash = args.stellarTxHash;
    if (args.status === "completed" || args.status === "failed") {
      updates.completedAt = Date.now();
    }

    await ctx.db.patch(args.transactionId, updates);
    return args.transactionId;
  },
});

// Get user's total KALE balance
export const getUserBalance = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const user = await getAuthUser(ctx);
    if (!user) return 0;

    const transactions = await ctx.db
      .query("rewardTransactions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    const balance = transactions.reduce((total, tx) => {
      return total + tx.amount;
    }, 0);

    return balance;
  },
});
