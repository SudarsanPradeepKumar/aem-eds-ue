export default function decorate(block) {
    const [quotewrapper] = block.children;

    const blockquote = document.createElement('blockquote');
    blockquote.textContent = quotewrapper.textContent.trim();
    quotewrapper.replaceChildren(blockquote);
}