import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';

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
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="parchment-card w-full max-w-sm p-8"
      >
        <div className="mb-6 text-center">
          <span aria-hidden="true" className="text-3xl">
            🗝️
          </span>
          <h1 className="mt-2 font-display text-2xl font-bold text-gold-400">Enter the Guild</h1>
          <p className="mt-1 text-sm text-parchment-300/70">Continue your quest log.</p>
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
              autoComplete="current-password"
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

          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Entering…' : 'Log In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-parchment-300/70">
          New adventurer?{' '}
          <Link to="/signup" className="font-semibold text-mystic-400 hover:underline">
            Create a character
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
