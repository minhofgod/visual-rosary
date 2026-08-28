#!/usr/bin/env python
"""Local, self-contained HTML dashboard of the wallpaper library.

Reads CREDITS.csv + the downsized cards in public/wallpapers/, embeds thumbnails as
base64, and groups the collection two ways: by MOOD (category) and by VERSE (with
style-pairing status — which verses have both styles vs. a gap). Output is one
standalone .html you open directly in a browser. Re-run whenever cards change.
Requires Pillow.
"""
import csv, os, base64, io, html
from PIL import Image

LIB = r"D:/Dropbox/Claude/MinhofGod Websites/AI Art"
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
WP = os.path.join(REPO, "public", "wallpapers")
CARDS = os.path.join(LIB, "cards")  # full library (incl. held-back verses); the app's public/ is pruned
OUT = os.path.join(LIB, "library-dashboard.html")

MOODS = [
    ("hope", "Cần hy vọng", "🌅"), ("peace", "Cần bình an", "🕊️"),
    ("faith", "Đức tin & sự thật", "✝️"), ("strength", "Cần sức mạnh", "🛡️"),
    ("unloved", "Cần được yêu thương", "💗"), ("small", "Thấy mình nhỏ bé", "🌱"),
    ("weary", "Mệt mỏi", "😔"), ("anxious", "Lo lắng", "😟"), ("lonely", "Cô đơn", "🥀"),
    ("sorrowful", "Buồn bã", "😢"), ("repentance", "Sám hối", "🙏"),
]
MOOD_VI = {m[0]: m[1] for m in MOODS}
MOOD_EMOJI = {m[0]: m[2] for m in MOODS}
STYLE_LABEL = {"papercut": "Nhẹ nhàng", "cinematic": "Điện ảnh", "renaissance": "Cổ điển"}

def thumb(card_file, image_id, w=300):
    # Prefer the full-res library card (so held-back verses still show); fall back to the pushed jpg.
    src = None
    if card_file and os.path.exists(os.path.join(CARDS, card_file)):
        src = os.path.join(CARDS, card_file)
    elif os.path.exists(os.path.join(WP, image_id + ".jpg")):
        src = os.path.join(WP, image_id + ".jpg")
    if not src:
        return ""
    im = Image.open(src).convert("RGB")
    im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, "JPEG", quality=72)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()

rows = []
with open(os.path.join(LIB, "CREDITS.csv"), encoding="utf-8") as f:
    for r in csv.DictReader(f):
        image_id = r["filename"][:-4]
        rows.append({"id": image_id, "ref": r["scripture_ref"], "mood": r["mood"],
                     "style": r["style"], "subject": r["subject"],
                     "thumb": thumb((r.get("card") or "").strip(), image_id)})

# group by verse for the pairing view
by_ref = {}
for r in rows:
    d = by_ref.setdefault(r["ref"], {"mood": r["mood"], "styles": {}})
    d["styles"].setdefault(r["style"], []).append(r)

# "Paired" = a verse with 2+ distinct styles (the real goal), style-agnostic now that
# renaissance exists. Also track which generator queues are outstanding.
multi = [k for k, v in by_ref.items() if len(v["styles"]) >= 2]
single = [k for k, v in by_ref.items() if len(v["styles"]) == 1]
missing_pc = [k for k, v in by_ref.items() if "papercut" not in v["styles"]]
missing_cn = [k for k, v in by_ref.items() if "cinematic" not in v["styles"]]

def card_html(r):
    return (f'<figure class="card"><img loading="lazy" src="{r["thumb"]}" alt="{html.escape(r["ref"])}">'
            f'<figcaption><span class="ref">{html.escape(r["ref"])}</span>'
            f'<span class="badge b-{r["style"]}">{STYLE_LABEL.get(r["style"], r["style"])}</span></figcaption>'
            f'<div class="subj">{html.escape(r["subject"])}</div></figure>')

# --- By mood ---
mood_sections = []
for slug, vi, emoji in MOODS:
    cards = [r for r in rows if r["mood"] == slug]
    if not cards:
        continue
    cards.sort(key=lambda x: x["style"])
    styles = {c["style"] for c in cards}
    toggle = "✓ cả hai kiểu" if ("papercut" in styles and "cinematic" in styles) else "một kiểu"
    grid = "".join(card_html(c) for c in cards)
    mood_sections.append(
        f'<section class="mood"><h2>{emoji} {html.escape(vi)} '
        f'<span class="mcount">{len(cards)} ảnh · {toggle}</span></h2><div class="grid">{grid}</div></section>')

# --- By verse (pairing) ---
verse_rows = []
for ref in sorted(by_ref, key=lambda k: (by_ref[k]["mood"], k)):
    v = by_ref[ref]
    def cell(style):
        if style in v["styles"]:
            r = v["styles"][style][0]
            extra = f' <span class="plus">+{len(v["styles"][style]) - 1}</span>' if len(v["styles"][style]) > 1 else ""
            return f'<td class="have"><img loading="lazy" src="{r["thumb"]}">{extra}</td>'
        return '<td class="miss">—</td>'
    n = len(v["styles"])
    status = (f'<span class=ok>✓ đã push · {n} kiểu</span>' if n >= 2
              else '<span class=gap>giữ lại · chờ kiểu 2</span>')
    verse_rows.append(
        f'<tr><td class="vref">{html.escape(ref)}<div class="vmood">{MOOD_EMOJI.get(v["mood"],"")} {MOOD_VI.get(v["mood"], v["mood"])}</div></td>'
        f'{cell("papercut")}{cell("cinematic")}{cell("renaissance")}<td class="vstatus">{status}</td></tr>')

