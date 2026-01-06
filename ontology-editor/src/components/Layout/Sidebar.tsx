import { NavLink } from 'react-router-dom';
import {
  Compass,
  FileEdit,
  History,
  Database,
  List,
  Share2,
  Link2,
  Zap,
  Grid3X3,
  Layers,
  CircleDot,
  FunctionSquare,
  AlertTriangle,
  Sparkles,
  Settings,
  ChevronDown,
} from 'lucide-react';
import clsx from 'clsx';
import { useOntologyStore } from '@/hooks/useOntologyStore';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  count?: number;
  indent?: boolean;
}

function SidebarItem({ to, icon, label, count, indent }: SidebarItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          'sidebar-item',
          isActive && 'active',
          indent && 'ml-4'
        )
      }
    >
      <span className="w-5 h-5 flex items-center justify-center text-ontology-500">
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {count !== undefined && (
        <span className="text-xs text-ontology-400 bg-ontology-100 px-2 py-0.5 rounded-full">
          {count.toLocaleString()}
        </span>
      )}
    </NavLink>
  );
}

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
}

function SidebarSection({ title, children }: SidebarSectionProps) {
  return (
    <div className="mb-6">
      <h3 className="px-3 mb-2 text-xs font-semibold text-ontology-400 uppercase tracking-wider">
        {title}
      </h3>
      <nav className="space-y-0.5">{children}</nav>
    </div>
  );
}

export function Sidebar() {
  const { dmos, linkTypes, groups } = useOntologyStore();

  // Calculate stats
  const sharedPropertiesCount = dmos.reduce(
    (sum, dmo) => sum + dmo.properties.filter(p => p.isShared).length,
    0
  );

  return (
    <aside className="w-64 bg-white border-r border-ontology-200 flex flex-col h-full">
      {/* Ontology Selector */}
      <div className="p-4 border-b border-ontology-100">
        <button className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-ontology-50 transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-sf-blue-500 rounded flex items-center justify-center">
              <Database className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-sm text-ontology-900">
              RAG Ontology
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-ontology-400" />
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto scrollbar-thin py-4 px-2">
        {/* Discovery Section */}
        <nav className="space-y-0.5 mb-6">
          <SidebarItem
            to="/"
            icon={<Compass className="w-4 h-4" />}
            label="Discover"
          />
          <SidebarItem
            to="/proposals"
            icon={<FileEdit className="w-4 h-4" />}
            label="Proposals"
          />
          <SidebarItem
            to="/history"
            icon={<History className="w-4 h-4" />}
            label="History"
          />
        </nav>

        {/* Resources Section */}
        <SidebarSection title="Resources">
          <SidebarItem
            to="/object-types"
            icon={<Database className="w-4 h-4" />}
            label="Object types"
            count={dmos.length}
          />
          <SidebarItem
            to="/properties"
            icon={<List className="w-4 h-4" />}
            label="Properties"
          />
          <SidebarItem
            to="/shared-properties"
            icon={<Share2 className="w-4 h-4" />}
            label="Shared Properties"
            count={sharedPropertiesCount}
          />
          <SidebarItem
            to="/link-types"
            icon={<Link2 className="w-4 h-4" />}
            label="Link types"
            count={linkTypes.length}
          />
          <SidebarItem
            to="/action-types"
            icon={<Zap className="w-4 h-4" />}
            label="Action types"
            count={0}
          />
          <SidebarItem
            to="/groups"
            icon={<Grid3X3 className="w-4 h-4" />}
            label="Groups"
            count={groups.length}
          />
          <SidebarItem
            to="/interfaces"
            icon={<Layers className="w-4 h-4" />}
            label="Interfaces"
            count={0}
          />
        </SidebarSection>

        {/* Advanced Section */}
        <SidebarSection title="Advanced">
          <SidebarItem
            to="/value-types"
            icon={<CircleDot className="w-4 h-4" />}
            label="Value types"
            count={12}
          />
          <SidebarItem
            to="/functions"
            icon={<FunctionSquare className="w-4 h-4" />}
            label="Functions"
            count={0}
          />
        </SidebarSection>

        {/* Health Section */}
        <SidebarSection title="Health">
          <SidebarItem
            to="/health-issues"
            icon={<AlertTriangle className="w-4 h-4" />}
            label="Health issues"
          />
          <SidebarItem
            to="/cleanup"
            icon={<Sparkles className="w-4 h-4" />}
            label="Cleanup"
          />
        </SidebarSection>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-ontology-100">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            clsx(
              'sidebar-item',
              isActive && 'active'
            )
          }
        >
          <Settings className="w-4 h-4 text-ontology-500" />
          <span>Ontology configuration</span>
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;
