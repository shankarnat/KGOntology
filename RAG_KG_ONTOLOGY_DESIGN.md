# Knowledge Graph Ontology for Deterministic RAG Enhancement
## Grounded in Salesforce Data Cloud DMOs

**Version:** 1.0
**Last Updated:** 2025-11-09
**Purpose:** Define semantic metadata ontology for enterprise RAG systems ensuring deterministic, authoritative answers

---

## Executive Summary

This ontology design leverages Salesforce Data Cloud's 89+ standard Data Model Objects (DMOs) as foundational building blocks, embellishing them with RAG-specific metadata to solve accuracy and consistency challenges. By grounding KG generation in proven DMO schemas, we ensure seamless integration with Salesforce ecosystems while enabling deterministic retrieval through a **Hybrid Graph + Vector approach** that combines semantic relevance with authority-based filtering.

### Key Design Principles

1. **Reuse, Don't Recreate**: Inherit core DMO schemas from Data Cloud
2. **Embellish, Don't Replace**: Extend DMOs with RAG-specific attributes
3. **Auto-Generate**: KG creation is automatic via prompt-driven classification
4. **Hybrid Retrieval**: Combine graph structure (authority, currency, validation) with vector similarity (semantic relevance)
5. **Deterministic Answers**: Structured metadata + fixed scoring weights ensure consistent results

---

## Part 1: DMO Foundation - What We Inherit

### Core DMO Categories for RAG

| DMO Category | Standard DMOs Used | RAG Purpose |
|--------------|-------------------|-------------|
| **Party** | Individual, Account, Party, Party Role | Author authority, department attribution, approver tracking |
| **Product** | Product Catalog, Product Category, Brand | Product mapping, model-year tracking, feature extraction |
| **Content** | *Custom Extension* | Document classification, content type taxonomy |
| **Case/Support** | Case, Case Update | Issue resolution tracking, validation evidence |
| **Engagement** | Engagement Channel Type, Engagement Topic | Document usage analytics, retrieval patterns |
| **Communication** | Communication Subscription | Notification of content updates, deprecation alerts |

---

## Part 2: Embellished Ontology - DMO Extensions for RAG

### 2.1 Document DMO (Custom - Built on Party Pattern)

**Inherits From:** Party DMO structure
**Purpose:** Represent enterprise documents as first-class entities in the knowledge graph

```yaml
DocumentDMO:
  extends: Party  # Treats documents as "parties" in the enterprise ecosystem

  core_fields:
    document_id: UUID
    document_title: String
    document_uri: String
    document_hash: String  # For version change detection

  # Standard DMO fields inherited from Party
  party_type: "Document"  # Leverages Party's type system
  party_status: "Active|Archived|Deprecated"

  # RAG-specific embellishments
  rag_metadata:
    document_classification:
      authority_level: "Official|Draft|Internal|Public"
      reliability_score: Float  # 0.0-1.0
      content_type: "TechnicalSpec|ProductManual|MarketingCollateral|TrainingMaterial|SalesPresentation|PolicyDocument|ComplianceDoc"
      validation_status: "Validated|Unvalidated|Pending"

    temporal_metadata:
      created_date: DateTime
      last_modified_date: DateTime
      effective_date: DateTime  # When content becomes valid
      expiration_date: DateTime  # When content becomes obsolete
      model_year: Integer  # For product documentation (e.g., 2024 GLA)
      is_current: Boolean

    source_metadata:
      source_system: String  # SharePoint, Google Drive, etc.
      source_department_id: UUID  # Foreign key to Party (Department)
      author_id: UUID  # Foreign key to Individual DMO
      approver_ids: [UUID]  # Foreign keys to Individual DMO
      contributing_authors: [UUID]

  # Relationships (leveraging DMO relationship patterns)
  relationships:
    authored_by: Individual  # Many-to-One
    approved_by: [Individual]  # Many-to-Many
    owned_by_department: Party  # Many-to-One (Party as Department)
    relates_to_products: [Product]  # Many-to-Many
    supersedes: [Document]  # Version chain
    superseded_by: [Document]  # Version chain
    supports: [Document]  # Supporting/reference materials
    validated_by: [ValidationEvidence]  # Links to test reports
```

---

### 2.2 Product DMO (Embellished Standard DMO)

**Inherits From:** Product Catalog, Product Category DMOs
**Purpose:** Map documents to specific products/models/variants with world knowledge

```yaml
ProductDMO:
  extends: [ProductCatalog, ProductCategory, Brand]

  # Standard DMO fields (inherited)
  product_id: UUID
  product_name: String
  brand_id: UUID  # Foreign key to Brand DMO
  product_category_id: UUID

  # Embellishments for RAG
  rag_metadata:
    product_hierarchy:
      brand: String  # Mercedes-Benz
      model_line: String  # GLA-Class
      model: String  # GLA 200
      variant: String  # GLA 200 AMG Line
      model_year: Integer  # 2024

    product_characteristics:
      country_of_origin: String
      manufacturing_plant: String
      market_segment: String  # Luxury, Mass Market, etc.
      target_audience: String

    technical_features:
      engine_specs: JSONB  # Structured technical data
      dimensions: JSONB
      performance_metrics: JSONB
      feature_codes: [String]  # P01, P02 feature packages

  # Relationships
  relationships:
    documented_in: [Document]  # Which documents describe this product
    belongs_to_category: ProductCategory
    has_brand: Brand
    related_products: [Product]  # Cross-sell, upsell relationships
```

---

### 2.3 Department/Organization DMO (Embellished Party DMO)

**Inherits From:** Party, Account DMOs
**Purpose:** Track document authority based on organizational source

```yaml
DepartmentDMO:
  extends: Party

  # Standard fields
  party_id: UUID
  party_type: "Organization"
  party_name: String

  # Embellishments
  rag_metadata:
    department_classification:
      department_type: "Engineering|Marketing|Product|Sales|Legal|Compliance|Training"
      authority_domains: [String]  # What topics this dept is authoritative on
      authority_level: Integer  # 1-5, where 5 is highest

    hierarchy:
      parent_department_id: UUID
      department_path: String  # /Engineering/Powertrain/ElectricDrives
      level: Integer

  relationships:
    publishes_documents: [Document]
    has_employees: [Individual]
    parent_department: Department
    child_departments: [Department]
```

---

### 2.4 Individual DMO (Embellished Standard DMO)

**Inherits From:** Individual DMO
**Purpose:** Track authors, approvers, subject matter experts

