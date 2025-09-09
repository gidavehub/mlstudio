import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId, getAuthUser } from "./utils";

// Get all training jobs (for overview/admin purposes)
export const list = query({
  args: {},
  handler: async (ctx) => {
    const jobs = await ctx.db
      .query("trainingJobs")
      .order("desc")
      .collect();
    return jobs;
  },
});

// Get all training jobs for the authenticated user
export const getMyTrainingJobs = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await getAuthUser(ctx);
    if (!user) return [];

    const jobs = await ctx.db
      .query("trainingJobs")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .order("desc")
      .collect();

    return jobs;
  },
});

// Get a specific training job
export const getTrainingJob = query({
  args: { jobId: v.id("trainingJobs") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await getAuthUser(ctx);
    if (!user) return null;

    const job = await ctx.db.get(args.jobId);
    if (!job) return null;

    if (job.ownerId !== user._id) {
      return null;
    }

    return job;
  },
});

// Get training jobs for a specific dataset
export const getTrainingJobsForDataset = query({
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

    const jobs = await ctx.db
      .query("trainingJobs")
      .withIndex("by_dataset", (q) => q.eq("datasetId", args.datasetId))
      .order("desc")
      .collect();

    return jobs;
  },
});

// Create a new training job
export const createTrainingJob = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    datasetId: v.id("datasets"),
    pipelineId: v.optional(v.id("transformationPipelines")),
    modelConfig: v.object({
      architecture: v.string(),
      layers: v.array(v.any()),
      optimizer: v.string(),
      learningRate: v.number(),
      batchSize: v.number(),
      epochs: v.number(),
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

    // Verify dataset ownership
    const dataset = await ctx.db.get(args.datasetId);
    if (!dataset) {
      throw new Error("Dataset not found");
    }

    if (dataset.ownerId !== user._id && !dataset.isPublic) {
      throw new Error("Not authorized to create training job for this dataset");
    }

    // Verify pipeline ownership if provided
    if (args.pipelineId) {
      const pipeline = await ctx.db.get(args.pipelineId);
      if (!pipeline || pipeline.ownerId !== user._id) {
        throw new Error("Invalid pipeline");
      }
    }

    const now = Date.now();
    const jobId = await ctx.db.insert("trainingJobs", {
      name: args.name,
      description: args.description,
      datasetId: args.datasetId,
      pipelineId: args.pipelineId,
      modelType: args.modelConfig.architecture,
      modelParameters: args.modelConfig,
      testSize: 0.2, // Default test size
      validationSize: 0.2, // Default validation size
      randomState: Math.floor(Math.random() * 1000), // Random seed
      status: "pending",
      progress: 0,
      ownerId: user._id,
      createdAt: now,
      updatedAt: now,
    });

    return jobId;
  },
});

// Update training job status
export const updateTrainingJobStatus = mutation({
  args: {
    jobId: v.id("trainingJobs"),
    status: v.union(
      v.literal("pending"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    metrics: v.optional(v.any()),
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

    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new Error("Training job not found");
    }

    if (job.ownerId !== user._id) {
      throw new Error("Not authorized to update this training job");
    }

    const updates: any = { 
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.metrics !== undefined) {
      updates.metrics = {
        ...job.metrics,
        ...args.metrics,
      };
    }

    // If job is completed, set completedAt timestamp
    if (args.status === "completed" && !job.completedAt) {
      updates.completedAt = Date.now();
    }

    await ctx.db.patch(args.jobId, updates);
    return args.jobId;
  },
});

// Delete a training job
export const deleteTrainingJob = mutation({
  args: { jobId: v.id("trainingJobs") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await getAuthUser(ctx);
    if (!user) {
      throw new Error("User not found");
    }

    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new Error("Training job not found");
    }

    if (job.ownerId !== user._id) {
      throw new Error("Not authorized to delete this training job");
    }

    await ctx.db.delete(args.jobId);
    return args.jobId;
  },
});

// Get training jobs by status
export const getTrainingJobsByStatus = query({
  args: { 
    status: v.union(
      v.literal("pending"),
      v.literal("running"),
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

    const jobs = await ctx.db
      .query("trainingJobs")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .filter((q) => q.eq(q.field("ownerId"), user._id))
      .order("desc")
      .take(limit);

    return jobs;
  },
});

// Get recent completed training jobs with results
export const getRecentCompletedJobs = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await getAuthUser(ctx);
    if (!user) return [];

    const limit = args.limit ?? 10;

    const jobs = await ctx.db
      .query("trainingJobs")
      .withIndex("by_status", (q) => q.eq("status", "completed"))
      .filter((q) => q.eq(q.field("ownerId"), user._id))
      .order("desc")
      .take(limit);

    return jobs;
  },
});
