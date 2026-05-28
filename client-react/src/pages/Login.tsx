import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const res = await fetch('/login', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        login(data);
        navigate('/dashboard');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      console.error(err);
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-10">
        <Link to="/" className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
            LA
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-slate-100">CloudLog SIEM</h1>
            <p className="text-sm text-slate-500">Security Analytics Platform</p>
          </div>
        </Link>
        <h2 className="text-2xl font-bold mb-2 text-slate-100">Welcome back</h2>
        <p className="text-slate-400 mb-7">Sign in to access your dashboard</p>

        {error && (
          <div className="bg-red-950/30 border border-red-900/50 text-red-400 rounded-lg px-4 py-3 mb-5 flex items-center gap-2 text-sm">
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition text-slate-100"
              required
              autoFocus
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition text-slate-100"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-semibold rounded-lg transition active:scale-[0.98]"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-500">
          Secure connection • Protected data
        </div>
      </div>
    </div>
  );
};

export default Login;
