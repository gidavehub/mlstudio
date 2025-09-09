import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./utils";

// Get all teams (for overview/admin purposes)
export const list = query({
  args: {},
  handler: async (ctx) => {
    const teams = await ctx.db
      .query("teams")
      .order("desc")
      .collect();
    return teams;
  },
});

// Get teams for current user
export const getMyTeams = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    if (!currentUser) return [];

    // Get all teams and filter in memory (since we can't easily query array fields)
    const allTeams = await ctx.db
      .query("teams")
      .collect();
    
    // Filter teams where user is owner or member
    const teams = allTeams.filter(team => 
      team.ownerId === currentUser._id || 
      team.members.some(member => member.userId === currentUser._id)
    );

    // Add role information for each team
    const teamsWithRoles = teams.map(team => {
      const userMembership = team.members.find(member => member.userId === currentUser._id);
      const role = team.ownerId === currentUser._id ? "owner" : (userMembership?.role || "member");
      
      return {
        ...team,
        userRole: role,
      };
    });

    return teamsWithRoles.filter(Boolean);
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
    if (!userId) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    if (!currentUser) throw new Error("User not found");

    const teamId = await ctx.db.insert("teams", {
      name: args.name,
      description: args.description,
      ownerId: currentUser._id,
      members: [{
        userId: currentUser._id,
        role: "admin" as const,
        joinedAt: Date.now(),
      }],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return teamId;
  },
});

// Add member to team
export const addTeamMember = mutation({
  args: {
    teamId: v.id("teams"),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("member")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    if (!currentUser) throw new Error("User not found");

    // Get team and check permissions
    const team = await ctx.db.get(args.teamId);
    if (!team) throw new Error("Team not found");

    const userMembership = team.members.find(member => member.userId === currentUser._id);
    const isOwner = team.ownerId === currentUser._id;
    const isAdmin = userMembership?.role === "admin";

    if (!isOwner && !isAdmin) {
      throw new Error("Insufficient permissions");
    }

    // Find user by email
    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!targetUser) throw new Error("User not found");

    // Check if user is already a member
    const existingMembership = team.members.find(member => member.userId === targetUser._id);
    if (existingMembership) throw new Error("User is already a member");

    // Add member to team
    await ctx.db.patch(args.teamId, {
      members: [...team.members, {
        userId: targetUser._id,
        role: args.role,
        joinedAt: Date.now(),
      }],
      updatedAt: Date.now(),
    });

    return targetUser._id;
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
    if (!currentUserId) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", currentUserId))
      .first();

    if (!currentUser) throw new Error("User not found");

    // Get team and check permissions
    const team = await ctx.db.get(args.teamId);
    if (!team) throw new Error("Team not found");

    const userMembership = team.members.find(member => member.userId === currentUser._id);
    const isOwner = team.ownerId === currentUser._id;
    const isAdmin = userMembership?.role === "admin";

    if (!isOwner && !isAdmin) {
      throw new Error("Insufficient permissions");
    }

    // Remove member from team
    await ctx.db.patch(args.teamId, {
      members: team.members.filter(member => member.userId !== args.userId),
      updatedAt: Date.now(),
    });

    return true;
  },
});

// Get team details
export const getTeam = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team) return null;

    // Get team members with details
    const members = await Promise.all(
      team.members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        return {
          ...user,
          role: member.role,
          joinedAt: member.joinedAt,
        };
      })
    );

    return {
      ...team,
      members: members.filter(Boolean),
    };
  },
});