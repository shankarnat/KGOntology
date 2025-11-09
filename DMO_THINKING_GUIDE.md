# How to Think About KG Ontology Based on Salesforce Data Cloud DMOs

**Purpose:** Conceptual guide for understanding the relationship between Data Cloud DMOs and RAG Knowledge Graph Ontology

---

## The Core Insight

**Salesforce Data Cloud DMOs are semantic blueprints for customer data. We extend this same semantic approach to document and knowledge data for RAG.**

### What Are DMOs?

Data Model Objects (DMOs) in Salesforce Data Cloud are:
- **Standardized schemas** for common business entities (Individual, Party, Product, Engagement, etc.)
- **Semantically rich** - they describe what data *means*, not just what it *is*
- **Relationship-aware** - they model how entities connect to each other
- **Proven at scale** - used by enterprises globally for customer 360° views

### Why Ground RAG Ontology in DMOs?

| Challenge | DMO Solution |
|-----------|--------------|
| **Semantic Gap** | LLMs need to understand what document data *means* (authority, currency, validation) - DMOs provide this semantic layer |
| **Integration** | RAG systems in Salesforce ecosystems need to work with existing Data Cloud data - DMO grounding ensures native compatibility |
| **Standardization** | Avoid reinventing schemas - 89+ battle-tested DMOs cover most enterprise needs |
| **Relationships** | DMOs already model complex relationships - we extend this to document/content relationships |
| **World Knowledge** | DMOs like Product, Brand, Party already capture real-world entities - perfect for grounding LLM understanding |

---

## Mental Model: DMO Categories for RAG

Think of DMOs as organized into "subject areas" that map to RAG needs:

### 1. **Party Subject Area → Document Authority & Authorship**

**Standard DMOs Used:**
- `Individual` - Authors, approvers, subject matter experts
- `Party` - Base pattern for representing entities (documents, departments)
- `Party Identification` - Identity resolution for users
- `Contact Point Email/Phone` - Author contact information

**How We Think About It:**
- Documents are created by *people* (Individuals) working in *organizations* (Parties as Departments)
- To determine if a document is authoritative, we need to know:
  - **Who** created it (Individual DMO)
  - **Which department** they belong to (Party DMO as Department)
  - **Their credentials** (embellishments to Individual: expertise_domains, seniority_level)
- Just like you'd trust a doctor's medical advice over a marketer's, you trust Engineering specs over Marketing claims

**Example Graph Walk:**
```
Document "GLA 200 Specs"
  → AUTHORED_BY → Individual "Dr. Hans Mueller"
    → WORKS_IN → Department "Engineering/Powertrain"
      → authority_level: 5 (highest)
  ∴ Document authority_score = HIGH
```

---

### 2. **Product Subject Area → Product Context & World Knowledge**

**Standard DMOs Used:**
- `Product Catalog` - Product definitions
- `Product Category` - Product hierarchies (GLA-Class → Compact SUV)
- `Brand` - Brand attribution (Mercedes-Benz, AMG)

**How We Think About It:**
- Documents describe *products* - we need to know which ones
- Product hierarchy gives context: GLA 200 is part of GLA-Class, which is a compact luxury SUV by Mercedes-Benz
- This is "world knowledge" - the KG knows what a GLA 200 *is* in the real world
- When a user asks "GLA 200 engine specs", we can:
  1. Resolve "GLA 200" to Product DMO
  2. Find all Documents where DESCRIBES_PRODUCT → GLA 200
  3. Filter by authority (Engineering > Marketing)
  4. Return specs with full product context

**Example Graph Walk:**
```
Query: "2024 GLA 200 fuel consumption"
  → Product "GLA 200" (model_year=2024)
    → DESCRIBED_IN ← Document "Tech Spec v3.2"
      → CONTAINS_FEATURE → ContentFeature "fuel_consumption_combined_wltp"
        → value: 6.8, unit: "L/100km"
        → VALIDATED_BY → ValidationEvidence "WLTP Test Report 2024-02-15"
  ∴ Answer: "6.8 L/100km (WLTP validated)"
```

---

### 3. **Case Subject Area → Validation & Evidence**

**Standard DMOs Used:**
- `Case` - Base pattern for evidence records

