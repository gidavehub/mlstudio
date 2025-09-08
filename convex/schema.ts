import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table for authentication and user management
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    role: v.union(v.literal("user"), v.literal("admin"), v.literal("owner")),
    kaleBalance: v.optional(v.number()), // KALE token balance - optional for existing users
    subscriptionPlan: v.optional(v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise"))),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  // Datasets table for storing original raw data metadata
  datasets: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("tabular"), v.literal("image"), v.literal("audio"), v.literal("text")),
    size: v.number(), // Size in bytes
    format: v.string(), // e.g., "csv", "png", "wav", "json"
    rowCount: v.optional(v.number()), // For tabular data
    columnCount: v.optional(v.number()), // For tabular data
    dimensions: v.optional(v.array(v.number())), // For images: [height, width, channels]
    duration: v.optional(v.number()), // For audio: duration in seconds
    fileUrl: v.optional(v.string()), // URL to the actual file (legacy/public URLs)
    fileStorageId: v.optional(v.id("_storage")), // Convex storage file id
    metadata: v.optional(v.any()), // Additional file-specific metadata
    ownerId: v.id("users"),
    isPublic: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_type", ["type"])
    .index("by_created_at", ["createdAt"]),

  // Transformation pipelines for storing preprocessing steps
  transformationPipelines: defineTable({
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
      parameters: v.any(), // Step-specific parameters
      order: v.number(),
      appliedAt: v.number(),
    })),
    ownerId: v.id("users"),
    isActive: v.boolean(),
    // Versioning fields
    version: v.optional(v.number()), // Version number (1, 2, 3, etc.)
    parentPipelineId: v.optional(v.id("transformationPipelines")), // Reference to parent pipeline
    isLatestVersion: v.optional(v.boolean()), // True for the latest version
    versionNotes: v.optional(v.string()), // Notes about this version
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_dataset", ["datasetId"])
    .index("by_created_at", ["createdAt"]),

  // Training jobs and results
  trainingJobs: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    datasetId: v.id("datasets"),
    pipelineId: v.optional(v.id("transformationPipelines")),
    modelType: v.string(), // e.g., "linear_regression", "neural_network", "random_forest"
    modelParameters: v.any(), // Model-specific parameters
    testSize: v.number(), // Test set size (0.0 to 1.0)
    validationSize: v.number(), // Validation set size (0.0 to 1.0)
    randomState: v.number(), // Random seed for reproducibility
    status: v.union(
      v.literal("pending"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    progress: v.number(), // Training progress (0-100)
    metrics: v.optional(v.any()), // Training metrics (accuracy, loss, etc.)
    error: v.optional(v.string()), // Error message if training failed
    ownerId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_owner", ["ownerId"])
    .index("by_dataset", ["datasetId"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),

  // Teams for collaboration
  teams: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    ownerId: v.id("users"),
    members: v.array(v.object({
      userId: v.id("users"),
      role: v.union(v.literal("member"), v.literal("admin")),
      joinedAt: v.number(),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_member", ["members"]),

  // Team dataset access permissions
  teamDatasets: defineTable({
    teamId: v.id("teams"),
    datasetId: v.id("datasets"),
    permission: v.union(v.literal("read"), v.literal("write"), v.literal("admin")),
    createdAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_dataset", ["datasetId"]),

  // Dataset versioning snapshots (pipeline steps + optional stats)
  datasetVersions: defineTable({
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
        v.literal("convert_to_tensor")
      ),
      parameters: v.any(),
      order: v.number(),
      appliedAt: v.number(),
    })),
    stats: v.optional(v.any()), // column summaries, shapes, etc.
    ownerId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_dataset", ["datasetId"])
    .index("by_owner", ["ownerId"]) 
    .index("by_created_at", ["createdAt"]),

  // Trained models and their versions
  models: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    modelType: v.string(), // e.g., "linear_regression", "neural_network", "cnn"
    status: v.union(
      v.literal("training"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    datasetId: v.id("datasets"),
    pipelineId: v.optional(v.id("transformationPipelines")),
    trainingJobId: v.optional(v.id("trainingJobs")),
    
    // Model configuration
    modelParameters: v.any(), // Architecture, optimizer, learning rate, etc.
    trainingConfig: v.any(), // Training-specific parameters
    
    // Results and metrics
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
    
    // Training history for visualization
    trainingHistory: v.optional(v.array(v.object({
      epoch: v.number(),
      loss: v.number(),
      accuracy: v.optional(v.number()),
      validationLoss: v.optional(v.number()),
      validationAccuracy: v.optional(v.number()),
      timestamp: v.number(),
    }))),
    
    // Model serialization
    modelData: v.optional(v.any()), // Serialized model weights/architecture
    modelStorageId: v.optional(v.id("_storage")), // For large models
    
    // Error information
    errorMessage: v.optional(v.string()),
    errorDetails: v.optional(v.any()),
    
    // Version management
    version: v.optional(v.string()),
    parentModelId: v.optional(v.id("models")), // For model versions
    isLatestVersion: v.optional(v.boolean()),
    
    ownerId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_owner", ["ownerId"])
    .index("by_dataset", ["datasetId"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"])
    .index("by_parent", ["parentModelId"]),

  // Deployed APIs for model predictions
  deployedAPIs: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    modelId: v.id("models"),
    apiKey: v.string(),
    isActive: v.boolean(),
    requestCount: v.number(),
    lastUsedAt: v.optional(v.number()),
    ownerId: v.string(), // Clerk user ID
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_model", ["modelId"])
    .index("by_api_key", ["apiKey"])
    .index("by_created_at", ["createdAt"]),

  // Data Marketplace - Public datasets available for browsing
  marketplaceDatasets: defineTable({
    name: v.string(),
    description: v.string(),
    category: v.string(), // e.g., "Computer Vision", "NLP", "Time Series"
    tags: v.array(v.string()),
    size: v.number(), // Size in bytes
    format: v.string(), // e.g., "csv", "png", "wav", "json"
    rowCount: v.optional(v.number()),
    columnCount: v.optional(v.number()),
    dimensions: v.optional(v.array(v.number())),
    duration: v.optional(v.number()),
    fileStorageId: v.id("_storage"),
    metadata: v.optional(v.any()),
    ownerId: v.id("users"),
    price: v.number(), // Price in KALE tokens
    rating: v.number(), // Average rating (0-5)
    reviewCount: v.number(),
    downloadCount: v.number(),
    isVerified: v.boolean(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_category", ["category"])
    .index("by_price", ["price"])
    .index("by_rating", ["rating"])
    .index("by_created_at", ["createdAt"])
    .index("by_active", ["isActive"]),

  // Data contributions - User submissions to marketplace
  dataContributions: defineTable({
    marketplaceDatasetId: v.id("marketplaceDatasets"),
    contributorId: v.id("users"),
    contributionType: v.union(v.literal("new_dataset"), v.literal("data_addition"), v.literal("correction")),
    description: v.string(),
    fileStorageId: v.id("_storage"),
    size: v.number(),
    format: v.string(),
    metadata: v.optional(v.any()),
    status: v.union(v.literal("pending"), v.literal("under_review"), v.literal("approved"), v.literal("rejected")),
    reviewNotes: v.optional(v.string()),
    reviewerId: v.optional(v.id("users")),
    rewardAmount: v.optional(v.number()), // KALE tokens awarded
    createdAt: v.number(),
    updatedAt: v.number(),
    reviewedAt: v.optional(v.number()),
  })
    .index("by_contributor", ["contributorId"])
    .index("by_dataset", ["marketplaceDatasetId"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),

  // API subscriptions and usage tracking
  apiSubscriptions: defineTable({
    userId: v.id("users"),
    subscriptionTier: v.union(v.literal("free"), v.literal("basic"), v.literal("pro"), v.literal("enterprise")),
    monthlyLimit: v.number(),
    currentUsage: v.number(),
    apiKeys: v.array(v.string()),
    isActive: v.boolean(),
    expiresAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_tier", ["subscriptionTier"])
    .index("by_active", ["isActive"]),

  // API usage logs for tracking and billing
  apiUsageLogs: defineTable({
    userId: v.id("users"),
    apiKey: v.string(),
    endpoint: v.string(),
    requestData: v.optional(v.any()),
    responseData: v.optional(v.any()),
    statusCode: v.number(),
    responseTime: v.number(), // milliseconds
    tokensUsed: v.number(), // KALE tokens consumed
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_api_key", ["apiKey"])
    .index("by_created_at", ["createdAt"]),

  // Reward transactions and KALE token operations
  rewardTransactions: defineTable({
    userId: v.id("users"),
    transactionType: v.union(v.literal("contribution_reward"), v.literal("api_usage"), v.literal("subscription_payment"), v.literal("withdrawal"), v.literal("bonus")),
    amount: v.number(), // KALE tokens
    description: v.string(),
    relatedId: v.optional(v.string()), // ID of related contribution, API call, etc.
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
    stellarTxHash: v.optional(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["transactionType"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),
});
