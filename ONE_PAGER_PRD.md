# Deterministic RAG via Knowledge Graph Ontology - One-Pager
## Volkswagen Automotive Service & Diagnostics Example

**For:** Product Requirements Document (PRD)
**Last Updated:** 2025-11-09

---

## Problem Statement

Traditional RAG systems in automotive service and diagnostics suffer from:
- **Inconsistent answers**: Same diagnostic query returns different repair procedures
- **Incomplete context**: DTCs analyzed in isolation without production rules or TPI linkage
- **Missing traceability**: No connection from symptoms → DTCs → TPIs → parts → work orders
- **Unvalidated claims**: No verification of which production batches are affected
- **Non-deterministic retrieval**: Vector similarity alone cannot guarantee correct repair procedure

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

**Automotive Service Context (Volkswagen Example):**

| DMO Category | Purpose in Diagnostic RAG |
|--------------|----------------|
| **Case** → Work Orders, Repair Cases | Track service history and repair outcomes |
| **Product** → Vehicle models, Parts catalog | Link repairs to specific vehicles and components |
| **Custom: TPI (Technical Product Information)** | Service bulletins with repair procedures and root cause analysis |
| **Custom: DTC (Diagnostic Trouble Code)** | Fault codes with descriptions and diagnostic rules |
| **Custom: Part** | Replacement parts with production batches and vendors |
| **Custom: ProductionRule** | Production date ranges for affected part batches |
| **Custom: Symptom** | Observable issues that manifest as DTCs |
| **Custom: WorkStep** | Repair procedure steps within TPIs |

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

## Concrete Example: Automotive Diagnostic to DMO Mapping

### Real-World Diagnostic Scenario (Volkswagen)

**Customer Complaint:** Malfunction Indicator Light (MIL) is always ON

**Diagnostic Context:**
```
Diagnostic Trouble Code: P245700
Symptom: Engine Malfunction Indicator Light constantly ON
Vehicle: Volkswagen (Diesel engine with EGR system)
Scan Tool Reading:
- DTC: P245700
- Description: Exhaust Gas Pressure Sensor 1 – Signal Implausible
- Status: Permanent
- Freeze Frame: Present
```

**Traditional RAG Response:**
```
Query: "Seeing Malfunctioning engine Indicator Lights are always ON with
        DTC P245700. Please zero in on the problem."

Response:
"The Diagnostic Trouble Code (DTC) P245700 indicates an issue with
Exhaust Gas Pressure Sensor 1, specifically an implausible signal. To
determine the necessary repair, further information is required.

Could you please specify if there are any other accompanying DTCs?
Additionally, is the issue constant or intermittent?"

Source: Chunk
```
❌ **Problem:** Generic response, no root cause, no parts, no production batch info

---

**Graph RAG Response:**
```
Query: "Seeing Malfunctioning engine Indicator Lights are always ON with
        DTC P245700. Please zero in on the problem."

Response:
**Problem Analysis and Recommended Action for DTC P245700**

**Problem Identified:**
Root cause: Deviation in measurement range of Exhaust Gas Pressure
Sensor 1 (G450). Internal membrane drift caused by thermal cycling and
moisture ingress within the sensor.

**Recommended Solution:**
Replace the faulty Exhaust Gas Pressure Sensor (G450)

Parts Required:
• Exhaust Gas Pressure Sensor (G450) - Part #: 04L 906 051 K
  (improved sealing version)
• Torx Screw (M6 x 16) - Part #: N 910 827 01
  (recommended after removal)

Procedure: Locate sensor behind engine near EGR cooler → Disconnect
electrical connectors and pressure lines → Remove old sensor → Clean
mounting surface → Install new sensor → Reconnect components → Clear
fault codes → Road test

**Follow-up:**
To confirm if your vehicle's sensor falls within the affected batch,
please provide the **production date** of the currently installed
Exhaust Gas Pressure Sensor (G450). Known affected production range:
2022-09-01 to 2023-07-09.

Sources:
- TPI Document with repair procedure
- Production Rule for affected sensor batch
- Parts catalog with updated part numbers
```
✅ **Success:** Root cause identified, specific parts listed, production batch check, complete procedure

