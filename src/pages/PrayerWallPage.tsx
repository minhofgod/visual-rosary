import { useEffect, useState, type CSSProperties, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { MysteryBackground } from '../components/MysteryBackground';
import { PrayerRequestCard } from '../components/PrayerRequestCard';
import { PrayingForYouModal } from '../components/PrayingForYouModal';
import { SignInModal } from '../components/SignInModal';
import { useDisplayLang } from '../state/useDisplayLang';
import { useSlideshow } from '../state/useSlideshow';
import { useAuth } from '../state/useAuth';
import { useSettings } from '../state/useSettings';
import {
  getWall, createRequest, prayForRequest, reportRequest, blockPoster, deleteRequest,
  type WallItem, type WallSort,
} from '../lib/prayerWall';

const PRAYED_GUARD = 'rosary.prayedFor.';
const PINNED_HIDDEN_KEY = 'rosary.wall.pinnedHidden';
const MAX_LEN = 500;

export function PrayerWallPage() {
  const navigate = useNavigate();
  const { displayLang, setDisplayLang } = useDisplayLang();
  const image = useSlideshow();
  const auth = useAuth();
  const { settings, setSettings } = useSettings();

  const [items, setItems] = useState<WallItem[]>([]);
  const [sort, setSort] = useState<WallSort>('new');
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [prayingId, setPrayingId] = useState<string | null>(null);
  const [pinnedHidden, setPinnedHidden] = useState(() => {
    try {
      return localStorage.getItem(PINNED_HIDDEN_KEY) === '1';
    } catch {
      return false;
    }
  });

  function hidePinned() {
    setPinnedHidden(true);
    try {
      localStorage.setItem(PINNED_HIDDEN_KEY, '1');
    } catch {
      /* private mode / storage disabled — hidden for this session only */
    }
  }

  function showPinned() {
    setPinnedHidden(false);
    try {
      localStorage.removeItem(PINNED_HIDDEN_KEY);
    } catch {
      /* ignore */
    }
  }

  const t = (vi: string, en: string) => (displayLang === 'en' ? en : vi);

  async function load(s: WallSort) {
    setLoading(true);
    const data = await getWall(s, 50, 0);
    setItems(
      data.map((it) => ({
        ...it,
        prayed_by_me: it.prayed_by_me || localStorage.getItem(PRAYED_GUARD + it.id) === '1',
      })),
    );
    setLoading(false);
  }

  useEffect(() => {
    load(sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, auth.isSignedIn]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    if (!auth.isSignedIn) {
      setSignInOpen(true);
      return;
    }
    setPosting(true);
    try {
      await createRequest(text);
      setBody('');
      await load(sort);
    } catch {
      alert(t('Không đăng được. Xin thử lại sau.', 'Could not post. Please try again later.'));
    } finally {
      setPosting(false);
    }
  }

  async function amen(id: string) {
    const newCount = await prayForRequest(id);
    localStorage.setItem(PRAYED_GUARD + id, '1');
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, prayed_by_me: true, prayed_count: newCount ?? it.prayed_count + 1 } : it,
      ),
    );
  }

  async function report(id: string) {
    if (!confirm(t('Báo cáo ý cầu nguyện này là không phù hợp?', 'Report this request as inappropriate?'))) return;
    await reportRequest(id);
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  async function block(id: string) {
    if (!auth.isSignedIn) {
      setSignInOpen(true);
      return;
    }
    if (!confirm(t('Ẩn tất cả bài của người này?', "Hide all of this person's posts?"))) return;
    await blockPoster(id);
    await load(sort);
  }

  async function remove(id: string) {
    if (!confirm(t('Xóa ý cầu nguyện của bạn?', 'Delete your request?'))) return;
    await deleteRequest(id);
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  return (
    <div className="reading-screen pw-screen" style={{ '--font-scale': settings.fontScale } as CSSProperties}>
      <MysteryBackground image={image?.file} gradientClass="bg-landing" />
      <div className="bg-scrim" />
      {image && (
        <div className="bg-credit">
          {image.title}, {image.artist} — Public domain, via Wikimedia Commons
        </div>
      )}

      <AppHeader
        displayLang={displayLang}
        setDisplayLang={setDisplayLang}
        settings={settings}
        onSettingsChange={setSettings}
        showFontSize
        showReturnHome
        left={
          <button type="button" className="icon-button icon-button-back" onClick={() => navigate('/')} aria-label={t('Trang chủ', 'Home')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8" />
            </svg>
          </button>
        }
      />

      <main className="pw-main">
        <div className="pw-hero">
          <div className="pw-eyebrow">{t('CỘNG ĐOÀN CẦU NGUYỆN', 'PRAYER COMMUNITY')}</div>
          <h1 className="pw-title">{t('Ý Cầu Nguyện', 'Prayer Requests')}</h1>
        </div>

        {/* Pinned welcome note from Minh — dismissible, remembered per device.
            When hidden, a small "What is this page?" button brings it back. */}
        {pinnedHidden ? (
          <button type="button" className="pw-pinned-show" onClick={showPinned}>
            ⓘ {t('Trang này là gì?', 'What is this page?')}
          </button>
        ) : (
        <div className="pw-pinned">
          <div className="pw-pinned-top">
            <div className="pw-pinned-badge">📌 {t('Ghim', 'Pinned')}</div>
            <button type="button" className="pw-pinned-hide" onClick={hidePinned}>
              {t('Ẩn', 'Hide')}
            </button>
          </div>
          <p className="pw-pinned-body">
            {t(
              'Hi các bạn, mình là Minh. Đây là chỗ các bạn có thể đăng ý nguyện của mình để mọi người cùng cầu nguyện cho bạn. Những lời cầu nguyện sẽ được đăng ẩn danh. Tuy nhiên khi cầu nguyện, bạn có thể nêu tên người bạn muốn cầu — ví dụ "xin cầu nguyện cho linh hồn Phêrô Nguyễn Văn A" — hoặc không nêu tên cũng được. Chúa là Đấng Toàn Tri: trước khi chúng ta dâng lời cầu nguyện, Ngài đã biết chúng ta cần gì. Nên cộng đoàn không cần biết rõ tên thì Chúa vẫn nhận lời. God bless you all. 🙏',
              "Hi everyone, I'm Minh. This is a place to share your intentions so others can pray for you. Requests are posted anonymously. When you pray, you're welcome to name the person you're praying for — for example, “please pray for the soul of Peter Nguyễn Văn A” — or leave it unnamed. God is all-knowing: before we lift up our prayers, He already knows what we need. So the community doesn't need to know the name for God to hear us. God bless you all. 🙏",
            )}
          </p>
          <div className="pw-pinned-author">— Minh · MinhofGod</div>
        </div>
        )}

        {/* Post box */}
        {auth.isSignedIn ? (
          <form className="pw-post" onSubmit={submit}>
            <textarea
              value={body}
              maxLength={MAX_LEN}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t('Xin cầu nguyện cho…', 'Please pray for…')}
              rows={3}
            />
            <div className="pw-post-row">
              <span className="pw-post-count">{body.length}/{MAX_LEN}</span>
              <button type="submit" className="pw-post-btn" disabled={posting || !body.trim()}>
                {posting ? '…' : t('Đăng', 'Post')}
              </button>
            </div>
          </form>
        ) : (
          <div className="pw-signin-prompt">
            <span>{t('Đăng nhập để chia sẻ ý cầu nguyện của bạn.', 'Sign in to share your prayer request.')}</span>
            <button type="button" className="pw-post-btn" onClick={() => setSignInOpen(true)}>
              {t('Đăng nhập', 'Sign in')}
            </button>
          </div>
        )}

        {/* Sort */}
        <div className="pw-sort">
          <button type="button" className={sort === 'new' ? 'is-active' : ''} onClick={() => setSort('new')}>
            {t('Mới nhất', 'Newest')}
          </button>
          <button type="button" className={sort === 'prayed' ? 'is-active' : ''} onClick={() => setSort('prayed')}>
            {t('Được cầu nguyện nhiều', 'Most prayed')}
          </button>
          <button type="button" className={sort === 'needs' ? 'is-active' : ''} onClick={() => setSort('needs')}>
            {t('Cần lời cầu nguyện', 'Needs prayer')}
          </button>
        </div>

        {/* List */}
        {loading ? (
          <p className="pw-empty">{t('Đang tải…', 'Loading…')}</p>
        ) : items.length === 0 ? (
          <p className="pw-empty">{t('Chưa có ý cầu nguyện nào. Hãy là người đầu tiên.', 'No requests yet. Be the first.')}</p>
        ) : (
          <ul className="pw-list">
            {items.map((it) => (
              <PrayerRequestCard
                key={it.id}
                item={it}
                displayLang={displayLang}
                onPray={() => setPrayingId(it.id)}
                onReport={() => report(it.id)}
                onBlock={() => block(it.id)}
                onDelete={it.is_mine ? () => remove(it.id) : undefined}
              />
            ))}
          </ul>
        )}
      </main>

      {prayingId && (
        <PrayingForYouModal
          displayLang={displayLang}
          onAmen={() => amen(prayingId)}
          onClose={() => setPrayingId(null)}
        />
      )}
      {signInOpen && <SignInModal displayLang={displayLang} onClose={() => setSignInOpen(false)} />}
    </div>
  );
}
