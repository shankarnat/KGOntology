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
