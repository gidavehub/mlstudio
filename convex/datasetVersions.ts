import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId, getAuthUser } from "./utils";

// Create a new dataset version snapshot
export const createVersion = mutation({
  args: {
    datasetId: v.id("datasets"),
    name: v.string(),
    description: v.optional(v.string()),
    steps: v.array(v.object({
      id: v.string(),
      type: v.union(
        v.literal("load"),
        v.literal("reshape"),
        v.literal("normalize"),
        v.literal("scale"),
        v.literal("feature_engineering"),
        v.literal("handle_missing"),
        v.literal("encode_categorical"),
        v.literal("split_data"),
        v.literal("convert_to_tensor"),
      ),
      parameters: v.any(),
      order: v.number(),
      appliedAt: v.number(),
    })),
    stats: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("User not found");

    const now = Date.now();
    const id = await ctx.db.insert("datasetVersions", {
      datasetId: args.datasetId,
      name: args.name,
      description: args.description,
      steps: args.steps,
      stats: args.stats,
      ownerId: user._id,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },
});

// List versions for a dataset
export const listVersions = query({
  args: { datasetId: v.id("datasets") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const user = await getAuthUser(ctx);
    if (!user) return [];
    const versions = await ctx.db
      .query("datasetVersions")
      .withIndex("by_dataset", (q) => q.eq("datasetId", args.datasetId))
      .order("desc")
      .collect();
    return versions;
  },
});

// Get one version
export const getVersion = query({
  args: { versionId: v.id("datasetVersions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const version = await ctx.db.get(args.versionId);
    return version;
  },
});

// Delete a version
export const deleteVersion = mutation({
  args: { versionId: v.id("datasetVersions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.delete(args.versionId);
    return args.versionId;
  },
});


