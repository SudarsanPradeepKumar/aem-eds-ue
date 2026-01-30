import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const [quoteWrapper] = block.children;
  if (!quoteWrapper) return;

  const blockquote = document.createElement('blockquote');
  moveInstrumentation(quoteWrapper, blockquote);
  while (quoteWrapper.firstChild) {
    blockquote.append(quoteWrapper.firstChild);
  }
  quoteWrapper.replaceChildren(blockquote);
}