// Core Ontology Types for Salesforce Data Cloud DMO Editor

// ============================================================================
// DMO (Data Model Object) Types
// ============================================================================

export type DMOCategory =
  | 'individual'      // Person entities
  | 'party'           // Organizations, departments
  | 'product'         // Products and catalog items
  | 'engagement'      // Interactions and analytics
  | 'case'            // Support cases, validation evidence
  | 'custom';         // Custom DMO types

export type DMOSource =
  | 'standard'        // Salesforce standard DMOs (89+)
  | 'embellished'     // Standard DMOs with extensions
  | 'custom';         // Entirely new DMOs

export type AuthorityLevel = 'engineering' | 'product' | 'marketing' | 'support' | 'external';

export interface Property {
  id: string;
  name: string;
  displayName: string;
  description: string;
  dataType: PropertyDataType;
  required: boolean;
  indexed: boolean;
  unique: boolean;
  defaultValue?: unknown;
  validation?: PropertyValidation;
  isShared: boolean;
  sourceField?: string; // Mapping to source system field
}

export type PropertyDataType =
  | 'string'
  | 'text'
  | 'number'
  | 'integer'
  | 'decimal'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'timestamp'
  | 'enum'
  | 'array'
  | 'object'
  | 'reference';

export interface PropertyValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  enumValues?: string[];
  referenceType?: string;
}

export interface DMO {
  id: string;
  name: string;
  displayName: string;
  pluralDisplayName: string;
  description: string;
  category: DMOCategory;
  source: DMOSource;
  basePattern?: string;          // e.g., "Party", "Case", "Engagement"
  icon: string;
  color: string;

  // Metadata
  objectCount: number;
  dependentCount: number;
  lastModified: string;
  createdAt: string;

  // Schema
  properties: Property[];
  primaryKey: string;

  // Relationships
  incomingLinkTypes: string[];   // Link type IDs
  outgoingLinkTypes: string[];   // Link type IDs

  // Grouping
  groups: string[];              // Group IDs

  // Authority (for RAG use cases)
  authorityLevel?: AuthorityLevel;
  authorityScore?: number;       // 0-1

  // Flags
  isProminent: boolean;
  isFavorite: boolean;
  isDeprecated: boolean;

  // RAG-specific extensions
  ragConfig?: DMORagConfig;
}

export interface DMORagConfig {
  includeInRetrieval: boolean;
  embeddingFields: string[];     // Fields to embed for vector search
  filterFields: string[];        // Fields used for graph filtering
  authorityWeight: number;       // Weight in authority scoring
  temporalField?: string;        // Field for version/time ordering
}

// ============================================================================
// Link Type (Edge) Types
// ============================================================================

export type LinkCardinality =
  | 'one-to-one'
  | 'one-to-many'
  | 'many-to-one'
  | 'many-to-many';

export type LinkDirection = 'unidirectional' | 'bidirectional';

export interface LinkType {
  id: string;
  name: string;
  displayName: string;
  description: string;

  // Source and Target
  sourceObjectType: string;      // DMO ID
  targetObjectType: string;      // DMO ID

  // Cardinality
  cardinality: LinkCardinality;
  direction: LinkDirection;

  // Display
  sourceDisplayName: string;     // e.g., "authored by"
  targetDisplayName: string;     // e.g., "is author of"

  // Properties on the edge
  properties: Property[];

  // Metadata
  linkCount: number;
  lastModified: string;
  createdAt: string;

  // Grouping
  groups: string[];

  // Flags
  isRequired: boolean;
  isFavorite: boolean;
  isDeprecated: boolean;

  // Visual
  color: string;
  lineStyle: 'solid' | 'dashed' | 'dotted';
}

// ============================================================================
// Template Types
// ============================================================================

export type TemplateCategory = 'starter' | 'industry' | 'use-case' | 'custom';

export interface Template {
  id: string;
  name: string;
  displayName: string;
  description: string;
  color: string;
  icon: string;

  // Template metadata
  category: TemplateCategory;

  // Members - what this template includes
  objectTypes: string[];         // DMO IDs
  linkTypes: string[];           // Link Type IDs

  // Metadata
  memberCount: number;
  lastModified: string;
  createdAt?: string;

