"use client";

import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/lib/convex";
import { ApiBillingProvider } from "@/components/ApiBillingMiddleware";
import EnterpriseDashboard from "@/components/EnterpriseDashboard";

export default function DashboardPage() {
  return (
    <>
      <SignedIn>
        <ConvexClientProvider>
          <ApiBillingProvider>
            <div className="min-h-screen bg-ml-dark-50">
              {/* Main Dashboard */}
              <EnterpriseDashboard />
            </div>
          </ApiBillingProvider>
        </ConvexClientProvider>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn redirectUrl="/dashboard" />
      </SignedOut>
    </>
  );
}
