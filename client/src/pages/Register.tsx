import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { Button, Input } from '@/components/ui';

export default function Register() {
  const [form, setForm] = useState({ name: '', username: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore(s => s.setAuth);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/register', { name: form.name, username: form.username, email: form.email, phone: form.phone, password: form.password });
      setAuth(data.user, data.accessToken);
      navigate('/');
    } catch (err: any) { setError(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  }

  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <form onSubmit={submit} className="bg-card p-8 rounded-2xl w-full max-w-md space-y-3 shadow-xl">
        <h1 className="text-2xl font-bold text-center">Create account</h1>
        <Input placeholder="Full name" value={form.name} onChange={set('name')} required />
        <Input placeholder="Username" value={form.username} onChange={set('username')} required />
        <Input type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
        <Input placeholder="Phone" value={form.phone} onChange={set('phone')} />
        <Input type="password" placeholder="Password" value={form.password} onChange={set('password')} required />
        <Input type="password" placeholder="Confirm password" value={form.confirm} onChange={set('confirm')} required />
        <Button className="w-full" disabled={loading}>{loading ? 'Creating...' : 'Register'}</Button>
        {error && <div className="text-danger text-sm">{error}</div>}
        <p className="text-center text-sm text-muted">Have account? <Link to="/login" className="text-primary">Sign in</Link></p>
      </form>
    </div>
  );
}
