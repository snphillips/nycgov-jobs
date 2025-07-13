export function toTitleCase(input: string) {
  return input
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// The app is interprets characters with the wrong encoding
// This occurs when the original text was encoded as UTF-8,
// but is being interpreted or displayed as ISO-8859-1 (Latin-1)
// or Windows-1252
export function cleanText(text: string): string {
  return text
    .replace(/â¢/g, '\n• ') // newline + bullet point
    .replace(/â/g, '’')    // right single quote
    .replace(/â/g, '“')    // left double quote
    .replace(/â/g, '”')    // right double quote
    .replace(/â”/g, '—')    // em dash
    .replace(/â¦/g, '…')    // ellipsis
    .replace(/â/g, `'`);    // fallback apostrophe
}


