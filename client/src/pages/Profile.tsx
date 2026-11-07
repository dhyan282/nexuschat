import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { Button, Input, Avatar } from '@/components/ui';

export default function Profile() {
  const user = useAuthStore(s => s.user)!;
  const setUser = useAuthStore(s => s.setUser);
  const [form, setForm] = useState({ name: user.name, bio: user.bio || '', phone: user.phone || '', avatar: user.avatar || '' });
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch('/users/me', form);
      setUser(data);
    } finally { setSaving(false); }
  }

  return (
    <div className="min-h-screen bg-bg text-white p-8">
      <div className="max-w-2xl mx-auto bg-card rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
        <div className="flex items-center gap-4 mb-6">
          <Avatar src={form.avatar} name={form.name} size={72} />
        </div>
        <form onSubmit={save} className="space-y-3">
          <Input placeholder="Full name" value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Avatar URL" value={form.avatar} onChange={(e: any) => setForm({ ...form, avatar: e.target.value })} />
          <Input placeholder="Phone" value={form.phone} onChange={(e: any) => setForm({ ...form, phone: e.target.value })} />
          <textarea className="w-full px-3 py-2 rounded-lg bg-card border border-slate-700" placeholder="Bio" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
          <Button disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </form>
        <div className="mt-6"><a href="/" className="text-primary">← Back to chat</a></div>
      </div>
    </div>
  );
}