**How We Think About It:**
- In customer service, a "Case" represents an issue or inquiry
- In RAG, we repurpose this pattern: a "ValidationEvidence" is like a case proving a claim
- Marketing claims are "allegations" - test reports are "evidence"
- Just like legal cases, we track:
  - What claim is being validated
  - Who validated it (conducted_by Department)
  - When it was validated (test_date)
  - What the result was (pass_fail_status)

**Example:**
```
Marketing Doc: "GLA 200 accelerates 0-100 km/h in 7.1 seconds"
  → CONTAINS_FEATURE → ContentFeature "acceleration_0_100_kmh"
    → value: 7.1 seconds
    → VALIDATED_BY → ValidationEvidence "WLTP Test Report"
      → test_date: 2024-02-15
      → pass_fail_status: "Pass"
      → conducted_by: Department "Engineering/Testing"
  ∴ Claim is VALIDATED (not just marketing hype)
```

---

### 4. **Engagement Subject Area → Retrieval Analytics**

**Standard DMOs Used:**
- `Engagement Topic` - Topics discussed in engagements
- `Message Engagement` - Engagement with messages

**How We Think About It:**
- In marketing, "Engagement" tracks how customers interact with content
- In RAG, we track how *LLMs* and *users* interact with documents
- Each retrieval query is an "engagement" event
- This enables:
  - Understanding what documents are most useful
  - Detecting patterns in queries
  - Improving retrieval over time

**Example:**
```
User Query: "GLA 200 engine specs"
  → Create RetrievalContext (extends Engagement pattern)
    → query_text: "GLA 200 engine specs"
    → documents_retrieved: [Doc1, Doc2, Doc3]
    → user_feedback_score: 5/5 (user found it helpful)
    → relates_to_products: [GLA 200]

Later: Analyze RetrievalContext to see which documents are most helpful
```

---

## Custom DMOs: When and Why

While we reuse many standard DMOs, we create custom ones when standard DMOs don't fit:

### Custom DMO: `Document`

**Why Custom?**
- No standard DMO represents "documents" as first-class entities
- We need document-specific metadata (authority_level, content_type, validation_status)
- Documents have unique relationships (supersedes, contradicts)

**Built On:** Party DMO pattern
- Just like Party represents a person or organization, we treat documents as "parties" in the knowledge ecosystem
- Inherits Party's structure (party_id, party_type, party_status)
- Adds RAG-specific embellishments

### Custom DMO: `ContentFeature`

**Why Custom?**
- No standard DMO for extracted claims/features
- Need to track numeric values with units (7.1 seconds, 6.8 L/100km)
- Need validation links (is this claim validated by evidence?)

**Built On:** New pattern (no direct DMO equivalent)
- Represents granular knowledge extracted from documents
- Enables feature-level retrieval and conflict detection

### Custom DMO: `ValidationEvidence`

**Why Custom?**
- Standard Case DMO is close, but lacks test-specific fields
- Need test_standard, measured_values, certification_body

**Built On:** Case DMO pattern
- Treats validation as a "case" proving a claim
- Adds test/certification-specific metadata

---

## The Embellishment Strategy

For standard DMOs, we follow a pattern: **Core + Embellishments**

### Example: Individual DMO

**Standard Individual DMO (from Data Cloud):**
```yaml
Individual:
  individual_id: UUID
  first_name: String
  last_name: String
  email: String  # via Contact Point Email
```

**Embellished Individual DMO (for RAG):**
```yaml
Individual:
  # Standard fields (inherited)
  individual_id: UUID
  first_name: String
  last_name: String
  email: String

  # RAG Embellishments
  rag_metadata:
    professional_context:
      title: String
      department_id: UUID
      expertise_domains: [String]  # ["Powertrain Engineering", "WLTP Testing"]
      seniority_level: Integer  # 1-5, for authority weighting

    authorship_metrics:
      documents_authored: Integer
      documents_approved: Integer
      average_document_authority: Float
```

**Why This Works:**
- Standard fields ensure compatibility with Data Cloud
- Embellishments add RAG-specific context without breaking the DMO contract
- Can still use standard Individual DMO queries, plus new RAG queries

---

## Relationship Ontology: The Edge Tables

DMOs are nodes in the graph. Relationships are edges.

### Standard DMO Relationship Patterns

**Example: Individual → Party (Department)**
```sql
-- Standard Data Cloud pattern
Individual.department_id → Party.party_id
```

