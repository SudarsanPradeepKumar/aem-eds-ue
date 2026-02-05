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

    const content = document.createElement('div');
    content.className = 'hero-content';
    [...block.children].forEach((child) => {
      if (child !== picture) content.append(child);
    });
    if (content.childNodes.length) {
      block.append(content);
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

  const getPropElement = (prop) => block.querySelector(
    `[data-aue-prop="${prop}"],[data-richtext-prop="${prop}"]`,
  );

  const getPropValue = (element) => element?.getAttribute('data-aue-value')
    || element?.getAttribute('data-richtext-value')
    || element?.textContent.trim()
    || '';

  const ctaContainer = document.createElement('div');
  ctaContainer.className = 'hero-ctas';

  ctaFields.forEach(({ text, url, variant }) => {
    const textElement = getPropElement(text);
    const urlElement = getPropElement(url);
    const label = getPropValue(textElement);
    const href = getPropValue(urlElement);
    if (!label && !href) {
      if (textElement) textElement.remove();
      if (urlElement) urlElement.remove();
      return;
    }

    const anchor = document.createElement('a');
    if (href) anchor.href = href;
    if (label) anchor.textContent = label;
    anchor.classList.add('button', variant);

    if (!href) {
      anchor.setAttribute('href', '#');
      anchor.setAttribute('aria-disabled', 'true');
      anchor.classList.add('is-disabled');
    }

    if (textElement) {
      moveInstrumentation(textElement, anchor);
      textElement.remove();
    }
    if (urlElement) {
      moveInstrumentation(urlElement, anchor);
      urlElement.remove();
    }

    const wrapper = document.createElement('p');
    wrapper.className = 'button-container';
    wrapper.append(anchor);
    ctaContainer.append(wrapper);
  });

  if (ctaContainer.childNodes.length) {
    content.append(ctaContainer);
  }
}
