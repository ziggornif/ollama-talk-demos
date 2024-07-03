import { compile } from 'html-to-text';
import { RecursiveUrlLoader } from '@langchain/community/document_loaders/web/recursive_url';

const compiledConvert = compile({ wordwrap: 130 }); // returns (text: string) => string;

async function loadHTML(url: string) {
  const loader = new RecursiveUrlLoader(url, {
    extractor: compiledConvert,
    maxDepth: 1,
  });
  const docs = await loader.load();
  return docs;
}

export { loadHTML };
