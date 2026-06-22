export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\|/g, '')
    .replace(/[-]{2,}/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^>{1,}\s*/gm, '')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function cleanPlaceholders(text: string): string {
  return text.replace(/\[Insert\s+[^\]]*\]/gi, '').replace(/\[\s*\]/g, '');
}

function processBoldItalic(line: string): string {
  return line
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, (_, content) => {
      if (content.startsWith(' ') || content.endsWith(' ')) return _;
      return `<em>${content}</em>`;
    })
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background:#f4f4f5;padding:2px 6px;border-radius:3px;font-size:0.9em;color:#e11d48">$1</code>')
    .replace(/\[([^\]]*)\]\(([^)]*)\)/g, '<a href="$2" style="color:#2563eb;text-decoration:underline">$1</a>');
}

function convertTable(lines: string[], startIdx: number): { html: string; endIdx: number } {
  const rows: string[][] = [];
  let i = startIdx;
  while (i < lines.length && lines[i].trim().startsWith('|')) {
    const cells = lines[i]
      .split('|')
      .filter(c => c.trim() !== '---' && c.trim() !== '')
      .map(c => c.trim());
    if (cells.length > 0 && !lines[i].includes('---')) {
      rows.push(cells);
    } else if (lines[i].includes('---') && rows.length === 0) {
      rows.push([]);
    }
    i++;
  }

  if (rows.length === 0) return { html: '', endIdx: i };

  const header = rows[0];
  const body = rows.slice(1).filter(r => r.length > 0);

  let html = '<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:13px;border:1px solid #d1d5db">';
  html += '<thead><tr>';
  for (const cell of header) {
    html += `<th style="background:#1a1a2e;color:#fff;padding:10px 14px;text-align:left;font-weight:700;border:1px solid #334155;text-transform:uppercase;letter-spacing:0.5px;font-size:11px">${processBoldItalic(escapeHtml(cell))}</th>`;
  }
  html += '</tr></thead><tbody>';
  for (const row of body) {
    html += '<tr>';
    for (const cell of row) {
      html += `<td style="padding:10px 14px;border:1px solid #e5e7eb;color:#374151;line-height:1.5">${processBoldItalic(escapeHtml(cell))}</td>`;
    }
    html += '</tr>';
  }
  html += '</tbody></table>';
  return { html, endIdx: i };
}

export function markdownToHtml(markdown: string): string {
  const cleaned = cleanPlaceholders(markdown);
  const lines = cleaned.split('\n');
  const result: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === '') {
      if (inList) { result.push('</ul>'); inList = false; }
      continue;
    }

    if (trimmed.startsWith('|') && trimmed.includes('|')) {
      if (inList) { result.push('</ul>'); inList = false; }
      const { html, endIdx } = convertTable(lines, i);
      if (html) {
        result.push(html);
        i = endIdx - 1;
        continue;
      }
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      if (inList) { result.push('</ul>'); inList = false; }
      const level = headingMatch[1].length;
      const content = processBoldItalic(escapeHtml(headingMatch[2]));
      const sizes: Record<number, string> = {
        1: '28px', 2: '22px', 3: '18px', 4: '16px', 5: '14px', 6: '13px'
      };
      result.push(`<h${level} style="font-size:${sizes[level] || '16px'};font-weight:800;margin:24px 0 12px 0;color:#1a1a2e;letter-spacing:-0.3px">${content}</h${level}>`);
      continue;
    }

    const hrMatch = trimmed.match(/^[-*_]{3,}$/);
    if (hrMatch) {
      if (inList) { result.push('</ul>'); inList = false; }
      result.push('<hr style="border:none;border-top:2px solid #e5e7eb;margin:24px 0" />');
      continue;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const content = processBoldItalic(escapeHtml(trimmed.substring(2)));
      if (!inList) { result.push('<ul style="padding-left:24px;margin:12px 0">'); inList = true; }
      result.push(`<li style="margin-bottom:6px;color:#333;line-height:1.6">${content}</li>`);
      continue;
    }

    const olMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      if (inList) { result.push('</ul>'); inList = false; }
      const content = processBoldItalic(escapeHtml(olMatch[1]));
      result.push(`<p style="margin:4px 0;padding-left:24px;color:#333;line-height:1.6"><span style="font-weight:700;color:#1a1a2e;margin-right:8px">${olMatch[0].match(/^\d+\./)?.[0] || ''}</span>${content}</p>`);
      continue;
    }

    if (trimmed.startsWith('> ')) {
      if (inList) { result.push('</ul>'); inList = false; }
      const content = processBoldItalic(escapeHtml(trimmed.substring(2)));
      result.push(`<blockquote style="margin:12px 0;padding:12px 20px;border-left:4px solid #3b82f6;background:#f8fafc;color:#475569;font-style:italic;line-height:1.6">${content}</blockquote>`);
      continue;
    }

    if (inList) { result.push('</ul>'); inList = false; }

    const processed = processBoldItalic(escapeHtml(trimmed));
    result.push(`<p style="margin:8px 0;color:#333;line-height:1.8">${processed}</p>`);
  }

  if (inList) result.push('</ul>');

  return result.join('\n');
}
