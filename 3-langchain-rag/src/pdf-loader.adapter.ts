import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';

async function loadPDF(path: string) {
  const loader = new PDFLoader(path);
  const docs = await loader.load();
  return docs;
}

export { loadPDF };