**For RAG, we extend this:**
```sql
-- Edge table with rich metadata
edge_works_in:
  individual_id → Individual
  department_id → Party (as Department)
  start_date: DateTime
  role: String
  is_current: Boolean
```

### Custom Relationship Patterns for RAG

**Document ← → Document:**
```sql
edge_supersedes:
  from_document_id → Document
  to_document_id → Document
  supersession_date: DateTime
  supersession_reason: Text
  backward_compatible: Boolean
```

**Document → Product:**
```sql
edge_describes_product:
  from_document_id → Document
  to_product_id → Product
  model_year: Integer
  market_region: String
  description_completeness: Float
```

**ContentFeature → ValidationEvidence:**
```sql
edge_validated_by:
  from_feature_id → ContentFeature
  to_validation_id → ValidationEvidence
  validation_method: String
  validation_date: DateTime
```

---

## How LLMs Understand This Ontology

### Semantic Grounding

**Without Ontology:**
```
LLM sees: "GLA 200 accelerates 0-100 km/h in 7.1 seconds"
LLM knows: Text string, statistical patterns
LLM doesn't know: Is this authoritative? Is it validated? Is it current?
```

**With Ontology:**
```
LLM sees:
  Document(
    authority_level="Official",
    content_type="TechnicalSpec",
    published_by=Department(type="Engineering", authority_level=5),
    contains_feature=ContentFeature(
      name="acceleration_0_100_kmh",
      value=7.1,
      unit="seconds",
      validated_by=ValidationEvidence(
        test_standard="WLTP",
        test_date="2024-02-15",
        pass_fail_status="Pass"
      )
    ),
    is_current=True
  )

LLM knows:
  ✓ This is authoritative (Official, Engineering source)
  ✓ This is validated (WLTP test, passed)
  ✓ This is current (no superseding document)
  ∴ Safe to use in answer
```

### Graph Reasoning

LLMs can perform multi-hop reasoning:

**Query:** "Is the GLA 200 acceleration claim in the brochure accurate?"

**Graph Walk:**
1. Find Document where title LIKE "%brochure%"
2. Extract ContentFeature "acceleration_0_100_kmh" from brochure
3. Traverse: ContentFeature → VALIDATED_BY → ValidationEvidence
4. Check: ValidationEvidence.pass_fail_status = "Pass"
5. Compare: Brochure value (7.1s) == Test report value (7.1s)
6. Answer: "Yes, the 7.1s acceleration claim in the brochure is accurate, validated by WLTP test report dated 2024-02-15."

---

## Deterministic RAG: The Payoff

### Problem: Non-Deterministic Retrieval

**Traditional RAG (vector similarity only):**
```
Query: "GLA 200 fuel consumption"

Retrieved docs (by embedding similarity):
1. Marketing brochure (says 6.5 L/100km) - score: 0.89
2. Engineering spec (says 6.8 L/100km) - score: 0.87
3. Blog post (says 6.2 L/100km) - score: 0.85

LLM answer: "Around 6.5 L/100km" ❌
  → Non-deterministic (could pick any of the three)
  → Not authoritative (might pick blog over engineering spec)
  → Not traceable (user doesn't know why this answer)
```

### Solution: Ontology-Grounded Retrieval

**RAG with KG Ontology:**
```
Query: "GLA 200 fuel consumption"

Step 1: Resolve entity
  "GLA 200" → Product DMO (id: xyz, model_year: 2024)

Step 2: Find authoritative documents
  Graph walk: Product → DESCRIBED_IN ← Document
  Filter: authority_level IN ["Official"] AND is_current=true
  Sort: department_authority DESC

Step 3: Extract validated features
  Document → CONTAINS_FEATURE → ContentFeature("fuel_consumption_combined_wltp")
  Filter: ContentFeature.validated_by IS NOT NULL
  Get: value=6.8, unit="L/100km"

Step 4: Trace validation
  ContentFeature → VALIDATED_BY → ValidationEvidence
  Get: test_standard="WLTP", test_date="2024-02-15"

LLM answer: "6.8 L/100km (combined WLTP cycle)" ✅
  Source: Engineering Technical Specification v3.2
  Validated by: WLTP Test Report dated 2024-02-15

  → Deterministic (same query, same answer every time)
  → Authoritative (Engineering > Marketing)
  → Traceable (user sees the source and validation)
```

---

