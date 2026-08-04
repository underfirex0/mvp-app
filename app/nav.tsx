"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();

  const tabs = [
    { href: "/", label: "Dashboard" },
    { href: "/browse", label: "Browse" },
  ];

  return (
    <div className="sticky top-0 z-50 bg-bg/90 backdrop-blur-md border-b border-line">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal to-[#1d4d48] relative">
            <div className="absolute inset-[7px] border-[1.5px] border-white/55 rounded-[3px]" />
          </div>
          <div>
            <div className="font-display font-semibold text-[15px] leading-none">
              LeadMaster
            </div>
            <div className="font-mono text-[10.5px] text-inkfaint mt-0.5">
              live data viewer
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-surface2 rounded-full p-1">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`font-mono text-[12.5px] px-4 py-1.5 rounded-full transition-colors ${
                pathname === t.href
                  ? "bg-ink text-white"
                  : "text-inksoft hover:text-ink"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-2 font-mono text-[11.5px] text-teal bg-tealsoft px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
          live
        </div>
      </div>
    </div>
  );
}
