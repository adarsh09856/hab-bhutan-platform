'use client';

import { createContext, useContext } from 'react';
import type { AdminAccessUser } from '@/lib/admin-navigation-access';

export const AdminAccessContext = createContext<{
  user: AdminAccessUser | null;
  loading: boolean;
  destinations: { label: string; href: string }[];
}>({ user: null, loading: true, destinations: [] });

export const useAdminAccess = () => useContext(AdminAccessContext);
