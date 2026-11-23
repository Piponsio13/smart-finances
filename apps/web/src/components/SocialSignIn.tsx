import { useEffect, useRef, useState } from 'react';
import AppleIcon from '@mui/icons-material/Apple';
import { authApi } from '../api/auth';
import { useAuth } from '../context/authState';

interface ProviderWindow extends Window {
  google?: { accounts: { id: {
    initialize: (options: { client_id: string; nonce: string; callback: (response: { credential: string }) => void }) => void;
    renderButton: (element: HTMLElement, options: object) => void;
    cancel: () => void;
  } } };
  AppleID?: { auth: {
    init: (options: object) => void;
    signIn: () => Promise<{ authorization: { id_token: string; state: string }; user?: { name?: { firstName?: string; lastName?: string } } }>;
  } };
}
const providers = window as ProviderWindow;
const scripts = new Map<string, Promise<void>>();
function loadScript(src: string) {
  const existing = scripts.get(src);
  if (existing) return existing;
  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => { scripts.delete(src); script.remove(); reject(new Error('Unable to load sign-in. Check your connection and reload.')); };
    document.head.appendChild(script);
  });
  scripts.set(src, promise);
  return promise;
}

export default function SocialSignIn({ disabled, onBusy, onError }: {
  disabled: boolean; onBusy: (busy: boolean) => void; onError: (message: string) => void;
}) {
  const { login } = useAuth();
  const googleElement = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const disabledRef = useRef(disabled);
  useEffect(() => { disabledRef.current = disabled; }, [disabled]);
  const callbacks = useRef({ login, onBusy, onError });
  useEffect(() => { callbacks.current = { login, onBusy, onError }; });
  const [appleReady, setAppleReady] = useState(false);
  const googleId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const appleId = import.meta.env.VITE_APPLE_CLIENT_ID;
  const appleRedirect = import.meta.env.VITE_APPLE_REDIRECT_URI;

  useEffect(() => {
    let active = true;
    let resizeObserver: ResizeObserver | undefined;
    const nonce = crypto.randomUUID();
    if (googleId) {
      loadScript('https://accounts.google.com/gsi/client').then(() => {
        if (!active || !googleElement.current) return;
        providers.google!.accounts.id.initialize({ client_id: googleId, nonce, callback: async ({ credential }) => {
          if (!active || busy.current || disabledRef.current) return;
          busy.current = true;
          callbacks.current.onError('');
          callbacks.current.onBusy(true);
          try {
            const { token } = await authApi.socialLogin('google', { idToken: credential, nonce });
            if (active) callbacks.current.login(token);
          } catch (error) {
            if (active) callbacks.current.onError((error as Error).message || 'Google sign-in failed');
          } finally {
            busy.current = false;
            if (active) callbacks.current.onBusy(false);
          }
        } });
        let renderedWidth = 0;
        const renderGoogleButton = () => {
          const element = googleElement.current;
          if (!active || !element) return;
          const width = Math.max(200, Math.min(400, Math.floor(element.clientWidth || 384)));
          if (width === renderedWidth) return;
          renderedWidth = width;
          element.replaceChildren();
          providers.google!.accounts.id.renderButton(element, {
            theme: 'outline', size: 'large', width, shape: 'rectangular', text: 'continue_with', locale: 'en',
          });
        };
        renderGoogleButton();
        if (typeof ResizeObserver !== 'undefined') {
          resizeObserver = new ResizeObserver(renderGoogleButton);
          resizeObserver.observe(googleElement.current);
        }
      }).catch((error: Error) => { if (active) callbacks.current.onError(error.message); });
    }
    if (appleId && appleRedirect) {
      loadScript('https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js')
        .then(() => { if (active) setAppleReady(true); })
        .catch((error: Error) => { if (active) callbacks.current.onError(error.message); });
    }
    return () => { active = false; resizeObserver?.disconnect(); providers.google?.accounts.id.cancel(); };
  }, [googleId, appleId, appleRedirect]);

  async function appleSignIn() {
    if (busy.current || disabled) return;
    busy.current = true;
    onError('');
    onBusy(true);
    try {
      const nonce = crypto.randomUUID();
      const state = crypto.randomUUID();
      providers.AppleID!.auth.init({ clientId: appleId, redirectURI: appleRedirect, scope: 'name email', nonce, state, usePopup: true });
      const result = await providers.AppleID!.auth.signIn();
      if (result.authorization.state !== state) throw new Error('Apple sign-in could not be verified. Please try again.');
      const name = [result.user?.name?.firstName, result.user?.name?.lastName].filter(Boolean).join(' ');
      const { token } = await authApi.socialLogin('apple', { idToken: result.authorization.id_token, nonce, name });
      login(token);
    } catch (error) {
      const reason = error as { error?: string; message?: string };
      if (reason.error !== 'popup_closed_by_user' && reason.error !== 'user_cancelled_authorize') onError(reason.message || 'Apple sign-in failed. Please try again.');
    } finally { busy.current = false; onBusy(false); }
  }

  if (!googleId && !(appleId && appleRedirect)) return null;
  return <div className="auth-social">
    {googleId && <div className="auth-google" ref={googleElement} inert={disabled} style={{ opacity: disabled ? 0.5 : 1 }} />}
    {appleId && appleRedirect && <button type="button" className="auth-apple" disabled={disabled || !appleReady} onClick={appleSignIn}><AppleIcon />Continue with Apple</button>}
    <div className="auth-divider">or continue with email</div>
  </div>;
}
