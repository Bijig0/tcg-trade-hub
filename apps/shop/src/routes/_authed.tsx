import { createFileRoute, Outlet, Navigate } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

export const Route = createFileRoute('/_authed')({
  component: AuthedLayout,
});

function AuthedLayout() {
  const { user, roles, isLoading, signOut } = useAuth();
  const hasSignedOut = useRef(false);
  const wasRejected = useRef(false);

  const isShopOwner = roles.includes('shop_owner');

  useEffect(() => {
    if (!isLoading && user && !isShopOwner && !hasSignedOut.current) {
      hasSignedOut.current = true;
      wasRejected.current = true;
      signOut();
    }
  }, [isLoading, user, isShopOwner, signOut]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    if (wasRejected.current) {
      return <Navigate to="/auth/login" search={{ error: 'unauthorized' }} />;
    }
    return <Navigate to="/auth/login" />;
  }

  if (!isShopOwner) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <Outlet />;
}
