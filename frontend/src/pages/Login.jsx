import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import AuthShell, { AuthSwitchLink } from './AuthShell';

export default function Login() {
  const login = useStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    const next = {};
    if (!email.trim()) next.email = 'Email is required.';
    if (!password) next.password = 'Password is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      const destination = location.state?.from || '/guild';
      navigate(destination, { replace: true });
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed. Check your credentials.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      icon="🗝️"
      title="Enter the Guild"
      subtitle="Welcome back, adventurer. Your quest log awaits."
      footer={<AuthSwitchLink prompt="New adventurer?" to="/signup" linkText="Forge your character" />}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="email" className="label-text">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="player@realm.com"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 flex items-center gap-1 text-xs text-ember-400" role="alert">
              <span aria-hidden="true">⚠</span> {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="label-text">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          {errors.password && (
            <p id="password-error" className="mt-1 flex items-center gap-1 text-xs text-ember-400" role="alert">
              <span aria-hidden="true">⚠</span> {errors.password}
            </p>
          )}
        </div>

        <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Entering the Guild…' : '⚔ Enter the Guild'}
        </button>
      </form>
    </AuthShell>
  );
}
