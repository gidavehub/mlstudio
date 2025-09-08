import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId, getAuthUser } from "./utils";

// Get all training jobs for the current user
export const getMyTrainingJobs = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

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
    const user = await getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const job = await ctx.db.get(args.jobId);
    if (!job || job.ownerId !== user._id) {
      throw new Error("Training job not found");
    }

    return job;
  },
});

// Create a new training job (client-side training)
export const createTrainingJob = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    datasetId: v.id("datasets"),
    pipelineId: v.optional(v.id("transformationPipelines")),
    modelType: v.string(),
    modelParameters: v.any(),
    testSize: v.number(),
    validationSize: v.number(),
    randomState: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    console.log("🚀 Creating training job for client-side training:");
    console.log("  - Job name:", args.name);
    console.log("  - Dataset ID:", args.datasetId);
    console.log("  - Model type:", args.modelType);
    console.log("  - User ID:", user._id);

    // For client-side training, we just create the job record
    // The client will handle downloading the dataset and training
    const jobId = await ctx.db.insert("trainingJobs", {
      name: args.name,
      description: args.description,
      datasetId: args.datasetId,
      pipelineId: args.pipelineId,
      modelType: args.modelType,
      modelParameters: args.modelParameters,
      testSize: args.testSize,
      validationSize: args.validationSize,
      randomState: args.randomState,
      status: "pending", // Client will update this when training starts
      progress: 0,
      ownerId: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    console.log("✅ Training job created successfully:", jobId);
    console.log("📝 Note: Client will handle the actual training process");
    return jobId;
  },
});

// Update training job status and progress
export const updateTrainingJob = mutation({
  args: {
    jobId: v.id("trainingJobs"),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    )),
    progress: v.optional(v.number()),
    metrics: v.optional(v.any()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const job = await ctx.db.get(args.jobId);
    if (!job || job.ownerId !== user._id) {
      throw new Error("Training job not found");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.status !== undefined) {
      updates.status = args.status;
      if (args.status === "completed" || args.status === "failed") {
        updates.completedAt = Date.now();
      }
    }

    if (args.progress !== undefined) {
      updates.progress = args.progress;
    }

    if (args.metrics !== undefined) {
      updates.metrics = args.metrics;
    }

    if (args.error !== undefined) {
      updates.error = args.error;
    }

    await ctx.db.patch(args.jobId, updates);
  },
});

// Cancel a training job
export const cancelTrainingJob = mutation({
  args: { jobId: v.id("trainingJobs") },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const job = await ctx.db.get(args.jobId);
    if (!job || job.ownerId !== user._id) {
      throw new Error("Training job not found");
    }

    if (job.status === "running" || job.status === "pending") {
      await ctx.db.patch(args.jobId, {
        status: "cancelled",
        updatedAt: Date.now(),
        completedAt: Date.now(),
      });
    }
  },
});

// Delete a training job
export const deleteTrainingJob = mutation({
  args: { jobId: v.id("trainingJobs") },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const job = await ctx.db.get(args.jobId);
    if (!job || job.ownerId !== user._id) {
      throw new Error("Training job not found");
    }

    await ctx.db.delete(args.jobId);
  },
});

// Get training job metrics and results
export const getTrainingResults = query({
  args: { jobId: v.id("trainingJobs") },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const job = await ctx.db.get(args.jobId);
    if (!job || job.ownerId !== user._id) {
      throw new Error("Training job not found");
    }

    return {
      metrics: job.metrics,
      status: job.status,
      progress: job.progress,
      error: job.error,
      completedAt: job.completedAt,
    };
  },
});

// Get model performance comparison
export const getModelComparison = query({
  args: { datasetId: v.id("datasets") },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const jobs = await ctx.db
      .query("trainingJobs")
      .withIndex("by_dataset", (q) => q.eq("datasetId", args.datasetId))
      .filter((q) => q.eq(q.field("ownerId"), user._id))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    return jobs.map(job => ({
      id: job._id,
      name: job.name,
      modelType: job.modelType,
      metrics: job.metrics,
      completedAt: job.completedAt,
    }));
  },
});

// Export trained model
export const exportModel = mutation({
  args: { jobId: v.id("trainingJobs") },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const job = await ctx.db.get(args.jobId);
    if (!job || job.ownerId !== user._id) {
      throw new Error("Training job not found");
    }

    if (job.status !== "completed") {
      throw new Error("Model training not completed");
    }

    // In a real implementation, this would export the actual model file
    // For now, we'll return the model configuration and metrics
    return {
      modelType: job.modelType,
      modelParameters: job.modelParameters,
      metrics: job.metrics,
      trainingData: {
        datasetId: job.datasetId,
        pipelineId: job.pipelineId,
        testSize: job.testSize,
        validationSize: job.validationSize,
        randomState: job.randomState,
      },
      metadata: {
        name: job.name,
        description: job.description,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
      }
    };
  },
});

// Import model from external source
export const importModel = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    modelType: v.string(),
    modelParameters: v.any(),
    metrics: v.any(),
    datasetId: v.id("datasets"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Verify dataset exists and belongs to user
    const dataset = await ctx.db.get(args.datasetId);
    if (!dataset || dataset.ownerId !== user._id) {
      throw new Error("Dataset not found");
    }

    const jobId = await ctx.db.insert("trainingJobs", {
      name: args.name,
      description: args.description,
      datasetId: args.datasetId,
      modelType: args.modelType,
      modelParameters: args.modelParameters,
      testSize: 0.2, // Default values for imported models
      validationSize: 0.2,
      randomState: 42,
      metrics: args.metrics,
      status: "completed",
      progress: 100,
      ownerId: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      completedAt: Date.now(),
    });

    return jobId;
  },
});

// Get training job logs (for debugging)
export const getTrainingLogs = query({
  args: { jobId: v.id("trainingJobs") },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const job = await ctx.db.get(args.jobId);
    if (!job || job.ownerId !== user._id) {
      throw new Error("Training job not found");
    }

    // In a real implementation, this would fetch actual training logs
    // For now, we'll return mock logs based on the job status
    const mockLogs = [
      {
        timestamp: job.createdAt,
        level: "INFO",
        message: `Training job "${job.name}" created`,
      },
      {
        timestamp: job.createdAt + 1000,
        level: "INFO",
        message: `Dataset loaded: ${job.datasetId}`,
      },
    ];

    if (job.pipelineId) {
      mockLogs.push({
        timestamp: job.createdAt + 2000,
        level: "INFO",
        message: `Data pipeline applied: ${job.pipelineId}`,
      });
    }

    mockLogs.push({
      timestamp: job.createdAt + 3000,
      level: "INFO",
      message: `Model type: ${job.modelType}`,
    });

    if (job.status === "running") {
      mockLogs.push({
        timestamp: job.updatedAt,
        level: "INFO",
        message: `Training in progress: ${job.progress}%`,
      });
    } else if (job.status === "completed") {
      mockLogs.push({
        timestamp: job.completedAt || job.updatedAt,
        level: "INFO",
        message: "Training completed successfully",
      });
    } else if (job.status === "failed") {
      mockLogs.push({
        timestamp: job.completedAt || job.updatedAt,
        level: "ERROR",
        message: job.error || "Training failed",
      });
    }

    return mockLogs;
  },
});
