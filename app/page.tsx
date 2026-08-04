"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Stats = {
  total: number;
  withPhone: number;
  withIce: number;
  withEmail: number;
  withCity: number;
  classified: number;
};

const KNOWN_SOURCES = [
  "hotels",
  "fmc_v4",
  "industriels",
  "f123_merged_v3",
  "export_fmc",
  "fmc_xlsx",
  "les500_directions",
  "leads_agricole",
  "liv4",
];

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [sources, setSources] = useState<{ source: string; count: number }[]>(
    []
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [total, withPhone, withIce, withEmail, withCity, classified] =
          await Promise.all([
            supabase
              .from("companies_v2")
              .select("*", { count: "exact", head: true }),
            supabase
              .from("companies_v2")
              .select("*", { count: "exact", head: true })
              .or("phone_1.not.is.null,phone_2.not.is.null"),
            supabase
              .from("companies_v2")
              .select("*", { count: "exact", head: true })
              .not("ice", "is", null),
            supabase
              .from("companies_v2")
              .select("*", { count: "exact", head: true })
              .not("email", "is", null),
            supabase
              .from("companies_v2")
              .select("*", { count: "exact", head: true })
              .not("city", "is", null),
            supabase
              .from("companies_v2")
              .select("*", { count: "exact", head: true })
              .not("primary_taxonomy_id", "is", null),
          ]);

        setStats({
          total: total.count ?? 0,
          withPhone: withPhone.count ?? 0,
          withIce: withIce.count ?? 0,
          withEmail: withEmail.count ?? 0,
          withCity: withCity.count ?? 0,
          classified: classified.count ?? 0,
        });

        const sourceCounts = await Promise.all(
          KNOWN_SOURCES.map(async (src) => {
            const { count } = await supabase
              .from("company_field_sources")
              .select("*", { count: "exact", head: true })
              .eq("source", src);
            return { source: src, count: count ?? 0 };
          })
        );
        setSources(
          sourceCounts
            .filter((s) => s.count > 0)
            .sort((a, b) => b.count - a.count)
        );
      } catch (e: any) {
        setError(e.message ?? "Failed to load data");
      }
    }
    load();
  }, []);

  const pct = (n: number, total: number) =>
    total > 0 ? ((n / total) * 100).toFixed(1) : "0.0";

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-coral font-medium mb-2">Couldn&apos;t load data</p>
        <p className="text-inksoft text-sm">{error}</p>
        <p className="text-inkfaint text-xs mt-4 font-mono">
          Check .env.local has the right NEXT_PUBLIC_SUPABASE_URL and
          NEXT_PUBLIC_SUPABASE_ANON_KEY, and that rls_fix.sql has been run.
        </p>
      </div>
    );
  }

  return (
    <div className="py-10 sm:py-14">
      <span className="inline-flex items-center gap-2 font-mono text-xs tracking-wide text-teal bg-tealsoft px-3 py-1.5 rounded-full mb-5">
        querying supabase directly — no cached numbers
      </span>
      <h1 className="font-display font-semibold text-3xl sm:text-4xl leading-tight max-w-xl">
        Your database, <em className="not-italic text-teal">right now</em>.
      </h1>
      <p className="text-inksoft mt-3 max-w-lg text-[15px]">
        Every number on this page is a live query against companies_v2 —
        refresh the page and it re-asks the database.
      </p>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-line border border-line rounded-xl2 overflow-hidden mt-10 shadow-soft">
        <StatCell
          label="total companies"
          value={stats ? stats.total.toLocaleString() : "—"}
        />
        <StatCell
          label="have a phone"
          value={stats ? `${pct(stats.withPhone, stats.total)}%` : "—"}
        />
        <StatCell
          label="have an ICE"
          value={stats ? `${pct(stats.withIce, stats.total)}%` : "—"}
        />
        <StatCell
          label="have a city"
          value={stats ? `${pct(stats.withCity, stats.total)}%` : "—"}
        />
        <StatCell
          label="have an email"
          value={stats ? `${pct(stats.withEmail, stats.total)}%` : "—"}
          warn={stats ? stats.withEmail === 0 : false}
        />
        <StatCell
          label="classified"
          value={stats ? `${pct(stats.classified, stats.total)}%` : "—"}
          warn={stats ? stats.classified === 0 : false}
        />
      </div>

      {/* classification ring */}
      <div className="mt-14">
        <div className="font-mono text-xs tracking-wide uppercase text-ochre mb-3">
          the gap that matters most
        </div>
        <h2 className="font-display font-semibold text-2xl max-w-md">
          Classification status, live.
        </h2>
        <div className="mt-8 bg-surface border border-line rounded-xl2 shadow-soft p-6 sm:p-8 grid sm:grid-cols-[220px_1fr] gap-8 items-center">
          <div className="flex flex-col items-center gap-2">
            <ClassificationRing
              pct={stats ? (stats.classified / Math.max(stats.total, 1)) * 100 : 0}
            />
            <div className="font-mono text-[11px] text-inkfaint text-center">
              {stats
                ? `${stats.classified.toLocaleString()} of ${stats.total.toLocaleString()}`
                : "loading..."}
              <br />
              companies classified
            </div>
          </div>
          <div>
            <p className="text-[14.5px] text-inksoft leading-relaxed">
              Every company currently carries a fresh taxonomy loaded
              alongside this rebuild — none have been classified against it
              yet. That work happens through reasoning-based classification,
              not similarity scores, before this number moves.
            </p>
          </div>
        </div>
      </div>

      {/* sources breakdown */}
      <div className="mt-14 pb-16">
        <div className="font-mono text-xs tracking-wide uppercase text-ochre mb-3">
          tonight&apos;s pipeline runs
        </div>
        <h2 className="font-display font-semibold text-2xl max-w-md">
          Where the enrichment came from.
        </h2>
        <div className="mt-8 bg-surface border border-line rounded-xl2 shadow-soft overflow-hidden">
          {sources.length === 0 && (
            <div className="p-8 text-center text-inkfaint text-sm">
              loading…
            </div>
          )}
          {sources.map((s, i) => (
            <div
              key={s.source}
              className={`flex items-center justify-between px-5 sm:px-6 py-4 ${
                i !== sources.length - 1 ? "border-b border-line" : ""
              }`}
            >
              <span className="font-mono text-[13px] text-ink">
                {s.source}
              </span>
              <span className="font-mono text-[13px] text-inkfaint">
                {s.count.toLocaleString()} field entries
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCell({
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div className="bg-surface px-4 py-4 sm:px-5 sm:py-5">
      <div
        className={`font-display font-semibold text-xl sm:text-2xl ${
          warn ? "text-coral" : "text-ink"
        }`}
      >
        {value}
      </div>
      <div className="font-mono text-[10.5px] text-inkfaint mt-1">
        {label}
      </div>
    </div>
  );
}

function ClassificationRing({ pct }: { pct: number }) {
  const r = 82;
  const c = 2 * Math.PI * r;
  const dash = Math.max((pct / 100) * c, 1.5);
  return (
    <svg viewBox="0 0 200 200" width="180" height="180">
      <circle cx="100" cy="100" r={r} fill="none" stroke="#EEF1EC" strokeWidth="20" />
      <circle
        cx="100"
        cy="100"
        r={r}
        fill="none"
        stroke="#C1554C"
        strokeWidth="20"
        strokeDasharray={`${dash} ${c}`}
        strokeLinecap="round"
        transform="rotate(-90 100 100)"
      />
      <text
        x="100"
        y="94"
        textAnchor="middle"
        fontFamily="var(--font-fraunces)"
        fontSize="30"
        fontWeight="600"
        fill="#1B2420"
      >
        {pct.toFixed(1)}%
      </text>
      <text
        x="100"
        y="118"
        textAnchor="middle"
        fontFamily="var(--font-plexmono)"
        fontSize="10"
        fill="#8C948C"
      >
        classified
      </text>
    </svg>
  );
}
