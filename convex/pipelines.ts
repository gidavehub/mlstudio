import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId, getAuthUser } from "./utils";

// Get all pipelines for the current user
export const getMyPipelines = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const user = await getAuthUser(ctx);
    if (!user) {
      return [];
    }

    const pipelines = await ctx.db
      .query("transformationPipelines")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .order("desc")
      .collect();

    return pipelines;
  },
});

// Get a specific pipeline by ID
export const getPipeline = query({
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
      throw new Error("Not authorized to access this pipeline");
    }

    return pipeline;
  },
});

// Create a new pipeline
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

    // Verify the dataset exists and user has access
    const dataset = await ctx.db.get(args.datasetId);
    if (!dataset || dataset.ownerId !== user._id) {
      throw new Error("Dataset not found or access denied");
    }

    const pipelineId = await ctx.db.insert("transformationPipelines", {
      name: args.name,
      description: args.description,
      datasetId: args.datasetId,
      steps: args.steps,
      ownerId: user._id,
      isActive: true,
      version: 1,
      isLatestVersion: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return pipelineId;
  },
});

// Update an existing pipeline
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
    if (!pipeline || pipeline.ownerId !== user._id) {
      throw new Error("Pipeline not found or access denied");
    }

    const updateData: any = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updateData.name = args.name;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.steps !== undefined) updateData.steps = args.steps;
    if (args.isActive !== undefined) updateData.isActive = args.isActive;

    await ctx.db.patch(args.pipelineId, updateData);
    return args.pipelineId;
  },
});

// Delete a pipeline
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
    if (!pipeline || pipeline.ownerId !== user._id) {
      throw new Error("Pipeline not found or access denied");
    }

    await ctx.db.delete(args.pipelineId);
    return args.pipelineId;
  },
});

