import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { DiscoverPage } from '@/components/Discover';
import { ObjectTypesPage, ObjectTypeDetail } from '@/components/ObjectTypes';
import { LinkTypesPage, LinkTypeDetail } from '@/components/LinkTypes';
import { TemplatesPage } from '@/components/Templates';
import { PropertiesPage } from '@/components/Properties';

// Placeholder pages for routes not yet implemented
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-ontology-900 mb-4">{title}</h1>
      <p className="text-ontology-600">This page is under construction.</p>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Main Discovery Page */}
          <Route index element={<DiscoverPage />} />

          {/* Object Types */}
          <Route path="object-types" element={<ObjectTypesPage />} />
          <Route path="object-types/new" element={<PlaceholderPage title="New Object Type" />} />
          <Route path="object-types/:id" element={<ObjectTypeDetail />} />

          {/* Link Types */}
          <Route path="link-types" element={<LinkTypesPage />} />
          <Route path="link-types/:id" element={<LinkTypeDetail />} />

          {/* Templates */}
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="templates/new" element={<PlaceholderPage title="New Template" />} />
          <Route path="templates/:id" element={<PlaceholderPage title="Template Details" />} />

          {/* Legacy Groups routes - redirect to templates */}
          <Route path="groups" element={<TemplatesPage />} />
          <Route path="groups/:id" element={<PlaceholderPage title="Template Details" />} />

          {/* Properties */}
          <Route path="properties" element={<PropertiesPage />} />
          <Route path="shared-properties" element={<PropertiesPage />} />

          {/* Actions */}
          <Route path="action-types" element={<PlaceholderPage title="Action Types" />} />
          <Route path="action-types/new" element={<PlaceholderPage title="New Action Type" />} />

          {/* Interfaces */}
          <Route path="interfaces" element={<PlaceholderPage title="Interfaces" />} />

          {/* Advanced */}
          <Route path="value-types" element={<PlaceholderPage title="Value Types" />} />
          <Route path="functions" element={<PlaceholderPage title="Functions" />} />

          {/* Health */}
          <Route path="health-issues" element={<PlaceholderPage title="Health Issues" />} />
          <Route path="cleanup" element={<PlaceholderPage title="Cleanup" />} />

          {/* Proposals & History */}
          <Route path="proposals" element={<PlaceholderPage title="Proposals" />} />
          <Route path="history" element={<PlaceholderPage title="History" />} />

          {/* Settings */}
          <Route path="settings" element={<PlaceholderPage title="Ontology Configuration" />} />

          {/* Catch all */}
          <Route path="*" element={<PlaceholderPage title="Page Not Found" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
