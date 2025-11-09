# Deterministic RAG via Knowledge Graph Ontology - One-Pager

**For:** Product Requirements Document (PRD)
**Last Updated:** 2025-11-09

---

## Problem Statement

Traditional RAG systems suffer from:
- **Inconsistent answers**: Same query returns different results
- **Unreliable sources**: Marketing claims treated equally to engineering specifications
- **Outdated information**: No version control or temporal awareness
- **Unvalidated claims**: No traceability from claims to supporting evidence
- **Non-deterministic retrieval**: Vector similarity alone cannot guarantee authoritative results

---

## Our Solution: Hybrid Graph + Vector RAG with DMO Grounding

A Knowledge Graph Ontology that combines **semantic understanding** (vector embeddings) with **structured authority** (graph metadata) for deterministic, authoritative enterprise RAG.

### Core Innovation

```
Traditional RAG:     Query → Vector Similarity → LLM → Answer ❌ (inconsistent)

Our Approach:        Query → Entity Resolution
                            ↓
                     ┌──────┴──────┐
                     │             │
              Graph Filter    Vector Search
            (Authority/      (Semantic
             Currency)        Relevance)
                     │             │
                     └──────┬──────┘
                            ↓
                    Hybrid Scoring → Context Enrichment → LLM → Answer ✅
                    (Deterministic)
```

---

## Key Components

### 1. DMO-Grounded Ontology

**Foundation:** Salesforce Data Cloud's 89+ standard Data Model Objects (DMOs)

| DMO Category | Purpose in RAG |
|--------------|----------------|
| **Individual** → Authors, approvers, SMEs | Authority attribution |
| **Party** → Departments, organizations | Source credibility (Engineering > Marketing) |
| **Product** → Product catalog | World knowledge, product context |
| **Custom: Document** | Documents as first-class entities with authority metadata |
| **Custom: ContentFeature** | Extracted specs, claims, features with numeric values |
| **Custom: ValidationEvidence** | Test reports, certifications linking claims to proof |

**See:** [Complete Ontology Design](RAG_KG_ONTOLOGY_DESIGN.md)

---

### 2. Hybrid Retrieval Strategies

#### Strategy 1: Graph-First (Recommended for Deterministic RAG)
```
Graph Filter → Vector Search → Hybrid Scoring
(Authority)    (Semantic)      (Combined)
```
- ✅ Guaranteed authoritative sources
- ✅ Semantic relevance within authority constraints
- ✅ Deterministic results

#### Strategy 2: Vector-First
```
Vector Search → Graph Enrichment → Re-ranking
(Broad)         (Add Authority)    (Filter)
```
- ✅ Broader semantic coverage
- ✅ Authority filtering in post-processing

#### Strategy 3: Parallel Hybrid
```
[Graph-First ∪ Vector-First] → Merge → Final Ranking
```
- ✅ Maximum coverage for exploratory queries

