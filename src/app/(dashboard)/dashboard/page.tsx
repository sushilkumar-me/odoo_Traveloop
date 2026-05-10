"use client";

import { AnimatedBackground } from "@/components/landing/animated-background";
import { Navbar } from "@/components/landing/navbar";
import { DashboardHero } from "@/components/landing/dashboard-hero";
import { QuickActions } from "@/components/landing/quick-actions";
import { SearchFilters } from "@/components/landing/search-filters";
import { DestinationsSection } from "@/components/landing/destinations-section";
import { PreviousTripsSection } from "@/components/landing/previous-trips-section";
import { BudgetHighlights } from "@/components/landing/budget-highlights";
import { FloatingCTA } from "@/components/landing/floating-cta";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      <AnimatedBackground />
      <Navbar />

      <main className="relative pt-16">
        <DashboardHero />
        <QuickActions />
        <SearchFilters />
        <PreviousTripsSection />
        <BudgetHighlights />
        <DestinationsSection />
      </main>

      <FloatingCTA />

      {/* Footer spacer */}
      <div className="h-24" />
    </div>
  );
}