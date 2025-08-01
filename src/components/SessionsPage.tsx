
import React from 'react';
import { User } from '@supabase/supabase-js';
import UserSessions from '@/components/UserSessions';

interface SessionsPageProps {
  user: User | null;
}

export default function SessionsPage({ user }: SessionsPageProps) {
  return (
    <div className="space-y-6">
      <UserSessions user={user} />
    </div>
  );
}
