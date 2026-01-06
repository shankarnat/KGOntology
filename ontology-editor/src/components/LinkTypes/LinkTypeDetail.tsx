import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  Edit2,
  Trash2,
  Copy,
  ChevronRight,
  AlertCircle,
  ArrowRight,
  Database,
  List,
  Settings,
  Link2,
} from 'lucide-react';
import clsx from 'clsx';
import { useOntologyStore } from '@/hooks/useOntologyStore';
import { Card, CardBody, CardHeader, Badge, IconBox } from '@/components/common';
import { formatDistanceToNow } from 'date-fns';

export function LinkTypeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getLinkTypeById,
    getDMOById,
    toggleLinkTypeFavorite,
    groups,
  } = useOntologyStore();

  const linkType = getLinkTypeById(id || '');

  if (!linkType) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <AlertCircle className="w-12 h-12 text-ontology-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-ontology-700 mb-2">
            Link type not found
          </h2>
          <p className="text-ontology-500 mb-4">
            The link type "{id}" does not exist.
          </p>
          <button
            onClick={() => navigate('/link-types')}
            className="btn btn-primary"
          >
            Back to Link Types
          </button>
        </div>
      </div>
    );
  }

  const sourceDMO = getDMOById(linkType.sourceObjectType);
  const targetDMO = getDMOById(linkType.targetObjectType);

  // Get groups
  const linkGroups = groups.filter(g => linkType.groups.includes(g.id));

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-ontology-500 mb-6">
        <Link
          to="/link-types"
          className="hover:text-ontology-700 transition-colors"
        >
          Link types
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-ontology-900 font-medium">{linkType.displayName}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${linkType.color}15` }}
          >
            <Link2 className="w-7 h-7" style={{ color: linkType.color }} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-ontology-900">
                {linkType.displayName}
              </h1>
              <button
                onClick={() => toggleLinkTypeFavorite(linkType.id)}
                className={clsx(
                  'p-1 rounded transition-colors',
                  linkType.isFavorite
                    ? 'text-yellow-500'
                    : 'text-ontology-300 hover:text-yellow-500'
                )}
              >
                <Star
                  className="w-5 h-5"
                  fill={linkType.isFavorite ? 'currentColor' : 'none'}
                />
              </button>
              {linkType.isRequired && (
                <Badge variant="red">Required</Badge>
              )}
              {linkType.isDeprecated && (
                <Badge variant="yellow">Deprecated</Badge>
              )}
            </div>
            <p className="text-ontology-600 font-mono mb-2">{linkType.name}</p>
            <p className="text-sm text-ontology-500 max-w-2xl">{linkType.description}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary">
            <Edit2 className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button className="btn btn-secondary">
            <Copy className="w-4 h-4" />
            <span>Duplicate</span>
          </button>
          <button className="btn btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Relationship Visualization */}
      <Card className="mb-8">
        <CardBody>
          <div className="flex items-center justify-center gap-4 py-6">
            {/* Source */}
            <Link
              to={`/object-types/${sourceDMO?.id}`}
              className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-ontology-50 transition-colors"
            >
              {sourceDMO && (
                <IconBox name={sourceDMO.icon} color={sourceDMO.color} size="lg" />
              )}
              <div className="text-center">
                <div className="font-semibold text-ontology-900">
                  {sourceDMO?.displayName || linkType.sourceObjectType}
                </div>
                <div className="text-xs text-ontology-500">Source</div>
              </div>
            </Link>

            {/* Arrow with relationship */}
            <div className="flex-1 max-w-md flex items-center gap-2">
              <div
                className={clsx(
                  'flex-1 h-1 rounded',
                  linkType.lineStyle === 'dashed' && 'border-t-4 border-dashed h-0',
                  linkType.lineStyle === 'dotted' && 'border-t-4 border-dotted h-0',
                )}
                style={{
                  backgroundColor: linkType.lineStyle === 'solid' ? linkType.color : 'transparent',
                  borderColor: linkType.color,
                }}
              />
              <div
                className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap shadow-sm"
                style={{
                  backgroundColor: `${linkType.color}15`,
                  color: linkType.color,
                  border: `1px solid ${linkType.color}30`,
                }}
              >
                {linkType.sourceDisplayName}
              </div>
              <div
                className={clsx(
                  'flex-1 h-1 rounded',
                  linkType.lineStyle === 'dashed' && 'border-t-4 border-dashed h-0',
                  linkType.lineStyle === 'dotted' && 'border-t-4 border-dotted h-0',
                )}
                style={{
                  backgroundColor: linkType.lineStyle === 'solid' ? linkType.color : 'transparent',
                  borderColor: linkType.color,
                }}
              />
              <ArrowRight className="w-6 h-6" style={{ color: linkType.color }} />
            </div>

            {/* Target */}
            <Link
              to={`/object-types/${targetDMO?.id}`}
              className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-ontology-50 transition-colors"
            >
              {targetDMO && (
                <IconBox name={targetDMO.icon} color={targetDMO.color} size="lg" />
              )}
              <div className="text-center">
                <div className="font-semibold text-ontology-900">
                  {targetDMO?.displayName || linkType.targetObjectType}
                </div>
                <div className="text-xs text-ontology-500">Target</div>
              </div>
            </Link>
          </div>

          {/* Bidirectional indicator */}
          {linkType.direction === 'bidirectional' && (
            <div className="text-center text-sm text-ontology-500 border-t border-ontology-100 pt-4">
              <Badge variant="blue">Bidirectional</Badge>
              <span className="ml-2">
                Inverse: <strong>{linkType.targetDisplayName}</strong>
              </span>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card>
          <CardBody className="text-center">
            <div className="text-3xl font-bold text-ontology-900 mb-1">
              {linkType.linkCount.toLocaleString()}
            </div>
            <div className="text-sm text-ontology-500">Total Links</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-3xl font-bold text-ontology-900 mb-1">
              {linkType.cardinality.split('-')[0]}
            </div>
            <div className="text-sm text-ontology-500">Source Cardinality</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-3xl font-bold text-ontology-900 mb-1">
              {linkType.cardinality.split('-')[2] || linkType.cardinality.split('-')[1]}
            </div>
            <div className="text-sm text-ontology-500">Target Cardinality</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-3xl font-bold text-ontology-900 mb-1">
              {linkType.properties.length}
            </div>
            <div className="text-sm text-ontology-500">Edge Properties</div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Edge Properties */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-ontology-900 flex items-center gap-2">
                  <List className="w-4 h-4 text-ontology-500" />
                  Edge Properties
                  <Badge variant="gray">{linkType.properties.length}</Badge>
                </h2>
                <button className="text-sm text-sf-blue-600 hover:text-sf-blue-700 font-medium">
                  Add property
                </button>
              </div>
            </CardHeader>
            {linkType.properties.length > 0 ? (
              <div className="divide-y divide-ontology-100">
                {linkType.properties.map(prop => (
                  <div
                    key={prop.id}
                    className="px-4 py-3 flex items-center justify-between hover:bg-ontology-50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-ontology-900">
                          {prop.displayName}
                        </span>
                        {prop.required && (
                          <Badge variant="red">Required</Badge>
                        )}
                        {prop.indexed && (
                          <Badge variant="blue">Indexed</Badge>
                        )}
                      </div>
                      <span className="text-xs text-ontology-500 font-mono">{prop.name}</span>
                      {prop.description && (
                        <p className="text-xs text-ontology-500 mt-1">{prop.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="gray">{prop.dataType}</Badge>
                      {prop.validation?.enumValues && (
                        <div className="flex gap-1">
                          {prop.validation.enumValues.slice(0, 3).map(v => (
                            <Badge key={v} variant="purple">{v}</Badge>
                          ))}
                          {prop.validation.enumValues.length > 3 && (
                            <Badge variant="gray">+{prop.validation.enumValues.length - 3}</Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <CardBody>
                <div className="text-center py-8 text-ontology-500">
                  <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No edge properties defined.</p>
                  <p className="text-xs mt-1">Edge properties store metadata about the relationship.</p>
                </div>
              </CardBody>
            )}
          </Card>

          {/* Usage Examples */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-ontology-900 flex items-center gap-2">
                <Settings className="w-4 h-4 text-ontology-500" />
                Query Examples
              </h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-ontology-500 uppercase mb-2 block">
                    Graph Query (Cypher)
                  </label>
                  <pre className="bg-ontology-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`MATCH (source:${sourceDMO?.name || 'Source'})-[r:${linkType.name}]->(target:${targetDMO?.name || 'Target'})
RETURN source, r, target
LIMIT 100`}
                  </pre>
                </div>
                <div>
                  <label className="text-xs font-semibold text-ontology-500 uppercase mb-2 block">
                    Find Related
                  </label>
                  <pre className="bg-ontology-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`MATCH (s:${sourceDMO?.name || 'Source'} {id: $sourceId})-[:${linkType.name}]->(t:${targetDMO?.name || 'Target'})
RETURN t`}
                  </pre>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Metadata */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-ontology-900">Details</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-ontology-500 uppercase">
                  Cardinality
                </label>
                <p className="text-ontology-900">{linkType.cardinality}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-ontology-500 uppercase">
                  Direction
                </label>
                <p className="text-ontology-900 capitalize">{linkType.direction}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-ontology-500 uppercase">
                  Line Style
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className={clsx(
                      'w-16 h-0.5',
                      linkType.lineStyle === 'dashed' && 'border-t-2 border-dashed h-0',
                      linkType.lineStyle === 'dotted' && 'border-t-2 border-dotted h-0',
                    )}
                    style={{
                      backgroundColor: linkType.lineStyle === 'solid' ? linkType.color : 'transparent',
                      borderColor: linkType.color,
                    }}
                  />
                  <span className="text-ontology-700 capitalize">{linkType.lineStyle}</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-ontology-500 uppercase">
                  Source Display
                </label>
                <p className="text-ontology-900">"{linkType.sourceDisplayName}"</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-ontology-500 uppercase">
                  Target Display
                </label>
                <p className="text-ontology-900">"{linkType.targetDisplayName}"</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-ontology-500 uppercase">
                  Last Modified
                </label>
                <p className="text-ontology-900">
                  {formatDistanceToNow(new Date(linkType.lastModified), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-ontology-500 uppercase">
                  Created
                </label>
                <p className="text-ontology-900">
                  {formatDistanceToNow(new Date(linkType.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Groups */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-ontology-900">Groups</h2>
                <button className="text-sm text-sf-blue-600 hover:text-sf-blue-700 font-medium">
                  Manage
                </button>
              </div>
            </CardHeader>
            <CardBody>
              {linkGroups.length > 0 ? (
                <div className="space-y-2">
                  {linkGroups.map(group => (
                    <Link
                      key={group.id}
                      to={`/groups/${group.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-ontology-50 transition-colors"
                    >
                      <span
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: group.color }}
                      />
                      <span className="text-sm font-medium text-ontology-900">
                        {group.displayName}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ontology-500">
                  Not assigned to any groups.
                </p>
              )}
            </CardBody>
          </Card>

          {/* Connected Objects */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-ontology-900">Connected Object Types</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <Link
                  to={`/object-types/${sourceDMO?.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-ontology-50 transition-colors"
                >
                  {sourceDMO && (
                    <IconBox name={sourceDMO.icon} color={sourceDMO.color} size="sm" />
                  )}
                  <div>
                    <div className="text-sm font-medium text-ontology-900">
                      {sourceDMO?.displayName}
                    </div>
                    <div className="text-xs text-ontology-500">Source</div>
                  </div>
                </Link>
                <Link
                  to={`/object-types/${targetDMO?.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-ontology-50 transition-colors"
                >
                  {targetDMO && (
                    <IconBox name={targetDMO.icon} color={targetDMO.color} size="sm" />
                  )}
                  <div>
                    <div className="text-sm font-medium text-ontology-900">
                      {targetDMO?.displayName}
                    </div>
                    <div className="text-xs text-ontology-500">Target</div>
                  </div>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default LinkTypeDetail;
