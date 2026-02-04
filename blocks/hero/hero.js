import { moveInstrumentation } from '../../scripts/scripts.js';

const propClassMap = {
  eyebrow: 'hero-eyebrow',
  title: 'hero-title',
  paragraph: 'hero-paragraph',
  footnotes: 'hero-footnotes',
};

const ctaFields = {
  primary: {
    link: 'ctaPrimaryLink',
    variant: 'primary',
  },
  secondary: {
    link: 'ctaSecondaryLink',
    variant: 'secondary',
  },
};

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

  const ctaContainer = document.createElement('div');
  ctaContainer.className = 'hero-ctas';

  const resolveAnchor = (linkElement) => {
    if (!linkElement) return null;
    if (linkElement.tagName === 'A') return linkElement;
    const nested = linkElement.querySelector('a');
    if (nested) {
      moveInstrumentation(linkElement, nested);
      if (linkElement.children.length === 1 && linkElement.firstElementChild === nested) {
        linkElement.replaceWith(nested);
      }
      return nested;
    }
    const anchor = document.createElement('a');
    anchor.href = linkElement.textContent.trim();
    moveInstrumentation(linkElement, anchor);
    linkElement.replaceWith(anchor);
    return anchor;
  };

  const buildCta = ({ link: linkProp, variant }) => {
    const linkElement = block.querySelector(`[data-aue-prop="${linkProp}"]`);
    const anchor = resolveAnchor(linkElement);
    if (!anchor) return;

    anchor.classList.add('button', variant);
    const wrapper = document.createElement('p');
    wrapper.className = 'button-container';
    wrapper.append(anchor);
    ctaContainer.append(wrapper);
  };

  Object.values(ctaFields).forEach(buildCta);
  if (ctaContainer.childNodes.length) {
    content.append(ctaContainer);
  }
}
