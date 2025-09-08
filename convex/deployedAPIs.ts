import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId, getAuthUser } from "./utils";

// Get all deployed APIs (for overview/admin purposes)
export const list = query({
  args: {},
  handler: async (ctx) => {
    const apis = await ctx.db
      .query("deployedAPIs")
      .order("desc")
      .collect();
    return apis;
  },
});

// Get user's deployed APIs
export const getMyAPIs = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const apis = await ctx.db
      .query("deployedAPIs")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .order("desc")
      .collect();

    return apis;
  },
});

// Get a specific API
export const getAPI = query({
  args: { apiId: v.id("deployedAPIs") },
  handler: async (ctx, args) => {
    const api = await ctx.db.get(args.apiId);
    return api;
  },
});

// Create a new deployed API
export const createAPI = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    modelId: v.id("models"),
    apiKey: v.string(),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    const apiId = await ctx.db.insert("deployedAPIs", {
      ...args,
      ownerId: userId,
      isActive: args.isActive ?? true,
      requestCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    return apiId;
  },
});

// Update API
export const updateAPI = mutation({
  args: {
    apiId: v.id("deployedAPIs"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const api = await ctx.db.get(args.apiId);
    if (!api) throw new Error("API not found");

    if (api.ownerId !== userId) {
      throw new Error("Not authorized to update this API");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.apiId, updates);
    return args.apiId;
  },
});

// Delete API
export const deleteAPI = mutation({
  args: { apiId: v.id("deployedAPIs") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const api = await ctx.db.get(args.apiId);
    if (!api) throw new Error("API not found");

    if (api.ownerId !== userId) {
      throw new Error("Not authorized to delete this API");
    }

    await ctx.db.delete(args.apiId);
    return args.apiId;
  },
});

// Increment request count
export const incrementRequestCount = mutation({
  args: { apiId: v.id("deployedAPIs") },
  handler: async (ctx, args) => {
    const api = await ctx.db.get(args.apiId);
    if (!api) throw new Error("API not found");

    await ctx.db.patch(args.apiId, {
      requestCount: api.requestCount + 1,
      lastUsedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return args.apiId;
  },
});
