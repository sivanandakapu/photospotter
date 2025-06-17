import { promises as fs } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FaceAnalysis } from 'insightface-node';

const dataFile = join(process.cwd(), 'face-data.json');
let faces: StoredFace[] = [];
let analyzer: FaceAnalysis | null = null;

interface StoredFace {
  id: string;
  embedding: number[];
  externalImageId?: string;
}

async function init() {
  if (!analyzer) {
    analyzer = new FaceAnalysis();
    await analyzer.init({ model: 'buffalo_l' });
  }
  if (faces.length === 0) {
    try {
      const data = await fs.readFile(dataFile, 'utf8');
      faces = JSON.parse(data) as StoredFace[];
    } catch {
      faces = [];
    }
  }
}

async function saveFaces() {
  await fs.writeFile(dataFile, JSON.stringify(faces));
}

function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((sum, ai, idx) => sum + ai * b[idx], 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (normA * normB);
}

export async function indexFace(buffer: Buffer, externalImageId?: string) {
  await init();
  const { embedding } = await analyzer!.extract(buffer);
  const id = uuidv4();
  faces.push({ id, embedding, externalImageId });
  await saveFaces();
  return id;
}

export async function searchFacesByImage(buffer: Buffer) {
  await init();
  const { embedding } = await analyzer!.extract(buffer);
  const matches = faces.map(f => ({
    face: f,
    similarity: cosineSimilarity(embedding, f.embedding)
  })).sort((a, b) => b.similarity - a.similarity);

  return matches.slice(0, 5).map(m => ({
    Face: {
      FaceId: m.face.id,
      ExternalImageId: m.face.externalImageId,
      Confidence: m.similarity * 100
    },
    Similarity: m.similarity * 100
  }));
}

export async function searchFaces(faceId: string) {
  await init();
  const target = faces.find(f => f.id === faceId);
  if (!target) return [];
  const matches = faces.filter(f => f.id !== faceId).map(f => ({
    face: f,
    similarity: cosineSimilarity(target.embedding, f.embedding)
  })).sort((a, b) => b.similarity - a.similarity);

  return matches.slice(0, 100).map(m => ({
    Face: {
      FaceId: m.face.id,
      ExternalImageId: m.face.externalImageId,
      Confidence: m.similarity * 100
    },
    Similarity: m.similarity * 100
  }));
}

export async function deleteAllFacesFromCollection() {
  await init();
  faces = [];
  await saveFaces();
}
