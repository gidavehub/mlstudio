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

    // Get teams where user is a member
    const memberships = await ctx.db
      .query("teamMemberships")
      .withIndex("by_user", (q) => q.eq("userId", currentUser._id))
      .collect();

    const teams = await Promise.all(
      memberships.map(async (membership) => {
        const team = await ctx.db.get(membership.teamId);
        return {
          ...team,
          role: membership.role,
        };
      })
    );

    return teams.filter(Boolean);
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
      members: [currentUser._id],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Add owner as admin member
    await ctx.db.insert("teamMemberships", {
      teamId,
      userId: currentUser._id,
      role: "owner",
      joinedAt: Date.now(),
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

    // Check if user is team admin or owner
    const membership = await ctx.db
      .query("teamMemberships")
      .withIndex("by_team_and_user", (q) => 
        q.eq("teamId", args.teamId).eq("userId", currentUser._id)
      )
      .first();

    if (!membership || (membership.role !== "admin" && membership.role !== "owner")) {
      throw new Error("Insufficient permissions");
    }

    // Find user by email
    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!targetUser) throw new Error("User not found");

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query("teamMemberships")
      .withIndex("by_team_and_user", (q) => 
        q.eq("teamId", args.teamId).eq("userId", targetUser._id)
      )
      .first();

    if (existingMembership) throw new Error("User is already a member");

    // Add membership
    await ctx.db.insert("teamMemberships", {
      teamId: args.teamId,
      userId: targetUser._id,
      role: args.role,
      joinedAt: Date.now(),
    });

    // Update team members array
    const team = await ctx.db.get(args.teamId);
    if (team) {
      await ctx.db.patch(args.teamId, {
        members: [...team.members, targetUser._id],
        updatedAt: Date.now(),
      });
    }

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

    // Check if user is team admin or owner
    const membership = await ctx.db
      .query("teamMemberships")
      .withIndex("by_team_and_user", (q) => 
        q.eq("teamId", args.teamId).eq("userId", currentUser._id)
      )
      .first();

    if (!membership || (membership.role !== "admin" && membership.role !== "owner")) {
      throw new Error("Insufficient permissions");
    }

    // Remove membership
    const targetMembership = await ctx.db
      .query("teamMemberships")
      .withIndex("by_team_and_user", (q) => 
        q.eq("teamId", args.teamId).eq("userId", args.userId)
      )
      .first();

    if (targetMembership) {
      await ctx.db.delete(targetMembership._id);
    }

    // Update team members array
    const team = await ctx.db.get(args.teamId);
    if (team) {
      await ctx.db.patch(args.teamId, {
        members: team.members.filter(id => id !== args.userId),
        updatedAt: Date.now(),
      });
    }

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
    const memberships = await ctx.db
      .query("teamMemberships")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    const members = await Promise.all(
      memberships.map(async (membership) => {
        const user = await ctx.db.get(membership.userId);
        return {
          ...user,
          role: membership.role,
          joinedAt: membership.joinedAt,
        };
      })
    );

    return {
      ...team,
      members: members.filter(Boolean),
    };
  },
});
