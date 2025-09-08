import { ConvexError } from "convex/values";

// Get the authenticated user's Clerk ID
export async function getAuthUserId(ctx: any): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  return identity?.subject || null;
}

// Get the authenticated user's Convex user record
export async function getAuthUser(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", userId))
    .first();

  return user;
}

// Check if user is authenticated
export async function requireAuth(ctx: any): Promise<string> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new ConvexError("Not authenticated");
  }
  return userId;
}

// Check if user has required role
export async function requireRole(ctx: any, requiredRole: "admin" | "owner"): Promise<void> {
  const user = await getAuthUser(ctx);
  if (!user || user.role !== requiredRole) {
    throw new ConvexError("Insufficient permissions");
  }
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Format date
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
