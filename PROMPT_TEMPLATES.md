# Auto-Generation Prompt Templates for RAG Knowledge Graph

**Version:** 1.0
**Purpose:** LLM prompts for automatic KG generation from enterprise documents

---

## Overview

These prompts are executed during RAG pipeline setup to automatically extract metadata and build the knowledge graph without manual configuration. Each prompt is designed to output structured JSON matching the DMO schemas.

---

## Template 1: Document Classification & Metadata Extraction

### Prompt ID: `document_classification_v1`
### Model: Claude Sonnet 4.5
### Output Format: JSON (DocumentDMO schema)

```markdown
# Document Classification and Metadata Extraction

You are analyzing an enterprise document to extract structured metadata for a knowledge graph that powers deterministic RAG.

## Input Document
- **Title:** {document_title}
- **Source:** {document_source}
- **Content:** {document_content}

## Task
Extract the following information and return it as structured JSON matching the DocumentDMO schema:

### 1. Document Classification

**authority_level** (required):
Classify as one of: Official | Draft | Internal | Public

Classification rules:
- **Official**: Engineering specifications, approved product manuals, legal documents, compliance documents, official policies
  * Look for approval stamps, official letterhead, engineering department attribution
  * Presence of approval chains, version control, formal document numbers

- **Draft**: Work-in-progress documents, documents marked "DRAFT", documents pending approval
  * Look for draft watermarks, "pending review" status, incomplete sections

- **Internal**: Internal communications, training materials, internal memos, process documentation
  * Look for "internal use only" markers, training department attribution

- **Public**: Marketing collateral, public-facing content, press releases, advertisements
  * Look for marketing language, customer-facing design, promotional content

**content_type** (required):
Classify as one of: TechnicalSpec | ProductManual | MarketingCollateral | TrainingMaterial | SalesPresentation | PolicyDocument | ComplianceDoc

Classification rules:
- **TechnicalSpec**: Detailed technical specifications, engineering documents, design specifications
- **ProductManual**: User manuals, operation guides, maintenance guides
- **MarketingCollateral**: Brochures, one-pagers, promotional materials
- **TrainingMaterial**: Training guides, learning modules, educational content
- **SalesPresentation**: Sales decks, pitch materials, proposal templates
- **PolicyDocument**: Corporate policies, procedures, governance documents
- **ComplianceDoc**: Regulatory compliance documents, certifications, audit reports

**validation_status**:
Determine if the document contains validated claims:
- **Validated**: Contains references to test reports, certifications, QA documentation
- **Unvalidated**: No validation evidence found
- **Pending**: Mentions validation is in progress

### 2. Source Metadata

**source_department** (required):
Identify the department that created/published this document.

Look for:
- Author email domains (e.g., powertrain.engineering@company.com → Engineering/Powertrain)
- Document properties/metadata
- Approval chains
- Document headers/footers

Classify as one of: Engineering | Marketing | Product | Sales | Legal | Compliance | Training | Other

If you can identify a specific sub-department, provide the full path (e.g., "Engineering/Powertrain/ElectricDrives")

**author_name** (if available):
Extract the primary author's name from document metadata or author fields.

**approver_names** (if available):
Extract names of individuals who approved the document from approval chains or signature blocks.

### 3. Temporal Metadata

**created_date** (if available):
Extract the creation date from document metadata.

**last_modified_date** (if available):
Extract the last modification date.

**effective_date** (if available):
When does this information become valid/effective?
Look for phrases like "effective from", "valid from", "applies to model year"

**expiration_date** (if available):
When does this information become obsolete?
Look for phrases like "valid until", "superseded by", "end of life"

**model_year** (if applicable):
For product documentation, extract the model year.
Look for phrases like "2024 model year", "MY2024", "2024 GLA"

### 4. Product Associations

**products_mentioned** (array):
Extract all product names, models, variants mentioned in the document.

Examples:
- "GLA 200", "GLA 250", "GLA-Class"
- "C-Class", "E-Class"
- "AMG Line", "Premium Package"

For each product, extract:
- Product name
- Model variant (if mentioned)
- Model year (if mentioned)
- Feature packages (if mentioned)

### 5. Document Relationships

**references_to_other_documents** (array):
Extract mentions of other documents, including:
- Document titles referenced
- Document numbers/IDs
- URLs/hyperlinks to other documents
- Phrases like "see also", "refer to", "as described in"

**supersession_information**:
Does this document supersede or replace an older document?
Look for phrases like:
- "This document replaces..."
- "Supersedes document XYZ"
- "Version 2.0 - replaces v1.0"

**validation_references**:
Are there references to validation evidence?
Look for mentions of:
- Test reports (e.g., "WLTP test report dated...")
- Certifications (e.g., "ISO certified", "EPA certification")
- QA documents (e.g., "Quality assurance report QA-2024-001")

### 6. Reliability Score Calculation

Calculate a reliability_score (0.0-1.0) based on:
- Authority level: Official=1.0, Internal=0.7, Draft=0.5, Public=0.6
- Source department: Engineering=1.0, Product=0.9, Marketing=0.6, Sales=0.5
- Validation status: Validated=1.0, Pending=0.7, Unvalidated=0.5
- Temporal currency: is_current=1.0, older_version=0.7

Formula: reliability_score = (authority_weight + department_weight + validation_weight + currency_weight) / 4

## Output Format

Return a JSON object matching this structure:

```json
{
  "document_id": "auto-generated-uuid",
  "document_title": "extracted or provided title",
  "document_uri": "source URI",
  "document_hash": "SHA-256 hash if available",
  "party_type": "Document",
  "party_status": "Active|Archived|Deprecated",
  "rag_metadata": {
    "document_classification": {
      "authority_level": "Official|Draft|Internal|Public",
      "reliability_score": 0.0-1.0,
      "content_type": "TechnicalSpec|ProductManual|etc",
      "validation_status": "Validated|Unvalidated|Pending"
    },
    "temporal_metadata": {
      "created_date": "ISO 8601 datetime",
      "last_modified_date": "ISO 8601 datetime",
      "effective_date": "ISO 8601 datetime or null",
      "expiration_date": "ISO 8601 datetime or null",
      "model_year": integer or null,
      "is_current": true|false
    },
    "source_metadata": {
      "source_system": "SharePoint|Google Drive|etc",
      "source_department": "Engineering|Marketing|etc",
      "source_department_path": "/Engineering/Powertrain/ElectricDrives or null",
      "author_name": "string or null",
      "approver_names": ["array of strings or empty"]
    }
  },
  "extracted_products": [
    {
      "product_name": "GLA 200",
      "model_variant": "AMG Line or null",
      "model_year": 2024 or null,
      "feature_packages": ["array or empty"]
    }
  ],
  "extracted_relationships": {
    "references_documents": [
      {
        "referenced_title": "string",
        "reference_type": "Citation|Dependency|SeeAlso"
      }
    ],
    "supersedes_documents": ["array of document titles/IDs or empty"],
    "validation_references": [
      {
        "validation_type": "TestReport|Certification|QADoc",
        "description": "string"
      }
    ]
  },
  "extraction_metadata": {
    "extraction_timestamp": "ISO 8601 datetime",
    "extraction_model": "claude-sonnet-4-5",
    "extraction_confidence": 0.0-1.0
  }
}
```

## Important Guidelines

1. Be conservative with classifications - when uncertain, choose the less authoritative option
2. Always provide a confidence score for your extraction (extraction_metadata.extraction_confidence)
3. If a required field cannot be determined, set it to null but note this in a "notes" field
4. For dates, always use ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)
5. Normalize product names (e.g., "GLA-Class 200" → "GLA 200")
6. Extract model years even if written as "MY2024" or "model year 2024" → 2024

## Example Output

```json
{
  "document_id": "550e8400-e29b-41d4-a716-446655440000",
  "document_title": "GLA 200 Technical Specification - Model Year 2024",
  "document_uri": "sharepoint://engineering/specs/GLA_200_MY2024_TechSpec_v3.2.pdf",
  "document_hash": "a3b2c1d4e5f6...",
  "party_type": "Document",
  "party_status": "Active",
  "rag_metadata": {
    "document_classification": {
      "authority_level": "Official",
      "reliability_score": 0.95,
      "content_type": "TechnicalSpec",
      "validation_status": "Validated"
    },
    "temporal_metadata": {
      "created_date": "2024-01-15T10:30:00Z",
      "last_modified_date": "2024-03-20T14:45:00Z",
      "effective_date": "2024-04-01T00:00:00Z",
      "expiration_date": null,
      "model_year": 2024,
      "is_current": true
    },
    "source_metadata": {
      "source_system": "SharePoint",
      "source_department": "Engineering",
      "source_department_path": "/Engineering/Powertrain/Gasoline",
      "author_name": "Dr. Hans Mueller",
      "approver_names": ["Thomas Schmidt - Chief Engineer", "Dr. Anna Weber - VP Engineering"]
    }
  },
  "extracted_products": [
    {
      "product_name": "GLA 200",
      "model_variant": "Standard",
      "model_year": 2024,
      "feature_packages": []
    }
  ],
  "extracted_relationships": {
    "references_documents": [
      {
        "referenced_title": "WLTP Test Procedure Manual v2.1",
        "reference_type": "Dependency"
      },
      {
        "referenced_title": "Engine Test Report WLTP-2024-GLA200-001",
        "reference_type": "Citation"
      }
    ],
    "supersedes_documents": ["GLA_200_MY2023_TechSpec_v2.8.pdf"],
    "validation_references": [
      {
        "validation_type": "TestReport",
        "description": "WLTP Test Report dated 2024-02-15 validating performance claims"
      }
    ]
  },
  "extraction_metadata": {
    "extraction_timestamp": "2024-11-09T10:00:00Z",
    "extraction_model": "claude-sonnet-4-5",
    "extraction_confidence": 0.92
  }
}
```

Now analyze the provided document and return the structured JSON output.
```

