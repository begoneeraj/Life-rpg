import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';

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
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="parchment-card w-full max-w-sm p-8"
      >
        <div className="mb-6 text-center">
          <span aria-hidden="true" className="text-3xl">
            🛡️
          </span>
          <h1 className="mt-2 font-display text-2xl font-bold text-gold-400">
            Forge Your Character
          </h1>
          <p className="mt-1 text-sm text-parchment-300/70">
            Begin your journey from Level 1.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="email" className="label-text">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-xs text-ember-400">
                {errors.email}
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
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && (
              <p id="password-error" className="mt-1 text-xs text-ember-400">
                {errors.password}
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
              className="input-field"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
            />
            {errors.confirmPassword && (
              <p id="confirm-error" className="mt-1 text-xs text-ember-400">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Forging…' : 'Create Character'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-parchment-300/70">
          Already a member?{' '}
          <Link to="/login" className="font-semibold text-mystic-400 hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
