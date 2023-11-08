import {marked} from 'marked';
import {renderer} from './renderer';

import {docsWalkTokens} from './docs-walk-tokens';
import {hooks} from './hooks';
import { docsCardContainerExtension, docsCardExtension } from './tranformations/docs-card';
import { docsCalloutExtension } from './tranformations/docs-callout';
import { docsDecorativeHeaderExtension } from './tranformations/docs-decorative-header';
import { docsPillExtension, docsPillRowExtension } from './tranformations/docs-pill';
import { docsStepExtension, docsWorkflowExtension } from './tranformations/docs-workflow';
import { docsCodeExtension, docsCodeMultifileExtension, docsTripleTickMarkdownCodeExtension } from './tranformations/docs-code';
import { docsAlertExtension } from './tranformations/docs-alert';
import { docsVideoExtension } from './tranformations/docs-video';

let markedSetup = false;

function setupMarked() {
  if (markedSetup) {
    return;
  }
  marked.use(<any>{
    mangle: false,
    headerIds: false,
    renderer,
    hooks,
    extensions: [
      /** Custom Extensions are @type marked.TokenizerAndRendererExtension but the this.renderer uses a custom Token that extends marked.Tokens.Generic which is not exported by @types/marked */
      // @ts-ignore @types/marked
      docsCardExtension,
      // @ts-ignore @types/marked
      docsCardContainerExtension,
      // @ts-ignore @types/marked
      docsCalloutExtension,
      // @ts-ignore @types/marked
      docsDecorativeHeaderExtension,
      // @ts-ignore @types/marked
      docsPillRowExtension,
      // @ts-ignore @types/marked
      docsPillExtension,
      // @ts-ignore @types/marked
      docsWorkflowExtension,
      // @ts-ignore @types/marked
      docsStepExtension,
      // @ts-ignore @types/marked
      docsCodeExtension,
      // @ts-ignore @types/marked
      docsCodeMultifileExtension,
      // @ts-ignore @types/marked
      docsTripleTickMarkdownCodeExtension,
      // @ts-ignore @types/marked
      docsAlertExtension,
      // @ts-ignore @types/marked
      docsVideoExtension,
    ],

    // Marked will return a promise if the async option is true.
    // The async option will tell marked to await any walkTokens functions before parsing the tokens and returning an HTML string.
    // More details: https://marked.js.org/using_pro#async
    async: true,
    walkTokens: docsWalkTokens,
  });
}

/** Given the file name of a markdown file, return the corresponding html file name.  */
export function markdownFilenameToHtmlFilename(fileName: string): string {
  if (!fileName.toLowerCase().endsWith('.md')) {
    throw new Error(`Input file "${fileName}" does not end in a ".md" file extension.`);
  }

  return fileName.substring(0, fileName.length - '.md'.length) + '.html';
}

/** Renders markdown to html with additional Angular-specific extensions. */
export function markdownToHtml(markdownSource: string): string {
  setupMarked();
  return marked.parse(markdownSource);
}
