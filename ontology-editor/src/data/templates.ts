import { Template } from '@/types';

/**
 * Templates are pre-configured sets of object types and link types
 * that help users quickly set up common ontology patterns.
 *
 * Template Categories:
 * - starter: Basic templates for getting started
 * - industry: Industry-specific templates (retail, healthcare, finance)
 * - use-case: Templates for specific use cases (RAG, Customer 360)
 * - custom: User-created templates
 */

export const templates: Template[] = [
  // ============================================================================
  // STARTER TEMPLATES
  // ============================================================================
  {
    id: 'customer_360',
    name: 'Customer 360',
    displayName: 'Customer 360',
    description: 'Complete customer view with accounts, contacts, and interactions. Includes standard CRM object types and relationships for a unified customer profile.',
    color: '#0176d3',
    icon: 'Users',
    category: 'starter',
    objectTypes: ['account', 'individual'],
    linkTypes: ['member_of'],
    memberCount: 3,
    lastModified: '2024-01-17T14:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    isFavorite: true,
    isBuiltIn: true,
  },

  {
    id: 'product_catalog',
    name: 'Product Catalog',
    displayName: 'Product Catalog',
    description: 'Product information management with categories, brands, and product relationships. Perfect for e-commerce and retail applications.',
    color: '#9050e9',
    icon: 'Package',
    category: 'starter',
    objectTypes: ['product', 'brand', 'product_category'],
    linkTypes: ['describes_product', 'belongs_to_brand', 'belongs_to_category', 'applies_to_product'],
    memberCount: 7,
    lastModified: '2024-01-17T14:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    isFavorite: true,
    isBuiltIn: true,
  },

  // ============================================================================
  // USE-CASE TEMPLATES
  // ============================================================================
  {
    id: 'rag_knowledge_graph',
    name: 'RAG Knowledge Graph',
    displayName: 'RAG Knowledge Graph',
    description: 'Deterministic RAG with authority scoring. Includes Documents, Features, Validation Evidence, and all necessary relationships for building a knowledge retrieval system.',
    color: '#0ea5e9',
    icon: 'Brain',
    category: 'use-case',
    objectTypes: ['document', 'content_feature', 'validation_evidence', 'document_relationship', 'document_version', 'retrieval_context'],
    linkTypes: ['authored_by', 'published_by', 'describes_product', 'supersedes', 'contains_feature', 'validated_by', 'contradicts', 'references'],
    memberCount: 14,
    lastModified: '2024-01-17T14:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    isFavorite: true,
    isBuiltIn: true,
  },

  {
    id: 'document_management',
    name: 'Document Management',
    displayName: 'Document Management',
    description: 'Document lifecycle management with versioning, authorship tracking, and approval workflows. Ideal for compliance and content management.',
    color: '#6366f1',
    icon: 'FileText',
    category: 'use-case',
    objectTypes: ['document', 'document_version', 'document_relationship', 'individual'],
    linkTypes: ['authored_by', 'approved_by', 'supersedes', 'references'],
    memberCount: 8,
    lastModified: '2024-01-17T14:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    isFavorite: false,
    isBuiltIn: true,
  },

  {
    id: 'authority_tracking',
    name: 'Authority Tracking',
    displayName: 'Authority & Provenance',
    description: 'Track document authority, authorship, and organizational attribution. Essential for compliance, auditing, and trusted content retrieval.',
    color: '#16a34a',
    icon: 'Shield',
    category: 'use-case',
    objectTypes: ['individual', 'party'],
    linkTypes: ['authored_by', 'approved_by', 'published_by', 'member_of'],
    memberCount: 6,
    lastModified: '2024-01-17T14:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    isFavorite: false,
    isBuiltIn: true,
  },

  {
    id: 'support_case_management',
    name: 'Support Cases',
    displayName: 'Support Case Management',
    description: 'Support case tracking with escalation paths and resolution workflows. Includes case-to-document and case-to-customer relationships.',
    color: '#dc2626',
    icon: 'HelpCircle',
    category: 'use-case',
    objectTypes: ['case', 'individual', 'account'],
    linkTypes: ['member_of'],
    memberCount: 4,
    lastModified: '2024-01-17T14:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    isFavorite: false,
    isBuiltIn: true,
  },

  // ============================================================================
  // INDUSTRY TEMPLATES
  // ============================================================================
  {
    id: 'retail_commerce',
    name: 'Retail Commerce',
    displayName: 'Retail & Commerce',
    description: 'Complete retail ontology with products, customers, orders, and inventory. Optimized for e-commerce and omnichannel retail operations.',
    color: '#f59e0b',
    icon: 'ShoppingCart',
    category: 'industry',
    objectTypes: ['product', 'brand', 'product_category', 'account', 'individual'],
    linkTypes: ['describes_product', 'belongs_to_brand', 'belongs_to_category', 'applies_to_product', 'member_of'],
    memberCount: 10,
    lastModified: '2024-01-17T14:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    isFavorite: false,
    isBuiltIn: true,
  },

  {
    id: 'healthcare',
    name: 'Healthcare',
    displayName: 'Healthcare & Life Sciences',
    description: 'Healthcare ontology with patients, providers, and clinical documents. Includes HIPAA-compliant patterns for medical data management.',
    color: '#ec4899',
    icon: 'Heart',
    category: 'industry',
    objectTypes: ['individual', 'party', 'document', 'case'],
    linkTypes: ['authored_by', 'published_by', 'member_of'],
    memberCount: 7,
    lastModified: '2024-01-17T14:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    isFavorite: false,
    isBuiltIn: true,
  },

  {
    id: 'financial_services',
    name: 'Financial Services',
    displayName: 'Financial Services',
    description: 'Financial services ontology with accounts, transactions, and compliance tracking. Designed for banking, insurance, and wealth management.',
    color: '#0d9488',
    icon: 'Briefcase',
    category: 'industry',
    objectTypes: ['account', 'individual', 'party', 'engagement'],
    linkTypes: ['member_of', 'published_by'],
    memberCount: 6,
    lastModified: '2024-01-17T14:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    isFavorite: false,
    isBuiltIn: true,
  },

  // ============================================================================
  // SPECIALIZED TEMPLATES
  // ============================================================================
  {
    id: 'content_validation',
    name: 'Content Validation',
    displayName: 'Content Validation',
    description: 'Validate content claims against test reports and certifications. Track feature specifications and evidence-based verification.',
    color: '#22c55e',
    icon: 'ShieldCheck',
    category: 'use-case',
    objectTypes: ['content_feature', 'validation_evidence', 'document'],
    linkTypes: ['contains_feature', 'validated_by', 'contradicts'],
    memberCount: 6,
    lastModified: '2024-01-17T14:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    isFavorite: false,
    isBuiltIn: true,
  },

  {
    id: 'version_control',
    name: 'Version Control',
    displayName: 'Version Control & History',
    description: 'Document versioning with supersession chains and conflict detection. Track document evolution and maintain audit trails.',
    color: '#8b5cf6',
    icon: 'GitBranch',
    category: 'use-case',
    objectTypes: ['document', 'document_version', 'document_relationship'],
    linkTypes: ['supersedes', 'references', 'contradicts'],
    memberCount: 6,
    lastModified: '2024-01-17T14:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    isFavorite: false,
    isBuiltIn: true,
  },

  {
    id: 'analytics_engagement',
    name: 'Analytics & Engagement',
    displayName: 'Analytics & Engagement',
    description: 'Track user engagement, retrieval patterns, and content analytics. Measure RAG system effectiveness and user interactions.',
    color: '#ec4899',
    icon: 'BarChart3',
    category: 'use-case',
    objectTypes: ['retrieval_context', 'engagement', 'individual'],
    linkTypes: [],
    memberCount: 3,
    lastModified: '2024-01-17T14:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    isFavorite: false,
    isBuiltIn: true,
  },
];

// Also export as 'groups' for backward compatibility during transition
export const groups = templates;

export default templates;
