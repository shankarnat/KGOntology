# Implementation Roadmap: RAG Knowledge Graph with DMO Foundation

**Purpose:** Step-by-step guide to implement the ontology-grounded RAG system

---

## Phase 1: Foundation Setup (Week 1-2)

### 1.1 Data Cloud DMO Integration

**Objective:** Connect to existing Salesforce Data Cloud DMOs

**Tasks:**
- [ ] Set up Data Cloud connection in Intelligent Context (IC)
- [ ] Identify existing DMOs in your org (Individual, Party, Product, etc.)
- [ ] Map existing DMOs to ontology requirements
- [ ] Verify data quality of core DMOs (Individual, Party, Product)

**Deliverables:**
- Data Cloud connection configuration
- DMO inventory spreadsheet
- Data quality report

**Code Example:**
```python
# Salesforce Data Cloud API connection
import salesforce_cdp

client = salesforce_cdp.Client(
    client_id=os.getenv('SFDC_CLIENT_ID'),
    client_secret=os.getenv('SFDC_CLIENT_SECRET'),
    tenant_url=os.getenv('SFDC_TENANT_URL')
)

# List existing DMOs
dmos = client.list_dmos()
print(f"Found {len(dmos)} DMOs in Data Cloud")

# Verify core DMOs exist
required_dmos = ['Individual', 'Party', 'Product', 'ProductCategory', 'Brand']
for dmo in required_dmos:
    if dmo in dmos:
        print(f"✓ {dmo} DMO found")
    else:
        print(f"✗ {dmo} DMO missing - needs creation")
```

---

### 1.2 Graph Database Setup

**Objective:** Set up graph database for edge tables

**Options:**
- **TigerGraph** (recommended for large-scale)
- **Neo4j** (easier to start)
- **AWS Neptune** (for AWS ecosystems)

**Tasks:**
- [ ] Choose graph database platform
- [ ] Provision database instance
- [ ] Create initial schema for edge tables
- [ ] Set up indexes for performance

**Deliverables:**
- Running graph database instance
- Initial edge table schemas
- Connection credentials

**Code Example (Neo4j):**
```cypher
// Create constraints and indexes
CREATE CONSTRAINT document_id IF NOT EXISTS
FOR (d:Document) REQUIRE d.document_id IS UNIQUE;

CREATE CONSTRAINT individual_id IF NOT EXISTS
FOR (i:Individual) REQUIRE i.individual_id IS UNIQUE;

CREATE CONSTRAINT product_id IF NOT EXISTS
FOR (p:Product) REQUIRE p.product_id IS UNIQUE;

// Create indexes for common queries
CREATE INDEX document_authority IF NOT EXISTS
FOR (d:Document) ON (d.authority_level);

CREATE INDEX document_current IF NOT EXISTS
FOR (d:Document) ON (d.is_current);

CREATE INDEX product_model_year IF NOT EXISTS
FOR (p:Product) ON (p.model_year);
```

---

## Phase 2: Custom DMO Creation (Week 2-3)

### 2.1 Create Document DMO

**Objective:** Implement Document DMO as custom object

**Tasks:**
- [ ] Define Document DMO schema (see DMO_SCHEMA_REFERENCE.json)
- [ ] Create Document table in graph database
- [ ] Implement CRUD operations
- [ ] Set up sync with Salesforce Data Cloud (if applicable)

