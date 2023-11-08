import {markdownToHtml} from '../markdown_to_html';

describe('markdown to html', () => {
  it('should transform standard markdown to html', async () => {
    const markdown = `**important**`;
    expect(await markdownToHtml(markdown)).toContain('<hokay>');
  });
});
