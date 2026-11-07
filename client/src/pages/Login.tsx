import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { Button, Input } from '@/components/ui';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore(s => s.setAuth);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/login', { identifier, password });
      setAuth(data.user, data.accessToken);
      navigate('/');
    } catch (err: any) { setError(err.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <form onSubmit={submit} className="bg-card p-8 rounded-2xl w-full max-w-md space-y-4 shadow-xl">
        <h1 className="text-2xl font-bold text-center">NexusChat</h1>
        <p className="text-muted text-center text-sm">Sign in to continue</p>
        {error && <div className="text-danger text-sm">{error}</div>}
        <Input placeholder="Email or username" value={identifier} onChange={(e: any) => setIdentifier(e.target.value)} required />
        <div className="relative">
          <Input type={show ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e: any) => setPassword(e.target.value)} required />
          <button type="button" className="absolute right-3 top-2 text-muted text-sm" onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</button>
        </div>
        <Button className="w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</Button>
        <p className="text-center text-sm text-muted">No account? <Link to="/register" className="text-primary">Register</Link></p>
      </form>
    </div>
  );
}
