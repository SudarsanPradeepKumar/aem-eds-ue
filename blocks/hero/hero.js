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

  if (!existingContent) {
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

  const fallbackLinkCandidates = () => [...block.querySelectorAll(':scope > div p.button-container > a')]
    .filter((anchor) => !anchor.closest('.hero-ctas'));

  const fallbackLinks = fallbackLinkCandidates();

  const takeFallbackLink = () => {
    const link = fallbackLinks.shift();
    if (!link) return null;
    const row = link.closest('div');
    if (row) row.remove();
    return link;
  };

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
    const fallbackLink = (!href && !urlElement) ? takeFallbackLink() : null;
    const fallbackHref = fallbackLink?.getAttribute('href')
      || fallbackLink?.textContent.trim();

    if (!label && !href) {
      removeEmptyParent(textElement);
      removeEmptyParent(urlElement);
      if (fallbackLink) removeEmptyParent(fallbackLink);
      return;
    }

    const anchor = document.createElement('a');
    if (href) anchor.href = href;
    if (!href && fallbackHref) anchor.href = fallbackHref;
    if (label) anchor.textContent = label;
    anchor.classList.add('button', variant);

    if (!href && !fallbackHref) {
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
    if (fallbackLink) {
      moveInstrumentation(fallbackLink, anchor);
      removeEmptyParent(fallbackLink);
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
