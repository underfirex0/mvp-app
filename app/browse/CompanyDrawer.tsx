"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Company, FieldSource, Contact, FIELD_LABELS } from "@/lib/types";

export default function CompanyDrawer({
  companyId,
  onClose,
}: {
  companyId: string;
  onClose: () => void;
}) {
  const [company, setCompany] = useState<Company | null>(null);
  const [sources, setSources] = useState<FieldSource[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [c, s, ct] = await Promise.all([
        supabase.from("companies_v2").select("*").eq("id", companyId).single(),
        supabase
          .from("company_field_sources")
          .select("id, field_name, value, source, confidence")
          .eq("company_id", companyId)
          .order("confidence", { ascending: false }),
        supabase
          .from("company_contacts")
          .select("id, full_name, role, email, phone, source")
          .eq("company_id", companyId),
      ]);
      setCompany((c.data as Company) ?? null);
      setSources((s.data as FieldSource[]) ?? []);
      setContacts((ct.data as Contact[]) ?? []);
      setLoading(false);
    }
    load();
  }, [companyId]);

  // Escape key closes the drawer
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div
        className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative w-full sm:w-[520px] h-full bg-surface shadow-2xl overflow-y-auto animate-slide-in">
        <div className="sticky top-0 bg-surface border-b border-line px-6 py-4 flex items-start justify-between gap-4 z-10">
          <div className="min-w-0">
            <div className="font-display font-semibold text-xl leading-tight truncate">
              {loading ? "Loading…" : company?.name ?? "Not found"}
            </div>
            {company?.city && (
              <div className="text-inkfaint text-sm mt-0.5">{company.city}</div>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-full bg-surface2 hover:bg-line flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
              <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {loading && (
          <div className="p-8 text-center text-inkfaint text-sm">loading…</div>
        )}

        {!loading && company && (
          <div className="p-6 space-y-8">
            <Group title="Identity">
              <Row label="Telecontact ID" value={company.telecontact_id} mono />
              <Row
                label="ICE"
                value={company.ice}
                mono
                badge={company.ice_verified ? "verified" : company.ice ? "unverified" : undefined}
              />
              <Row label="RC number" value={company.rc} mono />
              <Row label="Legal form" value={company.forme_juridique} />
              <Row label="Year founded" value={company.annee_creation?.toString() ?? null} />
            </Group>

            <Group title="Contact">
              <Row label="Phone" value={company.phone_1} mono />
              <Row label="Phone (secondary)" value={company.phone_2} mono />
              <Row label="Email" value={company.email} highlight={!!company.email} />
              <Row label="Website" value={company.website} link />
              <Row label="Address" value={company.address_raw} />
              {company.latitude && company.longitude && (
                <Row
                  label="Coordinates"
                  value={`${company.latitude}, ${company.longitude}`}
                  mono
                  link={`https://www.google.com/maps?q=${company.latitude},${company.longitude}`}
                />
              )}
            </Group>

            <Group title="Business">
              <Row label="Director" value={company.director} />
              <Row
                label="Capital"
                value={company.capital_mad ? `${Number(company.capital_mad).toLocaleString()} MAD` : null}
              />
              <Row label="Employee range" value={company.effectif_tranche} />
              <Row label="Description" value={company.description} multiline />
            </Group>

            {sources.length > 0 && (
              <Group title={`Enrichment (${sources.length} field${sources.length !== 1 ? "s" : ""})`}>
                <p className="text-xs text-inkfaint mb-3 -mt-1">
                  Extra values gathered by tonight&apos;s pipeline, staged here rather
                  than overwriting the core fields above.
                </p>
                <div className="space-y-2">
                  {sources.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-start justify-between gap-3 bg-surface2 rounded-lg px-3.5 py-2.5"
                    >
                      <div className="min-w-0">
                        <div className="text-[11px] font-mono text-inkfaint uppercase tracking-wide">
                          {FIELD_LABELS[s.field_name] ?? s.field_name}
                        </div>
                        <div className="text-[13.5px] mt-0.5 break-words">{s.value}</div>
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <span className="font-mono text-[10px] bg-tealsoft text-teal px-2 py-0.5 rounded-full">
                          {s.source}
                        </span>
                        <span className="font-mono text-[10px] text-inkfaint">
                          {(s.confidence * 100).toFixed(0)}% conf.
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Group>
            )}

            {contacts.length > 0 && (
              <Group title={`People (${contacts.length})`}>
                <div className="space-y-2">
                  {contacts.map((c) => (
                    <div key={c.id} className="bg-surface2 rounded-lg px-3.5 py-2.5">
                      <div className="text-[13.5px] font-medium">
                        {c.full_name ?? "Unnamed"}
                        {c.role && (
                          <span className="text-inkfaint font-normal"> · {c.role}</span>
                        )}
                      </div>
                      <div className="text-[12px] text-inkfaint mt-0.5 font-mono">
                        {[c.email, c.phone].filter(Boolean).join("  ·  ") || "—"}
                      </div>
                      <span className="inline-block mt-1.5 font-mono text-[10px] bg-ochresoft text-ochre px-2 py-0.5 rounded-full">
                        {c.source}
                      </span>
                    </div>
                  ))}
                </div>
              </Group>
            )}

            {sources.length === 0 && contacts.length === 0 && (
              <div className="text-center text-inkfaint text-sm py-4 border-t border-line">
                No enrichment data yet for this company.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[11px] tracking-wide uppercase text-ochre mb-3">
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  link,
  highlight,
  badge,
  multiline,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
  link?: boolean | string;
  highlight?: boolean;
  badge?: string;
  multiline?: boolean;
}) {
  if (!value) {
    return (
      <div className="flex items-start justify-between gap-4 py-2 border-b border-line last:border-b-0">
        <span className="text-[13px] text-inkfaint shrink-0">{label}</span>
        <span className="text-[13px] text-inkfaint">—</span>
      </div>
    );
  }

  const href = typeof link === "string" ? link : link ? (value.startsWith("http") ? value : `https://${value}`) : undefined;

  return (
    <div className={`flex items-start justify-between gap-4 py-2 border-b border-line last:border-b-0 ${multiline ? "flex-col" : ""}`}>
      <span className="text-[13px] text-inkfaint shrink-0">{label}</span>
      <span
        className={`text-[13px] text-right ${multiline ? "text-left" : ""} ${mono ? "font-mono" : ""} ${
          highlight ? "text-teal font-medium" : "text-ink"
        }`}
      >
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" className="text-teal underline underline-offset-2">
            {value}
          </a>
        ) : (
          value
        )}
        {badge && (
          <span
            className={`ml-2 font-mono text-[10px] px-1.5 py-0.5 rounded-full ${
              badge === "verified" ? "bg-greensoft text-green" : "bg-coralsoft text-coral"
            }`}
          >
            {badge}
          </span>
        )}
      </span>
    </div>
  );
}
