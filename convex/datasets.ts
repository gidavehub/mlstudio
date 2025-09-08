import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId, getAuthUser } from "./utils";

// Get all datasets (for overview/admin purposes) - Updated
export const list = query({
  args: {},
  handler: async (ctx) => {
    const datasets = await ctx.db
      .query("datasets")
      .order("desc")
      .collect();
    return datasets;
  },
});

// Get all datasets owned by the authenticated user
export const getMyDatasets = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await getAuthUser(ctx);
    if (!user) return [];

    const datasets = await ctx.db
      .query("datasets")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .order("desc")
      .collect();

    return datasets;
  },
});

// Get a specific dataset by ID (public query for API calls)
export const getDatasetById = query({
  args: { datasetId: v.id("datasets") },
  handler: async (ctx, args) => {
    const dataset = await ctx.db.get(args.datasetId);
    return dataset;
  },
});

// Get a specific dataset by ID
export const getDataset = query({
  args: { datasetId: v.id("datasets") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const dataset = await ctx.db.get(args.datasetId);
    if (!dataset) return null;

    // Check if user owns the dataset or if it's public
    const user = await getAuthUser(ctx);
    if (!user) return null;

    if (dataset.ownerId === user._id || dataset.isPublic) {
      return dataset;
    }

    return null;
  },
});

// Create a new dataset
export const createDataset = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("tabular"), v.literal("image"), v.literal("audio"), v.literal("text")),
    size: v.number(),
    format: v.string(),
    rowCount: v.optional(v.number()),
    columnCount: v.optional(v.number()),
    dimensions: v.optional(v.array(v.number())),
    duration: v.optional(v.number()),
    fileUrl: v.optional(v.string()),
    fileStorageId: v.optional(v.id("_storage")),
    metadata: v.optional(v.any()),
    isPublic: v.optional(v.boolean()),
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

    const now = Date.now();
    const datasetId = await ctx.db.insert("datasets", {
      ...args,
      ownerId: user._id,
      isPublic: args.isPublic ?? false,
      createdAt: now,
      updatedAt: now,
    });

    return datasetId;
  },
});

// Update dataset metadata
export const updateDataset = mutation({
  args: {
    datasetId: v.id("datasets"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
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

    if (dataset.ownerId !== user._id) {
      throw new Error("Not authorized to update this dataset");
    }

    const updates: any = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.isPublic !== undefined) updates.isPublic = args.isPublic;

    await ctx.db.patch(args.datasetId, updates);
    return args.datasetId;
  },
});

// Delete a dataset
export const deleteDataset = mutation({
  args: { datasetId: v.id("datasets") },
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

    if (dataset.ownerId !== user._id) {
      throw new Error("Not authorized to delete this dataset");
    }

    // TODO: Also delete the actual file from storage (S3, GCS, etc.)
    // For now, we only delete the metadata

    await ctx.db.delete(args.datasetId);
    return args.datasetId;
  },
});

// Get public datasets
export const getPublicDatasets = query({
  args: {
    limit: v.optional(v.number()),
    type: v.optional(v.union(v.literal("tabular"), v.literal("image"), v.literal("audio"), v.literal("text"))),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    
    let query = ctx.db
      .query("datasets")
      .filter((q) => q.eq(q.field("isPublic"), true));

    if (args.type) {
      query = query.filter((q) => q.eq(q.field("type"), args.type));
    }

    const datasets = await query
      .order("desc")
      .take(limit);

    return datasets;
  },
});

// Search datasets by name or description
export const searchDatasets = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
    type: v.optional(v.union(v.literal("tabular"), v.literal("image"), v.literal("audio"), v.literal("text"))),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const searchQuery = args.query.toLowerCase();

    let datasets = await ctx.db
      .query("datasets")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .collect();

    // Filter by search query
    datasets = datasets.filter(dataset => 
      dataset.name.toLowerCase().includes(searchQuery) ||
      (dataset.description && dataset.description.toLowerCase().includes(searchQuery))
    );

    // Filter by type if specified
    if (args.type) {
      datasets = datasets.filter(dataset => dataset.type === args.type);
    }

    // Sort by relevance (exact matches first, then partial matches)
    datasets.sort((a, b) => {
      const aExact = a.name.toLowerCase() === searchQuery;
      const bExact = b.name.toLowerCase() === searchQuery;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return b.createdAt - a.createdAt;
    });

    return datasets.slice(0, limit);
  },
});

// Get file URL from storage
export const getFileUrl = query({
  args: { fileStorageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    try {
      const url = await ctx.storage.getUrl(args.fileStorageId);
      return url;
    } catch (error) {
      console.error("Error getting file URL:", error);
      return null;
    }
  },
});

// Generate an upload URL for Convex storage
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const url = await ctx.storage.generateUploadUrl();
    return url;
  },
});

// Finalize an upload by creating a dataset row referencing storage file id
export const finalizeUpload = mutation({
  args: {
    storageId: v.id("_storage"),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("tabular"), v.literal("image"), v.literal("audio"), v.literal("text")),
    size: v.number(),
    format: v.string(),
    rowCount: v.optional(v.number()),
    columnCount: v.optional(v.number()),
    dimensions: v.optional(v.array(v.number())),
    duration: v.optional(v.number()),
    metadata: v.optional(v.any()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("User not found");

    const now = Date.now();
    const datasetId = await ctx.db.insert("datasets", {
      name: args.name,
      description: args.description,
      type: args.type,
      size: args.size,
      format: args.format,
      rowCount: args.rowCount,
      columnCount: args.columnCount,
      dimensions: args.dimensions,
      duration: args.duration,
      fileStorageId: args.storageId,
      ownerId: user._id,
      isPublic: args.isPublic ?? false,
      metadata: args.metadata,
      createdAt: now,
      updatedAt: now,
    });
    return datasetId;
  },
});

// Get a time-limited download URL for a dataset file
export const getDatasetDownloadUrl = query({
  args: { datasetId: v.id("datasets") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const dataset = await ctx.db.get(args.datasetId);
    if (!dataset) return null;
    if (!dataset.fileStorageId) return dataset.fileUrl ?? null;
    const url = await ctx.storage.getUrl(dataset.fileStorageId);
    return url;
  },
});