**See:** [Detailed Retrieval Strategies](RAG_KG_ONTOLOGY_DESIGN.md#part-8-hybrid-graph--vector-retrieval)

---

### 3. Hybrid Scoring Function

Combines four signals with query-adaptive weights:

```python
final_score = (
    vector_similarity × 0.3 +      # Semantic relevance
    authority_score × 0.35 +       # Department authority + doc classification
    validation_score × 0.20 +      # Evidence links (WLTP, ISO, etc.)
    currency_score × 0.15          # Version awareness, temporal validity
)
```

**Adaptive Weights by Query Type:**
- **Factual queries** (specs, numbers): Prioritize authority + validation
- **Conceptual queries** (how-to): Prioritize semantic similarity
- **Compliance queries** (legal): Prioritize authority + currency

---

### 4. Auto-Generation Pipeline

**No manual configuration required** - KG builds automatically via LLM prompts:

```
Documents → Classification Prompt → DocumentDMO (authority, type, source)
         → Feature Extraction Prompt → ContentFeatureDMO (specs with units)
         → Relationship Detection Prompt → Edge Tables (supersedes, validates)
         → Knowledge Graph Ready
```

**See:** [Prompt Templates](PROMPT_TEMPLATES.md)

---

## User Experience: Intelligent Auto-Configuration

### Overview: Zero-Configuration Knowledge Graph Setup

**Key Innovation:** The system intelligently analyzes just **5-10 sample documents** to automatically configure the entire Knowledge Graph structure, DMO mappings, and edge relationships. No manual schema design required.

**User Control:** Users can review, customize, and override any auto-generated configuration through natural language prompts.

---

### Step 1: RAG Pipeline Setup in Intelligent Context (IC)

**What Users Do:**

Navigate to **Intelligent Context → RAG Configuration** and select document sources:

```
Document Source Selection:
✓ SharePoint: //engineering/specifications
✓ Google Drive: Product Documentation folder
✓ File Systems: /shared/technical-docs
✓ Other: Confluence, OneDrive, local folders

Sample Size: 5-10 documents (system automatically samples)
```

**What Happens Behind the Scenes:**

The system ingests a representative sample of documents and performs initial analysis:
- Detects document types (PDFs, Word docs, presentations)
- Extracts metadata (authors, departments, dates)
- Identifies content patterns (specs, marketing, manuals)

**User Interaction:**
- Simple point-and-click interface
- No technical knowledge required
- Takes < 2 minutes to configure

---

### Step 2: Automatic KG Generation via Intelligent Prompts

**What the System Does Automatically:**

The system runs intelligent classification prompts on the sample documents:

```
Prompt 1: Document Classification
"Analyze these 5 documents and identify:
 - Document types (Technical Specification, Marketing Brief,
   User Manual, Test Report, etc.)
 - Source departments (Engineering, Marketing, Product, Legal)
 - Authority levels (Official, Internal, Public, Draft)
 - Product associations (GLA, C-Class, E-Class, etc.)
 - Temporal patterns (version numbers, effective dates, supersession)"

Result Generated:
✓ Document authority hierarchy discovered
  → Engineering (authority: 0.95) > Product (0.80) > Marketing (0.60)
✓ Document types auto-classified
  → TechnicalSpec, TestReport, UserManual, MarketingBrief
✓ Products identified
  → GLA 200, GLA 250, C-Class, E-Class
✓ Version control patterns detected
  → v3.2 supersedes v2.8 (via "Supersedes:" field)
```

```
Prompt 2: Relationship Detection
"Identify relationships between documents:
 - Which documents supersede others? (version chains)
 - Which documents validate claims in other documents?
 - Which documents describe the same product?
 - Who authored/approved each document?
 - Which departments published each document?"

Result Generated:
✓ 15 SUPERSEDES edges discovered
✓ 8 VALIDATED_BY edges found
✓ 23 DESCRIBES_PRODUCT edges created
✓ 12 AUTHORED_BY relationships extracted
✓ 10 PUBLISHED_BY department links established
```

**User Interaction: DMO Selection**

After auto-analysis, the system presents recommendations:

```
Recommended DMO Mapping:

Standard DMOs Selected (from Salesforce Data Cloud):
✓ Individual DMO → for authors/approvers
✓ Party DMO → for departments/organizations
✓ Product DMO → for product catalog
✓ Brand DMO → for Mercedes-Benz hierarchy
✓ ProductCategory DMO → for vehicle categories

Custom DMOs Suggested:
✓ Document DMO (based on Party pattern)
  → Stores: authority_level, validation_status, temporal_metadata
✓ ContentFeature DMO (new)
  → Stores: extracted specs, numeric values, units, validation links
✓ ValidationEvidence DMO (based on Case pattern)
  → Stores: test reports, certifications, measured values

Edge Tables to Create:
✓ AUTHORED_BY (Document → Individual)
✓ PUBLISHED_BY (Document → Department)
✓ DESCRIBES_PRODUCT (Document → Product)
✓ SUPERSEDES (Document → Document)
✓ VALIDATED_BY (ContentFeature → ValidationEvidence)
✓ CONTAINS_FEATURE (Document → ContentFeature)
✓ APPLIES_TO (ContentFeature → Product)

User Action: Click "Approve" or "Customize"
```

**Customization via Natural Language:**

Users can refine the configuration using prompts:

```
User Prompt: "Add a custom DMO for tracking regulatory compliance"

System Response:
✓ Created ComplianceEvidence DMO (based on Case pattern)
✓ Added fields: regulation_id, compliance_standard, certification_date
✓ Created edge: COMPLIES_WITH (Document → ComplianceEvidence)
✓ Updated KG schema

User Prompt: "Increase authority level for Legal department to 0.90"

System Response:
✓ Updated Department authority: Legal (0.60 → 0.90)
✓ Recalculated authority scores for 47 documents
✓ Updated hybrid scoring weights
```

**What Gets Created:**

The system automatically generates:
1. **DMO Schemas** (JSON) for all custom DMOs
2. **Edge Table Schemas** (SQL/Cypher) for all relationships
3. **Classification Rules** (prompts) for future document ingestion
4. **Knowledge Graph Structure** ready for data population

**Time Required:** 3-5 minutes for auto-generation + user review

---

### Step 3: RAG Integration + Visualization (IC Backend)

**What Happens Automatically:**

Once the KG structure is approved, the system:

```
Backend Processing:
1. Ingests all documents from selected sources
2. Applies classification prompts to each document
3. Extracts entities, features, and relationships
4. Populates DMO instances in Data Cloud
5. Creates edge tables in graph database
6. Generates vector embeddings for semantic search
7. Links embeddings to KG nodes

Result:
✓ Complete Knowledge Graph built
✓ 1,247 documents processed
✓ 3,512 relationships established
✓ 892 content features extracted
✓ 156 validation evidences linked
```

**KG Filtering in Action:**

The system automatically enhances RAG queries:

```
Query: "What is the fuel consumption of 2024 GLA 200?"

Without KG (Traditional RAG):
→ Vector search returns: Marketing blog (6.2 L/100km),
  User forum (6.5 L/100km), Engineering spec (6.8 L/100km)
→ LLM sees conflicting values
→ Answer: "Approximately 6.2-6.8 L/100km" ❌ (inconsistent)

With KG (Our Approach):
→ Entity resolution: Product = "GLA 200", model_year = 2024
→ Graph filter: authority_level IN ['Official'], is_current = true
→ Results: Engineering Spec v3.2 (authority: 0.95)
→ Feature extraction: fuel_consumption_combined = 6.8 L/100km
→ Validation check: VALIDATED_BY → WLTP Test Report 2024-02-15
→ Answer: "6.8 L/100km (combined WLTP cycle)" ✅ (deterministic)
  Source: Engineering Specification v3.2 (Authority: 0.95)
  Validated by: WLTP Test Report dated 2024-02-15
```

**Visualization Dashboard:**

Users can view the Knowledge Graph visually:

```
KG Visualization:
- Node Explorer: Browse all Documents, Products, Authors, Features
- Relationship Viewer: See edge connections (SUPERSEDES chains,
  VALIDATED_BY links)
- Authority Heatmap: Color-coded by department authority
- Version Timeline: Temporal view of document supersession
- Query Inspector: See how queries traverse the graph
```

**Time Required:** Automatic (runs in background), results available in 10-30 minutes depending on document count

---

### Step 4: Testing, Validation & Go-Live

**Automatic Testing:**

The system runs validation tests on the KG to ensure quality:

```
Test Suite 1: Authority Filtering
✓ Query: "GLA engine specifications"
  → Returns: 5 engineering docs (authority: 0.95)
  → Excludes: 12 marketing docs (authority: 0.60)
  → Result: PASS - Engineering prioritized correctly

✓ Query: "Latest product features"
  → Returns: 3 docs with source department attribution
  → Engineering (2 docs), Product (1 doc)
  → Result: PASS - Source attribution working

✓ Query: "Technical details GLA 200"
  → Returns: 4 technical specs, 0 marketing materials
  → Result: PASS - Marketing excluded correctly

Test Suite 2: Version Control
✓ Query: "Current GLA 200 specifications"
  → Returns: Only v3.2 (current)
  → Excludes: v2.8, v2.5, v1.0 (superseded)
  → Result: PASS - Supersession working correctly

Test Suite 3: Validation Traceability
✓ Query: "Validated acceleration data"
  → Returns: Features with VALIDATED_BY edges only
  → Includes: WLTP test report references
  → Result: PASS - Validation links established

Test Suite 4: Determinism Check
✓ Same query run 10 times → Same result 10 times
✓ Scoring: consistent across all runs
✓ Result: PASS - Deterministic retrieval confirmed
```

**Results Dashboard:**

```
Accuracy Metrics:
✓ Answer Accuracy: 94% (vs 67% baseline without KG)
✓ Answer Consistency: 99% (same query → same answer)
✓ Authority Compliance: 100% (all answers cite authoritative sources)
✓ Validation Coverage: 87% (claims linked to evidence)

Performance Metrics:
✓ Query Latency (p95): 340ms (target: <500ms) ✅
✓ Graph Traversal: 45ms average
✓ Vector Search: 120ms average
✓ Hybrid Scoring: 15ms average
✓ KG Coverage: 96% (docs have relationships) ✅
```

**NL to SQL/Cypher Editing:**

Advanced users can inspect and edit the generated queries:

```
User Query: "Show me all validated features for GLA 200"

Auto-Generated Cypher (visible to user):
MATCH (p:Product {product_name: "GLA 200"})<-[:DESCRIBES_PRODUCT]-(d:Document)
MATCH (d)-[:CONTAINS_FEATURE]->(f:ContentFeature)
MATCH (f)-[:VALIDATED_BY]->(v:ValidationEvidence)
WHERE d.is_current = true
  AND d.authority_level IN ['Official', 'Internal']
RETURN f.feature_name, f.numeric_value, f.unit,
       v.test_standard, v.test_date
ORDER BY v.test_date DESC

User Action: Click "Edit Query"

User Modified Query:
MATCH (p:Product {product_name: "GLA 200"})<-[:DESCRIBES_PRODUCT]-(d:Document)
MATCH (d)-[:CONTAINS_FEATURE]->(f:ContentFeature)
MATCH (f)-[:VALIDATED_BY]->(v:ValidationEvidence)
WHERE d.is_current = true
  AND d.authority_level = 'Official'  // ← Changed: Only Official docs
  AND v.test_standard = 'WLTP'        // ← Added: Only WLTP validated
RETURN f.feature_name, f.numeric_value, f.unit,
       v.test_standard, v.test_date
ORDER BY v.test_date DESC

System: "Query updated. Re-running..."
```

**Publishing to Production:**

Once validated, users can publish with one click:

```
Production Deployment:

Pre-Deployment Checklist:
✓ KG schema validated
✓ All edge tables populated
✓ Authority rules configured
✓ Test suite passed (100%)
✓ Performance benchmarks met

Deployment Options:
→ Gradual rollout: 10% → 50% → 100% traffic
→ A/B testing: Compare KG-RAG vs baseline
→ Monitoring: Real-time accuracy tracking

Scaling with Universal DMO (UDMO):
✓ DMO schemas registered in Data Cloud
✓ Multi-tenant support enabled
✓ Cross-org KG federation ready
✓ Compliance policies enforced

Status: Ready for Production ✅
```

**User Action:** Click "Publish to Production"

**Time Required:** Testing (1 hour), Review (30 min), Deploy (15 min)

---

### End-to-End Timeline

```
Total Setup Time: ~2 hours (vs weeks of manual configuration)

Breakdown:
- Step 1: Document source selection → 2 minutes
- Step 2: Auto-configuration + review → 5 minutes
- Step 3: KG generation (background) → 30 minutes
- Step 4: Testing + validation → 1 hour
- Step 4: Production deployment → 15 minutes

Result: Production-ready deterministic RAG with full KG grounding
```

---

### Key User Benefits

**For Business Users:**
- No technical expertise required
- Point-and-click setup
- Natural language customization
- Immediate accuracy improvements

**For Technical Users:**
- Full transparency (NL to SQL/Cypher visible)
- Edit generated queries
- Custom DMO creation via prompts
- Advanced tuning controls (authority weights, scoring functions)

**For Administrators:**
- Automatic schema discovery
- Version control tracking
- Compliance enforcement
- Multi-tenant scalability

---

## Concrete Example: Document to DMO Mapping

### Real-World Document Processing

**Input Document:** `GLA_200_Engine_Specs_MY2024_v3.2.pdf`

**Document Content Snippet:**
```
Technical Specification: GLA 200 Model Year 2024
Department: Engineering / Powertrain / Gasoline Engines
Document ID: ENG-SPEC-GLA200-2024-v3.2
Status: Approved
Effective Date: 2024-04-01
Supersedes: ENG-SPEC-GLA200-2024-v2.8

Engine Specifications:
- Displacement: 1.33 liters
- Power Output: 120 kW (163 PS) @ 5,500 rpm
- Torque: 250 Nm @ 1,620-4,000 rpm
- Fuel Type: Premium Unleaded (RON 95)

Performance (WLTP validated):
- Acceleration 0-100 km/h: 7.1 seconds
- Top Speed: 225 km/h (electronically limited)
- Combined Fuel Consumption: 6.8 L/100km (WLTP)
- CO2 Emissions: 154 g/km (WLTP)

Approved by: Dr. Hans Mueller (Chief Powertrain Engineer)
Validation: See WLTP Test Report TP-2024-GLA200-001 dated 2024-02-15
```

---

### Step 1: Standard DMOs Leveraged (What We Inherit)

#### Individual DMO (Standard - Inherited)
```yaml
Individual:
  individual_id: "ind-001-hans-mueller"
  first_name: "Hans"
  last_name: "Mueller"
  email: "hans.mueller@company.com"          # Via ContactPointEmail DMO
  title: "Dr."

  # Standard DMO fields - used as-is
  party_type: "Individual"
  party_status: "Active"
```

#### Party DMO as Department (Standard - Inherited)
```yaml
Party:
  party_id: "dept-001-eng-powertrain"
  party_type: "Organization"
  party_name: "Engineering / Powertrain / Gasoline Engines"

  # Standard DMO fields - used as-is
  party_status: "Active"
```

#### Product DMO (Standard - Inherited)
```yaml
Product:
  product_id: "prod-001-gla-200"
  product_name: "GLA 200"

  # Standard DMO fields from ProductCatalog
  product_code: "GLA200"

  # Standard relationship to Brand DMO
  brand_id: "brand-001-mercedes-benz"

  # Standard relationship to ProductCategory DMO
  product_category_id: "cat-001-compact-suv"
```

---

### Step 2: Custom DMOs Created (Built on DMO Patterns)

#### Document DMO (Custom - Built on Party Pattern)
```yaml
DocumentDMO:
  extends: Party  # Inherits Party structure

  # Standard Party fields (inherited)
  document_id: "doc-001-gla-spec-v3.2"
  party_type: "Document"
  party_status: "Active"

  # Core document fields
  document_title: "Technical Specification: GLA 200 Model Year 2024"
  document_uri: "sharepoint://engineering/specs/GLA_200_Engine_Specs_MY2024_v3.2.pdf"
  document_hash: "a3f2c8d4e9b7a1c6f5e8d2b9a7c4e1f8..."

  # RAG EMBELLISHMENTS (what we add to standard DMO):
  rag_metadata:
    document_classification:
      authority_level: "Official"              # ← EMBELLISHED: Auto-classified via LLM
      reliability_score: 0.95                  # ← EMBELLISHED: Calculated from metadata
      content_type: "TechnicalSpec"            # ← EMBELLISHED: Auto-classified via LLM
      validation_status: "Validated"           # ← EMBELLISHED: Detected from content

    temporal_metadata:
      created_date: "2024-03-10T10:00:00Z"     # ← EMBELLISHED: Extracted from doc
      last_modified_date: "2024-03-20T14:30:00Z"
      effective_date: "2024-04-01T00:00:00Z"   # ← EMBELLISHED: Extracted from "Effective Date"
      expiration_date: null
      model_year: 2024                         # ← EMBELLISHED: Extracted from content
      is_current: true                         # ← EMBELLISHED: Checked via version chain

    source_metadata:
      source_system: "SharePoint"
      source_department_id: "dept-001-eng-powertrain"  # ← EMBELLISHED: Linked to Party DMO
      author_id: null                          # Not explicitly stated
      approver_ids: ["ind-001-hans-mueller"]   # ← EMBELLISHED: Extracted from "Approved by"
```

#### ContentFeature DMOs (Custom - New Pattern)

**Feature 1: Acceleration**
```yaml
ContentFeatureDMO:
  feature_id: "feat-001-gla200-accel"
  feature_name: "acceleration_0_100_kmh"
  feature_description: "Acceleration from 0 to 100 km/h"

  # RAG-specific metadata
  feature_metadata:
    feature_type: "PerformanceClaim"           # ← EMBELLISHED: Auto-classified
    confidence_score: 0.95                     # ← EMBELLISHED: LLM extraction confidence

    numeric_values:
      value: 7.1                               # ← EMBELLISHED: Extracted numeric value
      unit: "seconds"                          # ← EMBELLISHED: Extracted unit
      context: "Acceleration 0-100 km/h: 7.1 seconds"  # ← EMBELLISHED: Full text
      condition: null

    validation_status:
      is_validated: true                       # ← EMBELLISHED: Detected from content
      validation_reference_text: "WLTP validated"
      test_standard: "WLTP"                    # ← EMBELLISHED: Extracted standard
```

**Feature 2: Fuel Consumption**
```yaml
ContentFeatureDMO:
  feature_id: "feat-002-gla200-fuel"
  feature_name: "fuel_consumption_combined_wltp"
  feature_description: "Combined fuel consumption (WLTP cycle)"

  feature_metadata:
    feature_type: "TechnicalSpecification"
    confidence_score: 0.92

    numeric_values:
      value: 6.8
      unit: "L/100km"
      context: "Combined Fuel Consumption: 6.8 L/100km (WLTP)"
      condition: "WLTP cycle"

    validation_status:
      is_validated: true
      validation_reference_text: "WLTP validated"
      test_standard: "WLTP"
```

#### ValidationEvidence DMO (Custom - Built on Case Pattern)
```yaml
ValidationEvidenceDMO:
  extends: Case  # Inherits Case structure for tracking evidence

  validation_id: "valid-001-wltp-gla200"
  validation_type: "TestReport"

  # RAG-specific validation metadata
  validation_metadata:
    test_date: "2024-02-15T00:00:00Z"         # ← EMBELLISHED: Extracted from reference
    test_facility: "Company Test Center"
    test_standard: "WLTP"                     # ← EMBELLISHED: Worldwide harmonized Light vehicles Test Procedure
    test_result: "All performance claims validated"
    pass_fail_status: "Pass"
    certification_body: "Internal Engineering"

    measured_values:
      - metric_name: "acceleration_0_100_kmh"
        measured_value: 7.1
        unit: "seconds"
        tolerance: 0.1
      - metric_name: "fuel_consumption_combined"
        measured_value: 6.8
        unit: "L/100km"
        tolerance: 0.2
```

---

### Step 3: Product DMO Embellishments

#### Product DMO (Standard + RAG Embellishments)
```yaml
ProductDMO:
  extends: [ProductCatalog, Brand, ProductCategory]  # Standard DMOs

  # Standard fields (inherited)
  product_id: "prod-001-gla-200"
  product_name: "GLA 200"
  brand_id: "brand-001-mercedes-benz"
  product_category_id: "cat-001-compact-suv"

  # RAG EMBELLISHMENTS (what we add):
  rag_metadata:
    product_hierarchy:
      brand: "Mercedes-Benz"                   # ← EMBELLISHED: World knowledge
      model_line: "GLA-Class"                  # ← EMBELLISHED: Product taxonomy
      model: "GLA 200"
      variant: "Standard"
      model_year: 2024

    product_characteristics:
      country_of_origin: "Germany"             # ← EMBELLISHED: World knowledge
      manufacturing_plant: "Rastatt"
      market_segment: "Luxury"
      target_audience: "Premium compact SUV buyers"

    technical_features:
      engine_specs:
        displacement: 1.33
        displacement_unit: "liters"
        power_kw: 120
        power_ps: 163
        torque_nm: 250
      # ← EMBELLISHED: Extracted from documents
```

---

### Step 4: Edge Tables Created (Relationships)

#### Edge 1: AUTHORED_BY
```cypher
CREATE (doc:Document {document_id: "doc-001-gla-spec-v3.2"})-[r:AUTHORED_BY {
  authorship_role: "Approver",                 // ← EMBELLISHED: Role classification
  contribution_percentage: null,
  approval_date: "2024-03-20T00:00:00Z"       // ← EMBELLISHED: Extracted date
}]->(ind:Individual {individual_id: "ind-001-hans-mueller"})
```

**Why:** Links document to approver for authority attribution

---

#### Edge 2: PUBLISHED_BY
```cypher
CREATE (doc:Document {document_id: "doc-001-gla-spec-v3.2"})-[r:PUBLISHED_BY {
  publication_date: "2024-04-01T00:00:00Z",
  authority_score: 0.95                       // ← EMBELLISHED: Calculated from dept authority
}]->(dept:Department {party_id: "dept-001-eng-powertrain"})
```

**Why:** Establishes department authority (Engineering > Marketing)

---

#### Edge 3: DESCRIBES_PRODUCT
```cypher
CREATE (doc:Document {document_id: "doc-001-gla-spec-v3.2"})-[r:DESCRIBES_PRODUCT {
  model_year: 2024,                           // ← EMBELLISHED: Scopes to model year
  market_region: "Global",
  description_completeness: 0.95,             // ← EMBELLISHED: How comprehensive
  technical_depth: 5                          // ← EMBELLISHED: Level of detail (1-5)
}]->(prod:Product {product_id: "prod-001-gla-200"})
```

**Why:** Links document to product for product-scoped queries

---

#### Edge 4: SUPERSEDES
```cypher
CREATE (doc_new:Document {document_id: "doc-001-gla-spec-v3.2"})-[r:SUPERSEDES {
  supersession_date: "2024-04-01T00:00:00Z",  // ← EMBELLISHED: When new version takes effect
  supersession_reason: "Updated performance data with WLTP validation",
  backward_compatible: true                   // ← EMBELLISHED: Compatibility flag
}]->(doc_old:Document {document_id: "doc-001-gla-spec-v2.8"})
```

**Why:** Version control - ensures only current documents retrieved

---

#### Edge 5: CONTAINS_FEATURE
```cypher
CREATE (doc:Document {document_id: "doc-001-gla-spec-v3.2"})-[r:CONTAINS_FEATURE {
  feature_prominence: 0.9,                    // ← EMBELLISHED: How prominently featured
  extraction_confidence: 0.95                 // ← EMBELLISHED: LLM confidence
}]->(feat:ContentFeature {feature_id: "feat-001-gla200-accel"})
```

**Why:** Enables feature-level retrieval and conflict detection

---

#### Edge 6: VALIDATED_BY
```cypher
CREATE (feat:ContentFeature {feature_id: "feat-001-gla200-accel"})-[r:VALIDATED_BY {
  validation_method: "WLTP Test Procedure",   // ← EMBELLISHED: How validated
  validation_date: "2024-02-15T00:00:00Z",    // ← EMBELLISHED: When validated
  validation_confidence: 1.0                  // ← EMBELLISHED: Confidence in validation
}]->(valid:ValidationEvidence {validation_id: "valid-001-wltp-gla200"})
```

**Why:** Traces claims back to evidence for verification

---

#### Edge 7: APPLIES_TO (Feature to Product)
```cypher
CREATE (feat:ContentFeature {feature_id: "feat-001-gla200-accel"})-[r:APPLIES_TO {
  is_standard: true,                          // ← EMBELLISHED: Standard vs optional
  is_optional: false,
  feature_package: null,
  market_specific: false
}]->(prod:Product {product_id: "prod-001-gla-200"})
```

**Why:** Links features to products for product-specific queries

---

### Step 5: Complete Graph Visualization

```
┌─────────────────────────────────────────────────────────────────┐
│                    KNOWLEDGE GRAPH FOR THIS DOCUMENT            │
└─────────────────────────────────────────────────────────────────┘

    [Individual: Dr. Hans Mueller]
              ↑
              │ AUTHORED_BY
              │ (role: Approver)
              │
    [Document: GLA_200_Spec_v3.2]
         │          │          │
         │          │          │ CONTAINS_FEATURE
         │          │          ├─→ [Feature: acceleration_0_100_kmh]
         │          │          │         │
         │          │          │         │ VALIDATED_BY
         │          │          │         └─→ [Validation: WLTP Test Report]
         │          │          │
         │          │          └─→ [Feature: fuel_consumption_wltp]
         │          │                     │
         │          │                     │ VALIDATED_BY
         │          │                     └─→ [Validation: WLTP Test Report]
         │          │
         │          │ DESCRIBES_PRODUCT
         │          └─→ [Product: GLA 200]
         │                    │
         │                    │ HAS_BRAND
         │                    ├─→ [Brand: Mercedes-Benz]
         │                    │
         │                    │ BELONGS_TO_CATEGORY
         │                    └─→ [Category: Compact SUV]
         │
         │ PUBLISHED_BY
         └─→ [Department: Engineering/Powertrain]
                    │
                    │ HAS_EMPLOYEES
                    └─→ [Individual: Dr. Hans Mueller]

    Version Chain:
    [Document: v2.8] ←─SUPERSEDES─ [Document: v3.2 (current)]
```

---

### Step 6: What This Enables

**Query:** "What is the acceleration of 2024 GLA 200?"

**Graph Walk:**
1. Resolve entity: Product "GLA 200" (model_year=2024)
2. Find documents: `DESCRIBES_PRODUCT` → Document v3.2
3. Filter by authority: `PUBLISHED_BY` → Engineering (authority=5)
4. Check currency: `SUPERSEDES` chain → v3.2 is current
5. Extract feature: `CONTAINS_FEATURE` → acceleration_0_100_kmh
6. Verify validation: `VALIDATED_BY` → WLTP Test Report
7. Get numeric value: 7.1 seconds

**Answer with Full Traceability:**
```
"7.1 seconds (0-100 km/h)"

Source: Engineering Technical Specification v3.2 (Authority: 0.95)
Department: Engineering / Powertrain / Gasoline Engines
Approved by: Dr. Hans Mueller (Chief Powertrain Engineer)
Validated by: WLTP Test Report TP-2024-GLA200-001 dated 2024-02-15
Effective: 2024-04-01
Status: Current (supersedes v2.8)

→ Deterministic, authoritative, traceable, validated
```

---

### Summary: DMO Strategy

| Aspect | Standard DMO | Embellishments | Custom DMO | Edges Created | Source → Destination |
|--------|-------------|----------------|------------|---------------|---------------------|
| **Author** | Individual ✓ | + expertise_domains | — | AUTHORED_BY | Document → Individual |
| **Department** | Party ✓ | + authority_level | — | PUBLISHED_BY | Document → Department |
| **Product** | Product ✓ | + technical_features | — | DESCRIBES_PRODUCT<br>APPLIES_TO | Document → Product<br>ContentFeature → Product |
| **Document** | Party pattern | + authority_level<br>+ validation_status<br>+ temporal_metadata | Document DMO | SUPERSEDES<br>CONTAINS_FEATURE | Document → Document<br>Document → ContentFeature |
| **Features** | — | — | ContentFeature DMO | VALIDATED_BY<br>CONTAINS_FEATURE | ContentFeature → ValidationEvidence<br>Document → ContentFeature |
| **Validation** | Case pattern | + test_standard<br>+ measured_values | ValidationEvidence DMO | VALIDATED_BY | ContentFeature → ValidationEvidence |

**Key Insight:** We inherit 70% from standard DMOs, embellish 20%, and create only 10% custom — maximizing reuse while enabling deterministic RAG.

**See:** [Complete DMO Schemas](DMO_SCHEMA_REFERENCE.json) | [Ontology Design](RAG_KG_ONTOLOGY_DESIGN.md)

---

## Example: Deterministic Retrieval in Action

**Query:** "What is the fuel consumption of 2024 GLA 200?"

### Traditional RAG Result ❌
```
Retrieved: Marketing (6.5 L/100km), Blog (6.2 L/100km), Spec (6.8 L/100km)
Answer: "Around 6.5 L/100km"
→ Non-deterministic, source unclear, unvalidated
```

### Our Hybrid RAG Result ✅
```
1. Entity Resolution: Product="GLA 200", model_year=2024, feature="fuel_consumption"

2. Graph Filtering:
   - authority_level IN ['Official', 'Internal']
   - is_current = true
   - validation_status = 'Validated'
   - department_type IN ['Engineering', 'Product']
   → 47 authoritative documents

3. Vector Search within filtered set:
   - Semantic similarity to query
   → 10 relevant documents

4. Hybrid Scoring:
   - Top result: Engineering Spec v3.2 (final_score: 0.91)
     * similarity: 0.88
     * authority: 0.95 (Engineering dept)
     * validation: 1.0 (WLTP validated)
     * currency: 1.0 (current version)

5. Context Enrichment:
   - Validation: WLTP Test Report 2024-02-15
   - Version: Supersedes v2.8 (archived)
   - Supporting: Product Manual v3.0

Answer: "6.8 L/100km (combined WLTP cycle)"
Source: Engineering Technical Specification v3.2 (Authority: 0.95)
Validated by: WLTP Test Report dated 2024-02-15
Department: Engineering/Powertrain

→ Deterministic, authoritative, traceable, semantically relevant
```

---

## Benefits Delivered

| Capability | How We Achieve It |
|------------|-------------------|
| **Deterministic Answers** | Fixed scoring weights + graph ordering = same query → same result |
| **Authoritative Sources** | Department authority levels: Engineering (1.0) > Marketing (0.6) |
| **Temporal Currency** | Version chains (SUPERSEDES) + is_current filtering |
| **Claim Validation** | ValidationEvidence DMO links marketing → test reports |
| **Semantic Relevance** | Vector embeddings + hybrid scoring |
| **Full Traceability** | Every answer cites source + authority + validation chain |
| **No Manual Work** | Auto-generated via LLM prompts during ingestion |

---

## Implementation Timeline

**12-Week Plan:** [Full Roadmap](IMPLEMENTATION_ROADMAP.md)

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| **Foundation** | 2 weeks | Data Cloud connection, graph DB setup |
| **Custom DMOs** | 1 week | Document, ContentFeature, ValidationEvidence |
| **Auto-Generation** | 2 weeks | Classification + extraction pipelines |
| **Edge Tables** | 1 week | Relationship graph population |
| **Hybrid Retrieval** | 2 weeks | Graph-first, vector-first, parallel strategies |
| **Testing** | 2 weeks | Validation, performance benchmarks |
| **Production** | 2 weeks | Deployment, monitoring |

---

## Technical Architecture

### DMO Reuse Strategy

**Standard DMOs (inherited):**
- Individual, Party, Product, Brand, ProductCategory
- Embellished with RAG-specific fields

**Custom DMOs (created):**
- Document (Party pattern)
- ContentFeature (new)
- ValidationEvidence (Case pattern)
- DocumentRelationship (junction)

**See:** [DMO Schema Reference](DMO_SCHEMA_REFERENCE.json)

### Graph Structure

**Nodes:** Documents, Products, Individuals, Departments, ValidationEvidence, ContentFeatures
**Edges:** AUTHORED_BY, PUBLISHED_BY, DESCRIBES_PRODUCT, SUPERSEDES, VALIDATED_BY, CONTAINS_FEATURE, CONTRADICTS

### Technology Stack

- **Graph Database:** TigerGraph / Neo4j / AWS Neptune
- **Vector Database:** Your existing vector DB (filter-compatible)
- **LLM for Auto-Generation:** Claude Sonnet 4.5
- **Data Cloud Integration:** Salesforce Data Cloud DMO API

---

## Success Metrics

### Business Metrics
- **Answer Accuracy:** >95% factually correct
- **Answer Consistency:** 99%+ same query → same answer
- **User Satisfaction:** >4.5/5 stars
- **Source Trust:** 100% answers cite authoritative sources

### Technical Metrics
- **Query Latency (p95):** <500ms
- **Extraction Accuracy:** >90% precision/recall
- **Graph Completeness:** >95% docs have relationships
- **System Uptime:** >99.9%

---

## Key Differentiators

| Feature | Competitor RAG | Our Approach |
|---------|---------------|--------------|
| Retrieval Method | Vector only | **Hybrid Graph + Vector** |
| Source Authority | No differentiation | **Department-based hierarchy** |
| Temporal Awareness | None | **Version chains, supersession** |
| Claim Validation | None | **Test report traceability** |
| Determinism | No | **Yes (fixed scoring)** |
| Setup | Manual | **Auto-generated via prompts** |
| Integration | Custom | **Salesforce DMO-native** |

---

## Reference Documentation

- **[Complete Ontology Design](RAG_KG_ONTOLOGY_DESIGN.md)** - Full technical specification
- **[DMO Thinking Guide](DMO_THINKING_GUIDE.md)** - Conceptual framework
- **[DMO Schema Reference](DMO_SCHEMA_REFERENCE.json)** - JSON schemas for all DMOs
- **[Prompt Templates](PROMPT_TEMPLATES.md)** - Auto-generation prompts
- **[Implementation Roadmap](IMPLEMENTATION_ROADMAP.md)** - 12-week plan with code
- **[README](README.md)** - Quick start and architecture overview

---

## Quick Decision Framework

### Use Graph-First Strategy When:
- Need guaranteed authoritative results
- Query is factual (specs, numbers, compliance)
- Determinism is critical

### Use Vector-First Strategy When:
- Need broader semantic exploration
- Query is conceptual (how-to, explanations)
- Discovery is important

### Use Parallel Hybrid When:
- Exploratory queries
- Comparison queries (Product A vs B)
- Maximum coverage needed

---

## Summary

This solution delivers **enterprise-grade deterministic RAG** by:

1. **Grounding retrieval in Salesforce Data Cloud DMOs** (proven, standardized schemas)
2. **Combining graph authority with vector semantics** (hybrid scoring)
3. **Auto-generating the knowledge graph** via LLM prompts (no manual work)
4. **Ensuring deterministic, traceable answers** (authority rules + validation chains)

**Result:** Same query always returns the same authoritative, validated, current answer with full source attribution - solving RAG's fundamental accuracy and consistency problems.

---

**Contact:** For technical questions, see repository documentation
**Repository:** `/KGOntology/` on branch `claude/deterministic-rag-enhancement-011CUwdYYdEvhqbcuvP6kL7Y`
