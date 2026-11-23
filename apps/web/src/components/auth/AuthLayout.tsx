import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import './auth.css';
import Brand from '../Brand';

export default function AuthLayout({ mode, children }: { mode: 'login' | 'register'; children: ReactNode }) {
  const isLogin = mode === 'login';
  return (
    <main className="auth-shell">
      <section className="auth-story" aria-label="About Smart Finances">
        <Brand light />
        <div className="auth-story-content">
          <span className="auth-eyebrow">A little clarity goes a long way</span>
          <h2>Your money.<br />A clearer picture.</h2>
          <p>Less guesswork. More breathing room. Bring your spending, budgets, and goals together.</p>
          <div className="auth-preview" aria-label="Illustrative financial overview">
            <div className="auth-preview-heading"><span>Your monthly picture</span><span className="auth-preview-tag">Example</span></div>
            <div className="auth-preview-balance"><span>Room to breathe</span><strong>$3,240<span>.00</span></strong></div>
            <div className="auth-preview-chart" aria-hidden="true">
              {[36, 52, 44, 68, 56, 76, 64, 88, 74, 100, 86, 112].map((height, index) => <span key={index} style={{ height }} />)}
            </div>
            <div className="auth-preview-footer"><span><i /> A plan for today</span><span>A little more for tomorrow <ArrowOutwardRoundedIcon /></span></div>
          </div>
          <div className="auth-feature-list"><span>Track your spending</span><span>Build better habits</span><span>Reach your goals</span></div>
        </div>
        <span className="auth-story-footer">Make room for what matters.</span>
      </section>
      <section className="auth-entry" aria-labelledby="auth-title">
        <nav className="auth-switch" aria-label="Account options">
          <span>{isLogin ? 'New here?' : 'Already have an account?'}</span>
          <Link to={isLogin ? '/register' : '/login'}>{isLogin ? 'Create an account' : 'Sign in'} <span aria-hidden="true">↗</span></Link>
        </nav>
        <div className="auth-form-wrap">
          <header className="auth-form-heading">
            <span className="auth-eyebrow">{isLogin ? 'Your next chapter starts here' : 'A fresh start for your finances'}</span>
            <h1 id="auth-title">{isLogin ? 'Welcome back.' : 'Make yourself at home.'}</h1>
            <p>{isLogin ? 'Sign in and take a moment for your money.' : 'Create your account. Start seeing the bigger picture.'}</p>
          </header>
          {children}
          <p className="auth-footnote">One place for your spending, budgets, and savings.</p>
        </div>
        <footer className="auth-entry-footer"><span>Smart Finances</span><span>A little more intentional.</span></footer>
      </section>
    </main>
  );
}
