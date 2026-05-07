// web/app/(app)/layout.tsx
import { ReactNode } from "react";
import BottomNav from "@/components/bottom-nav";
import MaxWidthWrapper from "@/components/ui/max-width-wrapper";
import SideNav from "@/components/side-nav";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <MaxWidthWrapper>
      <SideNav />
      <main className="flex-1">{children}</main>
      <BottomNav />
    </MaxWidthWrapper>
  );
}
