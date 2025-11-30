export type Stage = {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  required_role?: string | null;
  requires_all_positions_calculated: boolean;
  requires_commercial_proposal: boolean;
  order: number;
};

export type PositionStatus =
  | "new"
  | "nomenclature_assigned"
  | "calculating"
  | "calculated"
  | "verified"
  | "transferred"
  | "in_proposal";

export type Nomenclature = {
  id: number;
  name: string;
  type?: string | null;
  category?: string | null;
  manufacturer?: string | null;
  article?: string | null;
  base_price?: string | number | null;
  price_currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type LifecycleStatus = "draft" | "review" | "active" | "archived";
export type SchemaStatus = "draft" | "review" | "published" | "archived";
export type NodeType = "segment" | "family" | "class" | "category";
export type NodeStatus = "draft" | "active" | "archived";
export type SearchMode = "text" | "semantic" | "combined";

export type NomenclatureCardListItem = {
  id: number;
  node_id: number;
  code: string;
  canonical_name: string;
  lifecycle_status: LifecycleStatus;
  manufacturer?: string | null;
  standard_document?: string | null;
  article?: string | null;
  type?: string | null;
  category?: string | null;
  base_price?: string | number | null;
  price_currency: string;
  usage_count: number;
  search_confidence?: number | null;
  audit: {
    created_by?: string | null;
    created_at: string;
    last_editor_id?: string | null;
    last_reviewed_at?: string | null;
  };
};

export type CardSynonym = {
  value: string;
  locale: string;
};

export type CardFile = {
  type: string;
  storage_key: string;
  hash?: string | null;
  source?: string | null;
  uploaded_at?: string | null;
};

export type NomenclatureCard = NomenclatureCardListItem & {
  attributes_payload: Record<string, unknown>;
  files: CardFile[];
  methodology_ids: number[];
  synonyms: CardSynonym[];
  related_nomenclature_ids: number[];
  tags?: Record<string, unknown>;
};

export type PaginatedNomenclatureCards = {
  items: NomenclatureCardListItem[];
  meta: {
    page: number;
    page_size: number;
    total: number;
    pages: number;
  };
};

export type NomenclatureNode = {
  id: number;
  code: string;
  name: string;
  node_type: NodeType;
  parent_id?: number | null;
  depth: number;
  version: number;
  status: NodeStatus;
  is_archived: boolean;
  effective_from: string;
  effective_to?: string | null;
  description?: string | null;
};

export type NomenclatureAttributePreset = {
  id: number;
  code: string;
  title: string;
  description?: string | null;
  version: number;
  status: SchemaStatus;
  json_schema: Record<string, unknown>;
  created_at: string;
};

export type NomenclatureNodeSchemaVersion = {
  id: number;
  node_id: number;
  version: number;
  status: SchemaStatus;
  json_schema: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  presets?: NomenclatureAttributePreset[];
  comment?: string | null;
  created_at: string;
  published_at?: string | null;
};

export type NomenclatureSchemaDiff = {
  node_id: number;
  version: number;
  created_at: string;
  diff: Record<string, unknown>;
};

export type NomenclatureSchemaVersionResponse = {
  id: number;
  node_id: number;
  version: number;
  status: SchemaStatus;
  json_schema: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  presets: NomenclatureAttributePreset[];
  comment?: string | null;
  created_at: string;
  published_at?: string | null;
};

export type Position = {
  id: number;
  tender_id: number;
  name: string;
  description?: string | null;
  quantity: string | number; // Decimal often comes as string from API or we treat as number
  unit: string;
  nomenclature_id?: number | null;
  nomenclature?: Nomenclature | null;
  technical_requirements?: Record<string, unknown> | null;
  status: PositionStatus;
  price_per_unit?: string | number | null;
  total_price?: string | number | null;
  currency: string;
  created_at: string;
  updated_at: string;
};

export type TenderSource = "eis" | "sberbank_ast" | "roseltorg" | "manual";

export type TenderFile = {
  id: number;
  filename: string;
  category: string;
  uploaded_by_id: number;
  uploaded_at: string;
};

export type AuditLog = {
  id: number;
  tender_id: number;
  user_id: number;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
};

export type Tender = {
  id: number;
  number: string;
  title: string;
  customer: string;
  description?: string | null;
  source: TenderSource;
  source_url?: string | null;
  deadline_at: string;
  published_at?: string | null;
  initial_max_price?: string | number | null;
  currency: string;
  terms?: {
    payment_terms?: string;
    delivery_conditions?: string;
    warranty?: string;
    validity_days?: number;
    lead_time_days?: number;
  } | null;
  responsible_id?: number | null;
  engineer_id?: number | null;
  stage_id: number;
  stage: Stage;
  positions: Position[];
  files: TenderFile[];
  audit_logs?: AuditLog[];
  is_archived: boolean;
  created_at: string;
  updated_at: string;
};

export type User = {
  id: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
};

export type AuthToken = {
  access_token: string;
  token_type: string;
};

export type ApiErrorResponse = {
  detail?: string;
  [key: string]: unknown;
};
