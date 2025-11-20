import { UMAP } from 'umap-js';

self.onmessage = (e: MessageEvent) => {
  const { embeddings, ideas } = e.data;

  if (!embeddings || embeddings.length === 0) {
    self.postMessage({ nodes: [] });
    return;
  }

  try {
    // Apply UMAP
    const umap = new UMAP({
      nComponents: 2,
      nNeighbors: Math.min(5, embeddings.length - 1),
      minDist: 0.1,
    });
    const layout = umap.fit(embeddings);

    // Normalize coordinates to [0, 1]
    const xCoords = layout.map((point: number[]) => point[0]);
    const yCoords = layout.map((point: number[]) => point[1]);
    const minX = Math.min(...xCoords);
    const maxX = Math.max(...xCoords);
    const minY = Math.min(...yCoords);
    const maxY = Math.max(...yCoords);

    const nodes = ideas.map((idea: any, i: number) => ({
      id: idea.id,
      content: idea.content,
      x: (layout[i][0] - minX) / (maxX - minX || 1),
      y: (layout[i][1] - minY) / (maxY - minY || 1),
    }));

    self.postMessage({ nodes });
  } catch (error) {
    console.error('UMAP Worker Error:', error);
    self.postMessage({ error: 'Failed to process UMAP' });
  }
};
