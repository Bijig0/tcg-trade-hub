import { createFileRoute } from '@tanstack/react-router';
import { DemoChat } from '@/components/demo/DemoChat';

export const Route = createFileRoute('/demo')({
  component: DemoPage,
});

function DemoPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <DemoChat />
    </div>
  );
}
