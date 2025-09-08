import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId, getAuthUser } from "./utils";

// Get all models (for overview/admin purposes)
export const list = query({
  args: {},
  handler: async (ctx) => {
    const models = await ctx.db
      .query("models")
      .order("desc")
      .collect();
    return models;
  },
});

// Get all models owned by the authenticated user
export const getMyModels = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await getAuthUser(ctx);
    if (!user) return [];

    const models = await ctx.db
      .query("models")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .order("desc")
      .collect();

    return models;
  },
});

// Get a specific model by ID (public query for API calls)
export const getModelById = query({
  args: { modelId: v.id("models") },
  handler: async (ctx, args) => {
    const model = await ctx.db.get(args.modelId);
    return model;
  },
});

// Get a specific model by ID
export const getModel = query({
  args: { modelId: v.id("models") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await getAuthUser(ctx);
    if (!user) return null;

    const model = await ctx.db.get(args.modelId);
    if (!model) return null;

    // Check if user owns the model
    if (model.ownerId !== user._id) {
      return null;
    }

    return model;
  },
});

// Get models for a specific dataset
export const getModelsForDataset = query({
  args: { datasetId: v.id("datasets") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await getAuthUser(ctx);
    if (!user) return [];

    // Check dataset ownership
    const dataset = await ctx.db.get(args.datasetId);
    if (!dataset) return [];

    if (dataset.ownerId !== user._id && !dataset.isPublic) {
      return [];
    }

    const models = await ctx.db
      .query("models")
      .withIndex("by_dataset", (q) => q.eq("datasetId", args.datasetId))
      .filter((q) => q.eq(q.field("ownerId"), user._id))
      .order("desc")
      .collect();

    return models;
  },
});

// Get models by status
export const getModelsByStatus = query({
  args: { 
    status: v.union(
      v.literal("training"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await getAuthUser(ctx);
    if (!user) return [];

    const limit = args.limit ?? 50;

    const models = await ctx.db
      .query("models")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .filter((q) => q.eq(q.field("ownerId"), user._id))
      .order("desc")
      .take(limit);

    return models;
  },
});

// Get model versions
export const getModelVersions = query({
  args: { parentModelId: v.id("models") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await getAuthUser(ctx);
    if (!user) return [];

    // Check parent model ownership
    const parentModel = await ctx.db.get(args.parentModelId);
    if (!parentModel || parentModel.ownerId !== user._id) {
      return [];
    }

    const versions = await ctx.db
      .query("models")
      .withIndex("by_parent", (q) => q.eq("parentModelId", args.parentModelId))
      .order("desc")
      .collect();

    return versions;
  },
});

// Create a new model
export const createModel = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    modelType: v.string(),
    datasetId: v.id("datasets"),
    pipelineId: v.optional(v.id("transformationPipelines")),
    trainingJobId: v.optional(v.id("trainingJobs")),
    modelParameters: v.any(),
    trainingConfig: v.any(),
    parentModelId: v.optional(v.id("models")),
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

    // Verify dataset ownership
    const dataset = await ctx.db.get(args.datasetId);
    if (!dataset) {
      throw new Error("Dataset not found");
    }

    if (dataset.ownerId !== user._id && !dataset.isPublic) {
      throw new Error("Not authorized to create model for this dataset");
    }

    // Verify pipeline ownership if provided
    if (args.pipelineId) {
      const pipeline = await ctx.db.get(args.pipelineId);
      if (!pipeline || pipeline.ownerId !== user._id) {
        throw new Error("Invalid pipeline");
      }
    }

    // Verify parent model ownership if provided
    if (args.parentModelId) {
      const parentModel = await ctx.db.get(args.parentModelId);
      if (!parentModel || parentModel.ownerId !== user._id) {
        throw new Error("Invalid parent model");
      }
    }

    const now = Date.now();
    const modelId = await ctx.db.insert("models", {
      ...args,
      status: "training",
      ownerId: user._id,
      createdAt: now,
      updatedAt: now,
      isLatestVersion: true,
    });

    // If this is a new version, mark other versions as not latest
    if (args.parentModelId) {
      const siblings = await ctx.db
        .query("models")
        .withIndex("by_parent", (q) => q.eq("parentModelId", args.parentModelId))
        .collect();

      for (const sibling of siblings) {
        if (sibling._id !== modelId) {
          await ctx.db.patch(sibling._id, { isLatestVersion: false });
        }
      }
    }

    return modelId;
  },
});

