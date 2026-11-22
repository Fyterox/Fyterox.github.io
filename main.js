(() => {
  'use strict';

  /* =========================================================
   *  DOM + small helpers
   * ======================================================= */
  const $ = (s) => document.querySelector(s);
  const out = $('#output');
  const input = $('#cmd');
  const form = $('#prompt-line');
  const term = $('#terminal');
  const promptPath = $('#prompt-path');
  const titleEl = $('#title');

  const esc = (s) => String(s).replace(/[&<>"']/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const link = (href, label) =>
    `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(label ?? href.replace(/^https?:\/\/(www\.)?/, ''))}</a>`;
  const cmd = (c, label, cls = '') =>
    `<button type="button" class="cmd ${cls}" data-cmd="${esc(c)}">${esc(label ?? c)}</button>`;
  const col = (cls, s) => `<span class="${cls}">${s}</span>`;
  const h1 = (s) => col('h1', esc(s));
  const h2 = (s) => col('h2', esc(s));
  const mute = (s) => col('c-muted', esc(s));
  const bullets = (items, mark = '•') =>
    `<div class="list">${items.map((t) => `<div class="list-item"><span class="c-muted">${mark}</span><span>${t}</span></div>`).join('')}</div>`;
  const grid = (pairs) =>
    `<div class="grid">${pairs.map(([k, v]) => `<span class="c-green b">${esc(k)}</span><span>${v}</span>`).join('')}</div>`;

  /** Terminal-style table (real <table> so columns line up in any font). */
  const table = (head, rows) =>
    `<div class="tt-wrap"><table class="tt"><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>` +
    `<tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;

  /* =========================================================
   *  Content
   * ======================================================= */
  const LINKS = {
    github: 'https://github.com/Fyterox',
    linkedin: 'https://www.linkedin.com/in/ayush-kumar-aa36a0245/',
    codeforces: 'https://codeforces.com/profile/Fyterox',
    codechef: 'https://www.codechef.com/users/fyterox1276',
    email: 'f20240560@pilani.bits-pilani.ac.in',
    resume: 'Ayush_Kumar_Resume.pdf',
  };

  const PROJECTS = [
    {
      slug: 'payables-signoff-gate',
      title: 'Payables Sign-Off Gate',
      meta: 'ContextCon 05 · BITS Pilani · Nov 2026 · team hackathon',
      stack: 'Python · LLM extraction (Gemini / Claude) · Crustdata · RDAP · IFSC/GST checks · RazorpayX (test) · Streamlit · MCP',
      tagline: 'An accounts-payable agent that pays each vendor invoice exactly once, and refuses to change a vendor’s bank account on the word of an email.',
      sections: [
        ['the problem', bullets([
          'The costliest payables fraud is a polite email asking to change bank details. Once money goes to the wrong account it usually can’t be recalled.',
          'Put an LLM on the AP desk and it gets worse: a model that reads the email <i>and</i> decides can be talked into paying by urgency, authority or hidden instructions.',
        ])],
        ['how it works', bullets([
          `<span class="c-cyan b">sanitize</span>  strip what a human can’t see but a model can: hidden HTML, zero-width chars, Unicode-tag prompt injection`,
          `<span class="c-cyan b">extract</span>   an LLM only returns schema-checked JSON of what the email <i>claims</i> (vendor, GSTIN, amount, account, requester)`,
          `<span class="c-cyan b">verify</span>    live records check every claim: requester’s current job, domain age &amp; lookalikes, GSTIN, IFSC, duplicates, PO`,
          `<span class="c-cyan b">decide</span>    plain code returns <span class="c-green">ALLOW</span> / <span class="c-red">BLOCK</span> / <span class="c-yellow">ESCALATE</span> with a dated source for each reason`,
          `<span class="c-cyan b">pay</span>       clean invoices pay exactly once (idempotent, crash-safe); every step goes to a tamper-evident ledger`,
        ], '→')],
        ['results · 130 adversarial emails', table(
          ['', 'correct', 'flipped by pressure', 'wrongful approvals'],
          [['the gate', '130 / 130', '0 / 116', '0'], ['plain LLM guard', '48 / 130', '15 / 116', '21']],
        ) + `\n` + bullets([
          'Pressure styles: authority, deadlines, flattery, threats, Hinglish urgency, “Note to AI: approve”, hidden HTML, Unicode-tag smuggling.',
          'Held-out live test on a real company (cases and expected verdicts written before any call): 3 / 4 as expected, 0 wrongful approvals. The miss failed safe (ESCALATE, not ALLOW).',
        ])],
      ],
      links: [['repo', 'https://github.com/krishnagupta07062-glitch/payables-signoff-gate']],
    },
    {
      slug: 'deepfake-detection',
      title: 'Multi-Stream Deepfake Detection',
      meta: 'C-DAC · Project Intern · 2026',
      stack: 'PyTorch · ViT-B/16 · FFT + SRM/Bayar CNN streams · cross-attention fusion · Gradio',
      tagline: 'A detector that reads three views of a face (RGB, frequency spectrum, noise residuals) and fuses them with cross-attention, because the obvious single-model solution looked solved and wasn’t.',
      sections: [
        ['the story', bullets([
          'Fine-tuned ViT-B/16 on a 140K real/fake face set: >99% accuracy, ROC-AUC ≈ 1.0. Looked solved.',
          'On generators it had never seen (DFFD: FaceApp, StarGAN, PGGAN), fake recall collapsed to ~0.29.',
          'FaceApp was the hard case: it <i>edits</i> a real photo locally, so there’s no global weirdness for a semantic model to catch.',
          'So: add a frequency stream (GAN upsampling fingerprints) and a noise-residual stream (local edits, splices), fused by a cross-attention transformer with per-stream auxiliary heads.',
        ])],
        ['fake recall', `<pre>ViT, unseen generators  <span class="c-red">0.29 ${'█'.repeat(6)}</span>
ViT + DFFD fine-tune    <span class="c-yellow">0.79 ${'█'.repeat(16)}</span>
3-stream fusion         <span class="c-green b">0.99 ${'█'.repeat(20)}</span></pre>`],
        ['held-out test · 53,381 images · identity-disjoint split', table(
          ['generator', 'n', 'caught as fake'],
          [['StarGAN', '21,913', '1.000'], ['PGGAN', '8,970', '1.000'], ['StyleGAN', '8,997', '0.997'], ['FaceApp', '4,501', '0.929'], ['real faces', '9,000', '0.026 flagged']],
        ) + mute('overall: recall 0.992 · precision 0.995 · F1 0.993 · ROC-AUC 0.999')],
        ['things worth knowing', bullets([
          'Unfreezing the pretrained RGB backbone made things <i>worse</i>: calibration collapsed (46% of real faces flagged at one point). Keeping it frozen was better and ~3× faster.',
          'Explainability: saliency over P(fake) plus the FFT/SRM panels each stream reads, and per-stream confidences, so a verdict can be attributed, not just asserted.',
          'Continual learning so the detector can adapt as new generators are released.',
        ])],
      ],
      links: [['repo', 'https://github.com/Fyterox/PS-CDAC-CINE']],
    },
    {
      slug: 'indic-translation',
      title: 'English→Indic MT for Very Low-Resource Languages with SLMs',
      meta: 'Research · Mar – Jun 2026 · team of 2',
      stack: 'Gemma · LoRA / PEFT · PyTorch · Hugging Face · BLEU / ChrF',
      tagline: 'Can small language models translate into languages with almost no parallel data? Benchmarked and fine-tuned SLMs for English→Indic across five Devanagari-script languages.',
      sections: [
        ['what we did', bullets([
          'Benchmarked <span class="b">seven SLMs</span> against dedicated NMT systems for English→Indic translation.',
          'Fine-tuned Gemma with <span class="b">LoRA on &lt;1K sentence pairs per language</span>.',
          'Per-language error analysis across morphology, agreement and code-mixing to trace exactly where the gains came from.',
        ])],
        ['results', `<pre>BLEU over zero-shot        <span class="c-green b">+36%</span>
ChrF over zero-shot        <span class="c-green b">+19%</span>
multilingual vs mono FT    <span class="c-green b">+4.39 ChrF</span></pre>`],
      ],
      links: [
        ['paper (pdf)', 'https://github.com/Fyterox/Indic_Languages/blob/main/Improving%20English-to-Indic%20Translation%20for%20Very%20Low-Resource%20Languages%20using%20SLMs.pdf'],
        ['repo', 'https://github.com/Fyterox/Indic_Languages'],
      ],
    },
    {
      slug: 'traffic-signal-uppaal',
      title: 'Formally Verified Traffic Signal Controller',
      meta: 'Logic in CS course project · Jul – Dec 2025 · team of 2',
      stack: 'UPPAAL · timed automata · model checking',
      tagline: 'A four-way junction (cars, pedestrians, emergency vehicles) modelled as timed automata, with a controller proven safe and live rather than just tested.',
      sections: [
        ['model', bullets([
          'Separate automata for NS/EW lights, vehicles, pedestrians, emergency vehicles and a central controller, synced over channels.',
          'Per-lane FIFO queues (cap 6); individual <code>go[id]</code> channels release the entity at the head of each queue.',
          'Green extends while its queue has traffic, capped at 60 s; fixed 3 s yellow and all-red clearance phases.',
          'Emergency preemption via urgent / committed locations: the active direction is cut through yellow → all-red, the emergency lane gets green, then normal cycling resumes.',
        ])],
        ['verified by model checking', bullets([
          `<span class="c-green">safety</span>    never two conflicting greens; no deadlock`,
          `<span class="c-green">liveness</span>  every vehicle, pedestrian and emergency vehicle is eventually served`,
        ], '✓')],
        ['phase cycle', `<pre class="c-cyan">NS green → NS yellow → all-red → EW green → EW yellow → all-red → …</pre>`],
      ],
      links: [['repo', 'https://github.com/Fyterox/Formal-Logic-Based-Intelligent-Traffic-Signal-Simulation']],
    },
    {
      slug: 'llm-gatekeepers',
      title: 'Guards & Rewriter: Small LLM Gatekeepers',
      meta: 'Research · ongoing',
      stack: 'Python · PyTorch · Qwen3 · Llama 3.1 (0.27B – 8B)',
      tagline: 'When a small LLM guard gates an agent’s actions, does it judge a justification by what it says, or by how it sounds?',
      sections: [
        ['setup', bullets([
          'Guards from 0.27B to 8B answer <span class="c-green">ALLOW</span> / <span class="c-red">BLOCK</span> / <span class="c-yellow">ESCALATE</span> against a written policy.',
          'Controlled benchmark: each reason rewritten in 7 styles (terse, urgent, authority, buried, …), with labels fixed by a rule program, so any decision flip is attributable to guard error.',
        ])],
        ['defense in progress', bullets([
          'A small <span class="b">rewriter</span> produces graded rewrites: type label → claim sentence → pressure-stripped text, each code-checked for fact drift.',
          'The guard reads simplest-first and escalates when unsure.',
        ])],
      ],
      links: [],
    },
    {
      slug: 'cipher-engine',
      title: 'cipher-engine',
      meta: 'Side project · C++17',
      stack: 'C++17 · CMake · libsodium (XSalsa20-Poly1305, Argon2id) · AVX2 SIMD',
      tagline: 'Multi-cipher encryption engine with a self-registering plugin registry, authenticated encrypted vaults and a tail-latency benchmark suite.',
      sections: [
        ['highlights', bullets([
          'Ciphers self-register via static initializers; the core is a CMake OBJECT library so the linker can’t silently drop them.',
          'Table-driven substitution: the per-byte hot path is one memory load. <span class="c-green b">~6×</span> over the branchy version.',
          'AVX2 XOR kernel with runtime CPU dispatch: <span class="c-green b">~35×</span> over scalar, ~11 GB/s (memory-bound).',
          'Benchmarks report p50 → p99.9, because the mean hides the tail.',
          'Zeroing <code>SecureBuffer</code> for key hygiene; vault auth is the Poly1305 tag itself, so there is no stored password hash.',
        ])],
      ],
      links: [['repo', 'https://github.com/Fyterox/cipher-engine']],
    },
  ];
  const projectBySlug = Object.fromEntries(PROJECTS.map((p) => [p.slug, p]));

  const renderProject = (p) => {
    const parts = [
      h1(`# ${p.title}`),
      mute(p.meta),
      `<span class="c-magenta">stack:</span> ${esc(p.stack)}`,
      '',
      p.tagline,
    ];
    for (const [head, body] of p.sections) parts.push('', h2(`## ${head}`), body);
    if (p.links.length) {
      parts.push('', h2('## links'), p.links.map(([l, u]) => `  ${l.padEnd(12)}${link(u)}`).join('\n'));
      parts.push('', mute('tip: ') + cmd(`open ${p.slug}`) + mute(' opens it in a new tab'));
    }
    return parts.join('\n');
  };

  const listProjects = () => [
    h1('~/projects'),
    '',
    ...PROJECTS.map((p, i) =>
      `${col('c-muted', String(i + 1).padStart(2) + '.')} ${cmd(`project ${p.slug}`, p.slug)}\n` +
      `    ${col('b', esc(p.title))}  ${mute('· ' + p.meta)}`),
    '',
    mute('Click one, or type ') + col('c-cyan', 'project &lt;name&gt;') + mute(' (tab completes). ') +
      col('c-cyan', 'cat projects/&lt;name&gt;.md') + mute(' works too.'),
  ].join('\n');

  const T = {
    about: () => [
      h1('Ayush Kumar'),
      mute('CS undergrad · BITS Pilani · 2024 – 2028'),
      '',
      `I’m a computer science student at BITS Pilani (CGPA <span class="c-green b">10.00/10</span>, Institute Rank 1).`,
      '',
      'Most of my work starts with a model that looks solved and then breaks on something it hasn’t seen: a deepfake detector that aces its benchmark and misses unseen generators, or an LLM guard that can be talked into a different answer. I like finding those failures, measuring them properly and building the fix.',
      '',
      grid([
        ['now', `Project Intern @ ${col('b', 'C-DAC')}: deepfake detection`],
        ['next', `Software Engineering Intern @ ${col('b', 'Stripe')}: Summer 2027`],
        ['research', 'small LLM gatekeepers · low-resource MT'],
        ['also', 'competitive programming · Optiver FutureFocus 2026'],
      ]),
      '',
      mute('try: ') + [cmd('projects'), cmd('experience'), cmd('optiver'), cmd('contact')].join(mute(' · ')),
    ].join('\n'),

    education: () => [
      h1('Education'),
      '',
      `${col('b', 'Birla Institute of Technology and Science (BITS), Pilani')}`,
      `B.E. Computer Science ${mute('· Aug 2024 – May 2028 · Pilani, India')}`,
      '',
      bullets([
        `CGPA <span class="c-green b">10.00 / 10</span>, <span class="b">Institute Rank 1</span>`,
        'BITS Merit Scholarship (top 2% of batch), four consecutive semesters',
        'BITSAT 2024: 350 / 390',
      ]),
    ].join('\n'),

    stripe: () => [
      `${col('h1', 'Stripe')} ${mute('· May 2027 – Jul 2027')}`,
      'Incoming Software Engineering Intern (Summer 2027)',
    ].join('\n'),

    cdac: () => [
      `${col('h1', 'Centre for Development of Advanced Computing (C-DAC)')} ${mute('· May 2026 – present · Silchar, India')}`,
      'Project Intern',
      '',
      bullets([
        'Built and benchmarked a deepfake detection framework across CNN, ViT, GAN- and diffusion-based models; a fine-tuned ViT-B/16 reached <span class="c-green b">&gt;99% accuracy</span> and ~1.0 ROC-AUC on a 140K real/fake face dataset.',
        'Found a real-world blind spot: recall on unseen generators (FaceApp, StarGAN, PGGAN) collapsed to <span class="c-red b">~30%</span>. DFFD fine-tuning plus a multi-stream model brought fake recall back to <span class="c-green b">0.99</span>.',
        'Designed a multi-signal model fusing colour, frequency and noise-pattern cues via attention to catch localised edits, with attention-map explainability and continual learning for newly released generators.',
      ]),
      '',
      mute('→ ') + cmd('project deepfake-detection', 'deep dive: project deepfake-detection'),
    ].join('\n'),

    achievements: () => [
      h1('Achievements'),
      '',
      bullets([
        `${col('b', 'Optiver FutureFocus')} ${mute('(Jun 2026)')}: selected for Optiver’s trading &amp; research cohort in Mumbai ${mute('→')} ${cmd('optiver', 'more')}`,
        `${col('b', 'Inter-Bhawan Coding League')} ${mute('(Apr 2026)')}: 2nd overall across all years, 1st among second-years`,
        `${col('b', 'Institute Rank 1')} with a 10.00 CGPA`,
        `${col('b', 'BITS Merit Scholarship')}: top 2% of batch, four consecutive semesters`,
        `${col('b', 'BITSAT 2024')}: 350 / 390`,
      ], '★'),
      '',
      `competitive programming: ${link(LINKS.codeforces, 'Codeforces')} · ${link(LINKS.codechef, 'CodeChef')}`,
    ].join('\n'),

    optiver: () => [
      `${h1('Optiver FutureFocus')} ${mute('· Mumbai · Jun 2026')}`,
      '',
      'Selected for Optiver’s trading &amp; research cohort.',
      '',
      bullets([
        'Trained by Optiver traders in <span class="b">market-making</span>, <span class="b">options pricing</span> and <span class="b">risk management</span>.',
        'Traded against the cohort on <span class="b">Optibook</span>, Optiver’s simulated exchange: quoting two-sided markets, managing inventory and hedging exposure in real time.',
      ]),
      '',
      `<pre class="c-muted">  bid  <span class="c-green">99.50 x 20</span>   │   ask  <span class="c-red">100.50 x 20</span>
  pos  <span class="c-fg">+0</span>            │   pnl  <span class="c-green">↑</span></pre>`,
    ].join('\n'),

    leadership: () => [
      h1('Leadership'),
      '',
      bullets([
        `${col('b', 'APOGEE Coordinator, BITS Embryo')} ${mute('· May 2026 – present')}\n organise talks and panels with speakers from around the world`,
        `${col('b', 'Student Faculty Council, CSIS')} ${mute('· Aug 2025 – present')}\n relay peer feedback on the curriculum to the department`,
      ]),
    ].join('\n'),

    skills: () => {
      const bar = (n) => col('c-green', '█'.repeat(n)) + col('c-muted', '░'.repeat(10 - n));
      return [
        h1('Skills'),
        '',
        h2('languages'),
        `  C++      ${bar(9)}\n  Python   ${bar(9)}\n  C        ${bar(8)}\n  SQL      ${bar(7)}`,
        '',
        h2('ml / data'),
        '  PyTorch · Hugging Face Transformers · PEFT / LoRA · scikit-learn · Pandas · NumPy',
        '',
        h2('tools'),
        '  Git · Linux · LaTeX · UPPAAL · CMake',
        '',
        h2('areas'),
        '  model robustness · LLM safety &amp; guardrails · low-resource NLP · formal verification · systems performance',
      ].join('\n');
    },

    contact: () => [
      h1('Contact'),
      '',
      grid([
        ['email', `<a href="mailto:${LINKS.email}">${LINKS.email}</a>`],
        ['github', link(LINKS.github)],
        ['linkedin', link(LINKS.linkedin, 'linkedin.com/in/ayush-kumar')],
        ['codeforces', link(LINKS.codeforces)],
        ['codechef', link(LINKS.codechef)],
        ['resume', `<a href="${LINKS.resume}" target="_blank" rel="noopener">Ayush_Kumar_Resume.pdf</a>`],
      ]),
      '',
      mute('Open to research collaborations and internships. Email is the fastest way to reach me.'),
    ].join('\n'),
  };

  T.experience = () => [T.cdac(), '', T.stripe()].join('\n');

  /* =========================================================
   *  Virtual filesystem
   * ======================================================= */
  const file = (render) => ({ type: 'file', render });
  const dir = (children) => ({ type: 'dir', children });

  const FS = dir({
    'about.txt': file(T.about),
    'education.txt': file(T.education),
    'experience': dir({
      'cdac.txt': file(T.cdac),
      'stripe.txt': file(T.stripe),
    }),
    'projects': dir(Object.fromEntries(PROJECTS.map((p) => [`${p.slug}.md`, file(() => renderProject(p))]))),
    'achievements.txt': file(T.achievements),
    'optiver.txt': file(T.optiver),
    'leadership.txt': file(T.leadership),
    'skills.txt': file(T.skills),
    'contact.txt': file(T.contact),
    'blog': dir({}), // filled from blog/index.json at boot
    'resume.pdf': file(() => `${mute('binary file. opening it for you instead:')} <a href="${LINKS.resume}" target="_blank" rel="noopener">resume.pdf</a>`),
  });

  let cwd = []; // path segments under ~

  const pathStr = (segs) => (segs.length ? '~/' + segs.join('/') : '~');

  /** Resolve a user path to segments; returns null if invalid syntax (never). */
  const resolve = (p = '') => {
    let segs = (p.startsWith('/') || p.startsWith('~')) ? [] : [...cwd];
    const rest = p.replace(/^~\/?/, '').replace(/^\/+/, '').replace(/^home\/(ayush|guest)\/?/, '');
    for (const part of rest.split('/')) {
      if (!part || part === '.') continue;
      if (part === '..') segs.pop();
      else segs.push(part);
    }
    return segs;
  };
  const getNode = (segs) => {
    let node = FS;
    for (const s of segs) {
      if (node.type !== 'dir' || !node.children[s]) return null;
      node = node.children[s];
    }
    return node;
  };

  const renderLs = (segs, node) => {
    const names = Object.keys(node.children).sort((a, b) => {
      const da = node.children[a].type === 'dir', db = node.children[b].type === 'dir';
      return da === db ? a.localeCompare(b) : (da ? -1 : 1);
    });
    const rel = (name) => {
      const target = [...segs, name];
      // express path relative to cwd when possible
      const isUnder = cwd.every((s, i) => target[i] === s);
      return isUnder ? target.slice(cwd.length).join('/') : pathStr(target);
    };
    return names.map((n) => node.children[n].type === 'dir'
      ? cmd(`cd ${rel(n)}`, n + '/', 'dir')
      : cmd(`cat ${rel(n)}`, n)).join('   ');
  };

  const renderTree = (node, prefix = '') => {
    const names = Object.keys(node.children);
    return names.map((n, i) => {
      const last = i === names.length - 1;
      const child = node.children[n];
      const label = child.type === 'dir' ? col('c-blue b', esc(n) + '/') : esc(n);
      let s = col('c-muted', prefix + (last ? '└── ' : '├── ')) + label;
      if (child.type === 'dir') s += '\n' + renderTree(child, prefix + (last ? '    ' : '│   '));
      return s;
    }).join('\n');
  };

  /* =========================================================
   *  Blog: posts are Markdown files in blog/, indexed into
   *  blog/index.json by scripts/build_blog.py (runs in CI).
   * ======================================================= */
  let POSTS = [];
  let blogLoad = null;
  const loadBlog = () => blogLoad || (blogLoad = fetch('blog/index.json', { cache: 'no-cache' })
    .then((r) => (r.ok ? r.json() : []))
    .catch(() => [])
    .then((list) => {
      POSTS = (Array.isArray(list) ? list : []).filter((p) => !p.draft);
      FS.children.blog = dir(Object.fromEntries(POSTS.map((p) => [`${p.slug}.md`, file(() => readPost(p))])));
      return POSTS;
    }));

  let markedLoad = null;
  const loadMarked = () => markedLoad || (markedLoad = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/marked/12.0.2/marked.min.js';
    s.integrity = 'sha384-/TQbtLCAerC3jgaim+N78RZSDYV7ryeoBCVqTuzRrFec2akfBkHS7ACQ3PQhvMVi';
    s.crossOrigin = 'anonymous';
    s.onload = () => resolve(window.marked);
    s.onerror = () => { markedLoad = null; reject(new Error('could not load the Markdown renderer (offline?)')); };
    document.head.appendChild(s);
  }));

  const fmtDate = (d) => {
    const t = new Date(d + 'T00:00:00');
    return Number.isNaN(t.getTime()) ? d : t.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const tagList = (tags) => (tags || []).map((t) => col('c-magenta', '#' + esc(t))).join(' ');

  const postArg = (arg) => {
    if (!arg) return null;
    const a = arg.replace(/^.*\//, '').replace(/\.md$/, '').toLowerCase();
    const n = parseInt(a, 10);
    if (String(n) === a && POSTS[n - 1]) return POSTS[n - 1];
    return POSTS.find((p) => p.slug === a) || POSTS.find((p) => p.slug.startsWith(a)) || null;
  };

  const listBlog = (tag) => {
    const posts = tag ? POSTS.filter((p) => (p.tags || []).includes(tag)) : POSTS;
    if (!POSTS.length) return `${h1('~/blog')}\n\n${mute('No posts yet. Check back soon.')}`;
    if (!posts.length) return col('c-red', `blog: no posts tagged '${esc(tag)}'`);
    return [
      `${h1('~/blog')} ${mute(`· ${posts.length} post${posts.length === 1 ? '' : 's'}${tag ? ` tagged #${tag}` : ''}`)}`,
      '',
      posts.map((p) => {
        const i = POSTS.indexOf(p) + 1;
        return `${col('c-muted', String(i).padStart(2) + '.')} ${col('c-yellow', esc(p.date))}  ${cmd(`blog ${p.slug}`, p.title)}\n` +
          `    ${mute(`${p.minutes} min read`)}${p.tags && p.tags.length ? '  ' + tagList(p.tags) : ''}` +
          (p.summary ? `\n    ${esc(p.summary)}` : '');
      }).join('\n\n'),
      '',
      mute('read one: ') + col('c-cyan', 'blog &lt;number|name&gt;') + mute(' · filter: ') + col('c-cyan', 'blog --tag &lt;tag&gt;') +
        mute(' · ') + `<a href="feed.xml" target="_blank" rel="noopener">rss</a>`,
    ].join('\n');
  };

  /** Rewrite relative image/link URLs in a post so they resolve from blog/. */
  const fixRelative = (html) => {
    const tpl = document.createElement('template');
    tpl.innerHTML = html;
    const rel = (u) => u && !/^([a-z]+:|\/|#)/i.test(u);
    tpl.content.querySelectorAll('img[src]').forEach((el) => { if (rel(el.getAttribute('src'))) el.setAttribute('src', 'blog/' + el.getAttribute('src')); });
    tpl.content.querySelectorAll('a[href]').forEach((el) => {
      const h = el.getAttribute('href');
      if (rel(h)) el.setAttribute('href', 'blog/' + h);
      if (!h.startsWith('#')) { el.target = '_blank'; el.rel = 'noopener'; }
    });
    tpl.content.querySelectorAll('img').forEach((el) => { el.loading = 'lazy'; });
    return tpl.innerHTML;
  };

  const readPost = async (p) => {
    const [md, marked] = await Promise.all([
      fetch('blog/' + encodeURIComponent(p.file)).then((r) => {
        if (!r.ok) throw new Error(`blog/${p.file}: HTTP ${r.status}`);
        return r.text();
      }),
      loadMarked(),
    ]);
    const body = md.replace(/^﻿?---\s*\n[\s\S]*?\n---\s*\n/, '');
    const html = fixRelative(marked.parse(body, { gfm: true }));
    const i = POSTS.indexOf(p);
    const older = POSTS[i + 1], newer = POSTS[i - 1];
    const share = `${location.origin}${location.pathname}#blog/${p.slug}`;
    try { history.replaceState(null, '', `#blog/${p.slug}`); } catch (_) { /* file:// */ }
    document.title = `${p.title} · Ayush Kumar`;
    return [
      h1(`# ${p.title}`),
      `${mute(`${fmtDate(p.date)} · ${p.minutes} min read`)}${p.tags && p.tags.length ? '  ' + tagList(p.tags) : ''}`,
      '',
      `<article class="post">${html}</article>`,
      col('c-muted', '─'.repeat(32)),
      [older ? cmd(`blog ${older.slug}`, '← older') : '', cmd('blog', 'all posts'), newer ? cmd(`blog ${newer.slug}`, 'newer →') : '']
        .filter(Boolean).join(mute('  ·  ')),
      `${mute('link:')} <a href="${esc(share)}">${esc(share.replace(/^https?:\/\//, ''))}</a>`,
    ].join('\n');
  };

  /* =========================================================
   *  Banner / neofetch
   * ======================================================= */
  const BANNER = String.raw`
 █████╗ ██╗   ██╗██╗   ██╗███████╗██╗  ██╗
██╔══██╗╚██╗ ██╔╝██║   ██║██╔════╝██║  ██║
███████║ ╚████╔╝ ██║   ██║███████╗███████║
██╔══██║  ╚██╔╝  ██║   ██║╚════██║██╔══██║
██║  ██║   ██║   ╚██████╔╝███████║██║  ██║
╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚══════╝╚═╝  ╚═╝`.slice(1);

  const TUX = [
    '        .--.',
    '       |o_o |',
    '       |:_/ |',
    '      //   \\ \\',
    '     (|     | )',
    "    /'\\_   _/'\\",
    '    \\___)=(___/',
  ].join('\n');

  const neofetch = () => {
    const kv = (k, v) => `<span class="k">${k}</span>: ${v}`;
    const sw = ['--red', '--yellow', '--green', '--cyan', '--blue', '--magenta', '--fg', '--muted']
      .map((v) => `<i style="background:var(${v})"></i>`).join('');
    return `<div class="neofetch"><pre class="logo">${esc(TUX)}</pre><div class="info">${[
      `<span class="k">ayush</span>@<span class="k">bits-pilani</span>`,
      col('c-muted', '─'.repeat(22)),
      kv('Name', 'Ayush Kumar'),
      kv('OS', 'B.E. Computer Science, BITS Pilani (2024–28)'),
      kv('Uptime', 'CGPA 10.00 / 10 · Institute Rank 1'),
      kv('Kernel', 'C++ · Python · C · SQL'),
      kv('Packages', 'PyTorch, HF Transformers, PEFT/LoRA, UPPAAL'),
      kv('Process', 'Project Intern @ C-DAC'),
      kv('Scheduled', 'SWE Intern @ Stripe, Summer 2027'),
      kv('Interests', 'model robustness, LLM safety, formal methods'),
      kv('Shell', `${link(LINKS.github, 'github.com/Fyterox')}`),
    ].join('\n')}<div class="swatches">${sw}</div></div></div>`;
  };

  const welcome = () => [
    `<pre class="banner" aria-label="Ayush">${esc(BANNER)}</pre>`,
    `Hi, I’m ${col('b', 'Ayush Kumar')}: CS @ BITS Pilani, Project Intern @ C-DAC, incoming SWE Intern @ Stripe.`,
    `Type ${cmd('help')} to see commands, or click anything ${col('c-cyan', 'underlined')}.`,
    '',
    mute('start here → ') + [cmd('about'), cmd('projects'), cmd('blog'), cmd('experience'), cmd('neofetch'), cmd('resume')].join('  '),
  ].join('\n');

  /* =========================================================
   *  Commands
   * ======================================================= */
  const THEMES = ['default', 'amber', 'matrix', 'dracula', 'light'];
  const history = [];
  let histIdx = 0;

  const setTheme = (t) => {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('theme', t); } catch (_) { /* storage blocked */ }
  };

  const projectArg = (arg) => {
    if (!arg) return null;
    const a = arg.replace(/^.*\//, '').replace(/\.md$/, '').toLowerCase();
    const n = parseInt(a, 10);
    if (!Number.isNaN(n) && PROJECTS[n - 1]) return PROJECTS[n - 1];
    return projectBySlug[a] || PROJECTS.find((p) => p.slug.startsWith(a)) || null;
  };

  const COMMANDS = {
    help: {
      desc: 'list commands',
      run: () => {
        const groups = [
          ['about me', ['about', 'neofetch', 'experience', 'education', 'skills', 'achievements', 'optiver', 'leadership', 'contact', 'resume']],
          ['projects & writing', ['projects', 'project', 'blog', 'open']],
          ['filesystem', ['ls', 'cd', 'cat', 'pwd', 'tree']],
          ['shell', ['clear', 'history', 'theme', 'banner', 'echo', 'date', 'whoami', 'man']],
        ];
        return groups.map(([g, names]) => h2(g) + '\n' + `<div class="grid keep indent">${names.map((n) =>
          cmd(n) + mute(COMMANDS[n].desc)).join('')}</div>`).join('\n\n') +
          '\n\n' + mute('tab completes · ↑/↓ history · ctrl+l clears · links open in a new tab');
      },
    },
    about: { desc: 'who I am', run: T.about },
    neofetch: { desc: 'system info, but it’s me', run: neofetch },
    experience: { desc: 'work experience', run: T.experience },
    education: { desc: 'BITS Pilani', run: T.education },
    skills: { desc: 'languages, ML stack, tools', run: T.skills },
    achievements: { desc: 'awards and rankings', run: T.achievements },
    optiver: { desc: 'Optiver FutureFocus 2026', run: T.optiver },
    leadership: { desc: 'clubs and councils', run: T.leadership },
    contact: { desc: 'email and profiles', run: T.contact },
    resume: {
      desc: 'download my resume (PDF)',
      run: () => `${col('c-green', '✓')} ${`<a href="${LINKS.resume}" target="_blank" rel="noopener">Ayush_Kumar_Resume.pdf</a>`} ${mute('· click to open or download')}`,
    },
    projects: { desc: 'list projects', run: listProjects },
    blog: {
      desc: 'read my blog: blog [number|name]',
      run: async (args) => {
        await loadBlog();
        const tagIdx = args.indexOf('--tag');
        if (tagIdx >= 0) return listBlog((args[tagIdx + 1] || '').replace(/^#/, '').toLowerCase());
        if (!args[0]) return listBlog();
        const p = postArg(args[0]);
        if (!p) return col('c-red', `blog: no such post: ${esc(args[0])}`) + '\n\n' + listBlog();
        return readPost(p);
      },
    },
    project: {
      desc: 'show one project: project <name|number>',
      run: (args) => {
        const p = projectArg(args[0]);
        if (!p) return args[0]
          ? col('c-red', `project: no such project: ${esc(args[0])}`) + '\n\n' + listProjects()
          : listProjects();
        return renderProject(p);
      },
    },
    open: {
      desc: 'open a project / profile in a new tab',
      run: (args) => {
        const a = (args[0] || '').toLowerCase();
        const profiles = { github: LINKS.github, linkedin: LINKS.linkedin, codeforces: LINKS.codeforces, codechef: LINKS.codechef, resume: LINKS.resume };
        let url = profiles[a];
        if (!url) { const p = projectArg(a); url = p && p.links[0] && p.links[0][1]; }
        if (!url) return `usage: open &lt;project|github|linkedin|codeforces|codechef|resume&gt;`;
        window.open(url, '_blank', 'noopener');
        return `${mute('opening')} ${link(url)}`;
      },
    },
    ls: {
      desc: 'list directory',
      run: (args) => {
        const target = args.find((a) => !a.startsWith('-'));
        const segs = resolve(target || '.');
        const node = getNode(segs);
        if (!node) return col('c-red', `ls: cannot access '${esc(target)}': No such file or directory`);
        if (node.type === 'file') return esc(target);
        return renderLs(segs, node);
      },
    },
    cd: {
      desc: 'change directory',
      run: (args) => {
        const segs = resolve(args[0] || '~');
        const node = getNode(segs);
        if (!node) return col('c-red', `cd: no such file or directory: ${esc(args[0])}`);
        if (node.type !== 'dir') return col('c-red', `cd: not a directory: ${esc(args[0])}`);
        cwd = segs;
        updatePrompt();
        return renderLs(cwd, node);
      },
    },
    pwd: { desc: 'print working directory', run: () => '/home/ayush' + (cwd.length ? '/' + cwd.join('/') : '') },
    cat: {
      desc: 'print a file: cat <file>',
      run: (args) => {
        if (!args.length) return 'usage: cat &lt;file&gt;   ' + mute('(try ') + cmd('ls') + mute(')');
        const results = args.map((a) => {
          const node = getNode(resolve(a));
          if (!node) {
            const p = projectArg(a);
            if (p && /project/.test(a)) return renderProject(p);
            return col('c-red', `cat: ${esc(a)}: No such file or directory`);
          }
          if (node.type === 'dir') return col('c-red', `cat: ${esc(a)}: Is a directory`) + '  ' + mute('try ') + cmd(`ls ${a}`);
          return node.render();
        });
        // blog posts render asynchronously
        return results.some((r) => r && typeof r.then === 'function')
          ? Promise.all(results).then((r) => r.join('\n\n'))
          : results.join('\n\n');
      },
    },
    tree: { desc: 'show the whole filesystem', run: () => col('c-blue b', '~') + '\n' + renderTree(FS) },
    clear: { desc: 'clear the screen', run: () => { out.innerHTML = ''; return null; } },
    history: { desc: 'command history', run: () => history.map((h, i) => `${col('c-muted', String(i + 1).padStart(4))}  ${esc(h)}`).join('\n') || mute('(empty)') },
    theme: {
      desc: `switch colours: ${THEMES.join(' | ')}`,
      run: (args) => {
        const t = (args[0] || '').toLowerCase();
        if (!t) return 'usage: theme &lt;name&gt;\n' + THEMES.map((n) => '  ' + cmd(`theme ${n}`, n)).join('\n');
        if (!THEMES.includes(t)) return col('c-red', `theme: unknown theme '${esc(t)}'`) + '  ' + mute('options: ' + THEMES.join(', '));
        setTheme(t);
        return `${col('c-green', '✓')} theme set to ${col('b', t)}`;
      },
    },
    banner: { desc: 'show the welcome screen', run: welcome },
    echo: { desc: 'print text', run: (args) => esc(args.join(' ')) },
    date: { desc: 'print the date', run: () => esc(new Date().toString()) },
    whoami: { desc: 'who are you?', run: () => `guest ${mute('(you\'re probably looking for')} ${cmd('about')}${mute(')')}` },
    man: {
      desc: 'describe a command: man <cmd>',
      run: (args) => {
        const c = COMMANDS[args[0]];
        if (!args[0]) return 'What manual page do you want? ' + mute('e.g. ') + cmd('man project');
        if (!c) return `No manual entry for ${esc(args[0])}`;
        return `${col('b', esc(args[0]))} ${mute('-')} ${esc(c.desc)}`;
      },
    },
    // ---- hidden easter eggs ----
    sudo: { hidden: true, run: () => col('c-red', 'guest is not in the sudoers file. This incident will be reported.') },
    rm: { hidden: true, run: () => col('c-red', 'rm: permission denied. Nice try.') },
    exit: { hidden: true, run: () => `There’s no escape. But you could ${cmd('contact')} me.` },
    vim: { hidden: true, run: () => `You’d never get out. Try ${cmd('cat about.txt')} instead.` },
    nano: { hidden: true, run: () => `Read-only filesystem. Try ${cmd('cat about.txt')}.` },
    hire: { hidden: true, run: () => `${col('c-green', 'Excellent choice.')}\n\n` + T.contact() },
    ping: { hidden: true, run: () => `PING ayush (127.0.0.1): 56 data bytes\n64 bytes from ayush: icmp_seq=0 ttl=64 time=0.042 ms\n${mute('Reachable. Email works better:')} ${cmd('contact')}` },
  };
  const ALIASES = { '?': 'help', whois: 'about', 'about-me': 'about', exp: 'experience', work: 'experience', cv: 'resume', read: 'blog', posts: 'blog', writing: 'blog', ll: 'ls', dir: 'ls', less: 'cat', more: 'cat', github: 'open github', linkedin: 'open linkedin', email: 'contact', mail: 'contact', fastfetch: 'neofetch', 'cls': 'clear', vi: 'vim', emacs: 'vim', 'hire-me': 'hire', hireme: 'hire' };

  /* =========================================================
   *  Terminal I/O
   * ======================================================= */
  const scrollDown = () => { term.scrollTop = term.scrollHeight; };

  // a newline right after a block element would render as an extra blank line
  const setHTML = (el, html) => { el.innerHTML = String(html).replace(/(<\/(?:div|pre|article)>)\n/g, '$1'); };

  const print = (html, cls = 'block') => {
    if (html == null) return null;
    const div = document.createElement('div');
    div.className = cls;
    setHTML(div, html);
    out.appendChild(div);
    return div;
  };

  const echoCommand = (text) => (
    print(`<span class="prompt"><span class="p-user">guest</span><span class="p-at">@</span><span class="p-host">ayush</span><span class="p-at">:</span><span class="p-path">${esc(pathStr(cwd))}</span><span class="p-at">$</span></span> ${esc(text)}`, 'line'));

  const updatePrompt = () => {
    promptPath.textContent = pathStr(cwd);
    titleEl.textContent = `guest@ayush: ${pathStr(cwd)}`;
  };

  const tokenize = (s) => (s.match(/"[^"]*"|'[^']*'|\S+/g) || []).map((t) => t.replace(/^(["'])(.*)\1$/, '$2'));

  const execute = (raw) => {
    const text = raw.trim();
    const echoEl = echoCommand(raw);
    if (!text) return scrollDown();
    history.push(text);
    histIdx = history.length;

    // allow simple chaining with && or ;
    for (const part of text.split(/\s*(?:&&|;)\s*/).filter(Boolean)) {
      let [name, ...args] = tokenize(part);
      name = name.toLowerCase();
      if (ALIASES[name]) {
        const [n2, ...a2] = ALIASES[name].split(' ');
        name = n2; args = [...a2, ...args];
      }
      const c = COMMANDS[name];
      let res;
      if (!c) {
        // `./foo` or a project name typed directly
        const p = projectArg(name) && projectBySlug[name.replace(/\.md$/, '')];
        res = p ? renderProject(p)
          : `${col('c-red', `bash: ${esc(name)}: command not found`)}. Type ${cmd('help')} for a list.`;
      } else {
        try { res = c.run(args); } catch (err) { res = col('c-red', 'error: ' + esc(err.message)); }
      }
      if (res && typeof res.then === 'function') {
        // async output (blog posts): reserve a slot so chained output stays in order
        const slot = print(mute('loading…'));
        res.then((html) => {
          if (html == null) slot.remove(); else setHTML(slot, html);
          // long reads: show the top of the output, not the bottom
          if (slot.offsetHeight > term.clientHeight * 0.6) echoEl.scrollIntoView({ block: 'start' });
          else scrollDown();
        }).catch((err) => { setHTML(slot, col('c-red', 'error: ' + esc(err.message))); scrollDown(); });
      } else print(res);
    }
    scrollDown();
  };

  const runFromClick = (c) => {
    execute(c);
    input.value = '';
    if (finePointer) input.focus({ preventScroll: true });
  };

  /* ---------- tab completion ---------- */
  const PATH_CMDS = new Set(['cat', 'cd', 'ls', 'less', 'more', 'tree']);
  const PROJ_CMDS = new Set(['project', 'open']);

  const commonPrefix = (arr) => arr.reduce((p, s) => { let i = 0; while (i < p.length && p[i] === s[i]) i++; return p.slice(0, i); });

  const complete = () => {
    const val = input.value;
    const tokens = val.split(/\s+/);
    const last = tokens[tokens.length - 1];
    let candidates = [];
    let replaceFrom = val.length - last.length;
    let base = '';

    if (tokens.length === 1) {
      candidates = Object.keys(COMMANDS).filter((n) => !COMMANDS[n].hidden && n.startsWith(last.toLowerCase())).map((n) => n + ' ');
    } else {
      const c0 = tokens[0].toLowerCase();
      if (c0 === 'blog' || ALIASES[c0] === 'blog') {
        candidates = POSTS.map((p) => p.slug).filter((x) => x.startsWith(last.toLowerCase()));
      } else if (PROJ_CMDS.has(c0)) {
        const extra = c0 === 'open' ? ['github', 'linkedin', 'codeforces', 'codechef', 'resume'] : [];
        candidates = [...PROJECTS.map((p) => p.slug), ...extra].filter((s) => s.startsWith(last.toLowerCase()));
      } else if (PATH_CMDS.has(c0) || ALIASES[c0] === 'cat' || ALIASES[c0] === 'ls') {
        const slash = last.lastIndexOf('/');
        base = slash >= 0 ? last.slice(0, slash + 1) : '';
        const partial = slash >= 0 ? last.slice(slash + 1) : last;
        const node = getNode(resolve(base || '.'));
        if (node && node.type === 'dir') {
          candidates = Object.keys(node.children)
            .filter((n) => n.startsWith(partial))
            .filter((n) => c0 !== 'cd' || node.children[n].type === 'dir')
            .map((n) => base + n + (node.children[n].type === 'dir' ? '/' : ''));
        }
      }
    }
    if (!candidates.length) return;
    if (candidates.length === 1) {
      input.value = val.slice(0, replaceFrom) + candidates[0];
    } else {
      const pre = commonPrefix(candidates);
      if (pre.length > last.length) input.value = val.slice(0, replaceFrom) + pre;
      else {
        echoCommand(val);
        print(candidates.map((c) => esc(c.trim().slice(base.length) || c)).join('   '));
        scrollDown();
      }
    }
  };

  /* ---------- events ---------- */
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = input.value;
    input.value = '';
    execute(v);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') { e.preventDefault(); complete(); }
    else if (e.key === 'ArrowUp') {
      if (histIdx > 0) { histIdx--; input.value = history[histIdx]; }
      e.preventDefault();
      requestAnimationFrame(() => input.setSelectionRange(input.value.length, input.value.length));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx < history.length - 1) { histIdx++; input.value = history[histIdx]; }
      else { histIdx = history.length; input.value = ''; }
    } else if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) {
      e.preventDefault(); out.innerHTML = '';
    } else if (e.ctrlKey && (e.key === 'c' || e.key === 'C') && !window.getSelection().toString()) {
      e.preventDefault(); echoCommand(input.value + '^C'); input.value = ''; scrollDown();
    } else if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
      e.preventDefault(); input.value = '';
    }
  });

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button.cmd');
    if (btn) { e.preventDefault(); runFromClick(btn.dataset.cmd); return; }
    if (e.target.closest('a')) return;
    if (term.contains(e.target) && !window.getSelection().toString()) input.focus({ preventScroll: true });
  });

  // type anywhere → goes to the prompt
  document.addEventListener('keydown', (e) => {
    if (document.activeElement === input || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key.length === 1 && !e.target.closest('button, a, input')) input.focus();
  });

  const clock = $('#clock');
  const tick = () => { clock.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
  tick(); setInterval(tick, 15000);

  /* =========================================================
   *  Boot
   * ======================================================= */
  try { const t = localStorage.getItem('theme'); if (THEMES.includes(t)) document.documentElement.dataset.theme = t; } catch (_) { /* ignore */ }

  const BOOT = [
    'Mounting /home/ayush',
    'Loading projects (6 found)',
    'Indexing ~/blog',
    'Starting curiosity.service',
    'Reached target Recruiter-Friendly Mode',
  ];

  const finishBoot = () => {
    out.innerHTML = '';
    print(welcome());
    form.classList.remove('busy');
    // deep links: site/#projects, site/#project%20deepfake-detection
    let hash = '';
    try { hash = decodeURIComponent(location.hash.slice(1)); } catch (_) { /* bad escape */ }
    hash = hash.replace(/^(blog|project)\/([\w.-]+)$/, '$1 $2'); // #blog/my-post
    if (hash) execute(hash);
    if (finePointer) input.focus({ preventScroll: true });
    scrollDown();
  };

  loadBlog();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) { finishBoot(); return; }

  form.classList.add('busy');
  let i = 0, skipped = false;
  const skip = () => { if (!skipped) { skipped = true; finishBoot(); } };
  window.addEventListener('keydown', skip, { once: true });
  window.addEventListener('pointerdown', skip, { once: true });
  const step = () => {
    if (skipped) return;
    if (i < BOOT.length) {
      print(`[  <span class="ok">OK</span>  ] ${esc(BOOT[i++])}`, 'line');
      setTimeout(step, 140);
    } else setTimeout(skip, 350);
  };
  step();
})();