```yaml
IndividualDMO:
  extends: Individual

  # Standard DMO fields (inherited)
  individual_id: UUID
  first_name: String
  last_name: String
  email: String  # Via Contact Point Email

  # Embellishments
  rag_metadata:
    professional_context:
      title: String
      department_id: UUID  # Foreign key to Department
      expertise_domains: [String]  # Technical areas of expertise
      certification_level: String
      seniority_level: Integer  # For authority weighting

    authorship_metrics:
      documents_authored: Integer
      documents_approved: Integer
      average_document_authority: Float

  relationships:
    works_in: Department
    authored_documents: [Document]
    approved_documents: [Document]
    subject_matter_expert_for: [String]  # Topic tags
```

---

### 2.5 ValidationEvidence DMO (Custom - Built on Case Pattern)

**Inherits From:** Case DMO structure
**Purpose:** Link marketing claims to engineering validation (test reports, QA docs)

```yaml
ValidationEvidenceDMO:
  extends: Case  # Treats validation as a "case" or evidence record

  # Core fields
  validation_id: UUID
  validation_type: "TestReport|QADocument|CertificationReport|ComplianceDoc|PerformanceData"

  # Validation metadata
  validation_metadata:
    test_date: DateTime
    test_facility: String
    test_standard: String  # ISO, WLTP, etc.
    test_result: String
    pass_fail_status: "Pass|Fail|Conditional"
    certification_body: String

    measured_values:
      metric_name: String
      measured_value: Float
      unit: String
      tolerance: Float

  # Relationships
  relationships:
    validates_claims_in: [Document]  # Which marketing docs this validates
    validates_features_of: [Product]
    conducted_by: Department
    approved_by: Individual
```

---

### 2.6 ContentFeature DMO (Custom)

**Purpose:** Extract and track specific claims/features mentioned in documents

```yaml
ContentFeatureDMO:
  # Core identification
  feature_id: UUID
  feature_name: String
  feature_description: String

  # Feature classification
  feature_metadata:
    feature_type: "TechnicalSpecification|PerformanceClaim|ProductFeature|SafetyFeature|ComfortFeature"
    confidence_score: Float  # LLM extraction confidence

    numeric_values:
      value: Float
      unit: String
      context: String  # "0-100 km/h in 7.1 seconds"

    validation_status:
      is_validated: Boolean
      validation_evidence_id: UUID  # Link to ValidationEvidence

  # Relationships
  relationships:
    mentioned_in: [Document]
    applies_to: [Product]
    validated_by: [ValidationEvidence]
    conflicts_with: [ContentFeature]  # Detect inconsistencies
```

---

### 2.7 DocumentRelationship DMO (Junction Table Pattern)

**Purpose:** Explicit relationship management between documents

```yaml
DocumentRelationshipDMO:
  relationship_id: UUID

  relationship_details:
    source_document_id: UUID
    target_document_id: UUID
    relationship_type: "Supersedes|SupersededBy|Supports|References|Validates|Contradicts|Updates"
    relationship_strength: Float  # 0.0-1.0
    effective_date: DateTime
    created_by: UUID  # Can be auto-detected or manually curated

  metadata:
    auto_detected: Boolean  # Was this detected by LLM or manually added?
    detection_confidence: Float
    detection_method: String  # "LLM-Analysis|Metadata-Parsing|Manual"
```

---

### 2.8 DocumentVersion DMO (Built on Engagement Pattern)

**Purpose:** Track document evolution over time for version control

```yaml
DocumentVersionDMO:
  version_id: UUID

  version_metadata:
    document_id: UUID  # Foreign key to Document
    version_number: String  # "1.0", "2.1", etc.
    version_hash: String
    version_date: DateTime

    change_summary:
      change_type: "Major|Minor|Patch|Editorial"
      change_description: String
      sections_modified: [String]

    version_status:
      is_current: Boolean
      is_archived: Boolean
      retention_policy: String

  relationships:
    document: Document
    previous_version: DocumentVersion
    next_version: DocumentVersion
    modified_by: Individual
```

---

### 2.9 RetrievalContext DMO (Embellished Engagement DMO)

**Inherits From:** Engagement Topic, Message Engagement DMOs
**Purpose:** Track retrieval patterns and quality for continuous improvement

```yaml
RetrievalContextDMO:
  extends: [EngagementTopic, MessageEngagement]

  retrieval_id: UUID

  retrieval_metadata:
    query_text: String
    query_embedding: Vector  # For semantic search
    query_timestamp: DateTime
    user_id: UUID  # From Individual DMO

    retrieval_results:
      documents_retrieved: [UUID]
      retrieval_scores: [Float]
      ranking_method: String
      filters_applied: JSONB

    quality_metrics:
      user_feedback_score: Integer  # 1-5 star rating
      result_used: Boolean  # Did user actually use the result?
      session_id: UUID  # For tracking conversation context

  relationships:
    retrieved_documents: [Document]
    queried_by: Individual
    relates_to_products: [Product]  # Inferred from query intent
```

---

## Part 3: Ontology Relationships - The Knowledge Graph Structure

### 3.1 Core Relationship Types

```yaml
relationship_types:

  # Document Authority Relationships
  AUTHORED_BY:
    domain: Document
    range: Individual
    cardinality: many-to-one
    properties:
      authorship_role: "Primary|Contributing|Technical Reviewer"
      contribution_percentage: Float

  APPROVED_BY:
    domain: Document
    range: Individual
    cardinality: many-to-many
    properties:
      approval_date: DateTime
      approval_level: "Technical|Legal|Executive"

  PUBLISHED_BY:
    domain: Document
    range: Department
    cardinality: many-to-one
    properties:
      publication_date: DateTime
      authority_score: Float  # Derived from dept authority level

  # Document Version Relationships
  SUPERSEDES:
    domain: Document
    range: Document
    cardinality: many-to-many
    properties:
      supersession_date: DateTime
      supersession_reason: String
      backward_compatible: Boolean

  SUPERSEDED_BY:
    domain: Document
    range: Document
    cardinality: many-to-many
    inverse_of: SUPERSEDES

  # Document Content Relationships
  REFERENCES:
    domain: Document
    range: Document
    cardinality: many-to-many
    properties:
      reference_type: "Citation|Dependency|SeeAlso"
      reference_sections: [String]

  SUPPORTS:
    domain: Document
    range: Document
    cardinality: many-to-many
    properties:
      support_type: "Evidence|Example|Detail"

  CONTRADICTS:
    domain: Document
    range: Document
    cardinality: many-to-many
    properties:
      contradiction_severity: "Critical|Moderate|Minor"
      detected_date: DateTime
      requires_resolution: Boolean

  # Product Relationships
  DESCRIBES_PRODUCT:
    domain: Document
    range: Product
    cardinality: many-to-many
    properties:
      description_completeness: Float  # 0.0-1.0
      technical_depth: Integer  # 1-5
      target_audience: String

  APPLIES_TO_MODEL_YEAR:
    domain: Document
    range: Product
    cardinality: many-to-many
    properties:
      model_year: Integer
      market_region: String
      variant_codes: [String]

  # Validation Relationships
  VALIDATED_BY:
    domain: Document
    range: ValidationEvidence
    cardinality: many-to-many
    properties:
      validation_scope: String  # Which claims are validated
      validation_confidence: Float

  VALIDATES_CLAIM:
    domain: ValidationEvidence
    range: ContentFeature
    cardinality: many-to-many
    properties:
      validation_method: String
      validation_date: DateTime

  # Feature Relationships
  CONTAINS_FEATURE:
    domain: Document
    range: ContentFeature
    cardinality: many-to-many
    properties:
      feature_prominence: Float  # How prominently featured (0.0-1.0)
      extraction_confidence: Float

  FEATURE_OF_PRODUCT:
    domain: ContentFeature
    range: Product
    cardinality: many-to-many
    properties:
      is_standard: Boolean
      is_optional: Boolean
      feature_package: String
```