**Code Example:**
```python
# Document DMO class
from dataclasses import dataclass
from typing import Optional, List
from datetime import datetime
from uuid import uuid4

@dataclass
class DocumentDMO:
    document_id: str
    document_title: str
    document_uri: str
    document_hash: str
    party_type: str = "Document"
    party_status: str = "Active"

    # RAG metadata
    authority_level: str  # Official|Draft|Internal|Public
    reliability_score: float
    content_type: str
    validation_status: str

    # Temporal metadata
    created_date: datetime
    last_modified_date: datetime
    effective_date: Optional[datetime] = None
    expiration_date: Optional[datetime] = None
    model_year: Optional[int] = None
    is_current: bool = True

    # Source metadata
    source_system: str
    source_department_id: Optional[str] = None
    author_id: Optional[str] = None
    approver_ids: List[str] = None

    def __post_init__(self):
        if self.approver_ids is None:
            self.approver_ids = []
        if not self.document_id:
            self.document_id = str(uuid4())

    def to_dict(self):
        return {
            "document_id": self.document_id,
            "document_title": self.document_title,
            "document_uri": self.document_uri,
            "document_hash": self.document_hash,
            "party_type": self.party_type,
            "party_status": self.party_status,
            "rag_metadata": {
                "document_classification": {
                    "authority_level": self.authority_level,
                    "reliability_score": self.reliability_score,
                    "content_type": self.content_type,
                    "validation_status": self.validation_status
                },
                "temporal_metadata": {
                    "created_date": self.created_date.isoformat(),
                    "last_modified_date": self.last_modified_date.isoformat(),
                    "effective_date": self.effective_date.isoformat() if self.effective_date else None,
                    "expiration_date": self.expiration_date.isoformat() if self.expiration_date else None,
                    "model_year": self.model_year,
                    "is_current": self.is_current
                },
                "source_metadata": {
                    "source_system": self.source_system,
                    "source_department_id": self.source_department_id,
                    "author_id": self.author_id,
                    "approver_ids": self.approver_ids
                }
            }
        }
```

---

### 2.2 Create ContentFeature DMO

**Tasks:**
- [ ] Define ContentFeature DMO schema
- [ ] Implement feature extraction logic
- [ ] Create validation linking mechanisms

---

### 2.3 Create ValidationEvidence DMO

**Tasks:**
- [ ] Define ValidationEvidence DMO schema
- [ ] Implement test report parsing
- [ ] Create claim validation workflows

---

## Phase 3: Auto-Generation Pipeline (Week 3-5)

### 3.1 Document Classification Pipeline

**Objective:** Auto-classify documents using LLM prompts

**Tasks:**
- [ ] Implement document ingestion from sources (SharePoint, Google Drive)
- [ ] Set up Claude API integration
- [ ] Implement document_classification_v1 prompt
- [ ] Parse LLM output to DocumentDMO format
- [ ] Store in graph database

**Code Example:**
```python
import anthropic
import hashlib
from datetime import datetime

class DocumentClassificationPipeline:
    def __init__(self, claude_api_key: str, graph_db):
        self.client = anthropic.Anthropic(api_key=claude_api_key)
        self.graph_db = graph_db

    def process_document(self, document_path: str, document_content: str):
        # Calculate document hash
        doc_hash = hashlib.sha256(document_content.encode()).hexdigest()

        # Load classification prompt template
        with open('PROMPT_TEMPLATES.md') as f:
            prompt_template = self.extract_template(f.read(), 'document_classification_v1')

        # Fill in template
        prompt = prompt_template.format(
            document_title=document_path.split('/')[-1],
            document_source=document_path,
            document_content=document_content[:50000]  # Limit context
        )

        # Call Claude
        response = self.client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=4096,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        # Parse JSON response
        import json
        classification = json.loads(response.content[0].text)

        # Create DocumentDMO
        doc = DocumentDMO(
            document_id=classification.get('document_id', str(uuid4())),
            document_title=classification['document_title'],
            document_uri=classification['document_uri'],
            document_hash=doc_hash,
            authority_level=classification['rag_metadata']['document_classification']['authority_level'],
            reliability_score=classification['rag_metadata']['document_classification']['reliability_score'],
            content_type=classification['rag_metadata']['document_classification']['content_type'],
            validation_status=classification['rag_metadata']['document_classification']['validation_status'],
            created_date=datetime.fromisoformat(classification['rag_metadata']['temporal_metadata']['created_date']),
            last_modified_date=datetime.now(),
            source_system=classification['rag_metadata']['source_metadata']['source_system']
        )

        # Store in graph database
        self.graph_db.create_document(doc)

        return doc

    def extract_template(self, markdown: str, template_id: str) -> str:
        # Extract specific prompt template from markdown
        # Implementation depends on template format
        pass
```

---

