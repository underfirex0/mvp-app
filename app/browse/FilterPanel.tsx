"use client";

import { KNOWN_SOURCES, LEGAL_FORMS } from "@/lib/types";

export type Filters = {
  legalForm: string;
  hasPhone: boolean;
  hasEmail: boolean;
  hasWebsite: boolean;
  iceVerified: boolean;
  sources: string[];
};

export const EMPTY_FILTERS: Filters = {
  legalForm: "",
  hasPhone: false,
  hasEmail: false,
  hasWebsite: false,
  iceVerified: false,
  sources: [],
};

export function activeFilterCount(f: Filters) {
  return (
    (f.legalForm ? 1 : 0) +
    (f.hasPhone ? 1 : 0) +
    (f.hasEmail ? 1 : 0) +
    (f.hasWebsite ? 1 : 0) +
    (f.iceVerified ? 1 : 0) +
    f.sources.length
  );
}

export default function FilterPanel({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  function toggle(key: keyof Filters) {
    onChange({ ...filters, [key]: !filters[key] });
  }

  function toggleSource(src: string) {
    const has = filters.sources.includes(src);
    onChange({
      ...filters,
      sources: has
        ? filters.sources.filter((s) => s !== src)
        : [...filters.sources, src],
    });
  }

  return (
    <div className="p-5 sm:p-6 space-y-5">
      <div>
        <div className="font-mono text-[10.5px] tracking-wide uppercase text-inkfaint mb-2.5">
          Has data
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip active={filters.hasPhone} onClick={() => toggle("hasPhone")}>
            Phone
          </Chip>
          <Chip active={filters.hasEmail} onClick={() => toggle("hasEmail")}>
            Email
          </Chip>
          <Chip active={filters.hasWebsite} onClick={() => toggle("hasWebsite")}>
            Website
          </Chip>
          <Chip active={filters.iceVerified} onClick={() => toggle("iceVerified")}>
            Verified ICE
          </Chip>
        </div>
      </div>

      <div>
        <div className="font-mono text-[10.5px] tracking-wide uppercase text-inkfaint mb-2.5">
          Legal form
        </div>
        <select
          value={filters.legalForm}
          onChange={(e) => onChange({ ...filters, legalForm: e.target.value })}
          className="w-full sm:w-auto px-3 py-2 rounded-lg border border-line bg-surface2 text-[13px] outline-none focus:border-teal"
        >
          <option value="">Any</option>
          {LEGAL_FORMS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="font-mono text-[10.5px] tracking-wide uppercase text-inkfaint mb-2.5">
          Enriched by
        </div>
        <div className="flex flex-wrap gap-2">
          {KNOWN_SOURCES.map((src) => (
            <Chip
              key={src}
              active={filters.sources.includes(src)}
              onClick={() => toggleSource(src)}
              mono
            >
              {src}
            </Chip>
          ))}
        </div>
      </div>

      {activeFilterCount(filters) > 0 && (
        <button
          onClick={() => onChange(EMPTY_FILTERS)}
          className="font-mono text-[12px] text-coral hover:underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  mono,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`${mono ? "font-mono" : ""} text-[12px] px-3 py-1.5 rounded-full border transition-colors ${
        active
          ? "bg-ink text-white border-ink"
          : "bg-surface text-inksoft border-line hover:border-inkfaint"
      }`}
    >
      {children}
    </button>
  );
}