---

### 3.2 Graph Walk Examples

**Example 1: Product Specification Query**

```
Query: "What is the 0-100 km/h acceleration of 2024 GLA 200?"

Graph Walk:
1. Start: Product "GLA 200" (model_year=2024)
2. Traverse: DESCRIBES_PRODUCT ← Document (filter: authority_level="Official", is_current=true)
3. Filter: document_type IN ["TechnicalSpec", "ProductManual"]
4. Traverse: PUBLISHED_BY → Department (filter: department_type="Engineering")
5. Extract: CONTAINS_FEATURE → ContentFeature (filter: feature_type="PerformanceClaim", feature_name LIKE "%acceleration%")
6. Validate: VALIDATED_BY → ValidationEvidence (filter: validation_status="Pass")
7. Return: ContentFeature.numeric_values WHERE validated=true

Result: "7.1 seconds (validated by WLTP test report dated 2024-03-15)"
```

**Example 2: Document Authority Resolution**

```
Query: "Is this engine specification document authoritative?"

Graph Walk:
1. Start: Document "GLA_200_Engine_Specs_v2.1.pdf"
2. Traverse: AUTHORED_BY → Individual (retrieve author credentials)
3. Traverse: APPROVED_BY → Individual (check approver authority levels)
4. Traverse: PUBLISHED_BY → Department (check if Engineering dept)
5. Check: SUPERSEDED_BY (ensure no newer version exists)
6. Compute: authority_score = f(dept_authority, approver_seniority, is_current, validation_status)

Result: Authority Score = 0.95 (Highly Authoritative)
```

**Example 3: Conflict Detection**

```
Query: "Are there conflicting specifications for GLA 200 fuel consumption?"

Graph Walk:
1. Start: Product "GLA 200"
2. Traverse: DESCRIBES_PRODUCT ← Document (get all documents)
3. Extract: CONTAINS_FEATURE → ContentFeature (filter: feature_name="fuel_consumption")
4. Group By: feature_name, compare numeric_values
5. Detect: ContentFeature.numeric_values WHERE variance > threshold
6. Check: CONTRADICTS relationships between parent documents
7. Resolve: Rank by (authority_score × is_current × validation_status)

Result: "Conflict detected: Marketing doc says 6.5L/100km, Technical spec says 6.8L/100km.
         Resolution: Use 6.8L/100km (Engineering source, WLTP validated)"
```

---

## Part 4: Auto-Generation via Prompts

### 4.1 Document Classification Prompt Template

```prompt
You are analyzing enterprise documents to build a Knowledge Graph for deterministic RAG.

For each document, extract the following into structured JSON following the DMO schema:

**Document Metadata:**
- document_classification.authority_level: Classify as Official|Draft|Internal|Public
  * Official: Engineering specs, approved product manuals, legal documents
  * Draft: Work-in-progress, pending approval
  * Internal: Internal communications, training materials
  * Public: Marketing collateral, public-facing content

- document_classification.content_type: Classify as TechnicalSpec|ProductManual|MarketingCollateral|TrainingMaterial|SalesPresentation|PolicyDocument|ComplianceDoc

- source_metadata.source_department_id: Identify creating department
  * Look for document properties, author email domains, approval chains
  * Map to: Engineering|Marketing|Product|Sales|Legal|Compliance|Training

**Product Associations:**
- Identify all products mentioned (e.g., "GLA 200", "C-Class", "AMG Line")
- Extract model years if specified
- Extract variant codes (e.g., "P01 Premium Package")

**Temporal Metadata:**
- effective_date: When does this information become valid?
- expiration_date: When does this become obsolete?
- model_year: If product documentation, which model year?

**Relationships:**
- Does this document reference other documents? (Extract titles, URLs)
- Does this supersede a previous version? (Look for version history)
- Does this contradict other known documents? (Flag for review)

**Validation Evidence:**
- Are there test reports, QA documents, certifications mentioned?
- Extract validation claims and link them

Return structured JSON matching the DocumentDMO schema.
```

---

### 4.2 Feature Extraction Prompt Template

```prompt
You are extracting technical features and specifications from product documents.

For each feature/specification found:

**Feature Identification:**
- feature_name: Normalized name (e.g., "acceleration_0_100_kmh")
- feature_description: Human-readable description
- feature_type: Classify as TechnicalSpecification|PerformanceClaim|ProductFeature|SafetyFeature|ComfortFeature

**Numeric Values:**
- If the feature has a numeric value, extract:
  * value: The number (e.g., 7.1)
  * unit: The unit (e.g., "seconds", "km/h", "kW")
  * context: Full text context (e.g., "0-100 km/h in 7.1 seconds")

**Validation Check:**
- Is there any mention of test standards? (ISO, WLTP, EPA, etc.)
- Is there a reference to a test report or validation document?
- Mark validation_status accordingly

**Product Association:**
- Which product(s) does this feature apply to?
- Is it standard or optional?
- Which model years?

Return structured JSON matching the ContentFeatureDMO schema.
```

---

### 4.3 Relationship Detection Prompt Template

```prompt
You are analyzing document relationships to build the knowledge graph.

For each document pair, determine:

**Version Relationships:**
- Does Document A supersede Document B?
  * Look for version numbers (v1.0 → v2.0)
  * Look for "replaces", "supersedes", "obsoletes" language
  * Check document dates and effective dates

**Reference Relationships:**
- Does Document A reference Document B?
  * Look for citations, hyperlinks, "see also" sections
  * Classify reference type: Citation|Dependency|SeeAlso

**Support Relationships:**
- Does Document A support claims in Document B?
  * Technical specs supporting marketing claims
  * Test reports validating performance claims

**Contradiction Relationships:**
- Do Document A and Document B contradict each other?
  * Compare extracted features for same product
  * Flag numeric discrepancies
  * Assess severity: Critical|Moderate|Minor

Return structured JSON with relationship_type, confidence_score, and supporting_evidence.
```

