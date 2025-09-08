import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;

console.log("Convex URL:", convexUrl);

export const convex = new ConvexReactClient(convexUrl);

// Custom hook to configure Convex auth with Clerk
export function useConvexAuth() {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  
  useEffect(() => {
    console.log("🔐 useConvexAuth hook running...");
    console.log("   isLoaded:", isLoaded);
    console.log("   isSignedIn:", isSignedIn);
    console.log("   userId:", userId);
    console.log("   getToken function:", typeof getToken === 'function' ? "Available" : "Not available");
    
    if (isLoaded && isSignedIn && typeof getToken === 'function') {
      convex.setAuth(async () => {
        try {
          const token = await getToken({ template: "convex" });
          console.log("Setting Convex auth token:", token ? "Token received" : "No token");
          return token;
        } catch (error) {
          console.error("Error getting Clerk token:", error);
          return null;
        }
      });
    } else if (isLoaded && !isSignedIn) {
      // Clear auth when user is not signed in
      convex.setAuth(() => null);
    }
  }, [getToken, isLoaded, isSignedIn, userId]);

  return { getToken, isLoaded, isSignedIn, userId };
}

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
