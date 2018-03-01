// @flow

type URLLike = HTMLAnchorElement | URL | Location;

export const isSameOrigin = (a: URLLike, b: URLLike): boolean =>
  a.origin === b.origin;

export const isSamePath = (a: URLLike, b: URLLike): boolean =>
  a.pathname === b.pathname;

export const isSameParams = (a: URLLike, b: URLLike): boolean => {
  const aURLParams = new URLSearchParams(a.search);
  const bURLParams = new URLSearchParams(b.search);

  aURLParams.sort();
  bURLParams.sort();

  return aURLParams.toString() === bURLParams.toString();
};

export const isModifiedClick = (e: MouseEvent): boolean =>
  Boolean(e.shiftKey || e.ctrlKey || e.altKey);

export const fetchHTML = async (url: string): Promise<Document> => {
  const html = await fetch(url).then(res => res.text());
  const parser = new DOMParser();
  return parser.parseFromString(html, "text/html");
};

// Ref: https://dom.spec.whatwg.org/#concept-node-equals
export const createEqualElement = (element: Element): Element => {
  const copy = document.createElementNS(
    element.namespaceURI || null,
    element.tagName.toLowerCase()
  );
  const attrs = Array.from(element.attributes);
  for (const attr of attrs) {
    const ns = attr.namespaceURI;
    if (ns === null) {
      copy.setAttribute(attr.name, attr.value);
    } else {
      copy.setAttributeNS(ns, attr.name, attr.value);
    }
  }
  copy.textContent = element.textContent;
  return copy;
};

export const executeScripts = (element: Element): void => {
  const scripts = element.querySelectorAll("script");
  for (const script of scripts) {
    const copy = createEqualElement(script);
    script.replaceWith(copy);
  }
};
