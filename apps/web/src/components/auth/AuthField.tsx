import { useState, type InputHTMLAttributes } from 'react';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string };
export default function AuthField({ label, hint, type, id, ...props }: Props) {
  const [visible, setVisible] = useState(false);
  const password = type === 'password';
  return <div className="auth-field">
    <label htmlFor={id}>{label}</label>
    <div className="auth-input-wrap">
      <input {...props} id={id} type={password && visible ? 'text' : type} aria-describedby={hint ? `${id}-hint` : undefined} />
      {password && <button className="auth-password-toggle" type="button" aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`} aria-pressed={visible} onClick={() => setVisible(!visible)}>
        {visible ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
      </button>}
    </div>
    {hint && <span id={`${id}-hint`} className="auth-field-hint">{hint}</span>}
  </div>;
}
