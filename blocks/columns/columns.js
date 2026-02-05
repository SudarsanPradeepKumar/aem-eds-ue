export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  const classElement = block.querySelector('[data-aue-prop="classes"],[data-richtext-prop="classes"]');
  if (classElement) {
    const classValue = classElement.getAttribute('data-aue-value')
      || classElement.getAttribute('data-richtext-value')
      || classElement.textContent.trim();
    if (classValue) {
      classValue.split(/\s+/).filter(Boolean).forEach((name) => block.classList.add(name));
    }
    const parent = classElement.parentElement;
    classElement.remove();
    if (parent && parent.childElementCount === 0 && parent.textContent.trim() === '') {
      parent.remove();
    }
  }

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });
}
