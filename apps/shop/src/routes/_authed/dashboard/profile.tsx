import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/orpc';
import { ShopProfileEditor } from '@/features/shop-profile/components/ShopProfileEditor';
import { ShopLocationPreview } from '@/features/shop-profile/components/ShopLocationPreview';

export const Route = createFileRoute('/_authed/dashboard/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  const { data } = useQuery({
    queryKey: ['shop', 'mine'],
    queryFn: () => client.shop.get(),
  });

  const shop = data?.shop;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Shop Profile</h2>
      <div className="flex flex-col gap-8 xl:flex-row">
        <div className="min-w-0 flex-1">
          <ShopProfileEditor />
        </div>
        {shop && (
          <div className="w-full xl:w-[480px] xl:shrink-0">
            <ShopLocationPreview shop={shop} />
          </div>
        )}
      </div>
    </div>
  );
}
