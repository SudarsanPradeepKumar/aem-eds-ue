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
    text: 'ctaPrimaryText',
    externalUrl: 'ctaPrimaryExternalUrl',
    variant: 'primary',
  },
  secondary: {
    link: 'ctaSecondaryLink',
    text: 'ctaSecondaryText',
    externalUrl: 'ctaSecondaryExternalUrl',
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

  const findPropElement = (prop) => block.querySelector(
    `[data-aue-prop="${prop}"],[data-richtext-prop="${prop}"]`,
  );

  const getPropValue = (element) => element?.getAttribute('data-aue-value')
    || element?.getAttribute('data-richtext-value')
    || element?.textContent.trim()
    || '';

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

  const findFallbackAnchors = () => {
    const candidates = [];
    [...content.children].forEach((child) => {
      if (child.tagName === 'A') {
        candidates.push(child);
        return;
      }
      if (
        child.children.length === 1
        && child.firstElementChild?.tagName === 'A'
        && child.textContent.trim() === child.firstElementChild.textContent.trim()
      ) {
        candidates.push(child.firstElementChild);
      }
    });
    return candidates;
  };

  const fallbackAnchors = findFallbackAnchors();

  const buildCta = ({
    link: linkProp,
    text: textProp,
    externalUrl: externalProp,
    variant,
  }) => {
    const linkElement = findPropElement(linkProp);
    const textElement = findPropElement(textProp);
    const externalElement = findPropElement(externalProp);
    const externalUrl = getPropValue(externalElement);
    const textValue = getPropValue(textElement);
    const fallbackAnchor = (!linkElement && !externalUrl) ? fallbackAnchors.shift() : null;
    if (!linkElement && !externalUrl && !fallbackAnchor && !textValue) return;

    const resolvedAnchor = resolveAnchor(linkElement) || fallbackAnchor || document.createElement('a');
    if (externalUrl) resolvedAnchor.href = externalUrl;

    if (textElement) {
      if (textValue) {
        const span = document.createElement('span');
        span.textContent = textValue;
        moveInstrumentation(textElement, span);
        resolvedAnchor.textContent = '';
        resolvedAnchor.append(span);
      }
      textElement.remove();
    } else if (!resolvedAnchor.textContent.trim() && externalUrl) {
      resolvedAnchor.textContent = externalUrl;
    }

    if (externalElement) externalElement.remove();

    if (!resolvedAnchor.getAttribute('href')) {
      resolvedAnchor.setAttribute('href', '#');
      resolvedAnchor.setAttribute('aria-disabled', 'true');
      resolvedAnchor.classList.add('is-disabled');
    }

    resolvedAnchor.classList.add('button', variant);
    const wrapper = document.createElement('p');
    wrapper.className = 'button-container';
    wrapper.append(resolvedAnchor);
    ctaContainer.append(wrapper);
  };

  Object.values(ctaFields).forEach(buildCta);
  if (ctaContainer.childNodes.length) {
    content.append(ctaContainer);
  }
}