CSS = """
:root{color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;background:#151210;color:#efe4cf;font:15px/1.5 -apple-system,Segoe UI,Roboto,sans-serif}
header{position:sticky;top:0;z-index:5;background:#1b1713ee;backdrop-filter:blur(8px);border-bottom:1px solid #3a2f22;padding:16px 22px}
h1{margin:0 0 4px;font:600 22px 'Source Serif 4',Georgia,serif;color:#f4e6c2}
.stats{display:flex;flex-wrap:wrap;gap:8px 18px;color:#c9b995;font-size:13px}
.stats b{color:#f4e6c2}
.tabs{display:flex;gap:6px;margin-top:12px}
.tabs button{background:#241f1a;border:1px solid #3a2f22;color:#cdbf9f;padding:7px 16px;border-radius:9px;font:inherit;font-size:14px;cursor:pointer}
.tabs button.on{background:#c79a3f;color:#1a1310;border-color:#c79a3f;font-weight:600}
main{padding:18px 22px 60px;max-width:1400px;margin:0 auto}
.view{display:none}.view.on{display:block}
.mood{margin-bottom:34px}
.mood h2{font:600 18px 'Source Serif 4',Georgia,serif;color:#f4e6c2;border-bottom:1px solid #332a1f;padding-bottom:7px;display:flex;align-items:baseline;gap:10px}
.mcount{font:400 12px sans-serif;color:#9c8f70}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px;margin-top:14px}
.card{margin:0;background:#1e1a15;border:1px solid #302719;border-radius:12px;overflow:hidden}
.card img{width:100%;display:block;aspect-ratio:1080/2340;object-fit:cover}
figcaption{display:flex;justify-content:space-between;align-items:center;padding:8px 9px 3px;gap:6px}
.ref{font-weight:600;font-size:13px;color:#f0e4c8}
.subj{padding:0 9px 9px;font-size:11px;color:#93866a;line-height:1.35}
.badge{font-size:10.5px;padding:2px 7px;border-radius:99px;white-space:nowrap}
.b-papercut{background:#3a4a2e;color:#cfe6b8}.b-cinematic{background:#3a2f2e;color:#e6c9b8}.b-renaissance{background:#2e3a4a;color:#b8cfe6}
table{border-collapse:collapse;width:100%;margin-top:6px}
th,td{border-bottom:1px solid #2a2318;padding:8px 10px;text-align:left;vertical-align:middle}
th{color:#c9b995;font-size:12px;text-transform:uppercase;letter-spacing:.06em;position:sticky;top:96px;background:#181510}
.vref{font-weight:600;color:#f0e4c8;white-space:nowrap}
.vmood{font-weight:400;font-size:11.5px;color:#9c8f70;margin-top:2px}
td.have img{width:52px;aspect-ratio:1080/2340;object-fit:cover;border-radius:5px;display:inline-block;vertical-align:middle}
td.miss{color:#6b5e46;text-align:center;font-size:20px}
.plus{font-size:11px;color:#9c8f70}
.ok{color:#8fbf6b;font-size:12.5px}.gap{color:#d98f5f;font-size:12.5px}
"""

JS = """
function show(v){document.querySelectorAll('.view').forEach(e=>e.classList.toggle('on',e.id===v));
document.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('on',b.dataset.v===v));}
"""

doc = f"""<!doctype html><html lang="vi"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Thư viện ảnh nền — Visual Rosary</title><style>{CSS}</style></head><body>
<header>
<h1>🌹 Thư viện ảnh nền Lời Chúa</h1>
<div class="stats">
<span><b>{len(rows)}</b> ảnh</span>
<span><b>{len(by_ref)}</b> câu</span>
<span><b>{len([r for r in rows if r['style']=='papercut'])}</b> Nhẹ nhàng · <b>{len([r for r in rows if r['style']=='cinematic'])}</b> Điện ảnh · <b>{len([r for r in rows if r['style']=='renaissance'])}</b> Cổ điển</span>
<span>Đã push (≥2 kiểu): <b>{len(multi)}</b> / {len(by_ref)}</span>
<span>Giữ lại (1 kiểu): <b>{len(single)}</b></span>
<span>Thiếu Nhẹ nhàng (cần Firefly): <b>{len(missing_pc)}</b></span>
</div>
<div class="tabs">
<button class="on" data-v="v-mood" onclick="show('v-mood')">Theo tâm tình</button>
<button data-v="v-verse" onclick="show('v-verse')">Theo câu Kinh Thánh</button>
</div>
</header>
<main>
<div class="view on" id="v-mood">{''.join(mood_sections)}</div>
<div class="view" id="v-verse">
<table><thead><tr><th>Câu</th><th>Nhẹ nhàng</th><th>Điện ảnh</th><th>Cổ điển</th><th>Trạng thái</th></tr></thead>
<tbody>{''.join(verse_rows)}</tbody></table>
</div>
</main>
<script>{JS}</script></body></html>"""

with open(OUT, "w", encoding="utf-8") as f:
    f.write(doc)
print(f"wrote dashboard -> {OUT}  ({len(rows)} cards, {len(by_ref)} verses, "
      f">=2 styles {len(multi)}, 1 style {len(single)}, missing-papercut {len(missing_pc)})")