---

## Template 2: Feature & Specification Extraction

### Prompt ID: `feature_extraction_v1`
### Model: Claude Sonnet 4.5
### Output Format: JSON (ContentFeatureDMO array)

```markdown
# Technical Feature and Specification Extraction

You are extracting technical features, specifications, and product claims from an enterprise document to build a knowledge graph for deterministic RAG.

## Input Document
- **Title:** {document_title}
- **Content:** {document_content}
- **Document Classification:** {document_classification}

## Task
Extract all technical features, specifications, performance claims, and product features mentioned in the document.

### What to Extract

1. **Technical Specifications**
   - Engine specifications (displacement, power, torque, etc.)
   - Dimension specifications (length, width, height, wheelbase, etc.)
   - Weight specifications (curb weight, gross weight, payload, etc.)
   - Fuel consumption / efficiency ratings
   - Emissions data

2. **Performance Claims**
   - Acceleration (0-100 km/h, 0-60 mph, etc.)
   - Top speed
   - Range (for EVs)
   - Towing capacity
   - Braking distance

3. **Product Features**
   - Standard equipment
   - Optional equipment
   - Feature packages
   - Technology features (ADAS, infotainment, etc.)

4. **Safety Features**
   - Active safety systems
   - Passive safety systems
   - Safety ratings

5. **Comfort Features**
   - Interior features
   - Seating configurations
   - Climate control features

### For Each Feature Extract:

**feature_name** (required):
Normalized, machine-readable name using snake_case
Examples:
- "acceleration_0_100_kmh"
- "engine_displacement_liters"
- "fuel_consumption_combined_wltp"
- "adaptive_cruise_control"

**feature_description** (required):
Human-readable description of the feature

**feature_type** (required):
Classify as: TechnicalSpecification | PerformanceClaim | ProductFeature | SafetyFeature | ComfortFeature

**numeric_values** (if applicable):
If the feature has a numeric value:
- **value**: The number (e.g., 7.1, 1.6, 250)
- **unit**: The unit (e.g., "seconds", "liters", "km/h", "kW", "Nm")
- **context**: Full text context from the document

Examples:
```json
{
  "value": 7.1,
  "unit": "seconds",
  "context": "Acceleration from 0-100 km/h in just 7.1 seconds"
}
```

**validation_indicators**:
Look for validation evidence in the text:
- Test standard mentions (WLTP, NEDC, EPA, ISO)
- Test report references
- Certification mentions
- Lab test results

If found, set `has_validation_reference: true` and capture the reference text.

### Extraction Rules

1. **Normalize units**: Convert all measurements to standard units
   - Speed: km/h (not mph unless specified for US market)
   - Power: kW (provide PS/hp as secondary)
   - Torque: Nm
   - Fuel consumption: L/100km (or mpg for US)

2. **Extract ranges**: If a range is given, extract min and max
   - Example: "Fuel consumption: 6.5-7.2 L/100km"
   - Extract as: `value_min: 6.5, value_max: 7.2`

3. **Extract conditional values**: Note conditions
   - Example: "Top speed: 240 km/h (electronically limited)"
   - Capture condition: "electronically limited"

4. **Identify conflicts**: If you extract multiple different values for the same feature (e.g., two different acceleration figures), flag this for conflict detection

## Output Format

Return a JSON array of features:

```json
[
  {
    "feature_id": "auto-generated-uuid",
    "feature_name": "normalized_snake_case_name",
    "feature_description": "Human-readable description",
    "feature_metadata": {
      "feature_type": "TechnicalSpecification|PerformanceClaim|ProductFeature|SafetyFeature|ComfortFeature",
      "confidence_score": 0.0-1.0,
      "numeric_values": {
        "value": number or null,
        "value_min": number or null,
        "value_max": number or null,
        "unit": "string or null",
        "context": "full text context from document",
        "condition": "any conditions or qualifiers"
      },
      "validation_status": {
        "has_validation_reference": true|false,
        "validation_reference_text": "string or null",
        "test_standard": "WLTP|NEDC|EPA|ISO|etc or null"
      },
      "product_association": {
        "product_name": "GLA 200",
        "model_year": 2024 or null,
        "is_standard": true|false|null,
        "is_optional": true|false|null,
        "feature_package": "string or null"
      }
    },
    "extraction_metadata": {
      "extraction_confidence": 0.0-1.0,
      "extraction_source": "direct_statement|inferred|calculated"
    }
  }
]
```

## Example Output

```json
[
  {
    "feature_id": "f1e8d7c6-b5a4-4c3b-a2b1-c0d9e8f7a6b5",
    "feature_name": "acceleration_0_100_kmh",
    "feature_description": "Acceleration from 0 to 100 km/h",
    "feature_metadata": {
      "feature_type": "PerformanceClaim",
      "confidence_score": 0.95,
      "numeric_values": {
        "value": 7.1,
        "value_min": null,
        "value_max": null,
        "unit": "seconds",
        "context": "The GLA 200 accelerates from 0-100 km/h in just 7.1 seconds, as validated by WLTP testing procedures.",
        "condition": null
      },
      "validation_status": {
        "has_validation_reference": true,
        "validation_reference_text": "as validated by WLTP testing procedures",
        "test_standard": "WLTP"
      },
      "product_association": {
        "product_name": "GLA 200",
        "model_year": 2024,
        "is_standard": true,
        "is_optional": false,
        "feature_package": null
      }
    },
    "extraction_metadata": {
      "extraction_confidence": 0.95,
      "extraction_source": "direct_statement"
    }
  },
  {
    "feature_id": "a2b3c4d5-e6f7-4a5b-9c8d-7e6f5a4b3c2d",
    "feature_name": "fuel_consumption_combined_wltp",
    "feature_description": "Combined fuel consumption (WLTP cycle)",
    "feature_metadata": {
      "feature_type": "TechnicalSpecification",
      "confidence_score": 0.92,
      "numeric_values": {
        "value": 6.8,
        "value_min": 6.5,
        "value_max": 7.2,
        "unit": "L/100km",
        "context": "Fuel consumption (combined WLTP): 6.5-7.2 L/100km",
        "condition": "depending on equipment and tire configuration"
      },
      "validation_status": {
        "has_validation_reference": true,
        "validation_reference_text": "WLTP",
        "test_standard": "WLTP"
      },
      "product_association": {
        "product_name": "GLA 200",
        "model_year": 2024,
        "is_standard": true,
        "is_optional": false,
        "feature_package": null
      }
    },
    "extraction_metadata": {
      "extraction_confidence": 0.92,
      "extraction_source": "direct_statement"
    }
  },
  {
    "feature_id": "b3c4d5e6-f7a8-4b5c-9d8e-7f6a5b4c3d2e",
    "feature_name": "mbux_infotainment_system",
    "feature_description": "MBUX (Mercedes-Benz User Experience) infotainment system with touchscreen",
    "feature_metadata": {
      "feature_type": "ProductFeature",
      "confidence_score": 0.88,
      "numeric_values": null,
      "validation_status": {
        "has_validation_reference": false,
        "validation_reference_text": null,
        "test_standard": null
      },
      "product_association": {
        "product_name": "GLA 200",
        "model_year": 2024,
        "is_standard": true,
        "is_optional": false,
        "feature_package": "Standard equipment"
      }
    },
    "extraction_metadata": {
      "extraction_confidence": 0.88,
      "extraction_source": "direct_statement"
    }
  }
]
```

## Important Guidelines

1. Extract ONLY features explicitly mentioned in the document - do not infer or add features
2. For numeric values, extract exactly as stated - do not convert or round unless necessary for unit normalization
3. Capture the full context text for traceability
4. Flag any validation references you find (test standards, certifications, etc.)
5. If the same feature appears multiple times with different values, extract all instances and flag for conflict detection
6. Provide confidence scores based on:
   - Clarity of the statement (0.9-1.0 for clear, specific statements)
   - Ambiguity of the text (0.7-0.9 for somewhat ambiguous)
   - Inferred information (0.5-0.7 for inferred values)

Now analyze the provided document and return the structured JSON array of extracted features.
```

