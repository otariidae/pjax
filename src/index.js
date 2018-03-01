// @flow

import { EventTarget } from "event-target-shim";

import {
  isSameOrigin,
  isSamePath,
  isSameParams,
  isModifiedClick,
  fetchHTML,
  executeScripts
} from "./util";

export default class PJAX extends EventTarget {
  area: string;
  $area: Element;

  constructor(area: string = "body", target = "a[href]:not([target])") {
    super();
    this.area = area;
    this.target = target;
    const $area = document.querySelector(this.area);

    if ($area === null) {
      throw new Error(`Document has no ${this.area}.`);
    }

    this.$area = $area;

    this.initTargetHandler();

    window.addEventListener(
      "popstate",
      async () => {
        this.dispatchEvent(new CustomEvent("loadstart"));
        await this.load(location.href);
        this.dispatchEvent(new CustomEvent("loadend"));
      },
      false
    );
  }
  initTargetHandler(): void {
    const elements = document.querySelectorAll(this.target);
    for (const element of elements) {
      element.addEventListener("click", this.onAnchorClick.bind(this), false);
    }
  }
  async load(url: string): Promise<void> {
    const canceled = !this.dispatchEvent(
      new CustomEvent("beforeunload", {
        cancelable: true
      })
    );

    if (canceled) {
      return;
    }

    const newDocument = await fetchHTML(url);
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
          document: newDocument
        }
      })
    );

    this.initTargetHandler();
    executeScripts(newRoot);
  }
  async onAnchorClick(e: MouseEvent): Promise<void> {
    const element = e.target;

    if (e.defaultPrevented) {
      return;
    }
    if (isModifiedClick(e)) {
      return;
    }
    if (!(element instanceof HTMLAnchorElement)) {
      return;
    }
    if (!isSameOrigin(element, location)) {
      return;
    }
    if (isSamePath(element, location) && isSameParams(element, location)) {
      return;
    }

    e.preventDefault();

    this.dispatchEvent(new CustomEvent("loadstart"));

    const newURL = element.href;
    await this.load(newURL);
    history.pushState(null, "", newURL);

    this.dispatchEvent(new CustomEvent("loadend"));
  }
}