---

## Part 5: DMO-to-Ontology Mapping Summary

### Standard DMOs Used Directly

| DMO | Purpose in RAG Ontology |
|-----|------------------------|
| **Individual** | Authors, approvers, SMEs |
| **Party** | Base pattern for Document, Department |
| **Product Catalog** | Product identification |
| **Product Category** | Product hierarchy |
| **Brand** | Brand attribution |
| **Case** | Base pattern for ValidationEvidence |
| **Engagement Topic** | Base pattern for RetrievalContext |
| **Party Identification** | User identity for retrieval tracking |
| **Contact Point Email** | Author/approver contact info |

---

### Custom DMOs Created (Embellished)

| Custom DMO | Built On | Why Custom? |
|------------|----------|-------------|
| **Document** | Party pattern | Documents are first-class entities in RAG, need specialized metadata |
| **ValidationEvidence** | Case pattern | Validation records don't fit existing DMOs, need test-specific fields |
| **ContentFeature** | New | Feature extraction is RAG-specific, no existing DMO |
| **DocumentRelationship** | Junction pattern | Explicit relationship management for version chains |
| **DocumentVersion** | New | Version control needs don't map to standard DMOs |
| **RetrievalContext** | Engagement pattern | Retrieval analytics specific to RAG systems |

---

### Embellishments to Standard DMOs

| Standard DMO | Embellishments Added |
|--------------|---------------------|
| **Product** | `rag_metadata.product_hierarchy`, `technical_features`, `country_of_origin` for world knowledge |
| **Party (as Department)** | `department_classification`, `authority_domains`, `authority_level` for source trust |
| **Individual** | `professional_context`, `expertise_domains`, `authorship_metrics` for author authority |

---

## Part 6: Implementation in Edge Tables

### Edge Table Schema for Neo4j/TigerGraph

```sql
-- Document → Individual (AUTHORED_BY)
CREATE TABLE edge_authored_by (
    edge_id UUID PRIMARY KEY,
    from_document_id UUID REFERENCES document_dmo(document_id),
    to_individual_id UUID REFERENCES individual_dmo(individual_id),
    authorship_role VARCHAR(50),  -- Primary|Contributing|Technical Reviewer
    contribution_percentage FLOAT,
    created_at TIMESTAMP,
    INDEX idx_from_doc (from_document_id),
    INDEX idx_to_ind (to_individual_id)
);

-- Document → Document (SUPERSEDES)
CREATE TABLE edge_supersedes (
    edge_id UUID PRIMARY KEY,
    from_document_id UUID REFERENCES document_dmo(document_id),
    to_document_id UUID REFERENCES document_dmo(document_id),
    supersession_date TIMESTAMP,
    supersession_reason TEXT,
    backward_compatible BOOLEAN,
    INDEX idx_from_doc (from_document_id),
    INDEX idx_to_doc (to_document_id)
);

-- Document → Product (DESCRIBES_PRODUCT)
CREATE TABLE edge_describes_product (
    edge_id UUID PRIMARY KEY,
    from_document_id UUID REFERENCES document_dmo(document_id),
    to_product_id UUID REFERENCES product_dmo(product_id),
    model_year INTEGER,
    market_region VARCHAR(100),
    description_completeness FLOAT,
    INDEX idx_from_doc (from_document_id),
    INDEX idx_to_prod (to_product_id),
    INDEX idx_model_year (model_year)
);

-- Document → ValidationEvidence (VALIDATED_BY)
CREATE TABLE edge_validated_by (
    edge_id UUID PRIMARY KEY,
    from_document_id UUID REFERENCES document_dmo(document_id),
    to_validation_id UUID REFERENCES validation_evidence_dmo(validation_id),
    validation_scope TEXT,
    validation_confidence FLOAT,
    INDEX idx_from_doc (from_document_id),
    INDEX idx_to_val (to_validation_id)
);

-- ValidationEvidence → ContentFeature (VALIDATES_CLAIM)
CREATE TABLE edge_validates_claim (
    edge_id UUID PRIMARY KEY,
    from_validation_id UUID REFERENCES validation_evidence_dmo(validation_id),
    to_feature_id UUID REFERENCES content_feature_dmo(feature_id),
    validation_method VARCHAR(200),
    validation_date TIMESTAMP,
    INDEX idx_from_val (from_validation_id),
    INDEX idx_to_feat (to_feature_id)
);
```

---

## Part 7: RAG Pipeline Integration

### Intelligent Context (IC) Configuration Flow

```yaml
rag_pipeline_config:

  # Step 1: Document Source Selection
  document_sources:
    - source_type: SharePoint
      connection_id: "sharepoint_prod_001"
      folders: ["/Engineering/Specs", "/Product/Manuals"]

    - source_type: Google Drive
      connection_id: "gdrive_marketing_001"
      folders: ["/Product Marketing/GLA", "/Brand Materials"]

  # Step 2: Ontology Selection (User selects which DMO set to use)
  ontology_configuration:
    base_dmos:
      - Individual
      - Party
      - Product
      - ProductCategory
      - Brand

    custom_dmos:
      - Document
      - ValidationEvidence
      - ContentFeature
      - DocumentRelationship

    embellishment_level: "Full"  # Minimal|Standard|Full

  # Step 3: Auto-Generation Prompts (Executed during ingestion)
  auto_generation:

    document_classification:
      enabled: true
      prompt_template: "document_classification_v1.prompt"
      llm_model: "claude-sonnet-4-5"

    feature_extraction:
      enabled: true
      prompt_template: "feature_extraction_v1.prompt"
      llm_model: "claude-sonnet-4-5"
      extract_numeric_values: true

    relationship_detection:
      enabled: true
      prompt_template: "relationship_detection_v1.prompt"
      llm_model: "claude-sonnet-4-5"
      detect_supersession: true
      detect_contradictions: true

    validation_linking:
      enabled: true
      auto_link_test_reports: true
      validation_confidence_threshold: 0.7

  # Step 4: Edge Table Generation
  edge_table_config:
    storage_backend: "TigerGraph"  # Neo4j|TigerGraph|AWS Neptune
    batch_size: 1000
    parallelization: 4

  # Step 5: Retrieval Configuration
  retrieval_config:

    authority_weighting:
      enabled: true
      weights:
        department_authority: 0.3
        document_classification: 0.3
        validation_status: 0.2
        temporal_currency: 0.2

    conflict_resolution:
      strategy: "HighestAuthority"  # HighestAuthority|MostRecent|Majority
      flag_unresolved_conflicts: true

    versioning_policy:
      always_use_current: true
      allow_archived_access: false
      deprecation_warning_days: 30
```

