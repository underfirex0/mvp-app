export type Company = {
  id: string;
  telecontact_id: string | null;
  name: string;
  city: string | null;
  address_raw: string | null;
  phone_1: string | null;
  phone_2: string | null;
  email: string | null;
  website: string | null;
  ice: string | null;
  ice_verified: boolean | null;
  director: string | null;
  forme_juridique: string | null;
  capital_mad: number | null;
  annee_creation: number | null;
  rc: string | null;
  description: string | null;
  effectif_tranche: string | null;
  primary_taxonomy_id: number | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string | null;
};

export type FieldSource = {
  id: number;
  field_name: string;
  value: string;
  source: string;
  confidence: number;
};

export type Contact = {
  id: number;
  full_name: string | null;
  role: string | null;
  email: string | null;
  phone: string | null;
  source: string;
};

export const KNOWN_SOURCES = [
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

export const LEGAL_FORMS = [
  "S.a.r.l.",
  "Sarlau",
  "Af.pers",
  "S.a.",
  "S.n.c.",
  "AUTRE",
  "SNADC",
  "Et-publ",
];

// human labels for raw field_name values coming out of company_field_sources
// -- these are collected across sources so the label set grows as new files
// get added, no code change needed for a new one, it just shows the raw key.
export const FIELD_LABELS: Record<string, string> = {
  email: "Email",
  phone_1: "Phone",
  phone_2: "Phone (secondary)",
  fax: "Fax",
  website: "Website",
  address_raw: "Address",
  ice: "ICE",
  rc: "RC number",
  annee_creation: "Year founded",
  forme_juridique: "Legal form",
  director: "Director",
  capital_mad: "Capital (MAD)",
};
