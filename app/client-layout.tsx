"use client";

import { AppLayout } from "@/components/layout/app-layout";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return <AppLayout>{children}</AppLayout>;
}
