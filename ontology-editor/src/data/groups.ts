import { Group } from '@/types';

export const groups: Group[] = [
  // RAG Core Groups
  {
    id: 'rag_core',
    name: 'RAG Core',
    displayName: 'RAG Core',
    description: 'Core entities for RAG Knowledge Graph - Documents, Features, Validation',
    color: '#0ea5e9',
    icon: 'Brain',
    objectTypes: ['document', 'content_feature', 'validation_evidence', 'document_relationship', 'document_version', 'retrieval_context'],
    linkTypes: ['authored_by', 'published_by', 'describes_product', 'supersedes', 'contains_feature', 'validated_by', 'contradicts'],
    memberCount: 12,
    lastModified: '2024-01-17T14:00:00Z',
    isFavorite: true,
  },

  // People/Individual related
  {
    id: 'people',
    name: 'People',
    displayName: 'People',
    description: 'Individual entities - Authors, Approvers, Subject Matter Experts',
    color: '#0176d3',
    icon: 'Users',
    objectTypes: ['individual'],
    linkTypes: ['authored_by', 'approved_by', 'member_of'],
    memberCount: 4,
    lastModified: '2024-01-17T14:00:00Z',
    isFavorite: true,
  },

  {
    id: 'rag_authors',
    name: 'RAG Authors',
    displayName: 'RAG Authors',
    description: 'Author entities embellished for RAG authority tracking',
    color: '#3b82f6',
    icon: 'UserCheck',
    objectTypes: ['individual'],
    linkTypes: ['authored_by', 'approved_by'],
    memberCount: 3,
    lastModified: '2024-01-17T14:00:00Z',
    isFavorite: false,
  },

  // Organization related
  {
    id: 'organizations',
    name: 'Organizations',
    displayName: 'Organizations',
    description: 'Party entities - Departments, Companies, External Organizations',
    color: '#2e844a',
    icon: 'Building2',
    objectTypes: ['party', 'account'],
    linkTypes: ['published_by', 'member_of'],
    memberCount: 4,
    lastModified: '2024-01-17T14:00:00Z',
    isFavorite: true,
  },

  {
    id: 'rag_authorities',
    name: 'RAG Authorities',
    displayName: 'RAG Authorities',
    description: 'Department entities with authority scoring for RAG retrieval',
    color: '#16a34a',
    icon: 'Shield',
    objectTypes: ['party'],
    linkTypes: ['published_by'],
    memberCount: 2,
    lastModified: '2024-01-17T14:00:00Z',
    isFavorite: false,
  },

  // Product related
  {
    id: 'catalog',
    name: 'Product Catalog',
    displayName: 'Product Catalog',
    description: 'Product entities - Products, Brands, Categories',
    color: '#9050e9',
    icon: 'Package',
    objectTypes: ['product', 'brand', 'product_category'],
    linkTypes: ['describes_product', 'belongs_to_brand', 'belongs_to_category', 'applies_to_product'],
    memberCount: 7,
    lastModified: '2024-01-17T14:00:00Z',
    isFavorite: true,
  },

  {
    id: 'rag_products',
    name: 'RAG Products',
    displayName: 'RAG Products',
    description: 'Product entities for RAG context filtering',
    color: '#a855f7',
    icon: 'Boxes',
    objectTypes: ['product'],
    linkTypes: ['describes_product', 'applies_to_product'],
    memberCount: 3,
    lastModified: '2024-01-17T14:00:00Z',
    isFavorite: false,
  },

  // Document related
  {
    id: 'documents',
    name: 'Documents',
    displayName: 'Documents',
    description: 'Document and content entities',
    color: '#0ea5e9',
    icon: 'FileText',
    objectTypes: ['document', 'document_version'],
    linkTypes: ['supersedes', 'references', 'contradicts'],
    memberCount: 5,
    lastModified: '2024-01-17T14:00:00Z',
    isFavorite: true,
  },

  // Feature & Validation
  {
    id: 'features',
    name: 'Features',
    displayName: 'Content Features',
    description: 'Extracted specifications and claims from documents',
    color: '#f59e0b',
    icon: 'Sparkles',
    objectTypes: ['content_feature'],
    linkTypes: ['contains_feature'],
    memberCount: 2,
    lastModified: '2024-01-17T14:00:00Z',
    isFavorite: false,
  },

  {
    id: 'validation',
    name: 'Validation',
    displayName: 'Validation Evidence',
    description: 'Test reports, certifications, and validation evidence',
    color: '#22c55e',
    icon: 'ShieldCheck',
    objectTypes: ['validation_evidence'],
    linkTypes: ['validated_by'],
    memberCount: 2,
    lastModified: '2024-01-17T14:00:00Z',
    isFavorite: false,
  },

  // Versioning & Relationships
  {
    id: 'versioning',
    name: 'Versioning',
    displayName: 'Version Control',
    description: 'Document versioning and supersession chains',
    color: '#8b5cf6',
    icon: 'GitBranch',
    objectTypes: ['document_version', 'document_relationship'],
    linkTypes: ['supersedes'],
    memberCount: 3,
    lastModified: '2024-01-17T14:00:00Z',
    isFavorite: false,
  },

  {
    id: 'relationships',
    name: 'Relationships',
    displayName: 'Document Relationships',
    description: 'Cross-document relationships and references',
    color: '#6366f1',
    icon: 'Link',
    objectTypes: ['document_relationship'],
    linkTypes: ['references', 'contradicts'],
    memberCount: 3,
    lastModified: '2024-01-17T14:00:00Z',
    isFavorite: false,
  },

  {
    id: 'conflicts',
    name: 'Conflicts',
    displayName: 'Conflict Detection',
    description: 'Contradiction and conflict tracking between documents',
    color: '#dc2626',
    icon: 'AlertTriangle',
    objectTypes: ['document_relationship'],
    linkTypes: ['contradicts'],
    memberCount: 2,
    lastModified: '2024-01-17T14:00:00Z',
    isFavorite: false,
  },

  // Analytics
  {
    id: 'analytics',
    name: 'Analytics',
    displayName: 'Retrieval Analytics',
    description: 'RAG retrieval tracking and analytics',
    color: '#ec4899',
    icon: 'BarChart3',
    objectTypes: ['retrieval_context', 'engagement'],
    linkTypes: [],
    memberCount: 2,
    lastModified: '2024-01-17T14:00:00Z',
    isFavorite: false,
  },

  // Support
  {
    id: 'support',
    name: 'Support',
    displayName: 'Support Cases',
    description: 'Support case entities from standard Salesforce DMOs',
    color: '#dc2626',
    icon: 'HelpCircle',
    objectTypes: ['case'],
    linkTypes: [],
    memberCount: 1,
    lastModified: '2024-01-17T14:00:00Z',
    isFavorite: false,
  },

  // CRM
  {
    id: 'crm',
    name: 'CRM',
    displayName: 'CRM Entities',
    description: 'Customer relationship management entities',
    color: '#0d9488',
    icon: 'Briefcase',
    objectTypes: ['account'],
    linkTypes: [],
    memberCount: 1,
    lastModified: '2024-01-17T14:00:00Z',
    isFavorite: false,
  },

  // Authorship
  {
    id: 'authorship',
    name: 'Authorship',
    displayName: 'Authorship Tracking',
    description: 'Author and approval relationships',
    color: '#0176d3',
    icon: 'PenTool',
    objectTypes: [],
    linkTypes: ['authored_by', 'approved_by'],
    memberCount: 2,
    lastModified: '2024-01-17T14:00:00Z',
    isFavorite: false,
  },

  // Authority
  {
    id: 'authority',
    name: 'Authority',
    displayName: 'Authority Attribution',
    description: 'Publishing authority and organizational attribution',
    color: '#2e844a',
    icon: 'BadgeCheck',
    objectTypes: [],
    linkTypes: ['published_by'],
    memberCount: 1,
    lastModified: '2024-01-17T14:00:00Z',
    isFavorite: false,
  },

  // Citations
  {
    id: 'citations',
    name: 'Citations',
    displayName: 'Document Citations',
    description: 'Cross-document references and citations',
    color: '#64748b',
    icon: 'Quote',
    objectTypes: [],
    linkTypes: ['references'],
    memberCount: 1,
    lastModified: '2024-01-17T14:00:00Z',
    isFavorite: false,
  },

  // Products (links only)
  {
    id: 'products',
    name: 'Products Links',
    displayName: 'Product Relationships',
    description: 'Product-related link types',
    color: '#9050e9',
    icon: 'LinkIcon',
    objectTypes: [],
    linkTypes: ['describes_product', 'applies_to_product', 'belongs_to_brand', 'belongs_to_category'],
    memberCount: 4,
    lastModified: '2024-01-17T14:00:00Z',
    isFavorite: false,
  },
];

export default groups;
