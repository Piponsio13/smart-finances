import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
} from '@mui/material';
import { authApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import type { ApiError } from '../api/client';

export default function Register() {
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authApi.register({ name: form.name, email: form.email, password: form.password });
      const { token } = await authApi.login({ email: form.email, password: form.password });
      login(token);
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.fields) {
        setError(Object.values(apiErr.fields).join('. '));
      } else {
        setError(apiErr.message ?? 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F5F0E8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontFamily: '"Space Mono", monospace',
              fontWeight: 700,
              fontSize: 28,
              letterSpacing: 3,
              textTransform: 'uppercase',
              lineHeight: 1.1,
              color: '#000000',
            }}
          >
            SMART
            <br />
            FINANCES
          </Typography>
          <Box sx={{ width: 60, height: 4, bgcolor: '#FFD600', mt: 1.5, border: '1px solid #000' }} />
        </Box>

        <Box
          sx={{
            border: '3px solid #000000',
            boxShadow: '6px 6px 0px #000000',
            bgcolor: '#FFFFFF',
            p: 4,
          }}
        >
          <Typography
            variant="h5"
            sx={{ mb: 0.5, fontSize: 18, letterSpacing: 2, fontWeight: 700 }}
          >
            CREATE ACCOUNT
          </Typography>
          <Typography
            sx={{ mb: 3, fontSize: 12, color: '#666666', fontFamily: '"Space Mono", monospace' }}
          >
            Start managing your finances today
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
          >
            <TextField
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              fullWidth
              autoFocus
            />

            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              fullWidth
              autoComplete="email"
            />

            <TextField
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
              fullWidth
              autoComplete="new-password"
              helperText="Minimum 8 characters"
            />

            <TextField
              label="Confirm Password"
              type="password"
              value={form.confirm}
              onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
              required
              fullWidth
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              fullWidth
              sx={{ mt: 0.5, py: 1.5, fontSize: 13 }}
            >
              {loading ? 'CREATING...' : 'CREATE ACCOUNT'}
            </Button>
          </Box>

          <Box
            sx={{
              mt: 3,
              pt: 2,
              borderTop: '2px solid #000000',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Typography
              sx={{ fontSize: 11, fontFamily: '"Space Mono", monospace', color: '#666666' }}
            >
              HAVE AN ACCOUNT?{' '}
              <Link
                component={RouterLink}
                to="/login"
                sx={{
                  color: '#000000',
                  fontWeight: 700,
                  textDecorationColor: '#FFD600',
                  textDecorationThickness: 2,
                  '&:hover': { color: '#000000', bgcolor: '#FFD600' },
                }}
              >
                SIGN IN
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
