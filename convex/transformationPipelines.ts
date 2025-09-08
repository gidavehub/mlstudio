import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId, getAuthUser } from "./utils";

// Get transformation pipelines for a specific dataset
export const getPipelinesForDataset = query({
  args: { datasetId: v.id("datasets") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await getAuthUser(ctx);
    if (!user) return [];

    // Get the dataset to check ownership
    const dataset = await ctx.db.get(args.datasetId);
    if (!dataset) return [];

    if (dataset.ownerId !== user._id && !dataset.isPublic) {
      return [];
    }

    const pipelines = await ctx.db
      .query("transformationPipelines")
      .withIndex("by_dataset", (q) => q.eq("datasetId", args.datasetId))
      .order("desc")
      .collect();

    return pipelines;
  },
});

// Get a specific transformation pipeline
export const getPipeline = query({
  args: { pipelineId: v.id("transformationPipelines") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await getAuthUser(ctx);
    if (!user) return null;

    const pipeline = await ctx.db.get(args.pipelineId);
    if (!pipeline) return null;

    // Check if user owns the pipeline
    if (pipeline.ownerId !== user._id) {
      return null;
    }

    return pipeline;
  },
});

// Create a new transformation pipeline
export const createPipeline = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    datasetId: v.id("datasets"),
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
        v.literal("convert_to_tensor")
      ),
      parameters: v.any(),
      order: v.number(),
      appliedAt: v.number(),
    })),
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

    if (dataset.ownerId !== user._id) {
      throw new Error("Not authorized to create pipeline for this dataset");
    }

    const now = Date.now();
    const pipelineId = await ctx.db.insert("transformationPipelines", {
      ...args,
      ownerId: user._id,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return pipelineId;
  },
});

// Update a transformation pipeline
export const updatePipeline = mutation({
  args: {
    pipelineId: v.id("transformationPipelines"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    steps: v.optional(v.array(v.object({
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
        v.literal("convert_to_tensor")
      ),
      parameters: v.any(),
      order: v.number(),
      appliedAt: v.number(),
    }))),
    isActive: v.optional(v.boolean()),
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

    const pipeline = await ctx.db.get(args.pipelineId);
    if (!pipeline) {
      throw new Error("Pipeline not found");
    }

    if (pipeline.ownerId !== user._id) {
      throw new Error("Not authorized to update this pipeline");
    }

    const updates: any = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.steps !== undefined) updates.steps = args.steps;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.pipelineId, updates);
    return args.pipelineId;
  },
});

// Delete a transformation pipeline
export const deletePipeline = mutation({
  args: { pipelineId: v.id("transformationPipelines") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await getAuthUser(ctx);
    if (!user) {
      throw new Error("User not found");
    }

    const pipeline = await ctx.db.get(args.pipelineId);
    if (!pipeline) {
      throw new Error("Pipeline not found");
    }

    if (pipeline.ownerId !== user._id) {
      throw new Error("Not authorized to delete this pipeline");
    }

    await ctx.db.delete(args.pipelineId);
    return args.pipelineId;
  },
});

// Add a step to an existing pipeline
export const addPipelineStep = mutation({
  args: {
    pipelineId: v.id("transformationPipelines"),
    step: v.object({
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
        v.literal("convert_to_tensor")
      ),
      parameters: v.any(),
      order: v.number(),
      appliedAt: v.number(),
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

    const pipeline = await ctx.db.get(args.pipelineId);
    if (!pipeline) {
      throw new Error("Pipeline not found");
    }

    if (pipeline.ownerId !== user._id) {
      throw new Error("Not authorized to modify this pipeline");
    }

    const updatedSteps = [...pipeline.steps, args.step];
    
    await ctx.db.patch(args.pipelineId, {
      steps: updatedSteps,
      updatedAt: Date.now(),
    });

    return args.pipelineId;
  },
});

// Remove a step from a pipeline
export const removePipelineStep = mutation({
  args: {
    pipelineId: v.id("transformationPipelines"),
    stepId: v.string(),
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

    const pipeline = await ctx.db.get(args.pipelineId);
    if (!pipeline) {
      throw new Error("Pipeline not found");
    }

    if (pipeline.ownerId !== user._id) {
      throw new Error("Not authorized to modify this pipeline");
    }

    const updatedSteps = pipeline.steps.filter(step => step.id !== args.stepId);
    
    await ctx.db.patch(args.pipelineId, {
      steps: updatedSteps,
      updatedAt: Date.now(),
    });

    return args.pipelineId;
  },
});

// Get all pipelines for the authenticated user
export const getMyPipelines = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await getAuthUser(ctx);
    if (!user) return [];

    const pipelines = await ctx.db
      .query("transformationPipelines")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .order("desc")
      .collect();

    return pipelines;
  },
});
