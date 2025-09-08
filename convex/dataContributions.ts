import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId, getAuthUser } from "./utils";

// Get all data contributions (for overview/admin purposes)
export const list = query({
  args: {},
  handler: async (ctx) => {
    const contributions = await ctx.db
      .query("dataContributions")
      .order("desc")
      .collect();
    return contributions;
  },
});

// Get user's contributions
export const getMyContributions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await getAuthUser(ctx);
    if (!user) return [];

    const contributions = await ctx.db
      .query("dataContributions")
      .withIndex("by_contributor", (q) => q.eq("contributorId", user._id))
      .order("desc")
      .collect();

    return contributions;
  },
});

// Get a specific contribution
export const getContribution = query({
  args: { contributionId: v.id("dataContributions") },
  handler: async (ctx, args) => {
    const contribution = await ctx.db.get(args.contributionId);
    return contribution;
  },
});

// Create a new contribution
export const createContribution = mutation({
  args: {
    marketplaceDatasetId: v.id("marketplaceDatasets"),
    contributionType: v.union(v.literal("new_dataset"), v.literal("data_addition"), v.literal("correction")),
    description: v.string(),
    fileStorageId: v.id("_storage"),
    size: v.number(),
    format: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await getAuthUser(ctx);
    if (!user) throw new Error("User not found");

    const now = Date.now();
    const contributionId = await ctx.db.insert("dataContributions", {
      ...args,
      contributorId: user._id,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    return contributionId;
  },
});

// Update contribution status
export const updateContributionStatus = mutation({
  args: {
    contributionId: v.id("dataContributions"),
    status: v.union(v.literal("pending"), v.literal("under_review"), v.literal("approved"), v.literal("rejected")),
    reviewNotes: v.optional(v.string()),
    rewardAmount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await getAuthUser(ctx);
    if (!user) throw new Error("User not found");

    const contribution = await ctx.db.get(args.contributionId);
    if (!contribution) throw new Error("Contribution not found");

    const updates: any = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.reviewNotes !== undefined) updates.reviewNotes = args.reviewNotes;
    if (args.rewardAmount !== undefined) updates.rewardAmount = args.rewardAmount;
    if (args.status === "approved" || args.status === "rejected") {
      updates.reviewerId = user._id;
      updates.reviewedAt = Date.now();
    }

    await ctx.db.patch(args.contributionId, updates);
    return args.contributionId;
  },
});
