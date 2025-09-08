import { mutation, query } from "./_generated/server";
import { getAuthUser } from "./utils";

// Migration function to initialize existing users with default KALE balance
export const initializeUserBalance = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // If user doesn't have kaleBalance set, initialize it
    if (user.kaleBalance === undefined) {
      await ctx.db.patch(user._id, {
        kaleBalance: 100, // Give new users 100 KALE tokens to start
        subscriptionPlan: user.subscriptionPlan || "free",
        updatedAt: Date.now(),
      });

      // Create initial transaction record
      await ctx.db.insert("rewardTransactions", {
        userId: user._id,
        transactionType: "bonus",
        amount: 100,
        description: "Welcome bonus - Initial KALE tokens",
        status: "completed",
        createdAt: Date.now(),
        completedAt: Date.now(),
      });

      return {
        success: true,
        message: "Initialized with 100 KALE tokens",
        newBalance: 100,
      };
    }

    return {
      success: false,
      message: "User already has KALE balance initialized",
      currentBalance: user.kaleBalance,
    };
  },
});

// Get all users that need balance initialization (for admin use)
export const getUsersNeedingInitialization = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    
    return users.filter(user => user.kaleBalance === undefined);
  },
});

// Bulk initialize all users without KALE balance (admin function)
export const bulkInitializeUserBalances = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const usersNeedingInit = users.filter(user => user.kaleBalance === undefined);
    
    let initializedCount = 0;
    
    for (const user of usersNeedingInit) {
      await ctx.db.patch(user._id, {
        kaleBalance: 100, // Give 100 KALE tokens to start
        subscriptionPlan: user.subscriptionPlan || "free",
        updatedAt: Date.now(),
      });

      // Create initial transaction record
      await ctx.db.insert("rewardTransactions", {
        userId: user._id,
        transactionType: "bonus",
        amount: 100,
        description: "Welcome bonus - Initial KALE tokens",
        status: "completed",
        createdAt: Date.now(),
        completedAt: Date.now(),
      });

      initializedCount++;
    }

    return {
      success: true,
      message: `Initialized ${initializedCount} users with KALE balances`,
      initializedCount,
    };
  },
});