---

### Step 1: Standard DMOs Leveraged (What We Inherit)

#### Case DMO (Standard - Used for Work Orders)
```yaml
Case:
  case_id: "wo-2024-12345"
  case_number: "WO-12345"
  status: "Closed"

  # Standard DMO fields - used as-is
  created_date: "2024-11-01T09:30:00Z"
  closed_date: "2024-11-01T11:45:00Z"
  subject: "MIL ON - DTC P245700"
  description: "Customer reports malfunction indicator light constantly ON"
```

#### Product DMO (Standard - Used for Parts)
```yaml
Product:
  product_id: "part-04L906051K"
  product_name: "Exhaust Gas Pressure Sensor (G450)"
  product_code: "04L 906 051 K"

  # Standard DMO fields from ProductCatalog
  category: "Sensor"
  type: "Pressure Sensor"

  # Used for parts catalog and vehicle components
```

#### ProductItem DMO (Standard - Used for Part Inventory)
```yaml
ProductItem:
  product_item_id: "pi-001-sensor-g450"
  product_id: "part-04L906051K"

  # Standard fields for tracking individual part instances
  serial_number: "SN-2023-05-12345"
  production_date: "2023-05-15"  # Critical for production rule matching
  vendor_id: "vendor-001"
```

---

### Step 2: Custom DMOs Created (Built on DMO Patterns)

#### TPI DMO (Technical Product Information - Custom)
```yaml
TPIDMO:
  id__c: "tpi-2024-001-p245700"
  tpi_number__c: "TPI-2024-001"
  title__c: "DTC P245700 - Exhaust Gas Pressure Sensor Replacement"
  revisionNumber__c: "Rev 2"

  # RAG EMBELLISHMENTS (what we add):
  rag_metadata:
    cause__c: "Internal membrane drift caused by thermal cycling and
               moisture ingress within Exhaust Gas Pressure Sensor (G450)"
    issue_date__c: "2024-01-15"
    authority_level: 0.95              # ← EMBELLISHED: Official TPI = highest authority
    document_type: "ServiceBulletin"   # ← EMBELLISHED: Auto-classified via LLM
    affected_systems: ["EGR", "Emission Control", "Sensor"]
```

#### DTC DMO (Diagnostic Trouble Code - Custom)
```yaml
DTCDMO:
  id__c: "dtc-p245700"
  code__c: "P245700"
  description__c: "Exhaust Gas Pressure Sensor 1 – Signal Implausible"
  type__c: "Powertrain"

  # RAG EMBELLISHMENTS:
  rag_metadata:
    severity: "Critical"               # ← EMBELLISHED: Auto-classified
    mil_status: "Illuminates"          # ← EMBELLISHED: Triggers MIL light
    system: "Exhaust Gas Recirculation"
    component: "Pressure Sensor"
    freeze_frame_capable: true
```

#### Part DMO (Custom)
```yaml
PartDMO:
  id__c: "part-04L906051K"
  part_number__c: "04L 906 051 K"
  name__c: "Exhaust Gas Pressure Sensor (G450) - Improved Sealing"
  type__c: "Sensor"
  category__c: "Emission Control"

  # RAG EMBELLISHMENTS:
  rag_metadata:
    vendor_id__c: "vendor-001"
    supersedes_part: "04L 906 051 J"   # ← EMBELLISHED: Version tracking
    production_date__c: "2024-01-01"
    improvement_description: "Enhanced sealing to prevent moisture ingress"
    list_price: 145.00
    currency: "USD"
```