### 3.2 Feature Extraction Pipeline

**Tasks:**
- [ ] Implement feature_extraction_v1 prompt
- [ ] Parse numeric values with units
- [ ] Link features to products and documents
- [ ] Detect validation references

**Code Example:**
```python
class FeatureExtractionPipeline:
    def __init__(self, claude_api_key: str, graph_db):
        self.client = anthropic.Anthropic(api_key=claude_api_key)
        self.graph_db = graph_db

    def extract_features(self, document: DocumentDMO, content: str):
        # Load feature extraction prompt
        prompt = self.load_prompt('feature_extraction_v1', {
            'document_title': document.document_title,
            'document_content': content,
            'document_classification': document.content_type
        })

        # Call Claude
        response = self.client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=8192,
            messages=[{"role": "user", "content": prompt}]
        )

        # Parse features
        features = json.loads(response.content[0].text)

        # Create ContentFeature DMOs and edges
        for feature_data in features:
            feature = ContentFeatureDMO(
                feature_id=feature_data['feature_id'],
                feature_name=feature_data['feature_name'],
                feature_description=feature_data['feature_description'],
                # ... other fields
            )

            # Store feature
            self.graph_db.create_feature(feature)

            # Create edge: Document → CONTAINS_FEATURE → Feature
            self.graph_db.create_edge(
                'CONTAINS_FEATURE',
                from_id=document.document_id,
                to_id=feature.feature_id,
                properties={
                    'extraction_confidence': feature_data['extraction_metadata']['extraction_confidence']
                }
            )

        return features
```

---

### 3.3 Relationship Detection Pipeline

**Tasks:**
- [ ] Implement pairwise document comparison
- [ ] Detect supersession relationships
- [ ] Detect reference relationships
- [ ] Detect contradictions via feature comparison

---

## Phase 4: Edge Table Population (Week 5-6)

### 4.1 Core Relationship Edges

**Objective:** Populate edge tables for key relationships

**Edge Types to Implement:**

| Edge Type | From | To | Priority |
|-----------|------|-----|----------|
| AUTHORED_BY | Document | Individual | P0 |
| PUBLISHED_BY | Document | Department | P0 |
| DESCRIBES_PRODUCT | Document | Product | P0 |
| CONTAINS_FEATURE | Document | ContentFeature | P1 |
| SUPERSEDES | Document | Document | P1 |
| VALIDATED_BY | ContentFeature | ValidationEvidence | P1 |
| WORKS_IN | Individual | Department | P2 |

**Code Example (Neo4j):**
```cypher
// Create AUTHORED_BY edge
MATCH (d:Document {document_id: $doc_id})
MATCH (i:Individual {individual_id: $author_id})
CREATE (d)-[r:AUTHORED_BY {
    authorship_role: $role,
    contribution_percentage: $contribution,
    created_at: datetime()
}]->(i)
RETURN r;

// Create DESCRIBES_PRODUCT edge
MATCH (d:Document {document_id: $doc_id})
MATCH (p:Product {product_id: $product_id})
CREATE (d)-[r:DESCRIBES_PRODUCT {
    model_year: $model_year,
    description_completeness: $completeness,
    market_region: $region
}]->(p)
RETURN r;
```

---

## Phase 5: Retrieval Integration (Week 6-8)

### 5.1 Graph-Grounded Retrieval

**Objective:** Implement retrieval that uses graph structure + vector similarity

**Architecture:**
```
Query → Entity Resolution → Graph Walk → Document Filtering → Vector Search → Ranking → Answer
```

