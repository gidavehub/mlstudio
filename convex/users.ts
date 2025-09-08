import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId, getAuthUser } from "./utils";

// Get current user profile
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await getAuthUser(ctx);
    return user;
  },
});

// Create or update user profile
export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    role: v.optional(v.union(v.literal("user"), v.literal("admin"), v.literal("owner"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      // Update existing user
      const updates: any = { updatedAt: now };
      if (args.firstName !== undefined) updates.firstName = args.firstName;
      if (args.lastName !== undefined) updates.lastName = args.lastName;
      if (args.email !== undefined) updates.email = args.email;
      if (args.role !== undefined) updates.role = args.role;

      await ctx.db.patch(existingUser._id, updates);
      return existingUser._id;
    } else {
      // Create new user
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        role: args.role ?? "user",
        createdAt: now,
        updatedAt: now,
      });
      return userId;
    }
  },
});

// Get user by ID
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) return null;

    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    // Only return basic profile info for security
    return {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  },
});

// Get all users (admin only)
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) return [];

    const currentUser = await getAuthUser(ctx);
    if (!currentUser || currentUser.role !== "admin") {
      return [];
    }

    const users = await ctx.db
      .query("users")
      .order("desc")
      .collect();

    return users;
  },
});

// Update user role (admin only)
export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("admin"), v.literal("owner")),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const currentUser = await getAuthUser(ctx);
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Insufficient permissions");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("User not found");
    }

    // Prevent changing owner role
    if (targetUser.role === "owner") {
      throw new Error("Cannot change owner role");
    }

    await ctx.db.patch(args.userId, {
      role: args.role,
      updatedAt: Date.now(),
    });

    return args.userId;
  },
});

// Get user's teams
export const getUserTeams = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await getAuthUser(ctx);
    if (!user) return [];

    const teams = await ctx.db
      .query("teams")
      .filter((q) => 
        q.eq(q.field("ownerId"), user._id) ||
        q.field("members").some((member: any) => member.userId === user._id)
      )
      .collect();

    return teams;
  },
});

// Create a new team
export const createTeam = mutation({
  args: {
    name: v.string(),
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

    const now = Date.now();
    const teamId = await ctx.db.insert("teams", {
      name: args.name,
      description: args.description,
      ownerId: user._id,
      members: [{
        userId: user._id,
        role: "admin",
        joinedAt: now,
      }],
      createdAt: now,
      updatedAt: now,
    });

    return teamId;
  },
});

// Add member to team
export const addTeamMember = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.id("users"),
    role: v.union(v.literal("member"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const currentUser = await getAuthUser(ctx);
    if (!currentUser) {
      throw new Error("User not found");
    }

    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    // Check if user is team owner or admin
    const isOwner = team.ownerId === currentUser._id;
    const isAdmin = team.members.some((member: any) => 
      member.userId === currentUser._id && member.role === "admin"
    );

    if (!isOwner && !isAdmin) {
      throw new Error("Insufficient permissions");
    }

    // Check if user is already a member
    const isAlreadyMember = team.members.some((member: any) => 
      member.userId === args.userId
    );

    if (isAlreadyMember) {
      throw new Error("User is already a team member");
    }

    const updatedMembers = [
      ...team.members,
      {
        userId: args.userId,
        role: args.role,
        joinedAt: Date.now(),
      }
    ];

    await ctx.db.patch(args.teamId, {
      members: updatedMembers,
      updatedAt: Date.now(),
    });

    return args.teamId;
  },
});

// Remove member from team
export const removeTeamMember = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const currentUser = await getAuthUser(ctx);
    if (!currentUser) {
      throw new Error("User not found");
    }

    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    // Check if user is team owner or admin
    const isOwner = team.ownerId === currentUser._id;
    const isAdmin = team.members.some((member: any) => 
      member.userId === currentUser._id && member.role === "admin"
    );

    if (!isOwner && !isAdmin) {
      throw new Error("Insufficient permissions");
    }

    // Prevent removing team owner
    if (team.ownerId === args.userId) {
      throw new Error("Cannot remove team owner");
    }

    const updatedMembers = team.members.filter((member: any) => 
      member.userId !== args.userId
    );

    await ctx.db.patch(args.teamId, {
      members: updatedMembers,
      updatedAt: Date.now(),
    });

    return args.teamId;
  },
});

// Delete team
export const deleteTeam = mutation({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const currentUser = await getAuthUser(ctx);
    if (!currentUser) {
      throw new Error("User not found");
    }

    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    // Only team owner can delete team
    if (team.ownerId !== currentUser._id) {
      throw new Error("Only team owner can delete team");
    }

    await ctx.db.delete(args.teamId);
    return args.teamId;
  },
});