#### ProductionRule DMO (Custom)
```yaml
ProductionRuleDMO:
  id__c: "rule-001-sensor-g450"
  rule_number__c: "PR-2024-001"
  type__c: "DateRangeCheck"

  # RAG EMBELLISHMENTS:
  rag_metadata:
    part__c: "04L 906 051 J"           # ← EMBELLISHED: Links to affected part
    date_start__c: "2022-09-01"        # ← EMBELLISHED: Production start date
    date_end__c: "2023-07-09"          # ← EMBELLISHED: Production end date
    description: "Sensors manufactured in this range are affected by
                  membrane drift issue. Check production date on sensor."
    applicability_condition: "production_date BETWEEN date_start AND date_end"
```

#### Symptom DMO (Custom)
```yaml
SymptomDMO:
  id__c: "symptom-001-mil-on"
  symptom_number__c: "SYM-001"
  description__c: "Malfunction Indicator Light (MIL) constantly ON"
  type__c: "Visual Indicator"

  # RAG EMBELLISHMENTS:
  rag_metadata:
    created_date__c: "2024-01-10"
    customer_impact: "High"            # ← EMBELLISHED: Auto-classified
    frequency: "Constant"              # ← EMBELLISHED: vs Intermittent
    observable_by: "Customer"
```

#### WorkStep DMO (Custom - Repair Procedure Steps)
```yaml
WorkStepDMO:
  id__c: "workstep-001-sensor-replace"
  procedure_number__c: "WS-001"
  description__c: "Sensor Replacement Procedure"

  # RAG EMBELLISHMENTS:
  rag_metadata:
    notes__c: "1. Locate sensor behind engine near EGR cooler
               2. Disconnect electrical connector
               3. Disconnect pressure lines (note routing)
               4. Remove old sensor with Torx wrench
               5. Clean mounting surface
               6. Install new sensor with new torx screw
               7. Reconnect all components
               8. Clear fault codes
               9. Perform road test to verify repair"
    estimated_time_minutes: 45         # ← EMBELLISHED: Labor time
    skill_level: "Technician Level 2"  # ← EMBELLISHED: Required skill
    special_tools: ["Torx wrench set", "Diagnostic scan tool"]
```

---

### Step 3: Edge Tables Created (Relationships)

#### Edge 1: SOLVES
```cypher
CREATE (tpi:TPI {tpi_number: "TPI-2024-001"})-[r:SOLVES {
  confidence: 0.98,                            // ← EMBELLISHED: Solution confidence
  revision_number: "Rev 2"                    // ← EMBELLISHED: TPI revision
}]->(dtc:DTC {code: "P245700"})
```

**Why:** Links TPI service bulletin to the DTC it solves

---

#### Edge 2: MANIFESTS_AS
```cypher
CREATE (dtc:DTC {code: "P245700"})-[r:MANIFESTS_AS {
  frequency: "Constant",                      // ← EMBELLISHED: vs Intermittent
  customer_impact: "High"                     // ← EMBELLISHED: Impact assessment
}]->(symptom:SYMPTOM {symptom_number: "SYM-001"})
```

**Why:** Links DTC to observable customer symptoms

---

#### Edge 3: RECOMMENDS
```cypher
CREATE (tpi:TPI {tpi_number: "TPI-2024-001"})-[r:RECOMMENDS {
  part_type: "Replacement",                   // ← EMBELLISHED: vs Optional
  quantity: 1,                                // ← EMBELLISHED: Required quantity
  critical: true                              // ← EMBELLISHED: Critical vs optional part
}]->(part:PART {part_number: "04L 906 051 K"})
```

**Why:** Links TPI to recommended replacement parts

---

#### Edge 4: REQUIRES_CHECK
```cypher
CREATE (tpi:TPI {tpi_number: "TPI-2024-001"})-[r:REQUIRES_CHECK {
  check_type: "ProductionDate",               // ← EMBELLISHED: Type of validation
  mandatory: true                             // ← EMBELLISHED: Required vs optional
}]->(rule:PRODUCTION_RULE {rule_number: "PR-2024-001"})
```

**Why:** Links TPI to production rules that must be checked

---

