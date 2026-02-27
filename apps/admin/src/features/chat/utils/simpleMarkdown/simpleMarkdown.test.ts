import { describe, it, expect } from 'vitest';
import { simpleMarkdown } from './simpleMarkdown';

describe('simpleMarkdown', () => {
  it('should pass through plain text', () => {
    expect(simpleMarkdown('Hello world')).toBe('Hello world');
  });

  it('should escape HTML entities', () => {
    expect(simpleMarkdown('<script>alert("xss")</script>')).toContain(
      '&lt;script&gt;',
    );
  });

  it('should render bold text', () => {
    expect(simpleMarkdown('This is **bold** text')).toContain(
      '<strong class="font-semibold">bold</strong>',
    );
  });

  it('should render inline code', () => {
    const result = simpleMarkdown('Use `console.log` here');
    expect(result).toContain('<code');
    expect(result).toContain('console.log');
  });

  it('should render fenced code blocks', () => {
    const input = '```js\nconst x = 1;\n```';
    const result = simpleMarkdown(input);
    expect(result).toContain('<pre');
    expect(result).toContain('const x = 1;');
  });

  it('should render links', () => {
    const result = simpleMarkdown('Visit [Google](https://google.com)');
    expect(result).toContain('href="https://google.com"');
    expect(result).toContain('>Google</a>');
    expect(result).toContain('target="_blank"');
  });

  it('should convert newlines to <br />', () => {
    expect(simpleMarkdown('Line 1\nLine 2')).toContain('Line 1<br />Line 2');
  });

  it('should handle combined markdown', () => {
    const input = '**Bold** and `code` on same line';
    const result = simpleMarkdown(input);
    expect(result).toContain('<strong');
    expect(result).toContain('<code');
  });
});