---

## Template 3: Relationship Detection

### Prompt ID: `relationship_detection_v1`
### Model: Claude Sonnet 4.5
### Output Format: JSON (DocumentRelationshipDMO array)

```markdown
# Document Relationship Detection

You are analyzing documents to detect relationships between them for a knowledge graph that powers deterministic RAG.

## Input Documents
- **Document A:** {document_a_title} (ID: {document_a_id})
  - Content: {document_a_content}
  - Metadata: {document_a_metadata}

- **Document B:** {document_b_title} (ID: {document_b_id})
  - Content: {document_b_content}
  - Metadata: {document_b_metadata}

## Task
Determine the relationships between these two documents.

### Relationship Types to Detect

#### 1. **Supersedes / SupersededBy**
Document A supersedes Document B if:
- Explicit statements: "This document replaces...", "Supersedes...", "Obsoletes..."
- Version progression: v2.0 → v1.0, "Updated version of..."
- Temporal replacement: Same topic but newer effective date

#### 2. **References**
Document A references Document B if:
- Explicit citations: "As described in [Doc B]..."
- Hyperlinks to Document B
- "See also", "Refer to", "For more information see..."

Classify reference type as:
- **Citation**: Formal reference to support a statement
- **Dependency**: Document A requires Document B to be understood
- **SeeAlso**: Supplementary reference

#### 3. **Supports**
Document A supports Document B if:
- Document A provides evidence for claims in Document B
- Document A contains detailed specifications that back up summary in Document B
- Document A is test data validating performance claims in Document B

Classify support type as:
- **Evidence**: Test reports, certifications validating claims
- **Detail**: Detailed specifications supporting high-level summaries
- **Example**: Examples or case studies illustrating concepts

#### 4. **Validates**
Document A validates Document B if:
- Document A is a test report validating claims in Document B
- Document A is a certification document for claims in Document B
- Document A contains QA/validation data for Document B

#### 5. **Contradicts**
Document A contradicts Document B if:
- Same feature/specification has different values
- Conflicting statements about product capabilities
- Incompatible effective dates or applicability

Classify contradiction severity as:
- **Critical**: Major specification differences (e.g., 7.1s vs 8.5s acceleration)
- **Moderate**: Moderate differences that might confuse users
- **Minor**: Minor wording differences or rounding variations

#### 6. **Updates**
Document A updates Document B if:
- Document A provides corrections or amendments to Document B
- Document A is an addendum or supplement
- Document A contains change notices for Document B

### Analysis Method

1. **Content Analysis**:
   - Search for explicit relationship keywords in both documents
   - Compare document titles and metadata for version indicators
   - Compare extracted features for consistency/conflicts

2. **Metadata Comparison**:
   - Compare creation dates, effective dates
   - Compare version numbers
   - Compare document classifications and authority levels

3. **Feature Comparison** (if features have been extracted):
   - Compare numeric values for same features
   - Flag discrepancies as potential contradictions

## Output Format

Return a JSON array of detected relationships:

```json
[
  {
    "relationship_id": "auto-generated-uuid",
    "source_document_id": "uuid",
    "target_document_id": "uuid",
    "relationship_type": "Supersedes|SupersededBy|References|Supports|Validates|Contradicts|Updates",
    "relationship_strength": 0.0-1.0,
    "effective_date": "ISO 8601 datetime or null",
    "relationship_metadata": {
      "detection_method": "LLM-Analysis|Metadata-Parsing|Feature-Comparison",
      "detection_confidence": 0.0-1.0,
      "auto_detected": true,
      "evidence": [
        "Text excerpts or metadata showing the relationship"
      ]
    },
    "type_specific_metadata": {
      "reference_type": "Citation|Dependency|SeeAlso (for References only)",
      "support_type": "Evidence|Detail|Example (for Supports only)",
      "contradiction_severity": "Critical|Moderate|Minor (for Contradicts only)",
      "conflicting_features": ["array of feature names (for Contradicts only)"]
    }
  }
]
```

## Example Output

```json
[
  {
    "relationship_id": "r1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f",
    "source_document_id": "doc-uuid-v3.2",
    "target_document_id": "doc-uuid-v2.8",
    "relationship_type": "Supersedes",
    "relationship_strength": 0.95,
    "effective_date": "2024-04-01T00:00:00Z",
    "relationship_metadata": {
      "detection_method": "Metadata-Parsing",
      "detection_confidence": 0.95,
      "auto_detected": true,
      "evidence": [
        "Version progression: v3.2 → v2.8",
        "Document metadata shows v3.2 'replaces' v2.8",
        "Effective date of v3.2 is after v2.8"
      ]
    },
    "type_specific_metadata": null
  },
  {
    "relationship_id": "r2e3f4a5-b6c7-4d8e-9f0a-1b2c3d4e5f6a",
    "source_document_id": "test-report-uuid",
    "target_document_id": "marketing-doc-uuid",
    "relationship_type": "Validates",
    "relationship_strength": 0.88,
    "effective_date": "2024-02-15T00:00:00Z",
    "relationship_metadata": {
      "detection_method": "LLM-Analysis",
      "detection_confidence": 0.88,
      "auto_detected": true,
      "evidence": [
        "Test report contains WLTP validation of acceleration claim",
        "Marketing doc references this test report number",
        "Numeric values match: 7.1 seconds acceleration"
      ]
    },
    "type_specific_metadata": {
      "support_type": "Evidence"
    }
  },
  {
    "relationship_id": "r3f4a5b6-c7d8-4e9f-0a1b-2c3d4e5f6a7b",
    "source_document_id": "marketing-doc-uuid",
    "target_document_id": "tech-spec-uuid",
    "relationship_type": "Contradicts",
    "relationship_strength": 0.75,
    "effective_date": null,
    "relationship_metadata": {
      "detection_method": "Feature-Comparison",
      "detection_confidence": 0.75,
      "auto_detected": true,
      "evidence": [
        "Marketing doc: fuel consumption 6.5 L/100km",
        "Tech spec: fuel consumption 6.8 L/100km",
        "Discrepancy of 0.3 L/100km detected"
      ]
    },
    "type_specific_metadata": {
      "contradiction_severity": "Moderate",
      "conflicting_features": ["fuel_consumption_combined_wltp"]
    }
  },
  {
    "relationship_id": "r4a5b6c7-d8e9-4f0a-1b2c-3d4e5f6a7b8c",
    "source_document_id": "product-manual-uuid",
    "target_document_id": "tech-spec-uuid",
    "relationship_type": "References",
    "relationship_strength": 0.92,
    "effective_date": null,
    "relationship_metadata": {
      "detection_method": "LLM-Analysis",
      "detection_confidence": 0.92,
      "auto_detected": true,
      "evidence": [
        "Product manual states: 'For detailed technical specifications, refer to document GLA_200_TechSpec_v3.2'",
        "Hyperlink found pointing to technical specification document"
      ]
    },
    "type_specific_metadata": {
      "reference_type": "Dependency"
    }
  }
]
```

## Important Guidelines

1. Only detect relationships with high confidence (> 0.7) - be conservative
2. Always provide evidence for detected relationships
3. For contradictions, calculate severity based on:
   - Impact on user decisions (Critical: performance/safety specs differ significantly)
   - Magnitude of difference (>10% difference → Moderate/Critical)
   - Context (Minor: rounding differences, formatting variations)
4. Check both explicit statements AND implicit indicators (metadata, versions, dates)
5. If no relationships are detected, return an empty array - do not force relationships

Now analyze the provided documents and return the structured JSON array of detected relationships.
```

