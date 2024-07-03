import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import { QdrantVectorStore } from '@langchain/qdrant';

const ollamaEmbeddings = new OllamaEmbeddings({
  baseUrl: 'http://localhost:11434',
  model: 'nomic-embed-text',
});

async function store(documents) {
  await QdrantVectorStore.fromDocuments(documents, ollamaEmbeddings, {
    url: 'http://localhost:6333',
    collectionName: 'rag-source2',
  });
}

async function retrieve(query: string) {
  const vectorStore = await QdrantVectorStore.fromExistingCollection(ollamaEmbeddings, {
    url: 'http://localhost:6333',
    collectionName: 'rag-source2',
  });

  const retrieved = await vectorStore.asRetriever().invoke(query);
  return retrieved;
}

export { store, retrieve };
