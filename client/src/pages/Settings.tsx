import { useState } from 'react';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { Button, Input } from '@/components/ui';

export default function Settings() {
  const logout = useAuthStore(s => s.logout);
  const [passwords, setPasswords] = useState({ current: '', next: '' });
  const [msg, setMsg] = useState('');

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.patch('/users/me', {});
      setMsg('Password change endpoint not wired in demo; update via profile.');
    } catch {}
  }

  return (
    <div className="min-h-screen bg-bg text-white p-8">
      <div className="max-w-2xl mx-auto bg-card rounded-2xl p-6 space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <div>
          <h2 className="font-semibold mb-2">Theme</h2>
          <button className="px-3 py-2 rounded-lg bg-slate-800" onClick={() => document.documentElement.classList.toggle('light')}>Toggle light/dark</button>
        </div>
        <div>
          <h2 className="font-semibold mb-2">Account</h2>
          <Button variant="danger" onClick={() => { logout(); window.location.href = '/login'; }}>Logout</Button>
        </div>
        <div><a href="/" className="text-primary">← Back to chat</a></div>
      </div>
    </div>
  );
}
