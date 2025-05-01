
export const titlecase = (str?: string) => {
  if (!str) return '';
  return str.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}
