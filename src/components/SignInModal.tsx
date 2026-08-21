import { useState, type FormEvent } from 'react';
import { Modal } from './Modal';
import { useAuth } from '../state/useAuth';
import type { DisplayLang } from '../state/useDisplayLang';

// Sign-in is only needed to POST a request. Google (one tap) + email magic link.
interface Props {
  displayLang: DisplayLang;
  onClose: () => void;
}

export function SignInModal({ displayLang, onClose }: Props) {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const t = (vi: string, en: string) => (displayLang === 'en' ? en : vi);

  const sendMagic = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setErr(null);
    const res = await auth.signInWithEmail(email.trim());
    setBusy(false);
    if (res?.error) {
      setErr(res.error.message);
      return;
    }
    setSent(true);
  };

  return (
    <Modal title={t('Đăng nhập', 'Sign in')} onClose={onClose}>
      <div className="signin">
        <p className="signin-lead">
          {t(
            'Đăng nhập để đăng ý cầu nguyện của bạn. Việc đọc và cầu nguyện cho người khác không cần đăng nhập.',
            'Sign in to post your prayer request. Reading and praying for others needs no account.',
          )}
        </p>

        <button type="button" className="signin-google" onClick={() => auth.signInWithGoogle()}>
          {t('Tiếp tục với Google', 'Continue with Google')}
        </button>

        <div className="signin-or">{t('hoặc', 'or')}</div>

        {sent ? (
          <p className="signin-sent">
            {t(
              'Đã gửi liên kết đăng nhập tới email của bạn. Xin kiểm tra hộp thư.',
              'A sign-in link has been sent to your email. Please check your inbox.',
            )}
          </p>
        ) : (
          <form onSubmit={sendMagic} className="signin-email">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('Địa chỉ email', 'Email address')}
            />
            <button type="submit" disabled={busy}>
              {busy ? '…' : t('Gửi liên kết đăng nhập', 'Send magic link')}
            </button>
          </form>
        )}

        {err && <p className="signin-error">{err}</p>}
      </div>
    </Modal>
  );
}