---

## Implementation Notes

### Prompt Execution Flow

```yaml
rag_pipeline_ingestion:
  for_each_document:

    step_1_classification:
      prompt: document_classification_v1
      input:
        document_title: from_source_metadata
        document_source: from_source_metadata
        document_content: extracted_text
      output: DocumentDMO_json

    step_2_feature_extraction:
      prompt: feature_extraction_v1
      input:
        document_title: from_source_metadata
        document_content: extracted_text
        document_classification: from_step_1
      output: ContentFeatureDMO_array

  after_all_documents_processed:

    step_3_relationship_detection:
      prompt: relationship_detection_v1
      for_each_document_pair:
        input:
          document_a: {title, content, metadata}
          document_b: {title, content, metadata}
        output: DocumentRelationshipDMO_array

    step_4_conflict_detection:
      compare_features: from_step_2
      detect_contradictions: numeric_value_discrepancies
      output: additional_DocumentRelationshipDMO (type=Contradicts)
```

### Batch Processing Optimization

- Process documents in parallel where possible
- Use smaller prompts for quick classification, detailed prompts for feature extraction
- Cache common patterns (e.g., department classifications)
- Relationship detection can be done pairwise with smart sampling (don't compare all pairs)

### Quality Assurance

- Set minimum confidence thresholds (e.g., > 0.7 for auto-acceptance)
- Flag low-confidence extractions for human review
- Track extraction accuracy over time to refine prompts
- Implement feedback loops: user corrections → prompt improvements

---

## Versioning Strategy

- Prompts are versioned (v1, v2, etc.)
- When improving prompts, create new versions rather than editing
- Track which prompt version was used for each extraction (in extraction_metadata)
- Allow re-processing documents with newer prompt versions

---
