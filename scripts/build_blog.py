#!/usr/bin/env python3
"""Index the blog: read blog/*.md front matter, write blog/index.json and feed.xml.

Runs automatically in GitHub Actions on every push. Run it locally before
previewing:  python3 scripts/build_blog.py && python3 -m http.server

Post format (blog/YYYY-MM-DD-some-slug.md):

    ---
    title: My post title
    date: 2026-11-23
    tags: [ml, deepfakes]
    summary: One line shown in the post list.   (optional)
    draft: true                                  (optional, hides the post)
    ---

    Markdown body...

Files starting with "_" and README.md are ignored.
"""
import datetime as dt
import email.utils
import json
import re
import sys
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parent.parent
BLOG = ROOT / "blog"
SITE = "https://fyterox.github.io/"
AUTHOR = "Ayush Kumar"
WPM = 220

FRONT = re.compile(r"^﻿?---\s*\n(.*?)\n---\s*\n", re.S)
DATED = re.compile(r"^(\d{4}-\d{2}-\d{2})-(.+)$")


def parse_front(text):
    m = FRONT.match(text)
    if not m:
        return {}, text
    meta = {}
    for line in m.group(1).splitlines():
        if ":" not in line or line.lstrip().startswith("#"):
            continue
        key, val = line.split(":", 1)
        key, val = key.strip().lower(), val.strip()
        if val.startswith("[") and val.endswith("]"):
            val = [t.strip().strip("\"'") for t in val[1:-1].split(",") if t.strip()]
        else:
            val = val.strip("\"'")
        meta[key] = val
    return meta, text[m.end():]


def plain(md):
    """Rough Markdown -> text, for summaries and word counts."""
    md = re.sub(r"```.*?```", " ", md, flags=re.S)
    md = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", md)
    md = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", md)
    md = re.sub(r"[`*_>#~|-]", " ", md)
    return re.sub(r"\s+", " ", md).strip()


def first_paragraph(body):
    for block in re.split(r"\n\s*\n", body):
        b = block.strip()
        if b and not b.startswith(("#", "```", "!", "|", "<")):
            return plain(b)
    return ""


def load_post(path):
    meta, body = parse_front(path.read_text(encoding="utf-8"))
    m = DATED.match(path.stem)
    slug = (m.group(2) if m else path.stem).lower()
    if not re.fullmatch(r"[a-z0-9][a-z0-9._-]*", slug):
        sys.exit(f"error: {path.name}: file name must be lowercase letters, digits and dashes")

    date = meta.get("date") or (m.group(1) if m else None)
    if not date:
        date = dt.date.fromtimestamp(path.stat().st_mtime).isoformat()
    try:
        dt.date.fromisoformat(date)
    except ValueError:
        sys.exit(f"error: {path.name}: date must look like 2026-11-23, got {date!r}")

    title = meta.get("title")
    if not title:
        h = re.search(r"^#\s+(.+)$", body, re.M)
        title = h.group(1).strip() if h else slug.replace("-", " ").capitalize()

    tags = meta.get("tags", [])
    if isinstance(tags, str):
        tags = [t.strip() for t in tags.split(",") if t.strip()]
    tags = [t.lower().lstrip("#") for t in tags]

    summary = meta.get("summary") or first_paragraph(body)
    if len(summary) > 160:
        summary = summary[:157].rsplit(" ", 1)[0] + "…"

    words = len(plain(body).split())
    return {
        "slug": slug,
        "file": path.name,
        "title": title,
        "date": date,
        "tags": tags,
        "summary": summary,
        "words": words,
        "minutes": max(1, round(words / WPM)),
        "draft": str(meta.get("draft", "false")).lower() in ("true", "yes", "1"),
    }


def write_feed(posts):
    items = []
    for p in posts[:20]:
        d = dt.datetime.fromisoformat(p["date"]).replace(tzinfo=dt.timezone.utc)
        url = f"{SITE}#blog/{p['slug']}"
        items.append(
            "    <item>\n"
            f"      <title>{escape(p['title'])}</title>\n"
            f"      <link>{url}</link>\n"
            f"      <guid isPermaLink=\"false\">{escape(p['slug'])}</guid>\n"
            f"      <pubDate>{email.utils.format_datetime(d)}</pubDate>\n"
            f"      <description>{escape(p['summary'])}</description>\n"
            "    </item>"
        )
    feed = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<rss version="2.0">\n  <channel>\n'
        f"    <title>{AUTHOR} · blog</title>\n"
        f"    <link>{SITE}#blog</link>\n"
        f"    <description>Notes from {AUTHOR}</description>\n"
        + "\n".join(items)
        + "\n  </channel>\n</rss>\n"
    )
    (ROOT / "feed.xml").write_text(feed, encoding="utf-8")


def main():
    BLOG.mkdir(exist_ok=True)
    posts = [
        load_post(f)
        for f in sorted(BLOG.glob("*.md"))
        if not f.name.startswith("_") and f.name.lower() != "readme.md"
    ]
    seen = {}
    for p in posts:
        if p["slug"] in seen:
            sys.exit(f"error: {p['file']} and {seen[p['slug']]} have the same slug '{p['slug']}'")
        seen[p["slug"]] = p["file"]

    published = sorted((p for p in posts if not p["draft"]), key=lambda p: (p["date"], p["slug"]), reverse=True)
    (BLOG / "index.json").write_text(json.dumps(published, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    write_feed(published)

    drafts = len(posts) - len(published)
    print(f"blog: {len(published)} published, {drafts} draft(s) -> blog/index.json, feed.xml")
    for p in published:
        print(f"  {p['date']}  {p['slug']}  ({p['minutes']} min)")


if __name__ == "__main__":
    main()
