export function removeComments(string: string) {
  return string.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').trim();
}
