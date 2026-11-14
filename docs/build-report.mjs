#!/usr/bin/env node
/**
 * Renders docs/SECURITY_REVIEW.md into a single self-contained HTML file.
 *
 * Deliberately dependency-free and deliberately self-contained: the output has no
 * external stylesheet, no CDN script, no webfont and no remote image. A security
 * report is read by people who will open it from an email attachment or an air-gapped
 * machine, and a document that phones home to a CDN is a document that leaks the
 * reader's IP and breaks offline. Everything is inlined.
 *
 *   node docs/build-report.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = path.join(__dirname, 'SECURITY_REVIEW.md');
const target = path.join(__dirname, 'security-review.html');

const md = fs.readFileSync(source, 'utf8');

const escapeHtml = (text) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Inline markdown: code, bold, italic, links. Escapes first, so nothing injects. */
const inline = (text) => {
  let out = escapeHtml(text);
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  out = out.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    '<a href="$2" rel="noopener noreferrer">$1</a>'
  );
  return out;
};

/** Anchor id from heading text, for the table of contents. */
const slug = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

const lines = md.split('\n');
const html = [];
const toc = [];

let i = 0;
while (i < lines.length) {
  const line = lines[i];

  // fenced code block
  if (line.startsWith('```')) {
    const lang = line.slice(3).trim();
    const body = [];
    i += 1;
    while (i < lines.length && !lines[i].startsWith('```')) body.push(lines[i++]);
    i += 1;
    html.push(
      `<pre class="code"${lang ? ` data-lang="${escapeHtml(lang)}"` : ''}><code>${escapeHtml(body.join('\n'))}</code></pre>`
    );
    continue;
  }

  // table
  if (line.trim().startsWith('|') && lines[i + 1] && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
    const parseRow = (raw) =>
      raw
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((cell) => cell.trim());

    const head = parseRow(line);
    i += 2;
    const rows = [];
    while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(parseRow(lines[i++]));

    html.push(
      `<table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead>` +
        `<tbody>${rows
          .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`)
          .join('')}</tbody></table>`
    );
    continue;
  }

  // headings
  const heading = line.match(/^(#{1,4})\s+(.*)$/);
  if (heading) {
    const level = heading[1].length;
    const text = heading[2].trim();
    const id = slug(text);
    if (level === 2) toc.push({ id, text });
    html.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
    i += 1;
    continue;
  }

  if (/^---+\s*$/.test(line)) {
    html.push('<hr>');
    i += 1;
    continue;
  }

  // blockquote
  if (line.startsWith('> ')) {
    const body = [];
    while (i < lines.length && lines[i].startsWith('> ')) body.push(lines[i++].slice(2));
    html.push(`<blockquote>${inline(body.join(' '))}</blockquote>`);
    continue;
  }

  // lists (bulleted and numbered, single level with nested indentation)
  if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
    const ordered = /^\s*\d+\.\s+/.test(line);
    const items = [];
    while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) {
      const raw = lines[i].replace(/^\s*([-*]|\d+\.)\s+/, '');
      const indent = lines[i].match(/^\s*/)[0].length;
      items.push({ text: raw, indent });
      i += 1;
      // continuation lines of the same item
      while (i < lines.length && lines[i].trim() && !/^\s*([-*]|\d+\.)\s+/.test(lines[i]) && lines[i].startsWith('  ')) {
        items[items.length - 1].text += ` ${lines[i].trim()}`;
        i += 1;
      }
    }
    const tag = ordered ? 'ol' : 'ul';
    html.push(`<${tag}>${items.map((it) => `<li>${inline(it.text)}</li>`).join('')}</${tag}>`);
    continue;
  }

  // paragraph
  if (line.trim()) {
    const body = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('```') &&
      !lines[i].startsWith('|') &&
      !lines[i].startsWith('> ') &&
      !/^\s*([-*]|\d+\.)\s+/.test(lines[i]) &&
      !/^---+\s*$/.test(lines[i])
    ) {
      body.push(lines[i++].trim());
    }
    html.push(`<p>${inline(body.join(' '))}</p>`);
    continue;
  }

  i += 1;
}

