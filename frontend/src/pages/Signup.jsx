import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import AuthShell, { AuthSwitchLink } from './AuthShell';

export default function Signup() {
  const signup = useStore((s) => s.signup);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    const next = {};
    if (!email.trim()) next.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email.';

    if (!password) next.password = 'Password is required.';
    else if (password.length < 8) next.password = 'Use at least 8 characters.';

    if (confirmPassword !== password) next.confirmPassword = 'Passwords do not match.';

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await signup(email.trim(), password);
      navigate('/guild', { replace: true });
    } catch (err) {
      const message = err.response?.data?.error || 'Signup failed. Try a different email.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      icon="🛡️"
      title="Forge Your Character"
      subtitle="Create your player profile and begin from Level 1."
      footer={<AuthSwitchLink prompt="Already a member?" to="/login" linkText="Enter the Guild" />}
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
            autoComplete="new-password"
            placeholder="At least 8 characters"
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

        <div>
          <label htmlFor="confirmPassword" className="label-text">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat your passcode"
            className="input-field"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
          />
          {errors.confirmPassword && (
            <p id="confirm-error" className="mt-1 flex items-center gap-1 text-xs text-ember-400" role="alert">
              <span aria-hidden="true">⚠</span> {errors.confirmPassword}
            </p>
          )}
        </div>

        <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Forging your character…' : '🛡️ Begin Adventure'}
        </button>
      </form>
    </AuthShell>
  );
}
