export function createChild(parent, tagName) {
  const child = document.createElement(tagName);
  parent.append(child);
  return child;
}
