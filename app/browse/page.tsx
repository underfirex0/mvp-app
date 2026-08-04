"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import FilterPanel, {
  Filters,
  EMPTY_FILTERS,
  activeFilterCount,
} from "./FilterPanel";
import CompanyDrawer from "./CompanyDrawer";

type Row = {
  id: string;
  name: string;
  city: string | null;
  phone_1: string | null;
  email: string | null;
  ice: string | null;
  ice_verified: boolean | null;
  forme_juridique: string | null;
};

const PAGE_SIZE = 25;

export default function Browse() {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<Row[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openCompany, setOpenCompany] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(0);
      fetchRows(0);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, city, filters]);

  useEffect(() => {
    fetchRows(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function fetchRows(p: number) {
    setLoading(true);

    // Source filters reach into a different table -- resolve to a set of
    // company_ids first, since PostgREST can't cleanly filter+dedupe a
    // parent table by a child-table condition in one call.
    let sourceIds: string[] | null = null;
    if (filters.sources.length > 0) {
      const { data } = await supabase
        .from("company_field_sources")
        .select("company_id")
        .in("source", filters.sources)
        .limit(5000);
      sourceIds = Array.from(new Set((data ?? []).map((r: any) => r.company_id)));
      if (sourceIds.length === 0) {
        setRows([]);
        setCount(0);
        setLoading(false);
        return;
      }
    }

    let query = supabase
      .from("companies_v2")
      .select(
        "id, name, city, phone_1, email, ice, ice_verified, forme_juridique",
        { count: "exact" }
      );

    if (name.trim()) query = query.ilike("name", `%${name.trim()}%`);
    if (city.trim()) query = query.ilike("city", `%${city.trim()}%`);
    if (filters.legalForm) query = query.eq("forme_juridique", filters.legalForm);
    if (filters.hasPhone) query = query.or("phone_1.not.is.null,phone_2.not.is.null");
    if (filters.hasEmail) query = query.not("email", "is", null);
    if (filters.hasWebsite) query = query.not("website", "is", null);
    if (filters.iceVerified) query = query.eq("ice_verified", true);
    if (sourceIds) query = query.in("id", sourceIds);

    const from = p * PAGE_SIZE;
    const { data, count: c } = await query
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    setRows((data as Row[]) ?? []);
    setCount(c ?? 0);
    setLoading(false);
  }

  const totalPages = Math.max(Math.ceil(count / PAGE_SIZE), 1);
  const filterCount = activeFilterCount(filters);

  return (
    <div className="py-10 sm:py-14 pb-20">
      <h1 className="font-display font-semibold text-3xl sm:text-4xl leading-tight max-w-xl">
        Browse, live.
      </h1>
      <p className="text-inksoft mt-3 max-w-lg text-[15px]">
        Search, filter across everything — including what tonight&apos;s
        enrichment added — and open any row for the full record.
      </p>

      <div className="mt-8 bg-surface border border-line rounded-xl2 shadow-soft overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-line flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-inkfaint"
            >
              <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M14 14L18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search by company name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-line bg-surface2 text-sm outline-none focus:border-teal focus:bg-surface transition-colors"
            />
          </div>
          <input
            type="text"
            placeholder="Filter by city..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="sm:w-52 px-4 py-2.5 rounded-lg border border-line bg-surface2 text-sm outline-none focus:border-teal focus:bg-surface transition-colors"
          />
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
              showFilters || filterCount > 0
                ? "bg-ink text-white border-ink"
                : "border-line text-inksoft hover:border-inkfaint"
            }`}
          >
            <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
              <path d="M3 5h14M6 10h8M9 15h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            Filters
            {filterCount > 0 && (
              <span className="font-mono text-[11px] bg-white/20 px-1.5 rounded-full">
                {filterCount}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="border-b border-line bg-surface2/50">
            <FilterPanel filters={filters} onChange={setFilters} />
          </div>
        )}

        <div className="px-5 sm:px-6 pt-4 font-mono text-xs text-inkfaint">
          {count.toLocaleString()} companies match
        </div>

        <div className="overflow-x-auto">
          <table className="w-full mt-2 min-w-[680px]">
            <thead>
              <tr>
                {["Company", "City", "Phone", "Email", "ICE", "Form"].map((h) => (
                  <th
                    key={h}
                    className="text-left font-mono text-[10.5px] tracking-wide uppercase text-inkfaint px-5 sm:px-6 py-2.5 border-b border-line"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-inkfaint text-sm">
                    loading…
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-inkfaint text-sm">
                    No companies match — try different filters.
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setOpenCompany(r.id)}
                    className="hover:bg-surface2 transition-colors cursor-pointer"
                  >
                    <td className="px-5 sm:px-6 py-3 border-b border-line align-top font-semibold text-[13.5px]">
                      {r.name}
                    </td>
                    <td className="px-5 sm:px-6 py-3 border-b border-line align-top text-[13.5px]">
                      {r.city ?? "—"}
                    </td>
                    <td className="px-5 sm:px-6 py-3 border-b border-line align-top font-mono text-[13px]">
                      {r.phone_1 ?? "—"}
                    </td>
                    <td className="px-5 sm:px-6 py-3 border-b border-line align-top text-[13px]">
                      {r.email ? (
                        <span className="text-teal">{r.email}</span>
                      ) : (
                        <span className="text-inkfaint">—</span>
                      )}
                    </td>
                    <td className="px-5 sm:px-6 py-3 border-b border-line align-top font-mono text-[13px]">
                      {r.ice ? (
                        <span className="inline-flex items-center gap-1.5">
                          {r.ice}
                          {r.ice_verified && (
                            <span className="w-1.5 h-1.5 rounded-full bg-green" title="verified" />
                          )}
                        </span>
                      ) : (
                        <span className="text-inkfaint">—</span>
                      )}
                    </td>
                    <td className="px-5 sm:px-6 py-3 border-b border-line align-top">
                      {r.forme_juridique ? (
                        <span className="font-mono text-[10.5px] bg-tealsoft text-teal px-2.5 py-1 rounded-full">
                          {r.forme_juridique}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 sm:px-6 py-4">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            className="font-mono text-xs px-4 py-2 rounded-full border border-line disabled:opacity-30 hover:border-inkfaint transition-colors"
          >
            ← prev
          </button>
          <span className="font-mono text-xs text-inkfaint">
            page {page + 1} of {totalPages.toLocaleString()}
          </span>
          <button
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="font-mono text-xs px-4 py-2 rounded-full border border-line disabled:opacity-30 hover:border-inkfaint transition-colors"
          >
            next →
          </button>
        </div>
      </div>

      {openCompany && (
        <CompanyDrawer companyId={openCompany} onClose={() => setOpenCompany(null)} />
      )}
    </div>
  );
}