**Code Example:**
```python
class GraphGroundedRetrieval:
    def __init__(self, graph_db, vector_db, llm_client):
        self.graph = graph_db
        self.vector = vector_db
        self.llm = llm_client

    def retrieve(self, query: str, top_k: int = 5):
        # Step 1: Entity resolution
        entities = self.extract_entities(query)
        # "GLA 200" → Product(id=xyz)

        # Step 2: Graph walk to find relevant documents
        cypher_query = """
        MATCH (p:Product {product_name: $product_name, model_year: $model_year})
        MATCH (p)<-[:DESCRIBES_PRODUCT]-(d:Document)
        WHERE d.is_current = true
          AND d.authority_level IN ['Official', 'Internal']
        MATCH (d)-[:PUBLISHED_BY]->(dept:Department)
        RETURN d, dept.authority_level as dept_authority
        ORDER BY dept_authority DESC, d.reliability_score DESC
        """

        graph_results = self.graph.query(cypher_query, {
            'product_name': entities['product'],
            'model_year': entities.get('model_year')
        })

        # Step 3: Filter to high-authority documents
        doc_ids = [r['d']['document_id'] for r in graph_results[:20]]

        # Step 4: Vector search within filtered set
        query_embedding = self.vector.embed(query)
        vector_results = self.vector.search(
            embedding=query_embedding,
            filter={'document_id': {'$in': doc_ids}},
            top_k=top_k
        )

        # Step 5: Authority-weighted ranking
        ranked_results = self.rank_by_authority(vector_results, graph_results)

        return ranked_results

    def rank_by_authority(self, vector_results, graph_results):
        # Combine vector similarity + authority score
        for result in vector_results:
            doc_id = result['document_id']
            # Find graph metadata
            graph_meta = next((r for r in graph_results if r['d']['document_id'] == doc_id), None)
            if graph_meta:
                # Authority boost
                authority_boost = graph_meta['dept_authority'] / 5.0  # Normalize to 0-1
                result['final_score'] = (result['similarity_score'] * 0.6) + (authority_boost * 0.4)
            else:
                result['final_score'] = result['similarity_score']

        return sorted(vector_results, key=lambda x: x['final_score'], reverse=True)
```

---

### 5.2 Conflict Detection & Resolution

**Objective:** Detect and resolve contradictions in retrieved documents

**Code Example:**
```python
class ConflictDetection:
    def detect_conflicts(self, feature_name: str, product_id: str):
        # Find all documents mentioning this feature for this product
        cypher_query = """
        MATCH (p:Product {product_id: $product_id})
        MATCH (p)<-[:APPLIES_TO]-(f:ContentFeature {feature_name: $feature_name})
        MATCH (f)<-[:CONTAINS_FEATURE]-(d:Document)
        RETURN d, f.numeric_value as value, f.unit as unit,
               d.authority_level as authority, d.reliability_score as reliability
        """

        results = self.graph.query(cypher_query, {
            'product_id': product_id,
            'feature_name': feature_name
        })

        # Check for value conflicts
        values = [r['value'] for r in results]
        if len(set(values)) > 1:
            # Conflict detected!
            # Resolve by highest authority
            authoritative = max(results, key=lambda r: r['reliability'])

            # Log conflict
            print(f"⚠️  Conflict detected for {feature_name}:")
            for r in results:
                print(f"  - {r['value']} {r['unit']} (authority: {r['authority']}, score: {r['reliability']})")
            print(f"✓ Resolved to: {authoritative['value']} {authoritative['unit']} (highest authority)")

            return authoritative['value'], authoritative

        return values[0], results[0]
```

---

## Phase 6: Testing & Validation (Week 8-10)

### 6.1 Unit Tests

**Test Coverage:**
- [ ] Document classification accuracy
- [ ] Feature extraction precision/recall
- [ ] Relationship detection accuracy
- [ ] Graph query performance

**Code Example:**
```python
import pytest

def test_document_classification():
    pipeline = DocumentClassificationPipeline(api_key, graph_db)

    # Test technical spec classification
    doc = pipeline.process_document(
        'test_docs/GLA_200_TechSpec.pdf',
        'Technical Specification for GLA 200...'
    )

    assert doc.authority_level == 'Official'
    assert doc.content_type == 'TechnicalSpec'
    assert doc.reliability_score >= 0.8

def test_feature_extraction():
    pipeline = FeatureExtractionPipeline(api_key, graph_db)

    content = "The GLA 200 accelerates from 0-100 km/h in 7.1 seconds."
    features = pipeline.extract_features(mock_document, content)

    assert len(features) >= 1
    assert any(f['feature_name'] == 'acceleration_0_100_kmh' for f in features)

    accel_feature = next(f for f in features if f['feature_name'] == 'acceleration_0_100_kmh')
    assert accel_feature['numeric_values']['value'] == 7.1
    assert accel_feature['numeric_values']['unit'] == 'seconds'

def test_graph_retrieval():
    retriever = GraphGroundedRetrieval(graph_db, vector_db, llm_client)

    results = retriever.retrieve("What is the GLA 200 acceleration?")

    assert len(results) > 0
    # Highest ranked result should be authoritative
    assert results[0]['authority_level'] in ['Official', 'Internal']
```