#### Edge 5: APPLIES_BASED_ON
```cypher
CREATE (rule:PRODUCTION_RULE {rule_number: "PR-2024-001"})-[r:APPLIES_BASED_ON {
  condition: "production_date BETWEEN '2022-09-01' AND '2023-07-09'",
  applicability: "DateRange"                  // ← EMBELLISHED: Rule type
}]->(tpi:TPI {tpi_number: "TPI-2024-001"})
```

**Why:** Defines when the TPI applies based on production rules

---

#### Edge 6: CONTAINS (TPI to WorkStep)
```cypher
CREATE (tpi:TPI {tpi_number: "TPI-2024-001"})-[r:CONTAINS {
  step_order: 1,                              // ← EMBELLISHED: Sequence order
  estimated_minutes: 45                       // ← EMBELLISHED: Labor time
}]->(step:WORK_STEP {procedure_number: "WS-001"})
```

**Why:** Links TPI to repair procedure work steps

---

#### Edge 7: INVOLVES (WorkStep to Part)
```cypher
CREATE (step:WORK_STEP {procedure_number: "WS-001"})-[r:INVOLVES {
  usage_type: "Install",                      // ← EMBELLISHED: Install/Remove/Replace
  quantity: 1                                 // ← EMBELLISHED: Parts needed
}]->(part:PART {part_number: "04L 906 051 K"})
```

**Why:** Links repair steps to required parts

---

#### Edge 8: USED (WorkOrder to TPI)
```cypher
CREATE (wo:WORK_ORDER {work_order_number: "WO-12345"})-[r:USED {
  effectiveness: "Resolved",                  // ← EMBELLISHED: Repair outcome
  repair_date: "2024-11-01"                   // ← EMBELLISHED: When repair completed
}]->(tpi:TPI {tpi_number: "TPI-2024-001"})
```

**Why:** Tracks which TPIs were used in actual repairs (validates TPI effectiveness)

---

### Step 4: Complete Graph Visualization

```
┌──────────────────────────────────────────────────────────────────┐
│         KNOWLEDGE GRAPH FOR DTC P245700 DIAGNOSTIC               │
└──────────────────────────────────────────────────────────────────┘

    [SYMPTOM: MIL ON]
              ↑
              │ MANIFESTS_AS
              │ (frequency: Constant)
              │
    [DTC: P245700]
         │
         │ SOLVES (confidence: 0.98)
         ↓
    [TPI: TPI-2024-001]
         │          │          │
         │          │          │ RECOMMENDS (critical: true)
         │          │          ├─→ [PART: 04L 906 051 K]
         │          │          │    (Improved Sealing Sensor)
         │          │          │
         │          │          │ RECOMMENDS
         │          │          └─→ [PART: N 910 827 01]
         │          │               (Torx Screw)
         │          │
         │          │ REQUIRES_CHECK
         │          └─→ [PRODUCTION_RULE: PR-2024-001]
         │                    │ (date range: 2022-09-01 to 2023-07-09)
         │                    │
         │                    │ APPLIES_BASED_ON
         │                    └─→ [TPI: TPI-2024-001]
         │
         │ CONTAINS (step 1)
         └─→ [WORK_STEP: WS-001]
                    │ (Sensor Replacement, 45 min)
                    │
                    │ INVOLVES (usage: Install)
                    └─→ [PART: 04L 906 051 K]

    Repair History:
    [WORK_ORDER: WO-12345] ─USED→ [TPI: TPI-2024-001]
                           (effectiveness: Resolved)
```

---

### Step 5: What This Enables

**Query:** "Seeing Malfunctioning engine Indicator Lights are always ON with DTC P245700"

**Graph Walk:**
1. Resolve entity: DTC "P245700"
2. Find symptom: `MANIFESTS_AS` → Symptom "MIL ON" (validates customer complaint)
3. Find solution: `SOLVES` → TPI "TPI-2024-001" (authority=0.95)
4. Extract root cause: TPI cause field → "Internal membrane drift"
5. Get recommended parts: `RECOMMENDS` → Part "04L 906 051 K" + "N 910 827 01"
6. Check production rule: `REQUIRES_CHECK` → Production Rule "PR-2024-001"
7. Get procedure: `CONTAINS` → WorkStep "WS-001" → `INVOLVES` → Parts
8. Verify effectiveness: `USED` → WorkOrders with "Resolved" status

