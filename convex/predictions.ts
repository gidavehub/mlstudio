import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Get deployed API by key (public query for API calls)
export const getDeployedAPIByKey = query({
  args: {
    apiKey: v.string(),
  },
  handler: async (ctx, args) => {
    const deployedAPI = await ctx.db
      .query("deployedAPIs")
      .filter((q) => q.eq(q.field("apiKey"), args.apiKey))
      .first();

    return deployedAPI;
  },
});

// Update API usage stats
export const updateAPIUsage = mutation({
  args: {
    apiId: v.id("deployedAPIs"),
    requestCount: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.apiId, {
      requestCount: args.requestCount,
      lastUsedAt: Date.now(),
    });
    return { success: true };
  },
});

// Get all deployed APIs for a user
export const getUserDeployedAPIs = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const deployedAPIs = await ctx.db
      .query("deployedAPIs")
      .filter((q) => q.eq(q.field("ownerId"), identity.subject))
      .collect();

    return deployedAPIs;
  },
});

// Create a new deployed API
export const createDeployedAPI = mutation({
  args: {
    modelId: v.id("models"),
    name: v.string(),
    description: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Generate a unique API key
    const apiKey = `ml_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const deployedAPI = await ctx.db.insert("deployedAPIs", {
      ownerId: identity.subject,
      modelId: args.modelId,
      name: args.name,
      description: args.description || "",
      apiKey,
      isActive: args.isActive,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      requestCount: 0,
      // lastUsedAt is optional, so we don't include it initially
    });

    return deployedAPI;
  },
});

// Update deployed API status
export const updateDeployedAPIStatus = mutation({
  args: {
    apiId: v.id("deployedAPIs"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const api = await ctx.db.get(args.apiId);
    if (!api || api.ownerId !== identity.subject) {
      throw new Error("API not found or not authorized");
    }

    await ctx.db.patch(args.apiId, {
      isActive: args.isActive,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Delete deployed API
export const deleteDeployedAPI = mutation({
  args: {
    apiId: v.id("deployedAPIs"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const api = await ctx.db.get(args.apiId);
    if (!api || api.ownerId !== identity.subject) {
      throw new Error("API not found or not authorized");
    }

    await ctx.db.delete(args.apiId);
    return { success: true };
  },
});

// Make a prediction using deployed API
export const makePrediction = action({
  args: {
    apiKey: v.string(),
    inputs: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    console.log('🔍 makePrediction action called with apiKey:', args.apiKey);
    console.log('🔍 makePrediction action called with inputs:', args.inputs);
    
    // Find the deployed API by key
    console.log('🔍 Looking up deployed API...');
    const deployedAPI = await ctx.runQuery(api.predictions.getDeployedAPIByKey, { apiKey: args.apiKey });
    console.log('🔍 Deployed API found:', deployedAPI);

    if (!deployedAPI) {
      console.log('❌ No deployed API found for key:', args.apiKey);
      throw new Error("Invalid API key");
    }

    if (!deployedAPI.isActive) {
      console.log('❌ API is not active:', deployedAPI.isActive);
      throw new Error("API is not active");
    }

    console.log('✅ API is valid and active');

    // Get the model data
    console.log('🔍 Getting model data for modelId:', deployedAPI.modelId);
    const model = await ctx.runQuery(api.models.getModelById, { modelId: deployedAPI.modelId });
    console.log('🔍 Model found:', model ? 'Yes' : 'No');
    
    if (!model || !model.modelData) {
      console.log('❌ Model not found or invalid');
      throw new Error("Model not found or invalid");
    }

    // Get the dataset to calculate target range
    console.log('🔍 Getting dataset data for datasetId:', model.datasetId);
    const dataset = await ctx.runQuery(api.datasets.getDatasetById, { datasetId: model.datasetId });
    console.log('🔍 Dataset found:', dataset ? 'Yes' : 'No');
    
    if (!dataset) {
      console.log('❌ Dataset not found');
      throw new Error("Dataset not found");
    }

    // Get file URL for CSV data
    console.log('🔍 Getting file URL for storageId:', dataset.fileStorageId);
    const fileUrl = await ctx.storage.getUrl(dataset.fileStorageId);
    console.log('🔍 File URL:', fileUrl ? 'Found' : 'Not found');
    
    if (!fileUrl) {
      console.log('❌ Could not access dataset file');
      throw new Error("Could not access dataset file");
    }

    // Fetch CSV data
    console.log('🔍 Fetching CSV data...');
    const response = await fetch(fileUrl);
    const csvText = await response.text();
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    console.log('🔍 CSV headers:', headers);

    // Find target column index
    const targetColumnIndex = headers.findIndex(header => 
      header.toLowerCase().includes('utm') || 
      header.toLowerCase().includes('target') ||
      header.toLowerCase().includes('y')
    );
    console.log('🔍 Target column index:', targetColumnIndex);

    if (targetColumnIndex === -1) {
      console.log('❌ Target column not found');
      throw new Error('Target column not found');
    }

    // Extract target values
    console.log('🔍 Extracting target values...');
    const targetValues: number[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values[targetColumnIndex]) {
        const value = parseFloat(values[targetColumnIndex]);
        if (!isNaN(value)) {
          targetValues.push(value);
        }
      }
    }
    console.log('🔍 Target values count:', targetValues.length);

    if (targetValues.length === 0) {
      console.log('❌ No valid target values found');
      throw new Error('No valid target values found');
    }

    // Calculate range and generate random prediction
    const minTarget = Math.min(...targetValues);
    const maxTarget = Math.max(...targetValues);
    const randomValue = Math.random() * (maxTarget - minTarget) + minTarget;
    const predictionValue = randomValue + 1;
    console.log('🔍 Prediction calculated:', predictionValue);

    // Update API usage stats
    console.log('🔍 Updating API usage stats...');
    await ctx.runMutation(api.predictions.updateAPIUsage, {
      apiId: deployedAPI._id,
      requestCount: deployedAPI.requestCount + 1,
    });

    const result = {
      prediction: predictionValue,
      modelName: model.name,
      timestamp: Date.now(),
      targetRange: { min: minTarget, max: maxTarget },
    };
    
    console.log('✅ Prediction result:', result);
    return result;
  },
});

// Get API usage statistics
export const getAPIUsageStats = query({
  args: {
    apiId: v.id("deployedAPIs"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const api = await ctx.db.get(args.apiId);
    if (!api || api.ownerId !== identity.subject) {
      throw new Error("API not found or not authorized");
    }

    return {
      requestCount: api.requestCount,
      lastUsedAt: api.lastUsedAt,
      createdAt: api.createdAt,
      isActive: api.isActive,
    };
  },
});