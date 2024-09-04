export const splitTextIntoLines = (text: string, maxLength: number = 40) => {
  let chunks = text.split(',');

  let lines = [];
  let currentLine = '';

  chunks.forEach(chunk => {
    chunk = chunk.trim();
    if (currentLine.length + chunk.length + 1 <= maxLength) {
      if (currentLine.length > 0) {
        currentLine += ', ' + chunk;
      } else {
        currentLine = chunk;
      }
    } else {
      lines.push(currentLine);
      currentLine = chunk;
    }
  });

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines.join('\n');
};