// Wrap the leading run of "**Key:** value" paragraphs in a metadata card.
{
  const h1 = html.findIndex((chunk) => chunk.startsWith('<h1'));
  if (h1 !== -1) {
    let end = h1 + 1;
    while (end < html.length && /^<p><strong>[^<]+:<\/strong>/.test(html[end])) end += 1;
    if (end > h1 + 1) html.splice(h1 + 1, end - h1 - 1, `<div class="meta">${html.slice(h1 + 1, end).join('')}</div>`);
  }
}

const title = 'SecureBank — Security Review & Remediation Plan';

const document = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="referrer" content="no-referrer">
<meta name="description" content="Security review and remediation plan for the enterprise-fintech-banking repository.">
<title>${title}</title>
<style>
/* All styling is inline and local. No CDN, no webfont, no remote asset. */
:root {
  --bg: #ffffff; --fg: #16181d; --muted: #5b6472; --line: #e2e6ec;
  --accent: #0b5fff; --code-bg: #f5f7fa; --quote-bg: #f7f9fc;
  --crit: #b42318; --crit-bg: #fef3f2; --high: #b54708; --high-bg: #fffaeb;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #14161a; --fg: #e7e9ee; --muted: #9aa3b2; --line: #262a31;
    --accent: #6ea8ff; --code-bg: #1b1e24; --quote-bg: #1a1d23;
    --crit: #f97066; --crit-bg: #2a1a19; --high: #fdb022; --high-bg: #2a2115;
  }
}
* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0; padding: 0 1.25rem 5rem;
  background: var(--bg); color: var(--fg);
  font: 16px/1.65 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
