import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Edit2,
  Trash2,
  Copy,
  MoreHorizontal,
  Link2,
  Database,
  List,
  Settings,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import clsx from 'clsx';
import { useOntologyStore } from '@/hooks/useOntologyStore';
import { Card, CardBody, CardHeader, Badge, IconBox } from '@/components/common';
import { formatDistanceToNow } from 'date-fns';

export function ObjectTypeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getDMOById,
    toggleDMOFavorite,
    linkTypes,
    groups,
    addToRecentlyViewed,
  } = useOntologyStore();

  const dmo = getDMOById(id || '');

  if (!dmo) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <AlertCircle className="w-12 h-12 text-ontology-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-ontology-700 mb-2">
            Object type not found
          </h2>
          <p className="text-ontology-500 mb-4">
            The object type "{id}" does not exist.
          </p>
          <button
            onClick={() => navigate('/object-types')}
            className="btn btn-primary"
          >
            Back to Object Types
          </button>
        </div>
      </div>
    );
  }

  // Track view
  addToRecentlyViewed({
    type: 'dmo',
    id: dmo.id,
    name: dmo.displayName,
    icon: dmo.icon,
    color: dmo.color,
    viewedAt: new Date().toISOString(),
  });

  // Get related link types
  const incomingLinks = linkTypes.filter(lt => lt.targetObjectType === dmo.id);
  const outgoingLinks = linkTypes.filter(lt => lt.sourceObjectType === dmo.id);

  // Get groups
  const dmoGroups = groups.filter(g => dmo.groups.includes(g.id));

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-ontology-500 mb-6">
        <Link
          to="/object-types"
          className="hover:text-ontology-700 transition-colors"
        >
          Object types
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-ontology-900 font-medium">{dmo.displayName}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-start gap-4">
          <IconBox name={dmo.icon} color={dmo.color} size="lg" />
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-ontology-900">
                {dmo.displayName}
              </h1>
              <button
                onClick={() => toggleDMOFavorite(dmo.id)}
                className={clsx(
                  'p-1 rounded transition-colors',
                  dmo.isFavorite
                    ? 'text-yellow-500'
                    : 'text-ontology-300 hover:text-yellow-500'
                )}
              >
                <Star
                  className="w-5 h-5"
                  fill={dmo.isFavorite ? 'currentColor' : 'none'}
                />
              </button>
              {dmo.isProminent && (
                <Badge variant="blue">Prominent</Badge>
              )}
              {dmo.isDeprecated && (
                <Badge variant="red">Deprecated</Badge>
              )}
            </div>
            <p className="text-ontology-600 mb-2">{dmo.name}</p>
            <p className="text-sm text-ontology-500">{dmo.description}</p>
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

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card>
          <CardBody className="text-center">
            <div className="text-3xl font-bold text-ontology-900 mb-1">
              {dmo.objectCount.toLocaleString()}
            </div>
            <div className="text-sm text-ontology-500">Objects</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-3xl font-bold text-sf-blue-600 mb-1">
              {dmo.dependentCount}
            </div>
            <div className="text-sm text-ontology-500">Dependents</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-3xl font-bold text-ontology-900 mb-1">
              {dmo.properties.length}
            </div>
            <div className="text-sm text-ontology-500">Properties</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-3xl font-bold text-ontology-900 mb-1">
              {incomingLinks.length + outgoingLinks.length}
            </div>
            <div className="text-sm text-ontology-500">Link Types</div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Properties */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-ontology-900 flex items-center gap-2">
                  <List className="w-4 h-4 text-ontology-500" />
                  Properties
                  <Badge variant="gray">{dmo.properties.length}</Badge>
                </h2>
                <button className="text-sm text-sf-blue-600 hover:text-sf-blue-700 font-medium">
                  Add property
                </button>
              </div>
            </CardHeader>
            <div className="divide-y divide-ontology-100">
              {dmo.properties.map(prop => (
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
                      {prop.unique && (
                        <Badge variant="purple">Unique</Badge>
                      )}
                      {prop.isShared && (
                        <Badge variant="green">Shared</Badge>
                      )}
                    </div>
                    <span className="text-xs text-ontology-500">{prop.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="gray">{prop.dataType}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Link Types */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-ontology-900 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-ontology-500" />
                Link Types
                <Badge variant="gray">
                  {incomingLinks.length + outgoingLinks.length}
                </Badge>
              </h2>
            </CardHeader>
            <div className="divide-y divide-ontology-100">
              {/* Outgoing Links */}
              {outgoingLinks.length > 0 && (
                <div className="p-4">
                  <h3 className="text-xs font-semibold text-ontology-500 uppercase mb-3">
                    Outgoing ({outgoingLinks.length})
                  </h3>
                  <div className="space-y-2">
                    {outgoingLinks.map(lt => (
                      <Link
                        key={lt.id}
                        to={`/link-types/${lt.id}`}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-ontology-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-0.5"
                            style={{ backgroundColor: lt.color }}
                          />
                          <span className="font-medium text-ontology-900">
                            {lt.displayName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-ontology-500">
                          <span>→</span>
                          <Badge variant="custom" color={getDMOById(lt.targetObjectType)?.color}>
                            {getDMOById(lt.targetObjectType)?.displayName}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Incoming Links */}
              {incomingLinks.length > 0 && (
                <div className="p-4">
                  <h3 className="text-xs font-semibold text-ontology-500 uppercase mb-3">
                    Incoming ({incomingLinks.length})
                  </h3>
                  <div className="space-y-2">
                    {incomingLinks.map(lt => (
                      <Link
                        key={lt.id}
                        to={`/link-types/${lt.id}`}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-ontology-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="custom" color={getDMOById(lt.sourceObjectType)?.color}>
                            {getDMOById(lt.sourceObjectType)?.displayName}
                          </Badge>
                          <span>→</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-ontology-900">
                            {lt.displayName}
                          </span>
                          <div
                            className="w-8 h-0.5"
                            style={{ backgroundColor: lt.color }}
                          />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {incomingLinks.length === 0 && outgoingLinks.length === 0 && (
                <div className="p-8 text-center text-ontology-500">
                  No link types defined for this object type.
                </div>
              )}
            </div>
          </Card>

          {/* RAG Configuration */}
          {dmo.ragConfig && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-ontology-900 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-ontology-500" />
                  RAG Configuration
                </h2>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-ontology-500 uppercase">
                      Include in Retrieval
                    </label>
                    <p className="text-ontology-900">
                      {dmo.ragConfig.includeInRetrieval ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-ontology-500 uppercase">
                      Authority Weight
                    </label>
                    <p className="text-ontology-900">
                      {dmo.ragConfig.authorityWeight}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-ontology-500 uppercase">
                      Embedding Fields
                    </label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {dmo.ragConfig.embeddingFields.map(field => (
                        <Badge key={field} variant="blue">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-ontology-500 uppercase">
                      Filter Fields
                    </label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {dmo.ragConfig.filterFields.map(field => (
                        <Badge key={field} variant="purple">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {dmo.ragConfig.temporalField && (
                    <div>
                      <label className="text-xs font-semibold text-ontology-500 uppercase">
                        Temporal Field
                      </label>
                      <p className="text-ontology-900">
                        {dmo.ragConfig.temporalField}
                      </p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          )}
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
                  Category
                </label>
                <p className="text-ontology-900 capitalize">{dmo.category}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-ontology-500 uppercase">
                  Source
                </label>
                <p className="text-ontology-900 capitalize">
                  {dmo.source}
                  {dmo.basePattern && ` (${dmo.basePattern} pattern)`}
                </p>
              </div>
              {dmo.authorityLevel && (
                <div>
                  <label className="text-xs font-semibold text-ontology-500 uppercase">
                    Authority Level
                  </label>
                  <p className="text-ontology-900 capitalize">
                    {dmo.authorityLevel}
                    {dmo.authorityScore && ` (${dmo.authorityScore})`}
                  </p>
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-ontology-500 uppercase">
                  Primary Key
                </label>
                <p className="text-ontology-900 font-mono text-sm">
                  {dmo.primaryKey}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-ontology-500 uppercase">
                  Last Modified
                </label>
                <p className="text-ontology-900">
                  {formatDistanceToNow(new Date(dmo.lastModified), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-ontology-500 uppercase">
                  Created
                </label>
                <p className="text-ontology-900">
                  {formatDistanceToNow(new Date(dmo.createdAt), {
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
              {dmoGroups.length > 0 ? (
                <div className="space-y-2">
                  {dmoGroups.map(group => (
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
        </div>
      </div>
    </div>
  );

  function getDMOById(id: string) {
    return useOntologyStore.getState().getDMOById(id);
  }
}

export default ObjectTypeDetail;