---

## Part 8: Benefits Realized

### RAG Problems Solved by This Ontology

| Problem | How Ontology Solves It |
|---------|----------------------|
| **Inconsistent Answers** | Authority weighting ensures engineering specs override marketing claims |
| **Outdated Information** | Version chains and temporal metadata ensure only current docs retrieved |
| **Source Ambiguity** | Department attribution makes source clear ("per Engineering specs...") |
| **Unvalidated Claims** | Validation relationships trace marketing claims to test evidence |
| **Feature Conflicts** | ContentFeature extraction detects numeric discrepancies across documents |
| **Context Loss** | Product mapping ensures queries are scoped to correct model/year |
| **Manual Curation** | Auto-generation prompts build KG without human intervention |

---

## Part 8: Hybrid Graph + Vector Retrieval

### 8.1 Retrieval Architecture Overview

**Core Principle:** Combine vector similarity (semantic relevance) with graph structure (authority, currency, validation) for optimal retrieval.

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER QUERY                                │
│              "What is the fuel consumption of 2024 GLA 200?"     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ENTITY RESOLUTION                              │
│  • Extract entities: "GLA 200" → Product DMO                    │
│  • Extract temporal: "2024" → model_year                        │
│  • Extract intent: "fuel consumption" → feature query           │
└────────────────────────┬────────────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
          ▼                             ▼
┌────────────────────┐        ┌────────────────────┐
│   GRAPH FILTERING  │        │  VECTOR SEARCH     │
│                    │        │                    │
│ • Product scope    │        │ • Embed query      │
│ • Authority filter │        │ • Semantic search  │
│ • Currency check   │        │ • Top-K candidates │
│ • Validation req   │        │ • Similarity score │
└─────────┬──────────┘        └──────────┬─────────┘
          │                              │
          └──────────────┬───────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   HYBRID SCORING                                 │
│  final_score = (vector_similarity × α) +                        │
│                (authority_score × β) +                           │
│                (validation_score × γ) +                          │
│                (currency_score × δ)                              │
│                                                                  │
│  Where: α + β + γ + δ = 1.0                                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                 CONTEXT ENRICHMENT                               │
│  • Retrieve related docs via graph (SUPPORTS, VALIDATES)        │
│  • Add validation evidence                                      │
│  • Include version context (SUPERSEDES chain)                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LLM GENERATION                                │
│  • Context: Top-K documents + graph-enriched metadata           │
│  • Grounding: Authority citations, validation references        │
│  • Output: Answer + source attribution + confidence             │
└─────────────────────────────────────────────────────────────────┘
```

---

### 8.2 Retrieval Strategies

#### Strategy 1: Graph-First Filtering (Recommended for Deterministic RAG)

**When to Use:** Need guaranteed authoritative, current results

**Flow:**
```python
1. Graph Filter (strict):
   - Filter by product, model_year
   - Filter by authority_level >= "Official"
   - Filter by is_current = true
   - Filter by validation_status = "Validated"
   → Reduces candidate set to ~10-50 authoritative docs

2. Vector Search (within filtered set):
   - Embed query
   - Search only within graph-filtered document IDs
   - Rank by semantic similarity
   → Top-K most semantically relevant from authoritative set

3. Hybrid Scoring:
   - Combine similarity + graph metadata
   - Re-rank by final score
```

**Example:**
```cypher
// Step 1: Graph filtering
MATCH (p:Product {product_name: "GLA 200", model_year: 2024})
MATCH (p)<-[:DESCRIBES_PRODUCT]-(d:Document)
WHERE d.is_current = true
  AND d.authority_level IN ['Official', 'Internal']
  AND d.validation_status = 'Validated'
MATCH (d)-[:PUBLISHED_BY]->(dept:Department)
WHERE dept.department_type IN ['Engineering', 'Product']
RETURN d.document_id, d.reliability_score, dept.authority_level
LIMIT 50

// Step 2: Vector search within filtered set
filtered_ids = [result.document_id for result in graph_results]

vector_results = vector_db.search(
    embedding=embed(query),
    filter={'document_id': {'$in': filtered_ids}},
    top_k=10
)

// Step 3: Hybrid scoring
for result in vector_results:
    graph_meta = find_graph_metadata(result.document_id)
    result.final_score = (
        result.similarity * 0.4 +           # Semantic relevance
        graph_meta.reliability_score * 0.3 + # Authority
        graph_meta.validation_score * 0.2 +  # Validation
        graph_meta.currency_score * 0.1      # Recency
    )

ranked_results = sorted(vector_results, key=lambda x: x.final_score, reverse=True)
```

**Benefits:**
- ✅ Guaranteed authoritative sources only
- ✅ No low-quality content in results
- ✅ Deterministic (same graph filter → same candidate set)

---

#### Strategy 2: Vector-First with Graph Re-ranking

**When to Use:** Broader semantic coverage needed, then filter for authority

**Flow:**
```python
1. Vector Search (broad):
   - Embed query
   - Search entire corpus
   - Get top-100 candidates by similarity
   → Cast wide net for semantic matches

2. Graph Enrichment:
   - For each candidate, fetch graph metadata
   - Calculate authority_score from graph
   → Add context to vector results

3. Hybrid Re-ranking:
   - Combine similarity + authority
   - Filter out low-authority if needed
   → Top-K with best combination of relevance + authority
```

**Example:**
```python
# Step 1: Broad vector search
query_embedding = embed("What is the fuel consumption of 2024 GLA 200?")
vector_results = vector_db.search(
    embedding=query_embedding,
    top_k=100  # Cast wide net
)

# Step 2: Graph enrichment
for result in vector_results:
    # Fetch graph metadata
    graph_data = graph_db.query("""
        MATCH (d:Document {document_id: $doc_id})
        MATCH (d)-[:PUBLISHED_BY]->(dept:Department)
        OPTIONAL MATCH (d)-[:VALIDATED_BY]->(v:ValidationEvidence)
        OPTIONAL MATCH (d)-[:SUPERSEDED_BY]->(newer:Document)
        RETURN
            d.authority_level as authority,
            d.reliability_score as reliability,
            dept.authority_level as dept_authority,
            COUNT(v) as validation_count,
            COUNT(newer) as is_superseded
    """, doc_id=result.document_id)

    # Calculate authority score
    result.authority_score = calculate_authority(graph_data)
    result.is_current = (graph_data.is_superseded == 0)

    # Hybrid scoring
    result.final_score = (
        result.similarity * 0.5 +        # Semantic relevance (higher weight)
        result.authority_score * 0.3 +   # Authority
        (1.0 if result.is_current else 0.5) * 0.2  # Currency
    )