**Answer with Full Traceability:**
```
**Problem Identified:**
Root cause: Deviation in measurement range of Exhaust Gas Pressure
Sensor 1 (G450). Internal membrane drift caused by thermal cycling and
moisture ingress within the sensor.

**Recommended Solution:**
Replace the faulty Exhaust Gas Pressure Sensor (G450)

Parts Required:
• Exhaust Gas Pressure Sensor (G450) - Part #: 04L 906 051 K
  (improved sealing version)
• Torx Screw (M6 x 16) - Part #: N 910 827 01

Procedure: 9-step repair procedure (45 minutes estimated)

Production Rule Check: Sensors manufactured between 2022-09-01 and
2023-07-09 are affected. Please verify production date on current sensor.

Source: TPI-2024-001 Rev 2 (Authority: 0.95)
Issued: 2024-01-15
Validated by: 847 successful work orders using this TPI

→ Deterministic, root-cause driven, parts-specific, production-validated
```

---

### Summary: DMO Strategy (Volkswagen Automotive Service)

| Aspect | Standard DMO | Embellishments | Custom DMO | Edges Created | Source → Destination |
|--------|-------------|----------------|------------|---------------|---------------------|
| **Work Orders** | Case ✓ | + repair_outcome<br>+ effectiveness | — | USED | WorkOrder → TPI |
| **Parts** | Product ✓<br>ProductItem ✓ | + production_date<br>+ supersedes_part | Part DMO | RECOMMENDS<br>INVOLVES | TPI → Part<br>WorkStep → Part |
| **TPI (Service Bulletins)** | — | — | TPI DMO | SOLVES<br>RECOMMENDS<br>REQUIRES_CHECK<br>CONTAINS | TPI → DTC<br>TPI → Part<br>TPI → ProductionRule<br>TPI → WorkStep |
| **DTC (Fault Codes)** | — | — | DTC DMO | SOLVES<br>MANIFESTS_AS | TPI → DTC<br>DTC → Symptom |
| **Production Rules** | — | — | ProductionRule DMO | REQUIRES_CHECK<br>APPLIES_BASED_ON | TPI → ProductionRule<br>ProductionRule → TPI |
| **Symptoms** | — | — | Symptom DMO | MANIFESTS_AS | DTC → Symptom |
| **Repair Steps** | — | — | WorkStep DMO | CONTAINS<br>INVOLVES | TPI → WorkStep<br>WorkStep → Part |

**Key Insight:** We inherit 25% from standard DMOs (Case, Product, ProductItem), embellish 15%, and create 60% custom for automotive diagnostics — domain-specific while leveraging Data Cloud foundation.

**See:** [Complete DMO Schemas](DMO_SCHEMA_REFERENCE.json) | [Ontology Design](RAG_KG_ONTOLOGY_DESIGN.md)

---

## Example: Deterministic Retrieval in Action (Volkswagen Diagnostics)

**Query:** "Seeing Malfunctioning engine Indicator Lights are always ON with DTC P245700. Please zero in on the problem and feel free to ask relevant questions"

### Traditional RAG Result ❌
```
Response:
"The Diagnostic Trouble Code (DTC) P245700 indicates an issue with
Exhaust Gas Pressure Sensor 1, specifically an implausible signal. To
determine the necessary repair, further information is required.

Could you please specify if there are any other accompanying DTCs?
Additionally, is the issue constant or intermittent?"

Source: Chunk

Issues:
❌ Generic response - repeats DTC description
❌ No root cause identified
❌ No parts recommended
❌ No production batch information
❌ Requires additional questions to proceed
❌ Non-actionable - technician must do manual research
```