// Update model status and results
export const updateModel = mutation({
  args: {
    modelId: v.id("models"),
    status: v.optional(v.union(
      v.literal("training"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    )),
    metrics: v.optional(v.object({
      accuracy: v.optional(v.number()),
      loss: v.optional(v.number()),
      validationAccuracy: v.optional(v.number()),
      validationLoss: v.optional(v.number()),
      testAccuracy: v.optional(v.number()),
      testLoss: v.optional(v.number()),
      trainingTime: v.optional(v.number()),
      epochs: v.optional(v.number()),
    })),
    trainingHistory: v.optional(v.array(v.object({
      epoch: v.number(),
      loss: v.number(),
      accuracy: v.optional(v.number()),
      validationLoss: v.optional(v.number()),
      validationAccuracy: v.optional(v.number()),
      timestamp: v.number(),
    }))),
    modelData: v.optional(v.any()),
    errorMessage: v.optional(v.string()),
    errorDetails: v.optional(v.any()),
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

    const model = await ctx.db.get(args.modelId);
    if (!model) {
      throw new Error("Model not found");
    }

    if (model.ownerId !== user._id) {
      throw new Error("Not authorized to update this model");
    }

    const updates: any = { updatedAt: Date.now() };

    if (args.status !== undefined) updates.status = args.status;
    if (args.metrics !== undefined) updates.metrics = args.metrics;
    if (args.trainingHistory !== undefined) updates.trainingHistory = args.trainingHistory;
    if (args.modelData !== undefined) updates.modelData = args.modelData;
    if (args.errorMessage !== undefined) updates.errorMessage = args.errorMessage;
    if (args.errorDetails !== undefined) updates.errorDetails = args.errorDetails;

    // If model is completed, set completedAt timestamp
    if (args.status === "completed" && !model.completedAt) {
      updates.completedAt = Date.now();
    }

    await ctx.db.patch(args.modelId, updates);
    return args.modelId;
  },
});

// Update model metadata (name, description)
export const updateModelMetadata = mutation({
  args: {
    modelId: v.id("models"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
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

    const model = await ctx.db.get(args.modelId);
    if (!model) {
      throw new Error("Model not found");
    }

    if (model.ownerId !== user._id) {
      throw new Error("Not authorized to update this model");
    }

    const updates: any = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;

    await ctx.db.patch(args.modelId, updates);
    return args.modelId;
  },
});

// Delete a model
export const deleteModel = mutation({
  args: { modelId: v.id("models") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await getAuthUser(ctx);
    if (!user) {
      throw new Error("User not found");
    }

    const model = await ctx.db.get(args.modelId);
    if (!model) {
      throw new Error("Model not found");
    }

    if (model.ownerId !== user._id) {
      throw new Error("Not authorized to delete this model");
    }

    // Also delete all versions of this model
    const versions = await ctx.db
      .query("models")
      .withIndex("by_parent", (q) => q.eq("parentModelId", args.modelId))
      .collect();

    for (const version of versions) {
      await ctx.db.delete(version._id);
    }

    // Delete the main model
    await ctx.db.delete(args.modelId);
    return args.modelId;
  },
});

// Clone/duplicate a model for retraining
export const cloneModel = mutation({
  args: {
    modelId: v.id("models"),
    name: v.string(),
    description: v.optional(v.string()),
    modelParameters: v.optional(v.any()),
    trainingConfig: v.optional(v.any()),
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

    const originalModel = await ctx.db.get(args.modelId);
    if (!originalModel) {
      throw new Error("Model not found");
    }

    if (originalModel.ownerId !== user._id) {
      throw new Error("Not authorized to clone this model");
    }

    const now = Date.now();
    const clonedModelId = await ctx.db.insert("models", {
      name: args.name,
      description: args.description,
      modelType: originalModel.modelType,
      status: "training",
      datasetId: originalModel.datasetId,
      pipelineId: originalModel.pipelineId,
      modelParameters: args.modelParameters || originalModel.modelParameters,
      trainingConfig: args.trainingConfig || originalModel.trainingConfig,
      parentModelId: args.modelId, // Link to original model
      ownerId: user._id,
      createdAt: now,
      updatedAt: now,
      isLatestVersion: true,
    });

    return clonedModelId;
  },
});

// Get recent completed models with good performance
export const getTopModels = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await getAuthUser(ctx);
    if (!user) return [];

    const limit = args.limit ?? 10;

    const models = await ctx.db
      .query("models")
      .withIndex("by_status", (q) => q.eq("status", "completed"))
      .filter((q) => q.eq(q.field("ownerId"), user._id))
      .order("desc")
      .take(limit * 2); // Get more to filter and sort

    // Sort by performance (accuracy or inverse loss)
    const sortedModels = models
      .filter(model => model.metrics)
      .sort((a, b) => {
        const aScore = a.metrics?.accuracy || (1 - (a.metrics?.loss || 1));
        const bScore = b.metrics?.accuracy || (1 - (b.metrics?.loss || 1));
        return bScore - aScore;
      })
      .slice(0, limit);

    return sortedModels;
  },
});

// Add training history entry (for real-time updates)
export const addTrainingHistoryEntry = mutation({
  args: {
    modelId: v.id("models"),
    entry: v.object({
      epoch: v.number(),
      loss: v.number(),
      accuracy: v.optional(v.number()),
      validationLoss: v.optional(v.number()),
      validationAccuracy: v.optional(v.number()),
      timestamp: v.number(),
    }),
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

    const model = await ctx.db.get(args.modelId);
    if (!model) {
      throw new Error("Model not found");
    }

    if (model.ownerId !== user._id) {
      throw new Error("Not authorized to update this model");
    }

    const currentHistory = model.trainingHistory || [];
    const updatedHistory = [...currentHistory, args.entry];

    await ctx.db.patch(args.modelId, {
      trainingHistory: updatedHistory,
      updatedAt: Date.now(),
    });

    return args.modelId;
  },
});
