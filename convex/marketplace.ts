import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId, getAuthUser } from "./utils";
import { Id } from "./_generated/dataModel";

// Get all marketplace datasets (for overview/admin purposes)
export const list = query({
  args: {},
  handler: async (ctx) => {
    const datasets = await ctx.db
      .query("marketplaceDatasets")
      .order("desc")
      .collect();
    return datasets;
  },
});

// Get all marketplace datasets
export const getDatasets = query({
  args: {},
  handler: async (ctx) => {
    const datasets = await ctx.db
      .query("marketplaceDatasets")
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect();

    return datasets;
  },
});

// Get all data contributions (for overview/admin purposes)
export const listContributions = query({
  args: {},
  handler: async (ctx) => {
    const contributions = await ctx.db
      .query("dataContributions")
      .order("desc")
      .collect();
    return contributions;
  },
});

// Get all reward transactions (for overview/admin purposes)
export const listRewardTransactions = query({
  args: {},
  handler: async (ctx) => {
    const transactions = await ctx.db
      .query("rewardTransactions")
      .order("desc")
      .collect();
    return transactions;
  },
});

// Get user's contributions
export const getUserContributions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await getAuthUser(ctx);
    if (!user) {
      throw new Error("User not found");
    }

    const contributions = await ctx.db
      .query("dataContributions")
      .withIndex("by_contributor", (q) => q.eq("contributorId", user._id))
      .order("desc")
      .collect();

    return contributions;
  },
});

// Get user's validation requests
export const getValidationRequests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await getAuthUser(ctx);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if user is a validator (has admin or owner role)
    if (user.role !== "admin" && user.role !== "owner") {
      throw new Error("Not authorized to view validation requests");
    }

    const requests = await ctx.db
      .query("dataContributions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();

    return requests;
  },
});

// Get validation statistics
export const getValidationStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await getAuthUser(ctx);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if user is a validator
    if (user.role !== "admin" && user.role !== "owner") {
      throw new Error("Not authorized to view validation stats");
    }

    const totalRequests = await ctx.db
      .query("dataContributions")
      .collect();

    const pendingRequests = totalRequests.filter(r => r.status === "pending").length;
    const approvedRequests = totalRequests.filter(r => r.status === "approved").length;
    const rejectedRequests = totalRequests.filter(r => r.status === "rejected").length;

    return {
      totalRequests: totalRequests.length,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      averageReviewTime: 2.3, // hours - would be calculated from actual data
      totalRewardsDistributed: 1250 // KALE tokens - would be calculated from actual data
    };
  },
});

// Get user statistics
export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await getAuthUser(ctx);
    if (!user) {
      throw new Error("User not found");
    }

    const contributions = await ctx.db
      .query("dataContributions")
      .filter((q) => q.eq(q.field("contributorId"), user._id))
      .collect();

    const approvedContributions = contributions.filter(c => c.status === "approved").length;
    const pendingContributions = contributions.filter(c => c.status === "pending").length;
    const totalRewards = contributions
      .filter(c => c.rewardAmount)
      .reduce((sum, c) => sum + (c.rewardAmount || 0), 0);

    return {
      totalContributions: contributions.length,
      approvedContributions,
      pendingContributions,
      totalRewards,
      averageRating: 4.2, // Would be calculated from actual reviews
      rank: 47 // Would be calculated from leaderboard
    };
  },
});