# Step 3: Re-rank and filter
ranked_results = sorted(vector_results, key=lambda x: x.final_score, reverse=True)

# Optional: Hard filter on authority
authoritative_results = [r for r in ranked_results if r.authority_score >= 0.7][:10]
```

**Benefits:**
- ✅ Broader semantic coverage
- ✅ Can discover unexpected relevant documents
- ✅ Still filtered by authority in final ranking

---

#### Strategy 3: Parallel Hybrid (Best of Both Worlds)

**When to Use:** Maximum recall with authority guarantee

**Flow:**
```python
1. Parallel Execution:
   a) Graph-First path → authoritative candidates
   b) Vector-First path → semantic candidates

2. Merge & Deduplicate:
   - Combine results from both paths
   - Remove duplicates
   → Union of authoritative + semantically relevant

3. Final Ranking:
   - Score all merged candidates
   - Rank by hybrid score
```

**Example:**
```python
import asyncio

async def graph_first_retrieval(query, product_id):
    # Graph filtering → Vector search
    graph_filtered = await graph_filter(product_id, authority='Official')
    vector_results = await vector_search(query, filter_ids=graph_filtered)
    return vector_results

async def vector_first_retrieval(query):
    # Vector search → Graph enrichment
    vector_candidates = await vector_search(query, top_k=100)
    enriched_results = await enrich_with_graph(vector_candidates)
    return enriched_results

# Parallel execution
graph_results, vector_results = await asyncio.gather(
    graph_first_retrieval(query, product_id),
    vector_first_retrieval(query)
)

# Merge and deduplicate
merged_results = merge_deduplicate(graph_results, vector_results)

# Final hybrid ranking
for result in merged_results:
    result.final_score = hybrid_score(
        similarity=result.similarity,
        authority=result.authority_score,
        validation=result.validation_score,
        currency=result.currency_score,
        source_path=result.retrieval_path  # Bonus for graph-first results
    )

top_results = sorted(merged_results, key=lambda x: x.final_score, reverse=True)[:10]
```

**Benefits:**
- ✅ Maximum coverage (union of both approaches)
- ✅ Authoritative results guaranteed from graph-first path
- ✅ Unexpected relevant docs from vector-first path
- ✅ Best for exploratory queries

---

### 8.3 Hybrid Scoring Functions

#### Authority Score Calculation

```python
def calculate_authority_score(doc_metadata):
    """
    Calculate authority score from graph metadata
    Returns: 0.0 - 1.0
    """
    # Base authority level
    authority_map = {
        'Official': 1.0,
        'Internal': 0.7,
        'Public': 0.6,
        'Draft': 0.5
    }
    base_score = authority_map.get(doc_metadata.authority_level, 0.5)

    # Department multiplier
    dept_map = {
        'Engineering': 1.0,
        'Product': 0.9,
        'Legal': 0.9,
        'Compliance': 0.9,
        'Marketing': 0.6,
        'Sales': 0.5
    }
    dept_multiplier = dept_map.get(doc_metadata.department_type, 0.5)

    # Validation bonus
    validation_bonus = 0.1 if doc_metadata.validation_status == 'Validated' else 0.0

    # Approval chain bonus
    approval_bonus = min(len(doc_metadata.approver_ids) * 0.05, 0.15)

    # Calculate final score
    authority_score = min(
        base_score * dept_multiplier + validation_bonus + approval_bonus,
        1.0
    )

    return authority_score
```

#### Currency Score Calculation

```python
def calculate_currency_score(doc_metadata):
    """
    Calculate how current the document is
    Returns: 0.0 - 1.0
    """
    from datetime import datetime, timedelta

    # Check if superseded
    if doc_metadata.is_superseded:
        return 0.3  # Significant penalty

    # Check if current flag
    if not doc_metadata.is_current:
        return 0.4

    # Check effective/expiration dates
    now = datetime.now()

    if doc_metadata.expiration_date:
        if now > doc_metadata.expiration_date:
            return 0.0  # Expired

    if doc_metadata.effective_date:
        if now < doc_metadata.effective_date:
            return 0.5  # Not yet effective

    # Recency bonus based on last_modified_date
    days_since_modified = (now - doc_metadata.last_modified_date).days

    if days_since_modified < 90:
        recency_bonus = 0.2
    elif days_since_modified < 365:
        recency_bonus = 0.1
    else:
        recency_bonus = 0.0

    return min(0.8 + recency_bonus, 1.0)
```

#### Validation Score Calculation

```python
def calculate_validation_score(doc_metadata, graph_db):
    """
    Calculate validation score based on evidence links
    Returns: 0.0 - 1.0
    """
    if doc_metadata.validation_status == 'Validated':
        # Check validation evidence quality
        validation_evidence = graph_db.query("""
            MATCH (d:Document {document_id: $doc_id})
            MATCH (d)-[:CONTAINS_FEATURE]->(f:ContentFeature)
            MATCH (f)-[:VALIDATED_BY]->(v:ValidationEvidence)
            RETURN
                COUNT(DISTINCT v) as evidence_count,
                AVG(CASE v.test_standard
                    WHEN 'WLTP' THEN 1.0
                    WHEN 'ISO' THEN 0.9
                    WHEN 'EPA' THEN 0.9
                    ELSE 0.7 END) as standard_quality
        """, doc_id=doc_metadata.document_id)

        evidence_count = validation_evidence.evidence_count
        standard_quality = validation_evidence.standard_quality

        # More evidence = higher score
        count_score = min(evidence_count * 0.2, 0.6)

        return min(count_score + standard_quality * 0.4, 1.0)

    elif doc_metadata.validation_status == 'Pending':
        return 0.5

    else:  # Unvalidated
        return 0.3
