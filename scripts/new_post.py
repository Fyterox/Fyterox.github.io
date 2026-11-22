#!/usr/bin/env python3
"""Create a new blog post:  python3 scripts/new_post.py "My post title" [tag1,tag2]"""
import datetime as dt
import re
import sys
from pathlib import Path

if len(sys.argv) < 2:
    sys.exit('usage: python3 scripts/new_post.py "Post title" [tag1,tag2]')

title = sys.argv[1].strip()
tags = [t.strip() for t in (sys.argv[2] if len(sys.argv) > 2 else "").split(",") if t.strip()]
today = dt.date.today().isoformat()
slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-") or "post"

path = Path(__file__).resolve().parent.parent / "blog" / f"{today}-{slug}.md"
if path.exists():
    sys.exit(f"already exists: {path}")
path.parent.mkdir(exist_ok=True)
path.write_text(
    "---\n"
    f"title: {title}\n"
    f"date: {today}\n"
    f"tags: [{', '.join(tags)}]\n"
    "summary:\n"
    "draft: true\n"
    "---\n\n"
    "Write here. Delete `draft: true` above when it's ready to publish.\n",
    encoding="utf-8",
)
print(f"created {path.relative_to(Path.cwd()) if path.is_relative_to(Path.cwd()) else path}")
