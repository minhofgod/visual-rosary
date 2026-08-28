#!/usr/bin/env python
"""Build the in-app wallpaper catalog from the shared AI Art library.

Reads CREDITS.csv + cards/ + avatars/ from the (out-of-repo) AI Art library, writes
web-optimized assets into public/ and a typed catalog into src/data/wallpapers.ts.
Re-run whenever new wallpapers are filed. Requires Pillow.
"""
import csv, os, sys, json, re, io
from PIL import Image

LIB = r"D:/Dropbox/Claude/MinhofGod Websites/AI Art"
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT_WP = os.path.join(REPO, "public", "wallpapers")
OUT_AV = os.path.join(REPO, "public", "avatars")
os.makedirs(OUT_WP, exist_ok=True)
os.makedirs(OUT_AV, exist_ok=True)

cards = os.listdir(os.path.join(LIB, "cards"))

def refcompact(ref):
    # "Mt 6:26" -> "Mt6"; "Đnl 31:8" -> "Dnl31" (cards use ASCII + no verse part)
    head = ref.rsplit(":", 1)[0]
    return head.replace(" ", "").replace("Đ", "D").replace("đ", "d")

def find_card(row, image_id, ref):
    # Preferred: an explicit `card` filename in CREDITS.csv — unambiguous, no inference.
    explicit = (row.get("card") or "").strip()
    if explicit:
        if explicit not in cards:
            raise SystemExit(f"CREDITS card {explicit!r} for {image_id!r} not found in cards/")
        return explicit
    # Fallback (no `card` column yet): the card is <refcompact>-...-<style>-<NN>.png.
    # ref+style+NN can collide (two verses sharing a book+chapter, or a verse with two
    # variants), so disambiguate on the image's own subject slug, which the card carries.
    style, nn = image_id.rsplit("-", 2)[1:]
    tail = f"-{style}-{nn}.png"
    refc = refcompact(ref)
    cands = [c for c in cards if c.startswith(refc + "-") and c.endswith(tail)]
    if len(cands) == 1:
        return cands[0]
    subject = image_id.rsplit("-", 2)[0]            # e.g. good-shepherd
    narrowed = [c for c in cands if f"-{subject}-" in c]
    if len(narrowed) == 1:
        return narrowed[0]
    raise SystemExit(
        f"ambiguous card for {image_id!r} (ref={ref} refc={refc} {tail}): {cands}. "
        f"Add a `card` column to CREDITS.csv to resolve it.")

# Pass 1: read every card's metadata (no image work yet) so we can apply the push rule.
catalog = []
with open(os.path.join(LIB, "CREDITS.csv"), encoding="utf-8") as f:
    for r in csv.DictReader(f):
        image_id = r["filename"][:-4]              # e.g. good-shepherd-papercut-01
        catalog.append({
            "id": image_id, "card_file": find_card(r, image_id, r["scripture_ref"]),
            "filename": r["filename"], "ref": r["scripture_ref"], "mood": r["mood"],
            "style": r["style"], "title": r["title"],
        })

# RATCHET (Minh, 2026-08-28): once a wallpaper has SHIPPED it stays shipped, whatever CREDITS
# says later. Collections are persisted per-account in Supabase (`user_wallpapers`) and the app
# resolves a kept card by id against this catalog — so dropping an id here makes that card
# silently vanish from the gallery of everyone who earned it, with no error anywhere.
#
# This script is otherwise stateless: it recomputes everything from CREDITS on each run, so a
# routine edit could un-ship live cards without anyone touching art. The realistic path is
# spelling, not deletion — "paper cut-out" and "papercut" on one verse count as 2 styles until
# someone normalises them, at which point the verse falls under the >=2 rule below and its cards
# are pruned. (23 of 38 verses currently sit at exactly 2 styles.) Shipped ids are read back from
# the last generated catalog and always re-emitted.
SHIPPED_TS = os.path.join(REPO, "src", "data", "wallpapers.ts")
shipped_ids = set()
if os.path.exists(SHIPPED_TS):
    shipped_ids = set(re.findall(r"id: '([^']+)'", io.open(SHIPPED_TS, encoding="utf-8").read()))

# A shipped id whose CREDITS row is gone cannot be re-emitted (no mood/title/art), so fail
# loudly instead of quietly deleting it from live collections.
catalog_ids = {c["id"] for c in catalog}
orphaned = sorted(shipped_ids - catalog_ids)
if orphaned:
    msg = ["REFUSING TO BUILD - these ids already shipped but have no CREDITS row, so this run",
           "would delete them from the collections of everyone who earned them:"]
    msg += ["  " + o for o in orphaned]
    msg.append("Restore their rows in CREDITS.csv - retire a card by marking it, never by deleting it.")
    raise SystemExit(chr(10).join(msg))

# RULE CHANGE (Minh, 2026-08-28): the old ">=2 styles or hold the verse back" rule is GONE — every
# card ships. It existed so a gift always offered a real style choice, but it kept 14 finished cards
# invisible, and the RATCHET above now makes single-style verses safe (they can no longer be
# un-shipped by a later edit). A verse with one style skips the style chooser in the app; when its
# second style lands, the verse returns to the pool and the chooser marks the owned one "Đã có".
included = catalog
held = []
kept_by_ratchet = []

