import {
  isSameOrigin,
  isSamePath,
  isSameParams,
  isModifiedClick,
  dehashURL,
  fetchHTML,
  executeScripts,
} from "./util";

export default class PJAX extends EventTarget {
  area: string;
  $area: Element;
  cache: Map<string, Document>;
  target: string;

  constructor(area = "body", target = "a[href]:not([target])") {
    super();
    this.area = area;
    this.cache = new Map();
    this.target = target;
    const $area = document.querySelector(this.area);

    if ($area === null) {
      throw new Error(`Document has no ${this.area}.`);
    }

    this.$area = $area;

    this.initTargetHandler();

    window.addEventListener(
      "popstate",
      () => {
        this.onPopState();
      },
      false
    );
  }
  initTargetHandler(): void {
    const elements = document.querySelectorAll<HTMLElement>(this.target);
    for (const element of elements) {
      element.addEventListener(
        "click",
        (e) => {
          this.onAnchorClick(e);
        },
        false
      );
    }
  }
  async loadDocument(url: string): Promise<Document> {
    const cache = this.cache.get(url);
    if (cache) {
      return cache;
    }
    const newDocument = await fetchHTML(url);
    this.cache.set(url, newDocument);
    return newDocument;
  }
  async load(url: string): Promise<void> {
    const canceled = !this.dispatchEvent(
      new CustomEvent("beforeunload", {
        cancelable: true,
        detail: {
          url: url,
        },
      })
    );

    if (canceled) {
      return;
    }

    const newDocument = (await this.loadDocument(url)).cloneNode(
      true
    ) as Document;

    const newRoot = newDocument.querySelector(this.area);

    if (newRoot === null) {
      throw new Error(`The new document has no ${this.area}.`);
    }

    this.dispatchEvent(new CustomEvent("unload"));

    this.$area.replaceWith(newRoot);
    document.title = newDocument.title;
    this.$area = newRoot;

    this.dispatchEvent(
      new CustomEvent("contentLoaed", {
        detail: {
          document: newDocument,
        },
      })
    );

    this.initTargetHandler();
    executeScripts(newRoot);
  }
  async onAnchorClick(e: MouseEvent): Promise<void> {
    const element = e.currentTarget;

    if (
      e.defaultPrevented ||
      isModifiedClick(e) ||
      !(element instanceof HTMLAnchorElement) ||
      !isSameOrigin(element, location) ||
      (isSamePath(element, location) && isSameParams(element, location))
    ) {
      return;
    }

    e.preventDefault();

    this.dispatchEvent(new CustomEvent("loadstart"));

    const newURL = dehashURL(element);
    await this.load(newURL);
    history.pushState(null, "", newURL);

    this.dispatchEvent(new CustomEvent("loadend"));
  }
  async onPopState(): Promise<void> {
    this.dispatchEvent(new CustomEvent("loadstart"));
    await this.load(location.href);
    this.dispatchEvent(new CustomEvent("loadend"));
  }
}
