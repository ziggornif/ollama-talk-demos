import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { store } from '../rag-qdrant.adapter';
import { loadPDF } from '../pdf-loader.adapter';

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
  const documents = await loadPDF(`${__dirname}/../resources/dictionnaire-donnees-adresses.pdf`);
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
