const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_FILE_SIZE) {
      reject(new Error('File size exceeds 5MB limit. Please choose a smaller file.'));
      return;
    }
    const reader = new FileReader();
    reader.onload  = (e) => resolve(e.target.result);
    reader.onerror = ()  => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

export function getFileIcon(mimeType) {
  if (!mimeType) return '📄';
  if (mimeType === 'application/pdf') return '📋';
  if (mimeType.startsWith('image/'))  return '🖼️';
  return '📄';
}

export function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