---

### 6.2 End-to-End Tests

**Test Scenarios:**
1. **Determinism Test**: Same query returns same answer 10 times
2. **Authority Test**: Engineering specs rank higher than marketing
3. **Currency Test**: Current docs rank higher than archived
4. **Validation Test**: Validated claims preferred over unvalidated
5. **Conflict Resolution Test**: Contradictions resolved correctly

---

### 6.3 Performance Benchmarks

**Metrics to Track:**
- Query latency (target: <500ms)
- Graph traversal time
- LLM extraction time
- End-to-end pipeline throughput

---

## Phase 7: Production Deployment (Week 10-12)

### 7.1 Scalability

**Tasks:**
- [ ] Set up batch processing for large document sets
- [ ] Implement caching for frequent queries
- [ ] Optimize graph indexes
- [ ] Set up monitoring and alerting

---

### 7.2 Continuous Improvement

**Tasks:**
- [ ] Implement feedback collection
- [ ] Track retrieval quality metrics
- [ ] Set up A/B testing framework
- [ ] Create prompt refinement workflow

---

## Success Metrics

### Business Metrics
- **Answer Accuracy**: >95% of answers are factually correct
- **Answer Consistency**: Same query returns same answer 99%+ of the time
- **User Satisfaction**: >4.5/5 average rating
- **Source Trust**: 100% of answers cite authoritative sources

### Technical Metrics
- **Extraction Accuracy**: >90% precision/recall on classification
- **Graph Completeness**: >95% of documents have relationships
- **Query Performance**: <500ms p95 latency
- **System Uptime**: >99.9% availability

---

## Common Pitfalls & Solutions

### Pitfall 1: Over-Engineering
**Problem:** Trying to extract every possible relationship upfront
**Solution:** Start with P0 relationships (AUTHORED_BY, DESCRIBES_PRODUCT), add others iteratively

### Pitfall 2: Poor Entity Resolution
**Problem:** "GLA 200" not matching "GLA-200" or "GLA-Class 200"
**Solution:** Implement entity normalization and aliasing

### Pitfall 3: LLM Extraction Errors
**Problem:** LLM misclassifies documents or extracts incorrect values
**Solution:** Set confidence thresholds, implement human-in-the-loop review for low-confidence extractions

### Pitfall 4: Graph Query Performance
**Problem:** Complex graph walks are slow
**Solution:** Optimize indexes, materialize common paths, use graph database query optimization

---

## Timeline Summary

| Phase | Duration | Key Deliverable |
|-------|----------|-----------------|
| Phase 1: Foundation | 2 weeks | Data Cloud connection, graph DB setup |
| Phase 2: Custom DMOs | 1 week | Document, ContentFeature, ValidationEvidence DMOs |
| Phase 3: Auto-Generation | 2 weeks | Classification + extraction pipelines |
| Phase 4: Edge Tables | 1 week | Populated relationship graphs |
| Phase 5: Retrieval | 2 weeks | Graph-grounded retrieval system |
| Phase 6: Testing | 2 weeks | Validated, tested system |
| Phase 7: Production | 2 weeks | Deployed, monitored system |
| **Total** | **12 weeks** | Production RAG with deterministic answers |

---

## Next Steps

1. **Week 1**: Review this roadmap with stakeholders
2. **Week 1**: Set up development environment
3. **Week 1**: Begin Phase 1 (Foundation Setup)
4. **Ongoing**: Weekly progress reviews and adjustments

---