.wrap { max-width: 54rem; margin: 0 auto; }
h1, h2, h3, h4 { line-height: 1.25; font-weight: 650; letter-spacing: -0.01em; }
h1 { font-size: 1.95rem; margin: 2.25rem 0 0.5rem; }
h2 { font-size: 1.4rem; margin: 2.75rem 0 0.75rem; padding-bottom: 0.4rem; border-bottom: 1px solid var(--line); }
h3 { font-size: 1.1rem; margin: 1.9rem 0 0.5rem; }
h4 { font-size: 1rem; margin: 1.5rem 0 0.4rem; }
p { margin: 0.75rem 0; }
a { color: var(--accent); text-decoration: none; border-bottom: 1px solid color-mix(in srgb, var(--accent) 35%, transparent); }
a:hover, a:focus-visible { border-bottom-color: var(--accent); }
a:focus-visible, code:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
code {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-size: 0.875em; background: var(--code-bg);
  padding: 0.12em 0.38em; border-radius: 4px;
  word-break: break-word;
}
pre.code {
  background: var(--code-bg); border: 1px solid var(--line); border-radius: 8px;
  padding: 0.95rem 1.05rem; overflow-x: auto; margin: 1rem 0;
  position: relative;
}
pre.code code { background: none; padding: 0; font-size: 0.84rem; line-height: 1.55; }
pre.code[data-lang]::before {
  content: attr(data-lang); position: absolute; top: 0.35rem; right: 0.6rem;
  font-size: 0.66rem; letter-spacing: 0.07em; text-transform: uppercase; color: var(--muted);
}
blockquote {
  margin: 1.1rem 0; padding: 0.85rem 1.1rem;
  background: var(--quote-bg); border-left: 3px solid var(--accent);
  border-radius: 0 8px 8px 0; color: var(--fg);
}
blockquote p { margin: 0; }
hr { border: 0; border-top: 1px solid var(--line); margin: 2.25rem 0; }
ul, ol { margin: 0.75rem 0; padding-left: 1.4rem; }
li { margin: 0.34rem 0; }
table { border-collapse: collapse; width: 100%; margin: 1.15rem 0; font-size: 0.9rem; display: block; overflow-x: auto; }
th, td { border: 1px solid var(--line); padding: 0.5rem 0.65rem; text-align: left; vertical-align: top; }
th { background: var(--code-bg); font-weight: 650; white-space: nowrap; }
tbody tr:nth-child(even) { background: color-mix(in srgb, var(--code-bg) 45%, transparent); }
/* Severity emphasis on the finding headings. */
h3[id^="c-"] { color: var(--crit); }
h3[id^="h-"] { color: var(--high); }
.meta {
  background: var(--code-bg); border: 1px solid var(--line); border-radius: 10px;
  padding: 1rem 1.15rem; margin: 1.25rem 0 0; font-size: 0.9rem;
}
.meta p { margin: 0.25rem 0; }
.meta strong { color: var(--muted); font-weight: 600; min-width: 8.5rem; display: inline-block; }
nav.toc {
  border: 1px solid var(--line); border-radius: 10px; padding: 1rem 1.25rem;
  margin: 1.75rem 0; background: var(--quote-bg);
}
nav.toc h2 { margin: 0 0 0.6rem; padding: 0; border: 0; font-size: 0.8rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
nav.toc ol { margin: 0; padding-left: 1.15rem; }
nav.toc li { margin: 0.28rem 0; font-size: 0.92rem; }
.badge {
  display: inline-block; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em;
  text-transform: uppercase; padding: 0.15rem 0.5rem; border-radius: 999px;
  vertical-align: middle; margin-left: 0.5rem;
}
.badge.crit { background: var(--crit-bg); color: var(--crit); }
.badge.high { background: var(--high-bg); color: var(--high); }
footer { margin-top: 3rem; padding-top: 1.25rem; border-top: 1px solid var(--line); color: var(--muted); font-size: 0.85rem; }
@media print {
  body { padding: 0; font-size: 11pt; }
  pre.code, table, blockquote { break-inside: avoid; }
  h2, h3 { break-after: avoid; }
  a { color: inherit; border: 0; }
  nav.toc { display: none; }
}
</style>
</head>
<body>
<div class="wrap">
${html.join('\n')}
<footer>
  Generated from <code>docs/SECURITY_REVIEW.md</code> by <code>node docs/build-report.mjs</code>.
  Self-contained: no external stylesheet, script, font or image. Edit the Markdown and re-run.
</footer>
</div>
</body>
</html>
`;

// Inject the table of contents after the metadata block, and severity badges.
let out = document;
const tocHtml = `<nav class="toc" aria-label="Table of contents"><h2>Contents</h2><ol>${toc
  .map((entry) => `<li><a href="#${entry.id}">${inline(entry.text)}</a></li>`)
  .join('')}</ol></nav>`;
const hrIndex = out.indexOf('<hr>');
out = hrIndex === -1 ? out : out.slice(0, hrIndex + 5) + '\n' + tocHtml + out.slice(hrIndex + 5);

out = out.replace(/<h3 id="(c-\d+[^"]*)">/g, '<h3 id="$1"><span class="badge crit">Critical</span> ');
out = out.replace(/<h3 id="(h-\d+[^"]*)">/g, '<h3 id="$1"><span class="badge high">High</span> ');

fs.writeFileSync(target, out);

const kb = (Buffer.byteLength(out) / 1024).toFixed(1);
console.log(`Wrote ${path.relative(process.cwd(), target)} — ${kb} kB, ${toc.length} sections in the contents list.`);

// Prove the self-contained claim rather than asserting it.
const external = out.match(/(?:src|href)="(?!#)([^"]+)"/g) || [];
const remote = external.filter((attr) => /^["']?(?:https?:)?\/\//.test(attr.replace(/^(?:src|href)="/, '')));
if (remote.length) {
  console.error(`FAIL: external references found: ${remote.join(', ')}`);
  process.exit(1);
}
console.log(`Self-contained: ${external.length} internal link(s), 0 remote references.`);
