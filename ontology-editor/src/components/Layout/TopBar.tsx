import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Command,
  GitBranch,
  ChevronDown,
  Plus,
  Database,
  Link2,
  Grid3X3,
  Zap,
} from 'lucide-react';
import clsx from 'clsx';
import { useOntologyStore } from '@/hooks/useOntologyStore';

interface DropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function DropdownMenu({ isOpen, onClose, children }: DropdownMenuProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-10"
        onClick={onClose}
      />
      <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-ontology-200 py-1 z-20">
        {children}
      </div>
    </>
  );
}

interface DropdownItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function DropdownItem({ icon, label, onClick }: DropdownItemProps) {
  return (
    <button
      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-ontology-700 hover:bg-ontology-50 transition-colors"
      onClick={onClick}
    >
      <span className="w-5 h-5 flex items-center justify-center text-ontology-500">
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}

export function TopBar() {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, currentBranch, setCurrentBranch } = useOntologyStore();
  const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const branches = ['Main', 'Development', 'Feature/RAG-Improvements', 'Hotfix/Authority-Scoring'];

  return (
    <header className="h-14 bg-white border-b border-ontology-200 flex items-center justify-between px-4">
      {/* Logo and Title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-sf-blue-500 to-sf-blue-600 rounded-lg flex items-center justify-center shadow-sm">
          <Database className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-lg font-semibold text-ontology-900">
          Ontology Management
        </h1>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-xl mx-8">
        <div
          className={clsx(
            'relative flex items-center',
            isSearchFocused && 'ring-2 ring-sf-blue-500 rounded-lg'
          )}
        >
          <div className="absolute left-3 text-ontology-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by name, RID, aliases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="w-full pl-10 pr-16 py-2 rounded-lg border border-ontology-200 text-sm text-ontology-900 placeholder:text-ontology-400 focus:outline-none focus:border-transparent"
          />
          <div className="absolute right-3 flex items-center gap-1 text-ontology-400">
            <Command className="w-3 h-3" />
            <span className="text-xs">K</span>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Branch Selector */}
        <div className="relative">
          <button
            onClick={() => setIsBranchMenuOpen(!isBranchMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-ontology-200 hover:bg-ontology-50 transition-colors"
          >
            <GitBranch className="w-4 h-4 text-ontology-500" />
            <span className="text-sm font-medium text-ontology-700">
              {currentBranch}
            </span>
            <ChevronDown className="w-4 h-4 text-ontology-400" />
          </button>

          <DropdownMenu
            isOpen={isBranchMenuOpen}
            onClose={() => setIsBranchMenuOpen(false)}
          >
            {branches.map((branch) => (
              <button
                key={branch}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors',
                  branch === currentBranch
                    ? 'bg-sf-blue-50 text-sf-blue-700'
                    : 'text-ontology-700 hover:bg-ontology-50'
                )}
                onClick={() => {
                  setCurrentBranch(branch);
                  setIsBranchMenuOpen(false);
                }}
              >
                <GitBranch className="w-4 h-4" />
                <span>{branch}</span>
              </button>
            ))}
            <div className="border-t border-ontology-100 my-1" />
            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-sf-blue-600 hover:bg-ontology-50 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Create new branch</span>
            </button>
          </DropdownMenu>
        </div>

        {/* New Button */}
        <div className="relative">
          <button
            onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-sf-blue-500 text-white hover:bg-sf-blue-600 transition-colors"
          >
            <span className="text-sm font-medium">New</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          <DropdownMenu
            isOpen={isNewMenuOpen}
            onClose={() => setIsNewMenuOpen(false)}
          >
            <DropdownItem
              icon={<Database className="w-4 h-4" />}
              label="Object type"
              onClick={() => {
                navigate('/object-types/new');
                setIsNewMenuOpen(false);
              }}
            />
            <DropdownItem
              icon={<Link2 className="w-4 h-4" />}
              label="Link type"
              onClick={() => {
                navigate('/link-types/new');
                setIsNewMenuOpen(false);
              }}
            />
            <DropdownItem
              icon={<Grid3X3 className="w-4 h-4" />}
              label="Group"
              onClick={() => {
                navigate('/groups/new');
                setIsNewMenuOpen(false);
              }}
            />
            <DropdownItem
              icon={<Zap className="w-4 h-4" />}
              label="Action type"
              onClick={() => {
                navigate('/action-types/new');
                setIsNewMenuOpen(false);
              }}
            />
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