# Pass 2: write downsized card + avatar JPGs for the included cards only.
rows = []
keep_ids = set()
for c in included:
    image_id = c["id"]
    keep_ids.add(image_id)
    im = Image.open(os.path.join(LIB, "cards", c["card_file"])).convert("RGB")
    w, h = im.size
    im.resize((1080, round(h * 1080 / w)), Image.LANCZOS).save(
        os.path.join(OUT_WP, image_id + ".jpg"), quality=90, optimize=True)
    av = Image.open(os.path.join(LIB, "avatars", c["filename"])).convert("RGB")
    av.resize((256, 256), Image.LANCZOS).save(
        os.path.join(OUT_AV, image_id + ".jpg"), quality=90, optimize=True)
    rows.append({"id": image_id, "ref": c["ref"], "mood": c["mood"], "style": c["style"], "title": c["title"]})

# Prune orphan JPGs (held-back or removed cards) so nothing stale ships in public/.
for d in (OUT_WP, OUT_AV):
    for fn in os.listdir(d):
        if fn.endswith(".jpg") and fn[:-4] not in keep_ids:
            os.remove(os.path.join(d, fn))

rows.sort(key=lambda x: (x["mood"], x["style"], x["id"]))

# Ordered happy → heavy: uplifting needs first, then longing, then the harder feelings,
# closing with repentance. Drives the mood picker + the collection scoreboard order.
MOODS = [
    ("hope", "Cần hy vọng", "Need hope", "🌅"),
    ("peace", "Cần bình an", "Need peace", "🕊️"),
    ("faith", "Đức tin & sự thật", "Faith & truth", "✝️"),
    ("strength", "Cần sức mạnh", "Strength & courage", "🛡️"),
    ("unloved", "Cần được yêu thương", "Feeling unloved", "💗"),
    ("small", "Thấy mình nhỏ bé", "Feeling small", "🌱"),
    ("weary", "Mệt mỏi", "Weary", "😔"),
    ("anxious", "Lo lắng", "Anxious", "😟"),
    ("lonely", "Cô đơn", "Lonely", "🥀"),
    ("sorrowful", "Buồn bã", "Sorrowful", "😢"),
    ("repentance", "Sám hối", "Repentance & mercy", "🙏"),
]

ts = []
ts.append("// AUTO-GENERATED by scripts/gen-wallpapers.py — do not edit by hand.")
ts.append("// Source: the shared AI Art library (CREDITS.csv + cards/ + avatars/).\n")
ts.append("export type MoodSlug =\n  " + "\n  | ".join(f"'{m[0]}'" for m in MOODS) + ";")
ts.append("export type WallpaperStyle = 'papercut' | 'cinematic' | 'renaissance';\n")
ts.append("export interface Wallpaper {")
ts.append("  id: string;")
ts.append("  ref: string;")
ts.append("  mood: MoodSlug;")
ts.append("  style: WallpaperStyle;")
ts.append("  title: string;")
ts.append("  /** full card (verse baked in), served from /public */")
ts.append("  card: string;")
ts.append("  /** square avatar crop of the art */")
ts.append("  avatar: string;")
ts.append("}\n")
ts.append("export interface Mood {")
ts.append("  slug: MoodSlug;")
ts.append("  vi: string;")
ts.append("  en: string;")
ts.append("  emoji: string;")
ts.append("}\n")
ts.append("export const MOODS: Mood[] = [")
for slug, vi, en, emoji in MOODS:
    ts.append(f"  {{ slug: '{slug}', vi: {json.dumps(vi, ensure_ascii=False)}, en: {json.dumps(en, ensure_ascii=False)}, emoji: '{emoji}' }},")
ts.append("];\n")
ts.append("export const WALLPAPERS: Wallpaper[] = [")
for r in rows:
    ts.append("  { " + ", ".join([
        f"id: '{r['id']}'",
        f"ref: {json.dumps(r['ref'], ensure_ascii=False)}",
        f"mood: '{r['mood']}'",
        f"style: '{r['style']}'",
        f"title: {json.dumps(r['title'], ensure_ascii=False)}",
        f"card: '/wallpapers/{r['id']}.jpg'",
        f"avatar: '/avatars/{r['id']}.jpg'",
    ]) + " },")
ts.append("];")

open(os.path.join(REPO, "src", "data", "wallpapers.ts"), "w", encoding="utf-8").write("\n".join(ts) + "\n")
print(f"wrote {len(rows)} wallpapers -> src/data/wallpapers.ts, public/wallpapers/, public/avatars/")
if held:
    print(f"HELD BACK {len(held)} single-style verses (need a 2nd style before they push): {', '.join(held)}")
if kept_by_ratchet:
    print(f"RATCHET kept {len(kept_by_ratchet)} already-shipped card(s) whose verse now has <2 styles "
          f"(they stay live so nobody loses a collected card): {', '.join(kept_by_ratchet)}")
by_mood = {}
for r in rows:
    by_mood.setdefault(r["mood"], []).append(r["style"])
print("by mood:", {k: len(v) for k, v in by_mood.items()})
