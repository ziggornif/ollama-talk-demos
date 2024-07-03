import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { store } from '../rag-qdrant.adapter';
import { loadHTML } from '../html-loader.adapter';

function chunkDocuments(documents) {
  const perChunk = 10;
  const result = documents.reduce((chunkArray, item, index) => {
    const chunkIndex = Math.floor(index / perChunk);

    if (!chunkArray[chunkIndex]) {
      chunkArray[chunkIndex] = []; // start a new chunk
    }

    chunkArray[chunkIndex].push(item);

    return chunkArray;
  }, []);
  return result;
}

(async () => {
  const url = 'https://doc.rust-lang.org/stable/book/';
  const documents = await loadHTML(url);
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const splits = await textSplitter.splitDocuments(documents);

  const chunks = chunkDocuments(splits);
  for (const chunk of chunks) {
    await store(chunk);
  }
})();