  // Flags
  isFavorite: boolean;
  isBuiltIn: boolean;            // Built-in templates can't be deleted
}

// Backward compatibility alias
export type Group = Template;

// ============================================================================
// Action Types
// ============================================================================

export interface ActionType {
  id: string;
  name: string;
  displayName: string;
  description: string;

  // Trigger
  triggerObjectType: string;     // DMO ID
  triggerCondition?: string;     // Expression

  // Action
  actionType: 'create' | 'update' | 'delete' | 'notify' | 'webhook' | 'custom';
  targetObjectType?: string;
  actionConfig: Record<string, unknown>;

  // Metadata
  executionCount: number;
  lastExecuted?: string;
  isEnabled: boolean;
}

// ============================================================================
// Interface Types (for polymorphism)
// ============================================================================

export interface InterfaceType {
  id: string;
  name: string;
  displayName: string;
  description: string;

  // Properties that implementing types must have
  requiredProperties: Property[];

  // Types that implement this interface
  implementingTypes: string[];   // DMO IDs

  // Metadata
  lastModified: string;
}

// ============================================================================
// Value Types (enums, custom types)
// ============================================================================

export interface ValueType {
  id: string;
  name: string;
  displayName: string;
  description: string;
  baseType: PropertyDataType;

  // For enum types
  values?: ValueTypeValue[];

  // Validation
  validation?: PropertyValidation;

  // Usage
  usedByProperties: string[];    // Property IDs using this type
}

export interface ValueTypeValue {
  value: string;
  displayName: string;
  description?: string;
  color?: string;
  icon?: string;
  isDeprecated: boolean;
}

// ============================================================================
// Shared Property Types
// ============================================================================

export interface SharedProperty extends Property {
  usedByObjectTypes: string[];   // DMO IDs
}

// ============================================================================
// Function Types
// ============================================================================

export interface FunctionType {
  id: string;
  name: string;
  displayName: string;
  description: string;

  // Input/Output
  inputParameters: FunctionParameter[];
  outputType: PropertyDataType;

  // Implementation
  implementation: 'expression' | 'code' | 'external';
  expression?: string;

  // Usage
  usedByProperties: string[];

  // Metadata
  lastModified: string;
}

export interface FunctionParameter {
  name: string;
  type: PropertyDataType;
  required: boolean;
  defaultValue?: unknown;
}

// ============================================================================
// Health & Validation Types
// ============================================================================

export type HealthIssueSeverity = 'error' | 'warning' | 'info';

export interface HealthIssue {
  id: string;
  severity: HealthIssueSeverity;
  category: string;
  title: string;
  description: string;
  affectedObject: {
    type: 'dmo' | 'linkType' | 'property' | 'template';
    id: string;
    name: string;
  };
  suggestedFix?: string;
  createdAt: string;
}

// ============================================================================
// UI State Types
// ============================================================================

export interface DiscoverSection {
  id: string;
  type: 'recently_viewed' | 'favorites' | 'favorite_templates' | 'template' | 'prominent';
  title: string;
  templateId?: string;           // For template sections
  itemsPerSection: number;
  order: number;
  isVisible: boolean;
}

export interface OntologyConfig {
  name: string;
  description: string;
  version: string;
  defaultBranch: string;

  // Display settings
  discoverSections: DiscoverSection[];
  defaultItemsPerSection: number;

  // RAG configuration
  ragEnabled: boolean;
  defaultAuthorityHierarchy: AuthorityLevel[];

  // History
  lastModified: string;
  modifiedBy: string;
}

// ============================================================================
// Navigation & History Types
// ============================================================================

export interface RecentlyViewed {
  type: 'dmo' | 'linkType' | 'template' | 'property';
  id: string;
  name: string;
  icon: string;
  color: string;
  viewedAt: string;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'merged';
  changes: ProposalChange[];
  createdBy: string;
  createdAt: string;
  reviewers: string[];
}

export interface ProposalChange {
  type: 'create' | 'update' | 'delete';
  objectType: 'dmo' | 'linkType' | 'property' | 'template';
  objectId: string;
  objectName: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}

// ============================================================================
// Search Types
// ============================================================================

export interface SearchResult {
  type: 'dmo' | 'linkType' | 'property' | 'template' | 'function';
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  color: string;
  matchedField: string;
  matchedText: string;
}
