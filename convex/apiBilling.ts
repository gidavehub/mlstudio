import { mutation, query } from "./_generated/server";
import { getAuthUser } from "./utils";
import { v } from "convex/values";

// API Pricing Configuration
const API_PRICING = {
  // Model training endpoints
  "train_model": 10, // 10 KALE tokens per training job
  "predict": 1, // 1 KALE token per prediction
  "batch_predict": 0.5, // 0.5 KALE tokens per prediction in batch
  
  // Data processing endpoints
  "upload_dataset": 5, // 5 KALE tokens per dataset upload
  "process_data": 2, // 2 KALE tokens per data processing job
  "transform_data": 3, // 3 KALE tokens per transformation
  
  // Model management endpoints
  "deploy_model": 15, // 15 KALE tokens per model deployment
  "update_model": 5, // 5 KALE tokens per model update
  "delete_model": 2, // 2 KALE tokens per model deletion
  
  // Analytics endpoints
  "get_metrics": 0.5, // 0.5 KALE tokens per metrics request
  "get_training_history": 1, // 1 KALE token per training history request
  
  // Data marketplace endpoints
  "browse_datasets": 0.1, // 0.1 KALE tokens per browse request
  "download_dataset": 2, // 2 KALE tokens per dataset download
  "contribute_data": 3, // 3 KALE tokens per data contribution
  "validate_data": 1, // 1 KALE token per validation request
};

// Get user's current KALE balance
export const getUserBalance = query({
  args: {},
  handler: async (ctx) => {
    try {
      const user = await getAuthUser(ctx);
      if (!user) {
        // Return default values instead of throwing error
        return {
          kaleBalance: 0,
          subscriptionPlan: "free"
        };
      }
      
      return {
        kaleBalance: user.kaleBalance || 0,
        subscriptionPlan: user.subscriptionPlan || "free"
      };
    } catch (error) {
      console.error('Error getting user balance:', error);
      // Return default values on error
      return {
        kaleBalance: 0,
        subscriptionPlan: "free"
      };
    }
  },
});

// Check if user has sufficient balance for API call
export const checkBalance = query({
  args: { 
    endpoint: v.string(),
    quantity: v.optional(v.number()) // For batch operations
  },
  handler: async (ctx, args) => {
    try {
      const user = await getAuthUser(ctx);
      if (!user) {
        return {
          hasSufficientBalance: false,
          requiredTokens: 0,
          currentBalance: 0,
          endpoint: args.endpoint
        };
      }

      const baseCost = API_PRICING[args.endpoint as keyof typeof API_PRICING] || 1;
      const totalCost = baseCost * (args.quantity || 1);
      const currentBalance = user.kaleBalance || 0;
      
      return {
        hasSufficientBalance: currentBalance >= totalCost,
        requiredTokens: totalCost,
        currentBalance,
        endpoint: args.endpoint
      };
    } catch (error) {
      console.error('Error checking balance:', error);
      return {
        hasSufficientBalance: false,
        requiredTokens: 0,
        currentBalance: 0,
        endpoint: args.endpoint
      };
    }
  },
});

