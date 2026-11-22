# Terminal portfolio: Ayush Kumar

Live at **https://fyterox.github.io**. It's a portfolio you browse like a Linux shell: plain HTML, CSS and JS with no framework.

| file | what it is |
|---|---|
| `index.html` | page shell |
| `style.css` | themes (`default`, `amber`, `matrix`, `dracula`, `light`) and blog post styling |
| `main.js` | all content (`PROJECTS`, `T.*`) and the shell (commands, virtual filesystem, tab completion, history, blog reader) |
| `blog/*.md` | blog posts |
| `scripts/build_blog.py` | builds `blog/index.json` and `feed.xml` from the posts (CI runs it on every push) |
| `scripts/new_post.py` | creates a new post file |
| `.github/workflows/pages.yml` | builds and deploys to GitHub Pages on every push to `main` |

## Writing a blog post

**From your laptop:**

```bash
python3 scripts/new_post.py "Why my deepfake detector needed three eyes" ml,deepfakes
# edit blog/2026-11-23-why-my-deepfake-detector-needed-three-eyes.md
# remove `draft: true` when it's ready
git add blog && git commit -m "post: three eyes" && git push
```

**From the browser:** on GitHub open `blog/`, click **Add file → Create new file**, name it `2026-11-23-my-post.md`, paste the template below and commit. It's live about a minute later.

```markdown
---
title: My post title
date: 2026-11-23
tags: [ml, llm-safety]
summary: One line shown in the post list (optional; defaults to the first paragraph).
---

Normal **Markdown** here: headings, lists, `code`, fenced code blocks, tables, > quotes, links.

![diagram](images/my-diagram.png)   <- put images in blog/images/
```

- The file name sets the URL: `2026-11-23-my-post.md` is served at `fyterox.github.io/#blog/my-post`.
- `draft: true` keeps a post out of the list and the RSS feed. The file is still publicly readable in the repo, so keep real drafts off `main`.
- Readers use `blog`, `blog 1`, `blog my-post` or `blog --tag ml`. `cat blog/my-post.md` also works, and there's an RSS feed at `/feed.xml`.

## Preview locally

```bash
python3 scripts/build_blog.py && python3 -m http.server 8000
# open http://localhost:8000
```

Deep links run a command when the page opens: `/#projects`, `/#project/deepfake-detection`, `/#blog/hello-world`.
