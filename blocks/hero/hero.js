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
  const picture = block.querySelector('picture');
  if (picture) {
    const pictureWrapper = picture.closest('div');
    if (pictureWrapper && pictureWrapper !== block) {
      moveInstrumentation(pictureWrapper, picture);
      pictureWrapper.replaceWith(picture);
    }
    picture.classList.add('hero-background');
    block.prepend(picture);
  }

  Object.entries(propClassMap).forEach(([prop, className]) => {
    block
      .querySelectorAll(`[data-aue-prop="${prop}"],[data-richtext-prop="${prop}"]`)
      .forEach((element) => element.classList.add(className));
  });

  const getPropElement = (prop) => block.querySelector(
    `[data-aue-prop="${prop}"],[data-richtext-prop="${prop}"]`,
  );

  const getPropValue = (element) => element?.getAttribute('data-aue-value')
    || element?.getAttribute('data-richtext-value')
    || element?.textContent.trim()
    || '';

  const removeEmptyParent = (element) => {
    if (!element) return;
    const parent = element.parentElement;
    element.remove();
    if (parent && parent.childElementCount === 0 && parent.textContent.trim() === '') {
      parent.remove();
    }
  };

  const ctaContainer = document.createElement('div');
  ctaContainer.className = 'hero-ctas';

  ctaFields.forEach(({ text, url, variant }) => {
    const textElement = getPropElement(text);
    const urlElement = getPropElement(url);
    const label = getPropValue(textElement);
    const href = getPropValue(urlElement);
    console.log('label: ' + label);
    console.log('href: ' + href);

    if (!label && !href) {
      removeEmptyParent(textElement);
      removeEmptyParent(urlElement);
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

  if (ctaContainer.childNodes.length) {
    block.append(ctaContainer);
  }
}
