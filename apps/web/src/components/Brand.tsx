import { Link } from 'react-router-dom';
import './Brand.css';
export default function Brand({ light = false }: { light?: boolean }) {
  return <Link to="/" className={`sf-brand${light ? ' sf-brand-light' : ''}`} aria-label="Smart Finances home">
    <span className="sf-brand-mark" aria-hidden="true"><i /><i /><i /></span>
    <span>smart finances<span className="sf-brand-dot">.</span></span>
  </Link>;
}
