import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui';

export default function Admin() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {});
    api.get('/admin/users').then(r => setUsers(r.data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-bg text-white p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(stats).map(([k, v]) => (
              <div key={k} className="bg-card rounded-xl p-4">
                <div className="text-muted text-xs uppercase">{k}</div>
                <div className="text-2xl font-bold">{String(v)}</div>
              </div>
            ))}
          </div>
        )}
        <div className="bg-card rounded-xl p-4">
          <h2 className="font-semibold mb-3">Users</h2>
          <div className="space-y-2">
            {users.map(u => (
              <div key={u._id} className="flex items-center justify-between py-2 border-b border-slate-800">
                <div>{u.name} <span className="text-muted text-xs">@{u.username}</span></div>
                <div className="flex gap-2">
                  <Button className="text-xs" onClick={() => api.patch(`/admin/users/${u._id}/suspend`).then(() => api.get('/admin/users').then(r => setUsers(r.data)))}>Suspend</Button>
                  <Button className="text-xs" onClick={() => api.delete(`/admin/users/${u._id}`).then(() => api.get('/admin/users').then(r => setUsers(r.data)))}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <a href="/" className="text-primary">← Back to chat</a>
      </div>
    </div>
  );
}
