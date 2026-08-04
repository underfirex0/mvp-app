"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Company = {
  id: string;
  name: string;
  city: string | null;
  phone_1: string | null;
  ice: string | null;
  forme_juridique: string | null;
  director: string | null;
};

const PAGE_SIZE = 25;

export default function Browse() {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<Company[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(0);
      fetchRows(0);
    }, 300); // debounce typing
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, city]);

  useEffect(() => {
    fetchRows(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function fetchRows(p: number) {
    setLoading(true);
    let query = supabase
      .from("companies_v2")
      .select("id, name, city, phone_1, ice, forme_juridique, director", {
        count: "exact",
      });

    if (name.trim()) query = query.ilike("name", `%${name.trim()}%`);
    if (city.trim()) query = query.ilike("city", `%${city.trim()}%`);

    const from = p * PAGE_SIZE;
    const { data, count: c } = await query
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    setRows((data as Company[]) ?? []);
    setCount(c ?? 0);
    setLoading(false);
  }

  const totalPages = Math.max(Math.ceil(count / PAGE_SIZE), 1);

  return (
    <div className="py-10 sm:py-14 pb-20">
      <h1 className="font-display font-semibold text-3xl sm:text-4xl leading-tight max-w-xl">
        Browse, live.
      </h1>
      <p className="text-inksoft mt-3 max-w-lg text-[15px]">
        Every keystroke re-queries the database — no local cache, no stale
        results.
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
            className="sm:w-56 px-4 py-2.5 rounded-lg border border-line bg-surface2 text-sm outline-none focus:border-teal focus:bg-surface transition-colors"
          />
        </div>

        <div className="px-5 sm:px-6 pt-4 font-mono text-xs text-inkfaint">
          {count.toLocaleString()} companies match
        </div>

        <div className="overflow-x-auto">
          <table className="w-full mt-2 min-w-[640px]">
            <thead>
              <tr>
                {["Company", "City", "Phone", "ICE", "Form"].map((h) => (
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
                  <td colSpan={5} className="text-center py-10 text-inkfaint text-sm">
                    loading…
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-inkfaint text-sm">
                    No companies match — try a different search.
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-surface2 transition-colors">
                    <td className="px-5 sm:px-6 py-3 border-b border-line align-top">
                      <div className="font-semibold text-[13.5px]">{r.name}</div>
                      {r.director && (
                        <div className="text-[12px] text-inkfaint mt-0.5">
                          {r.director}
                        </div>
                      )}
                    </td>
                    <td className="px-5 sm:px-6 py-3 border-b border-line align-top text-[13.5px]">
                      {r.city ?? "—"}
                    </td>
                    <td className="px-5 sm:px-6 py-3 border-b border-line align-top font-mono text-[13px]">
                      {r.phone_1 ?? "—"}
                    </td>
                    <td className="px-5 sm:px-6 py-3 border-b border-line align-top font-mono text-[13px]">
                      {r.ice ?? <span className="text-inkfaint">—</span>}
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
    </div>
  );
}