```

#### Final Hybrid Score

```python
def calculate_hybrid_score(
    vector_similarity: float,
    authority_score: float,
    currency_score: float,
    validation_score: float,
    query_type: str = 'factual',
    weights: dict = None
):
    """
    Calculate final hybrid score combining all signals

    Args:
        vector_similarity: Semantic similarity from vector search (0.0-1.0)
        authority_score: Authority from graph metadata (0.0-1.0)
        currency_score: Currency/recency score (0.0-1.0)
        validation_score: Validation evidence score (0.0-1.0)
        query_type: Type of query affects weight distribution
        weights: Optional custom weights

    Returns:
        Final hybrid score (0.0-1.0)
    """
    # Default weights based on query type
    default_weights = {
        'factual': {      # Technical specs, performance data
            'similarity': 0.3,
            'authority': 0.35,
            'currency': 0.15,
            'validation': 0.20
        },
        'conceptual': {   # How-to, explanations
            'similarity': 0.5,
            'authority': 0.25,
            'currency': 0.15,
            'validation': 0.10
        },
        'compliance': {   # Legal, regulatory
            'similarity': 0.2,
            'authority': 0.35,
            'currency': 0.30,
            'validation': 0.15
        }
    }

    # Use custom weights or default
    w = weights if weights else default_weights.get(query_type, default_weights['factual'])

    # Calculate weighted sum
    final_score = (
        vector_similarity * w['similarity'] +
        authority_score * w['authority'] +
        currency_score * w['currency'] +
        validation_score * w['validation']
    )

    return final_score
```

---

### 8.4 Context Enrichment via Graph

After retrieving top documents, enrich with graph context:

```python
def enrich_context_with_graph(top_documents, graph_db):
    """
    Enrich retrieved documents with related context from graph
    """
    enriched_contexts = []

    for doc in top_documents:
        # Base document
        context = {
            'document': doc,
            'related_documents': [],
            'validation_evidence': [],
            'version_history': [],
            'product_context': []
        }

        # 1. Get supporting documents
        supporting_docs = graph_db.query("""
            MATCH (d:Document {document_id: $doc_id})
            MATCH (d)<-[:SUPPORTS]-(supporting:Document)
            WHERE supporting.is_current = true
            RETURN supporting
            LIMIT 3
        """, doc_id=doc.document_id)
        context['related_documents'].extend(supporting_docs)

        # 2. Get validation evidence
        validation = graph_db.query("""
            MATCH (d:Document {document_id: $doc_id})
            MATCH (d)-[:CONTAINS_FEATURE]->(f:ContentFeature)
            MATCH (f)-[:VALIDATED_BY]->(v:ValidationEvidence)
            RETURN v, f.feature_name
            LIMIT 5
        """, doc_id=doc.document_id)
        context['validation_evidence'] = validation

        # 3. Get version context
        version_chain = graph_db.query("""
            MATCH (d:Document {document_id: $doc_id})
            OPTIONAL MATCH (d)-[:SUPERSEDES]->(older:Document)
            OPTIONAL MATCH (d)<-[:SUPERSEDES]-(newer:Document)
            RETURN older, newer
        """, doc_id=doc.document_id)
        context['version_history'] = version_chain

        # 4. Get product context
        products = graph_db.query("""
            MATCH (d:Document {document_id: $doc_id})
            MATCH (d)-[:DESCRIBES_PRODUCT]->(p:Product)
            MATCH (p)-[:HAS_BRAND]->(b:Brand)
            MATCH (p)-[:BELONGS_TO_CATEGORY]->(c:ProductCategory)
            RETURN p, b, c
        """, doc_id=doc.document_id)
        context['product_context'] = products

        enriched_contexts.append(context)

    return enriched_contexts
```

---

### 8.5 Complete Hybrid Retrieval Example

**Query:** "What is the fuel consumption of 2024 GLA 200?"

```python
class HybridGraphVectorRetrieval:
    def __init__(self, graph_db, vector_db, embedding_model):
        self.graph = graph_db
        self.vector = vector_db
        self.embedder = embedding_model

    def retrieve(self, query: str, top_k: int = 5, strategy: str = 'graph_first'):
        # Step 1: Entity resolution
        entities = self.extract_entities(query)
        # {"product": "GLA 200", "model_year": 2024, "feature": "fuel_consumption"}

        if strategy == 'graph_first':
            return self._graph_first_retrieval(query, entities, top_k)
        elif strategy == 'vector_first':
            return self._vector_first_retrieval(query, entities, top_k)
        else:  # parallel
            return self._parallel_retrieval(query, entities, top_k)

    def _graph_first_retrieval(self, query, entities, top_k):
        # Step 2: Graph filtering
        graph_candidates = self.graph.query("""
            MATCH (p:Product {product_name: $product, model_year: $year})
            MATCH (p)<-[:DESCRIBES_PRODUCT]-(d:Document)
            WHERE d.is_current = true
              AND d.authority_level IN ['Official', 'Internal']
              AND d.validation_status = 'Validated'
            MATCH (d)-[:PUBLISHED_BY]->(dept:Department)
            WHERE dept.department_type IN ['Engineering', 'Product']
            RETURN
                d.document_id,
                d.authority_level,
                d.reliability_score,
                d.validation_status,
                dept.authority_level as dept_authority
            ORDER BY d.reliability_score DESC
            LIMIT 50
        """, product=entities['product'], year=entities['model_year'])

        # Step 3: Vector search within filtered set
        filtered_ids = [c['d.document_id'] for c in graph_candidates]
        query_embedding = self.embedder.embed(query)

        vector_results = self.vector.search(
            embedding=query_embedding,
            filter={'document_id': {'$in': filtered_ids}},
            top_k=top_k * 2  # Get more for re-ranking
        )

        # Step 4: Hybrid scoring and re-ranking
        scored_results = []
        for v_result in vector_results:
            # Find corresponding graph metadata
            g_meta = next(
                (c for c in graph_candidates if c['d.document_id'] == v_result['document_id']),
                None
            )

            if g_meta:
                # Calculate component scores
                authority_score = calculate_authority_score(g_meta)
                currency_score = 1.0  # All filtered for is_current
                validation_score = 1.0 if g_meta['d.validation_status'] == 'Validated' else 0.5

                # Hybrid score
                final_score = calculate_hybrid_score(
                    vector_similarity=v_result['similarity'],
                    authority_score=authority_score,
                    currency_score=currency_score,
                    validation_score=validation_score,
                    query_type='factual'
                )

                scored_results.append({
                    'document_id': v_result['document_id'],
                    'content': v_result['content'],
                    'final_score': final_score,
                    'similarity': v_result['similarity'],
                    'authority_score': authority_score,
                    'metadata': g_meta
                })

        # Sort by final score
        ranked_results = sorted(scored_results, key=lambda x: x['final_score'], reverse=True)

        # Step 5: Context enrichment
        top_docs = ranked_results[:top_k]
        enriched_results = enrich_context_with_graph(top_docs, self.graph)

        return enriched_results

# Usage
retriever = HybridGraphVectorRetrieval(graph_db, vector_db, embedding_model)

