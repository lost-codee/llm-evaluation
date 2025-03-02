import { diffWords } from 'diff';

export function similarity(text1: string, text2: string): number {
  // Handle exact matches
  if (text1.trim() === text2.trim()) {
    return 1;
  }

  // Handle empty strings
  if (!text1 || !text2) {
    return 0;
  }

  // Get the diff
  const changes = diffWords(text1, text2);

  // Count unchanged words
  let unchangedLength = 0;
  let totalLength = 0;

  changes.forEach(change => {
    const length = change.value.length;
    totalLength += length;

    // Count only unchanged parts
    if (!change.added && !change.removed) {
      unchangedLength += length;
    }
  });

  // Calculate similarity score
  const similarityScore = unchangedLength / totalLength;

  // Ensure the score is between 0 and 1
  return Math.max(0, Math.min(1, similarityScore));
}