### Our Graph RAG Result ✅
```
1. Entity Resolution: DTC="P245700"

2. Graph Traversal:
   - DTC P245700 → MANIFESTS_AS → Symptom "MIL ON" (validates complaint)
   - DTC P245700 ← SOLVES ← TPI "TPI-2024-001" (authority: 0.95)
   - TPI → RECOMMENDS → Parts: 04L 906 051 K, N 910 827 01
   - TPI → REQUIRES_CHECK → ProductionRule: 2022-09-01 to 2023-07-09
   - TPI → CONTAINS → WorkStep: 9-step procedure (45 min)
   - WorkStep → INVOLVES → Parts
   → Complete diagnostic path retrieved

3. Vector Search within graph context:
   - Semantic similarity: root cause descriptions
   - Supporting context: similar repair cases
   → Enriched with contextual information

4. Hybrid Scoring:
   - Top result: TPI-2024-001 Rev 2 (final_score: 0.96)
     * similarity: 0.91
     * authority: 0.95 (Official TPI)
     * validation: 1.0 (847 successful work orders)
     * currency: 1.0 (latest revision)

5. Context Enrichment:
   - Root cause: Internal membrane drift analysis
   - Production rule: Affected batch identification
   - Work order history: 847 successful repairs
   - Part supersession: Old part → New part

Response:
**Problem Identified:**
Root cause: Deviation in measurement range of Exhaust Gas Pressure
Sensor 1 (G450). Internal membrane drift caused by thermal cycling and
moisture ingress within the sensor.

**Recommended Solution:**
Replace the faulty Exhaust Gas Pressure Sensor (G450)

Parts Required:
• Exhaust Gas Pressure Sensor (G450) - Part #: 04L 906 051 K
  (improved sealing version)
• Torx Screw (M6 x 16) - Part #: N 910 827 01
  (recommended after removal)

Procedure: Locate sensor behind engine near EGR cooler → Disconnect
electrical connectors and pressure lines → Remove old sensor → Clean
mounting surface → Install new sensor → Reconnect components → Clear
fault codes → Road test

**Follow-up:**
To confirm if your vehicle's sensor falls within the affected batch,
please provide the **production date** of the currently installed
Exhaust Gas Pressure Sensor (G450). Known affected production range:
2022-09-01 to 2023-07-09.

Sources:
- TPI-2024-001 Rev 2 (Authority: 0.95)
- Issued: 2024-01-15
- Validated by: 847 successful work orders

→ Deterministic, root-cause driven, parts-specific, production-validated, actionable
```

---

## Benefits Delivered (Volkswagen Automotive Service)

| Capability | How We Achieve It |
|------------|-------------------|
| **Deterministic Diagnosis** | Fixed scoring weights + graph ordering = same DTC → same repair |
| **Root Cause Analysis** | TPI authority (0.95) provides verified root causes vs generic descriptions |
| **Parts Identification** | RECOMMENDS edges link TPIs directly to correct part numbers + quantities |
| **Production Batch Validation** | ProductionRule DMO checks if specific sensor batch is affected |
| **Repair Effectiveness Tracking** | USED edges from WorkOrders validate TPI success rate (847 repairs) |
| **Full Traceability** | Complete path: Symptom → DTC → TPI → Parts → Procedure → Validation |
| **No Manual Work** | Auto-generated KG from TPIs, DTCs, parts catalogs, and work order history |

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

### Graph Structure (Volkswagen)

**Nodes:** TPI (Service Bulletins), DTC (Fault Codes), Parts, ProductionRules, Symptoms, WorkSteps, WorkOrders
**Edges:** SOLVES, MANIFESTS_AS, RECOMMENDS, REQUIRES_CHECK, APPLIES_BASED_ON, CONTAINS, INVOLVES, USED

### Technology Stack

- **Graph Database:** TigerGraph / Neo4j / AWS Neptune
- **Vector Database:** Your existing vector DB (filter-compatible)
- **LLM for Auto-Generation:** Claude Sonnet 4.5
- **Data Cloud Integration:** Salesforce Data Cloud DMO API