// Submit a data contribution
export const submitContribution = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    fileStorageId: v.id("_storage"),
    size: v.number(),
    format: v.string(),
    metadata: v.optional(v.any()),
    contributionType: v.union(
      v.literal("new_dataset"),
      v.literal("data_addition"),
      v.literal("correction")
    ),
    marketplaceDatasetId: v.optional(v.id("marketplaceDatasets")), // Required for data_addition and correction
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await getAuthUser(ctx);
    if (!user) {
      throw new Error("User not found");
    }

    let marketplaceDatasetId: Id<"marketplaceDatasets">;

    if (args.contributionType === "new_dataset") {
      // For new datasets, create a marketplace dataset first
      marketplaceDatasetId = await ctx.db.insert("marketplaceDatasets", {
        name: args.name,
        description: args.description,
        category: args.category,
        tags: args.tags,
        size: args.size,
        format: args.format,
        fileStorageId: args.fileStorageId,
        metadata: args.metadata,
        ownerId: user._id,
        price: 0, // Free for new contributions
        rating: 0,
        reviewCount: 0,
        downloadCount: 0,
        isVerified: false,
        isActive: false, // Will be activated after review
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    } else {
      // For data_addition and correction, marketplaceDatasetId is required
      if (!args.marketplaceDatasetId) {
        throw new Error("marketplaceDatasetId is required for data_addition and correction contributions");
      }
      marketplaceDatasetId = args.marketplaceDatasetId;
    }

    const contributionId = await ctx.db.insert("dataContributions", {
      marketplaceDatasetId,
      contributorId: user._id,
      contributionType: args.contributionType,
      description: args.description,
      fileStorageId: args.fileStorageId,
      size: args.size,
      format: args.format,
      metadata: args.metadata,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return contributionId;
  },
});

// Review a data contribution
export const reviewContribution = mutation({
  args: {
    contributionId: v.id("dataContributions"),
    status: v.union(
      v.literal("approved"),
      v.literal("rejected")
    ),
    reviewNotes: v.optional(v.string()),
    rewardAmount: v.optional(v.number()),
    qualityScore: v.optional(v.number()),
    originalityScore: v.optional(v.number()),
    usefulnessScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await getAuthUser(ctx);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if user is a validator
    if (user.role !== "admin" && user.role !== "owner") {
      throw new Error("Not authorized to review contributions");
    }

    const contribution = await ctx.db.get(args.contributionId);
    if (!contribution) {
      throw new Error("Contribution not found");
    }

    // Update the contribution
    await ctx.db.patch(args.contributionId, {
      status: args.status,
      reviewNotes: args.reviewNotes,
      rewardAmount: args.rewardAmount,
      reviewerId: user._id,
      reviewedAt: Date.now(),
      updatedAt: Date.now(),
    });

    // If approved, create marketplace dataset entry
    if (args.status === "approved") {
      await ctx.db.insert("marketplaceDatasets", {
        name: `Contribution from ${user.firstName || "User"}`,
        description: contribution.description,
        category: "Other", // Would be determined from contribution data
        tags: [],
        size: contribution.size,
        format: contribution.format,
        fileStorageId: contribution.fileStorageId,
        metadata: contribution.metadata,
        ownerId: user._id,
        price: args.rewardAmount || 50, // Default price in KALE tokens
        rating: 0,
        reviewCount: 0,
        downloadCount: 0,
        isVerified: true,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Download a marketplace dataset
export const downloadDataset = mutation({
  args: {
    datasetId: v.id("marketplaceDatasets"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await getAuthUser(ctx);
    if (!user) {
      throw new Error("User not found");
    }

    const dataset = await ctx.db.get(args.datasetId);
    if (!dataset) {
      throw new Error("Dataset not found");
    }

    // Increment download count
    await ctx.db.patch(args.datasetId, {
      downloadCount: dataset.downloadCount + 1,
      updatedAt: Date.now(),
    });

    // Create reward transaction for dataset owner
    if (dataset.price > 0) {
      await ctx.db.insert("rewardTransactions", {
        userId: dataset.ownerId,
        transactionType: "api_usage",
        amount: -dataset.price, // Negative because user is paying
        description: `Downloaded dataset: ${dataset.name}`,
        relatedId: args.datasetId,
        status: "completed",
        createdAt: Date.now(),
        completedAt: Date.now(),
      });

      // Add reward to dataset owner
      await ctx.db.insert("rewardTransactions", {
        userId: dataset.ownerId,
        transactionType: "contribution_reward",
        amount: dataset.price,
        description: `Dataset download reward: ${dataset.name}`,
        relatedId: args.datasetId,
        status: "completed",
        createdAt: Date.now(),
        completedAt: Date.now(),
      });
    }

    return {
      fileStorageId: dataset.fileStorageId,
      name: dataset.name,
      format: dataset.format,
    };
  },
});

// Get dataset by ID
export const getDataset = query({
  args: {
    datasetId: v.id("marketplaceDatasets"),
  },
  handler: async (ctx, args) => {
    const dataset = await ctx.db.get(args.datasetId);
    if (!dataset) {
      throw new Error("Dataset not found");
    }

    return dataset;
  },
});

// Search datasets
export const searchDatasets = query({
  args: {
    query: v.optional(v.string()),
    category: v.optional(v.string()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    minRating: v.optional(v.number()),
    verified: v.optional(v.boolean()),
    sortBy: v.optional(v.union(
      v.literal("newest"),
      v.literal("oldest"),
      v.literal("price_low"),
      v.literal("price_high"),
      v.literal("rating"),
      v.literal("downloads")
    )),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("marketplaceDatasets")
      .filter((q) => q.eq(q.field("isActive"), true));

    // Apply filters
    if (args.category && args.category !== "all") {
      query = query.filter((q) => q.eq(q.field("category"), args.category));
    }

    if (args.minPrice !== undefined) {
      query = query.filter((q) => q.gte(q.field("price"), args.minPrice!));
    }

    if (args.maxPrice !== undefined) {
      query = query.filter((q) => q.lte(q.field("price"), args.maxPrice!));
    }

    if (args.minRating !== undefined) {
      query = query.filter((q) => q.gte(q.field("rating"), args.minRating!));
    }

    if (args.verified !== undefined) {
      query = query.filter((q) => q.eq(q.field("isVerified"), args.verified!));
    }

    const datasets = await query.collect();

    // Apply sorting in memory
    switch (args.sortBy) {
      case "newest":
        datasets.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case "oldest":
        datasets.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case "price_low":
        datasets.sort((a, b) => a.price - b.price);
        break;
      case "price_high":
        datasets.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        datasets.sort((a, b) => b.rating - a.rating);
        break;
      case "downloads":
        datasets.sort((a, b) => b.downloadCount - a.downloadCount);
        break;
      default:
        datasets.sort((a, b) => b.createdAt - a.createdAt);
    }

    // Apply text search if provided
    if (args.query) {
      const searchTerm = args.query.toLowerCase();
      return datasets.filter(dataset => 
        dataset.name.toLowerCase().includes(searchTerm) ||
        dataset.description.toLowerCase().includes(searchTerm) ||
        dataset.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    return datasets;
  },
});