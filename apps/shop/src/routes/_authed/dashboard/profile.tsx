import { createFileRoute } from '@tanstack/react-router';
import { ShopProfileEditor } from '@/features/shop-profile/components/ShopProfileEditor';

export const Route = createFileRoute('/_authed/dashboard/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Shop Profile</h2>
      <ShopProfileEditor />
    </div>
  );
}