// Duplicate a pipeline
export const duplicatePipeline = mutation({
  args: { 
    pipelineId: v.id("transformationPipelines"),
    newName: v.string(),
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

    const originalPipeline = await ctx.db.get(args.pipelineId);
    if (!originalPipeline || originalPipeline.ownerId !== user._id) {
      throw new Error("Pipeline not found or access denied");
    }

    const newPipelineId = await ctx.db.insert("transformationPipelines", {
      name: args.newName,
      description: originalPipeline.description,
      datasetId: originalPipeline.datasetId,
      steps: originalPipeline.steps,
      ownerId: user._id,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return newPipelineId;
  },
});

// Get pipelines for a specific dataset
export const getPipelinesForDataset = query({
  args: { datasetId: v.id("datasets") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const user = await getAuthUser(ctx);
    if (!user) {
      return [];
    }

    // Verify the dataset exists and user has access
    const dataset = await ctx.db.get(args.datasetId);
    if (!dataset || dataset.ownerId !== user._id) {
      return [];
    }

    const pipelines = await ctx.db
      .query("transformationPipelines")
      .withIndex("by_dataset", (q) => q.eq("datasetId", args.datasetId))
      .filter((q) => q.eq(q.field("ownerId"), user._id))
      .order("desc")
      .collect();

    return pipelines;
  },
});

// Create a pipeline template (pre-built pipeline)
export const createPipelineTemplate = mutation({
  args: {
    name: v.string(),
    description: v.string(),
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
    category: v.union(
      v.literal("data_cleaning"),
      v.literal("feature_engineering"),
      v.literal("preprocessing"),
      v.literal("ml_preparation")
    ),
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

    // Create a template pipeline (no specific dataset)
    const pipelineId = await ctx.db.insert("transformationPipelines", {
      name: args.name,
      description: args.description,
      datasetId: "" as any, // Templates don't have specific datasets
      steps: args.steps,
      ownerId: user._id,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return pipelineId;
  },
});

// Get pipeline templates
export const getPipelineTemplates = query({
  args: {
    category: v.optional(v.union(
      v.literal("data_cleaning"),
      v.literal("feature_engineering"),
      v.literal("preprocessing"),
      v.literal("ml_preparation")
    )),
  },
  handler: async (ctx, args) => {
    // For now, return hardcoded templates
    // In a real app, you might want to store these in a separate table
    const templates = [
      {
        id: "template_1",
        name: "Basic Data Cleaning",
        description: "Handle missing values, normalize data, and encode categorical variables",
        category: "data_cleaning" as const,
        steps: [
          {
            id: "step_1",
            type: "handle_missing" as const,
            parameters: { strategy: "mean" },
            order: 1,
            appliedAt: Date.now(),
          },
          {
            id: "step_2",
            type: "normalize" as const,
            parameters: { method: "zscore" },
            order: 2,
            appliedAt: Date.now(),
          },
          {
            id: "step_3",
            type: "encode_categorical" as const,
            parameters: { method: "label" },
            order: 3,
            appliedAt: Date.now(),
          },
        ],
      },
      {
        id: "template_2",
        name: "ML Preparation Pipeline",
        description: "Complete pipeline for machine learning model preparation",
        category: "ml_preparation" as const,
        steps: [
          {
            id: "step_1",
            type: "handle_missing" as const,
            parameters: { strategy: "mean" },
            order: 1,
            appliedAt: Date.now(),
          },
          {
            id: "step_2",
            type: "normalize" as const,
            parameters: { method: "minmax" },
            order: 2,
            appliedAt: Date.now(),
          },
          {
            id: "step_3",
            type: "encode_categorical" as const,
            parameters: { method: "onehot" },
            order: 3,
            appliedAt: Date.now(),
          },
          {
            id: "step_4",
            type: "split_data" as const,
            parameters: { train: 0.7, validation: 0.15, test: 0.15 },
            order: 4,
            appliedAt: Date.now(),
          },
        ],
      },
    ];

    if (args.category) {
      return templates.filter(t => t.category === args.category);
    }

    return templates;
  },
});

// Create a new version of an existing pipeline
export const createPipelineVersion = mutation({
  args: {
    pipelineId: v.id("transformationPipelines"),
    name: v.optional(v.string()),
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
        v.literal("convert_to_tensor")
      ),
      parameters: v.any(),
      order: v.number(),
      appliedAt: v.number(),
    })),
    versionNotes: v.optional(v.string()),
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

    const originalPipeline = await ctx.db.get(args.pipelineId);
    if (!originalPipeline || originalPipeline.ownerId !== user._id) {
      throw new Error("Pipeline not found or access denied");
    }

    // Mark all existing versions as not latest
    const existingVersions = await ctx.db
      .query("transformationPipelines")
      .filter((q) => 
        q.eq(q.field("ownerId"), user._id) &&
        (q.eq(q.field("name"), originalPipeline.name) || 
         q.eq(q.field("parentPipelineId"), args.pipelineId))
      )
      .collect();

    for (const version of existingVersions) {
      await ctx.db.patch(version._id, { isLatestVersion: false });
    }

    // Create new version
    const newVersion = originalPipeline.version + 1;
    const newPipelineId = await ctx.db.insert("transformationPipelines", {
      name: args.name || originalPipeline.name,
      description: args.description || originalPipeline.description,
      datasetId: originalPipeline.datasetId,
      steps: args.steps,
      ownerId: user._id,
      isActive: true,
      version: newVersion,
      parentPipelineId: args.pipelineId,
      isLatestVersion: true,
      versionNotes: args.versionNotes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return newPipelineId;
  },
});

// Get all versions of a pipeline
export const getPipelineVersions = query({
  args: { pipelineId: v.id("transformationPipelines") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const user = await getAuthUser(ctx);
    if (!user) {
      return [];
    }

    const originalPipeline = await ctx.db.get(args.pipelineId);
    if (!originalPipeline || originalPipeline.ownerId !== user._id) {
      return [];
    }

    // Get all versions of this pipeline
    const versions = await ctx.db
      .query("transformationPipelines")
      .filter((q) => 
        q.eq(q.field("ownerId"), user._id) &&
        (q.eq(q.field("name"), originalPipeline.name) || 
         q.eq(q.field("parentPipelineId"), args.pipelineId))
      )
      .order("desc")
      .collect();

    return versions;
  },
});

// Export pipeline to JSON
export const exportPipeline = mutation({
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
    if (!pipeline || pipeline.ownerId !== user._id) {
      throw new Error("Pipeline not found or access denied");
    }

    // Create exportable JSON
    const exportData = {
      name: pipeline.name,
      description: pipeline.description,
      version: pipeline.version,
      steps: pipeline.steps,
      exportedAt: Date.now(),
      exportedBy: user.email,
    };

    return exportData;
  },
});

// Import pipeline from JSON
export const importPipeline = mutation({
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
    importedFrom: v.optional(v.string()),
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

    // Verify the dataset exists and user has access
    const dataset = await ctx.db.get(args.datasetId);
    if (!dataset || dataset.ownerId !== user._id) {
      throw new Error("Dataset not found or access denied");
    }

    const pipelineId = await ctx.db.insert("transformationPipelines", {
      name: args.name,
      description: args.description,
      datasetId: args.datasetId,
      steps: args.steps,
      ownerId: user._id,
      isActive: true,
      version: 1,
      isLatestVersion: true,
      versionNotes: args.importedFrom ? `Imported from: ${args.importedFrom}` : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return pipelineId;
  },
});

// Run a pipeline (simulate execution)
export const runPipeline = mutation({
  args: {
    pipelineId: v.id("transformationPipelines"),
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

    const pipeline = await ctx.db.get(args.pipelineId);
    if (!pipeline || pipeline.ownerId !== user._id) {
      throw new Error("Pipeline not found or access denied");
    }

    // Simulate pipeline execution
    // In a real implementation, this would:
    // 1. Load the dataset
    // 2. Apply each transformation step
    // 3. Return the processed data or statistics

    const mockResult = {
      success: true,
      stepsExecuted: args.steps.length,
      executionTime: Math.random() * 1000 + 500, // Mock execution time
      dataShape: {
        rows: Math.floor(Math.random() * 10000) + 1000,
        columns: Math.floor(Math.random() * 50) + 5
      },
      statistics: {
        missingValues: Math.floor(Math.random() * 100),
        dataTypes: {
          numeric: Math.floor(Math.random() * 20) + 5,
          categorical: Math.floor(Math.random() * 10) + 2,
          text: Math.floor(Math.random() * 5)
        }
      },
      preview: {
        columns: ["feature_1", "feature_2", "feature_3", "target"],
        sampleData: [
          [1.2, 3.4, 5.6, 0],
          [2.1, 4.3, 6.5, 1],
          [3.0, 5.2, 7.4, 0]
        ]
      },
      executedAt: Date.now()
    };

    return mockResult;
  },
});