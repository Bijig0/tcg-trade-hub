/**
 * Converts a subset of markdown to HTML for chat message rendering.
 * Supports: fenced code blocks, links, bold, inline code, line breaks.
 * HTML-escapes input first to prevent XSS.
 */
export const simpleMarkdown = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(
      /```(\w*)\n([\s\S]*?)```/g,
      '<pre class="my-2 rounded-lg bg-secondary/50 p-3 text-xs font-mono overflow-x-auto"><code>$2</code></pre>',
    )
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline underline-offset-2">$1</a>',
    )
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(
      /`([^`]+)`/g,
      '<code class="rounded bg-secondary/50 px-1.5 py-0.5 text-xs font-mono">$1</code>',
    )
    .replace(/\n/g, '<br />');
