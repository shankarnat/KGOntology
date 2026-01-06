# Data Cloud Ontology Editor

A modern, Palantir-inspired ontology management interface for Salesforce Data Cloud DMOs (Data Model Objects). This editor provides a comprehensive UI for managing Knowledge Graph ontologies designed for deterministic RAG (Retrieval-Augmented Generation) systems.

## Features

### Core Functionality

- **Discover Page**: Customizable landing page with recently viewed, favorite, and prominent object types
- **Object Types (DMOs)**: Full CRUD operations for Data Model Objects
  - Standard DMOs (from Salesforce Data Cloud)
  - Embellished DMOs (extended standard DMOs)
  - Custom DMOs (built on DMO patterns)
- **Link Types (Edges)**: Manage relationships between object types
- **Groups**: Organize object types and link types into logical groups
- **Properties**: Define and manage object properties with full type support

### RAG-Specific Features

- Authority hierarchy configuration (Engineering > Product > Marketing > Support > External)
- Embedding field selection for vector search
- Filter field configuration for graph-based retrieval
- Temporal field support for version-aware queries
- Validation evidence tracking

### UI Highlights

- Clean, professional design inspired by Palantir Ontology Manager
- Responsive layout with sidebar navigation
- Search and filter capabilities across all entities
- Grid and list view modes
- Favorite and prominent item tracking
- Branch management (like git branches for ontology changes)

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Router** for navigation
- **Lucide React** for icons
- **date-fns** for date formatting

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd ontology-editor
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the application.

### Build

```bash
npm run build
```

### Type Checking

```bash
npm run type-check
```

## Project Structure

```
ontology-editor/
├── src/
│   ├── components/
│   │   ├── Layout/          # Sidebar, TopBar, Layout
│   │   ├── Discover/        # Main discovery page
│   │   ├── ObjectTypes/     # DMO management
│   │   ├── LinkTypes/       # Edge management
│   │   ├── Groups/          # Group management
│   │   └── common/          # Shared UI components
│   ├── data/
│   │   ├── standardDMOs.ts  # Salesforce standard DMOs
│   │   ├── customDMOs.ts    # RAG custom DMOs
│   │   ├── linkTypes.ts     # Edge definitions
│   │   └── groups.ts        # Group definitions
│   ├── hooks/
│   │   └── useOntologyStore.ts  # Zustand state
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   ├── styles/
│   │   └── globals.css      # Tailwind + custom styles
│   ├── App.tsx              # Main app with routing
│   └── main.tsx             # Entry point
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Data Model

### DMO (Data Model Object)

Represents an entity type in the ontology:

- **Standard DMOs**: Individual, Party, Product, Brand, ProductCategory, Account, Case, Engagement
- **Custom DMOs**: Document, ContentFeature, ValidationEvidence, DocumentRelationship, DocumentVersion, RetrievalContext

### Link Types (Edges)

Relationships between DMOs:

- AUTHORED_BY, APPROVED_BY (Document → Individual)
- PUBLISHED_BY (Document → Party)
- DESCRIBES_PRODUCT (Document → Product)
- SUPERSEDES, REFERENCES, CONTRADICTS (Document → Document)
- CONTAINS_FEATURE (Document → ContentFeature)
- VALIDATED_BY (ContentFeature → ValidationEvidence)

### Groups

Logical groupings for organization:

- RAG Core, People, Organizations, Catalog
- Documents, Features, Validation
- Versioning, Relationships, Conflicts
- Analytics, Support, CRM

## Integration with Salesforce Data Cloud

This editor is designed to work with Salesforce Data Cloud's DMO framework:

1. **Import existing DMOs** from your Data Cloud instance
2. **Define custom DMOs** using DMO patterns (Party, Case, Engagement)
3. **Configure relationships** for your knowledge graph
4. **Export ontology** for deployment

## License

MIT
