export function getExtension(filePath: string) {
  return filePath.split('.').pop()!;
}

export function getMimeTypeFromFilePath(filePath: string) {
  const extension = filePath.split('.').pop()!;
  const mimeTypes = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    bmp: 'image/bmp',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    tiff: 'image/tiff',
    ico: 'image/vnd.microsoft.icon',
    pdf: 'application/pdf',
  };

  return (mimeTypes as any)[extension.toLowerCase()] || '*/*';
}