---

## Success Metrics (Volkswagen Automotive Service)

### Business Metrics
- **Diagnostic Accuracy:** >95% correct root cause identification
- **First-Time Fix Rate:** 99%+ same DTC → same successful repair
- **Technician Satisfaction:** >4.5/5 stars (reduced manual research time)
- **Parts Accuracy:** 100% correct part numbers recommended

### Technical Metrics
- **Query Latency (p95):** <500ms (DTC → TPI → Parts retrieval)
- **TPI Extraction Accuracy:** >90% precision/recall from service bulletins
- **Graph Completeness:** >95% DTCs linked to TPIs and parts
- **System Uptime:** >99.9%

---

## Key Differentiators (Volkswagen vs Traditional Diagnostic Systems)

| Feature | Traditional RAG | Our Graph RAG Approach |
|---------|----------------|----------------------|
| Retrieval Method | Vector only (generic responses) | **Hybrid Graph + Vector (contextual)** |
| Root Cause | DTC description only | **TPI-linked root cause analysis** |
| Parts Recommendation | Manual lookup required | **Auto-linked via RECOMMENDS edges** |
| Production Batch Check | Not available | **ProductionRule validation** |
| Repair Validation | No historical data | **Work order history (847 repairs)** |
| Determinism | Inconsistent responses | **Yes (same DTC → same repair)** |
| Setup | Manual TPI indexing | **Auto-generated via LLM prompts** |
| Integration | Standalone | **Salesforce Data Cloud DMO-native** |

---

## Reference Documentation

- **[Complete Ontology Design](RAG_KG_ONTOLOGY_DESIGN.md)** - Full technical specification
- **[DMO Thinking Guide](DMO_THINKING_GUIDE.md)** - Conceptual framework
- **[DMO Schema Reference](DMO_SCHEMA_REFERENCE.json)** - JSON schemas for all DMOs
- **[Prompt Templates](PROMPT_TEMPLATES.md)** - Auto-generation prompts
- **[Implementation Roadmap](IMPLEMENTATION_ROADMAP.md)** - 12-week plan with code
- **[README](README.md)** - Quick start and architecture overview

---

## Quick Decision Framework (Automotive Diagnostics)

### Use Graph-First Strategy When:
- DTC code is known and specific
- Need guaranteed repair procedure
- Production batch validation is critical
- First-time fix is essential

### Use Vector-First Strategy When:
- Customer describes symptoms without DTC
- Need broader diagnostic exploration
- Symptom-based troubleshooting required
- Discovery of related issues important

### Use Parallel Hybrid When:
- Complex multi-symptom scenarios
- Comparison queries (multiple possible causes)
- Historical repair pattern analysis
- Maximum diagnostic coverage needed

---

## Summary (Volkswagen Automotive Service)

This solution delivers **enterprise-grade deterministic diagnostic RAG** by:

1. **Grounding retrieval in Salesforce Data Cloud DMOs** (Case, Product, ProductItem for work orders and parts)
2. **Combining TPI authority with vector semantics** (hybrid scoring for diagnostics)
3. **Auto-generating the knowledge graph** from TPIs, DTCs, parts catalogs, and work order history (no manual work)
4. **Ensuring deterministic, traceable repairs** (DTC → TPI → Parts → Procedure → Validation)

**Result:** Same DTC code always returns the same root cause, parts list, and repair procedure with full traceability - solving automotive service's fundamental diagnostic accuracy and first-time fix problems.

**Real-World Impact:**
- **Before Graph RAG:** Generic DTC description, requires technician research, inconsistent parts ordering
- **After Graph RAG:** Root cause identified, correct parts specified, production batch validated, 99% first-time fix rate

---

**Contact:** For technical questions, see repository documentation
**Repository:** `/KGOntology/` on branch `claude/deterministic-rag-enhancement-011CUwdYYdEvhqbcuvP6kL7Y`
