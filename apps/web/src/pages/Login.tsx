import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { authApi } from '../api/auth';
import { useAuth } from '../context/authState';
import type { ApiError } from '../api/client';
import { concrete } from '../theme/palette';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      const { token } = await authApi.login(form);
      login(token);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.fields ? Object.values(apiError.fields).join('. ') : apiError.message ?? 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#E4E0D6',
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
              color: concrete.void,
            }}
          >
            SMART
            <br />
            FINANCES
          </Typography>
          <Box sx={{ width: 60, height: 4, bgcolor: concrete.stone, mt: 1.5, border: `1px solid ${concrete.void}` }} />
        </Box>

        <Box
          sx={{
            border: `3px solid ${concrete.void}`,
            boxShadow: `8px 8px 0px ${concrete.void}`,
            bgcolor: concrete.paper,
            p: 4,
          }}
        >
          <Typography
            variant="h5"
            sx={{ mb: 0.5, fontSize: 18, letterSpacing: 2, fontWeight: 700 }}
          >
            SIGN IN
          </Typography>
          <Typography
            sx={{ mb: 3, fontSize: 12, color: concrete.aggregate, fontFamily: '"Space Mono", monospace' }}
          >
            Enter your credentials to continue
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
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              fullWidth
              autoComplete="email"
              autoFocus
            />

            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
              fullWidth
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((p) => !p)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? (
                        <VisibilityOffOutlinedIcon fontSize="small" />
                      ) : (
                        <VisibilityOutlinedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              fullWidth
              sx={{ mt: 0.5, py: 1.5, fontSize: 13 }}
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </Button>
          </Box>

          <Box
            sx={{
              mt: 3,
              pt: 2,
              borderTop: `2px solid ${concrete.void}`,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Typography
              sx={{ fontSize: 11, fontFamily: '"Space Mono", monospace', color: concrete.aggregate }}
            >
              NO ACCOUNT?{' '}
              <Link
                component={RouterLink}
                to="/register"
                sx={{
                  color: concrete.void,
                  fontWeight: 700,
                  textDecorationColor: concrete.stone,
                  textDecorationThickness: 2,
                  '&:hover': { color: concrete.void, bgcolor: concrete.stone },
                }}
              >
                SIGN UP
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