// Deduct tokens for API usage
export const deductTokens = mutation({
  args: {
    endpoint: v.string(),
    quantity: v.optional(v.number()),
    requestData: v.optional(v.any()),
    responseData: v.optional(v.any()),
    statusCode: v.number(),
    responseTime: v.number(),
    apiKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const baseCost = API_PRICING[args.endpoint as keyof typeof API_PRICING] || 1;
    const tokensToDeduct = baseCost * (args.quantity || 1);
    const currentBalance = user.kaleBalance || 0;

    // Check if user has sufficient balance
    if (currentBalance < tokensToDeduct) {
      throw new Error(`Insufficient KALE balance. Required: ${tokensToDeduct}, Available: ${currentBalance}`);
    }

    // Update user's balance
    await ctx.db.patch(user._id, {
      kaleBalance: currentBalance - tokensToDeduct,
      updatedAt: Date.now(),
    });

    // Log the API usage
    await ctx.db.insert("apiUsageLogs", {
      userId: user._id,
      apiKey: args.apiKey || "internal",
      endpoint: args.endpoint,
      requestData: args.requestData,
      responseData: args.responseData,
      statusCode: args.statusCode,
      responseTime: args.responseTime,
      tokensUsed: tokensToDeduct,
      createdAt: Date.now(),
    });

    // Create reward transaction record
    await ctx.db.insert("rewardTransactions", {
      userId: user._id,
      transactionType: "api_usage",
      amount: -tokensToDeduct, // Negative amount for deduction
      description: `API call to ${args.endpoint}`,
      relatedId: args.apiKey,
      status: "completed",
      createdAt: Date.now(),
      completedAt: Date.now(),
    });

    return {
      success: true,
      tokensDeducted: tokensToDeduct,
      newBalance: currentBalance - tokensToDeduct,
    };
  },
});

// Add tokens to user balance (for rewards, purchases, etc.)
export const addTokens = mutation({
  args: {
    amount: v.number(),
    description: v.string(),
    transactionType: v.union(
      v.literal("contribution_reward"),
      v.literal("subscription_payment"),
      v.literal("bonus"),
      v.literal("refund")
    ),
    relatedId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const currentBalance = user.kaleBalance || 0;
    const newBalance = currentBalance + args.amount;

    // Update user's balance
    await ctx.db.patch(user._id, {
      kaleBalance: newBalance,
      updatedAt: Date.now(),
    });

    // Create reward transaction record
    await ctx.db.insert("rewardTransactions", {
      userId: user._id,
      transactionType: args.transactionType,
      amount: args.amount,
      description: args.description,
      relatedId: args.relatedId,
      status: "completed",
      createdAt: Date.now(),
      completedAt: Date.now(),
    });

    return {
      success: true,
      tokensAdded: args.amount,
      newBalance,
    };
  },
});

// Get user's API usage history
export const getUsageHistory = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      const user = await getAuthUser(ctx);
      if (!user) {
        return {
          usageLogs: [],
          transactions: [],
          totalTokensUsed: 0,
        };
      }

      const limit = args.limit || 50;
      
      const usageLogs = await ctx.db
        .query("apiUsageLogs")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .order("desc")
        .take(limit);

      const transactions = await ctx.db
        .query("rewardTransactions")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("transactionType"), "api_usage"))
        .order("desc")
        .take(limit);

      return {
        usageLogs,
        transactions,
        totalTokensUsed: transactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0),
      };
    } catch (error) {
      console.error('Error getting usage history:', error);
      return {
        usageLogs: [],
        transactions: [],
        totalTokensUsed: 0,
      };
    }
  },
});

// Get API pricing information
export const getApiPricing = query({
  args: {},
  handler: async () => {
    return {
      pricing: API_PRICING,
      currency: "KALE",
      description: "All API calls are charged in KALE tokens. Prices may vary based on computational complexity and data size.",
    };
  },
});

// Get user's subscription benefits
export const getSubscriptionBenefits = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const plan = user.subscriptionPlan || "free";
    
    const benefits = {
      free: {
        monthlyApiLimit: 1000,
        discountMultiplier: 1.0, // No discount
        features: ["Basic API access", "Community support"],
      },
      pro: {
        monthlyApiLimit: 10000,
        discountMultiplier: 0.8, // 20% discount
        features: ["Priority API access", "Email support", "Advanced analytics"],
      },
      enterprise: {
        monthlyApiLimit: -1, // Unlimited
        discountMultiplier: 0.5, // 50% discount
        features: ["Unlimited API access", "Dedicated support", "Custom integrations"],
      },
    } as const;

    // Ensure plan is a valid key
    const validPlan = (plan === "free" || plan === "pro" || plan === "enterprise") ? plan : "free";

    return {
      currentPlan: validPlan,
      benefits: benefits[validPlan as keyof typeof benefits],
      allPlans: benefits,
    };
  },
});
