import { createFileRoute } from '@tanstack/react-router';
import { GraphViewer } from 'flow-graph/react';

export const Route = createFileRoute('/')({
  component: AdminHome,
});

function AdminHome() {
  return (
    <div style={{ height: '100vh' }}>
      <GraphViewer serverUrl="http://localhost:4243" />
    </div>
  );
}