results = retriever.retrieve(
    query="What is the fuel consumption of 2024 GLA 200?",
    top_k=5,
    strategy='graph_first'
)

# Results include:
# - Top 5 documents ranked by hybrid score
# - Validation evidence for each claim
# - Version context (if superseded by newer docs)
# - Related supporting documents
# - Product context (brand, category, features)

# Generate answer with full context
answer = generate_answer_with_citations(results)
# Output:
# "The 2024 GLA 200 has a combined fuel consumption of 6.8 L/100km (WLTP cycle).
#
#  Source: Engineering Technical Specification v3.2 (Authority: 0.95)
#  Validated by: WLTP Test Report dated 2024-02-15
#  Department: Engineering/Powertrain
#
#  This value is validated and represents the official specification."
```

---

### 8.6 Query Type Classification for Adaptive Weights

Different query types benefit from different weight distributions:

```python
def classify_query_type(query: str, llm_client) -> str:
    """
    Classify query to determine optimal weight distribution
    """
    classification_prompt = f"""
    Classify this query into one of these types:
    - factual: Asking for specific facts, specs, numbers (e.g., "What is the acceleration?")
    - conceptual: Asking for explanations, how-to (e.g., "How does the engine work?")
    - compliance: Asking about regulations, legal, safety (e.g., "What are the emissions standards?")
    - comparison: Comparing products/features (e.g., "GLA 200 vs GLA 250")

    Query: "{query}"

    Return only the classification: factual, conceptual, compliance, or comparison
    """

    query_type = llm_client.generate(classification_prompt).strip()
    return query_type

# Adaptive retrieval based on query type
query_type = classify_query_type(query, llm_client)

if query_type == 'factual':
    # Prioritize authority and validation
    results = retriever.retrieve(query, strategy='graph_first')
elif query_type == 'conceptual':
    # Prioritize semantic similarity
    results = retriever.retrieve(query, strategy='vector_first')
elif query_type == 'compliance':
    # Prioritize authority and currency
    results = retriever.retrieve(query, strategy='graph_first')
else:  # comparison
    # Use parallel for broad coverage
    results = retriever.retrieve(query, strategy='parallel')
```

---

### 8.7 Performance Optimizations

#### Caching Strategy

```python
from functools import lru_cache
import hashlib

class CachedHybridRetrieval:
    def __init__(self, graph_db, vector_db, cache_ttl=3600):
        self.retriever = HybridGraphVectorRetrieval(graph_db, vector_db)
        self.cache = {}
        self.cache_ttl = cache_ttl

    def retrieve_with_cache(self, query: str, top_k: int = 5):
        # Generate cache key
        cache_key = hashlib.sha256(
            f"{query}_{top_k}".encode()
        ).hexdigest()

        # Check cache
        if cache_key in self.cache:
            cached_result, timestamp = self.cache[cache_key]
            if time.time() - timestamp < self.cache_ttl:
                return cached_result

        # Retrieve and cache
        results = self.retriever.retrieve(query, top_k)
        self.cache[cache_key] = (results, time.time())

        return results
```

#### Batch Graph Queries

```python
# Instead of querying graph for each document individually
def batch_enrich_with_graph(document_ids, graph_db):
    """
    Batch fetch graph metadata for multiple documents
    """
    results = graph_db.query("""
        UNWIND $doc_ids as doc_id
        MATCH (d:Document {document_id: doc_id})
        MATCH (d)-[:PUBLISHED_BY]->(dept:Department)
        OPTIONAL MATCH (d)-[:VALIDATED_BY]->(v:ValidationEvidence)
        RETURN
            doc_id,
            d.authority_level,
            d.reliability_score,
            dept.authority_level as dept_authority,
            COUNT(v) as validation_count
    """, doc_ids=document_ids)

    # Convert to lookup dict
    return {r['doc_id']: r for r in results}
```

---

### 8.8 Deterministic Retrieval with Hybrid Approach

**Key Insight:** Determinism comes from consistent scoring and ranking, not just graph filtering.

**Achieving Determinism:**

1. **Consistent Entity Resolution**
   - Same query → same entity extraction
   - Canonical product names (GLA 200 = GLA-200 = GLA-Class 200)

2. **Deterministic Graph Queries**
   - Fixed ordering (ORDER BY reliability_score DESC, document_id ASC)
   - Consistent filtering thresholds

3. **Stable Vector Embeddings**
   - Same embedding model version
   - Consistent preprocessing

4. **Deterministic Scoring**
   - Fixed weight parameters
   - Reproducible score calculations
   - Tie-breaking by document_id

**Example:**
```python
def deterministic_retrieve(query, product_id, model_year):
    # 1. Canonical entity resolution
    product = resolve_entity_canonical(product_id)

    # 2. Deterministic graph query (fixed ordering)
    graph_results = graph.query("""
        MATCH (p:Product {product_id: $product_id, model_year: $year})
        MATCH (p)<-[:DESCRIBES_PRODUCT]-(d:Document)
        WHERE d.is_current = true AND d.authority_level = 'Official'
        RETURN d
        ORDER BY d.reliability_score DESC, d.document_id ASC
        LIMIT 50
    """, product_id=product.id, year=model_year)

    # 3. Deterministic vector search (stable embeddings)
    query_embedding = embed_deterministic(query)
    vector_results = vector_search(query_embedding, filter_ids=graph_results)

    # 4. Deterministic scoring (fixed weights)
    for result in vector_results:
        result.score = calculate_hybrid_score(
            similarity=result.similarity,
            authority=result.authority,
            currency=result.currency,
            validation=result.validation,
            weights={'similarity': 0.3, 'authority': 0.35, 'currency': 0.15, 'validation': 0.2}
        )

    # 5. Deterministic ranking (tie-breaking)
    return sorted(vector_results, key=lambda x: (x.score, x.document_id), reverse=True)

# Same query always produces same results
results1 = deterministic_retrieve("GLA 200 fuel consumption", "gla-200", 2024)
results2 = deterministic_retrieve("GLA 200 fuel consumption", "gla-200", 2024)
assert results1 == results2  # ✓ Deterministic
```

---

## Conclusion

This ontology design provides a **real-world blueprint for enterprise data** that LLMs can understand by:

1. **Reusing proven DMO schemas** from Salesforce Data Cloud (89+ standard objects)
2. **Embellishing DMOs** with RAG-specific metadata (authority, versioning, validation)
3. **Auto-generating the KG** via prompt-driven classification (no manual configuration)
4. **Ensuring deterministic retrieval** through structured relationships and authority rules

The result: **Accurate, consistent, authoritative answers from enterprise content** - solving RAG's fundamental problems through semantic metadata and knowledge graphs.
