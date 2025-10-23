import { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./app-layout.css";

const inter = Inter({ subsets: ["latin"] });

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div
      className={`min-h-screen bg-background text-foreground ${inter.className}`}
    >
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      {children}
    </div>
  );
}
