import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { CsvImportFlow } from '@/features/collection/components/CsvImportFlow/CsvImportFlow';

export const Route = createFileRoute('/_authed/dashboard/collection/import')({
  component: ImportPage,
});

function ImportPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Import Collection</h2>
      <CsvImportFlow
        onSuccess={() => navigate({ to: '/dashboard/collection' })}
      />
    </div>
  );
}