## DMO Mapping Quick Reference

### Core Salesforce Data Cloud DMOs → RAG Usage

| Data Cloud DMO | Subject Area | RAG Usage | Embellishments |
|----------------|--------------|-----------|----------------|
| **Individual** | Party | Authors, approvers, SMEs | + expertise_domains, seniority_level, authorship_metrics |
| **Party** | Party | Departments, organizations | + department_type, authority_domains, authority_level |
| **Party Identification** | Party | User identity | (used as-is) |
| **Contact Point Email** | Party | Author contact | (used as-is) |
| **Product Catalog** | Product | Product definitions | + product_hierarchy, technical_features |
| **Product Category** | Product | Product taxonomy | (used as-is) |
| **Brand** | Product | Brand attribution | + brand metadata for world knowledge |
| **Case** | Case | Base pattern for ValidationEvidence | → ValidationEvidence DMO (custom) |
| **Engagement Topic** | Engagement | Base pattern for RetrievalContext | → RetrievalContext DMO (custom) |
| **Message Engagement** | Engagement | Retrieval analytics | (pattern reused) |

---

### Custom DMOs Created for RAG

| Custom DMO | Built On | Purpose | Key Relationships |
|------------|----------|---------|-------------------|
| **Document** | Party pattern | Documents as first-class entities | AUTHORED_BY → Individual, PUBLISHED_BY → Department, DESCRIBES_PRODUCT → Product |
| **ContentFeature** | New | Extracted features/specs | MENTIONED_IN → Document, APPLIES_TO → Product, VALIDATED_BY → ValidationEvidence |
| **ValidationEvidence** | Case pattern | Test reports, certifications | VALIDATES_CLAIMS_IN → Document, VALIDATES_FEATURES_OF → Product |
| **DocumentRelationship** | Junction pattern | Explicit doc relationships | Document ← → Document (Supersedes, References, Contradicts) |
| **DocumentVersion** | New | Version control | DOCUMENT → DocumentVersion chain |
| **RetrievalContext** | Engagement pattern | Retrieval analytics | RETRIEVED_DOCUMENTS → Document, QUERIED_BY → Individual |

---

## Implementation Philosophy

### Start with DMOs, Not Custom Tables

❌ **Wrong Approach:**
```
"Let's create custom tables for documents:
  - documents
  - authors
  - departments
  - products
  - validations"
```

✅ **Right Approach:**
```
"Let's see which DMOs already exist:
  - Authors → Individual DMO ✓
  - Departments → Party DMO (type=Organization) ✓
  - Products → Product Catalog DMO ✓

Now let's embellish these for RAG:
  - Individual + rag_metadata.professional_context
  - Party + rag_metadata.department_classification
  - Product + rag_metadata.product_hierarchy

And create custom DMOs only where needed:
  - Document (no standard equivalent)
  - ContentFeature (no standard equivalent)
  - ValidationEvidence (Case pattern + test-specific fields)"
```

### Benefits of DMO-First Thinking

1. **Reuse Proven Schemas**: Don't reinvent Individual, Product, Party
2. **Native Integration**: Works with existing Salesforce Data Cloud data
3. **Standard Queries**: Can use standard DMO queries + RAG extensions
4. **Future-Proof**: As Data Cloud adds DMOs, we can adopt them
5. **Semantic Clarity**: DMOs have well-defined semantics that LLMs understand

---

## Conclusion: The Ontology Mindset

Think of this ontology as:

1. **A Real-World Blueprint**
   - Describes what data *means* (not just what it *is*)
   - Models real-world entities (documents, people, products) and their relationships
   - Enables LLMs to reason about the world, not just pattern-match text

2. **Built on Proven Foundations**
   - Leverages 89+ standard Data Cloud DMOs
   - Extends them with RAG-specific embellishments
   - Creates custom DMOs only when necessary

3. **Optimized for Deterministic RAG**
   - Authority hierarchies ensure consistent source prioritization
   - Version chains ensure temporal currency
   - Validation links ensure claim traceability
   - Relationships enable multi-hop reasoning

4. **Auto-Generated, Not Manual**
   - LLM prompts extract metadata during ingestion
   - Edge tables built automatically from detected relationships
   - No manual configuration required

**The Result:** Enterprise RAG that delivers accurate, consistent, authoritative answers - grounded in semantic metadata and knowledge graphs.
