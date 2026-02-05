import { moveInstrumentation } from '../../scripts/scripts.js';

const propClassMap = {
  eyebrow: 'hero-eyebrow',
  title: 'hero-title',
  paragraph: 'hero-paragraph',
  footnotes: 'hero-footnotes',
};

const ctaFields = [
  {
    text: 'ctaPrimaryText',
    url: 'ctaPrimaryUrl',
    variant: 'primary',
  },
  {
    text: 'ctaSecondaryText',
    url: 'ctaSecondaryUrl',
    variant: 'secondary',
  },
];

export default function decorate(block) {
  const existingContent = block.querySelector(':scope > .hero-content');
  if (!existingContent) {
    const picture = block.querySelector('picture');
    if (picture) {
      const pictureWrapper = picture.closest('div');
      if (pictureWrapper && pictureWrapper !== block) {
        moveInstrumentation(pictureWrapper, picture);
        pictureWrapper.replaceWith(picture);
      }
    }

    const heroContent = document.createElement('div');
    heroContent.className = 'hero-content';
    [...block.children].forEach((child) => {
      if (child !== picture) heroContent.append(child);
    });
    if (heroContent.childElementCount) {
      block.append(heroContent);
    }
  }

  Object.entries(propClassMap).forEach(([prop, className]) => {
    block
      .querySelectorAll(`[data-aue-prop="${prop}"],[data-richtext-prop="${prop}"]`)
      .forEach((element) => element.classList.add(className));
  });

  const content = block.querySelector(':scope > .hero-content') || block;
  const existingCtas = content.querySelector(':scope > .hero-ctas');
  if (existingCtas) existingCtas.remove();

  const getPropElement = (prop) =>
    block.querySelector(
      `[data-aue-prop="${prop}"],[data-richtext-prop="${prop}"]`,
    );

  const getTextPropValue = (element) =>
    element?.getAttribute('data-aue-value')
    || element?.getAttribute('data-richtext-value')
    || element?.textContent.trim()
    || '';

  const getUrlPropValue = (element) =>
    element?.getAttribute('data-aue-value')
    || element?.getAttribute('data-richtext-value')
    || element?.textContent.trim()
    || '';

  const removeEmptyParent = (element) => {
    if (!element) return;
    const parent = element.parentElement;
    element.remove();
    if (
      parent
      && parent.childElementCount === 0
      && parent.textContent.trim() === ''
    ) {
      parent.remove();
    }
  };

  const ctaContainer = document.createElement('div');
  ctaContainer.className = 'hero-ctas';

  ctaFields.forEach(({ text, url, variant }) => {
    const textElement = getPropElement(text);
    const urlElement = getPropElement(url);
    console.log('textElement: ' + textElement);
    console.log('urlElement: ' + urlElement);

    const label = getTextPropValue(textElement);
    let href = getUrlPropValue(urlElement);

    // Fallback: if no dedicated URL prop, and textElement is an <a>, use its href
    if (!href && textElement instanceof HTMLAnchorElement) {
      href = textElement.getAttribute('href') || '';
    }

    // If we still have nothing at all, skip this CTA
    if (!label && !href) {
      if (textElement) textElement.remove();
      if (urlElement) urlElement.remove();
      return;
    }

    const anchor = document.createElement('a');
    if (label) anchor.textContent = label;
    anchor.classList.add('button', variant);

    if (href) {
      anchor.href = href;
    } else {
      // Keep behavior: label without URL → disabled CTA
      anchor.setAttribute('href', '#');
      anchor.setAttribute('aria-disabled', 'true');
      anchor.classList.add('is-disabled');
    }

    if (textElement) {
      moveInstrumentation(textElement, anchor);
      removeEmptyParent(textElement);
    }
    if (urlElement) {
      moveInstrumentation(urlElement, anchor);
      removeEmptyParent(urlElement);
    }

    const wrapper = document.createElement('p');
    wrapper.className = 'button-container';
    wrapper.append(anchor);
    ctaContainer.append(wrapper);
  });

  if (ctaContainer.childElementCount) {
    content.append(ctaContainer);
  }
}
