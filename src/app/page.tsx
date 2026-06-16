'use client';

import { AppShell } from '@/components/home/AppShell';
import { useHomeController } from '@/hooks/useHomeController';

export default function Home() {
  const home = useHomeController();

  return <AppShell home={home} />;
}
