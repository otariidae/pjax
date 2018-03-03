# little pjax

[![CC0-1.0](https://img.shields.io/badge/license-CC0-green.svg?style=flat-square)](http://creativecommons.org/publicdomain/zero/1.0/)
[![npm version](https://img.shields.io/npm/v/little-pjax.svg?style=flat-square)](https://www.npmjs.com/package/little-pjax)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

> pushState + ajax (fetch) = pjax

A simple, small and modern implementation of pjax

## Prior arts

* [pjax-api](https://www.npmjs.com/package/pjax-api): A full-featured pjax written in TypeScript
* [barba.js](https://www.npmjs.com/package/barba.js): A library that provides smooth transition
* [jquery-pjax](https://www.npmjs.com/package/jquery-pjax): A jQuery plugin for pjax
* [pjax](https://www.npmjs.com/package/pjax): A standalone pjax

## Install

```bash
npm install --save-dev little-pjax
```

## Usage

```js
import PJAX from "little-pjax";

const pjax = new PJAX("#pjax-root", "a[href]:not[target]");

pjax.addEventListener("loadend", e => console.log("finish loading"), false);
```

PJAX will replace:

* `document.title`
* A container element
* URL

Target anchor elements are selected via the second argument from a container element.\
If `href` of a target anchor element is not `Same Origin`, there will be ignored.

`<script>` in a container element will be loaded after a container element was replaced.

The pages visited before are cached inside PJAX.\
When reloading a page, cache are deleted.

PJAX will not work:

* with Shift + click, Ctrl + click, Alt + click
* if a `click` event was prevented before
* if the new URL is same with the current one

PJAX does not support:

* Multiple container elements
* Other elements in `<head>` such as `<meta name="twitter:card">`, `<script>`

You can use the `contentLoaded` event to hook.

### API

#### PJAX()

`EventTarget` (shim) <- `PJAX`

```js
const pjax = new PJAX(container, target);
```

##### Options

`container`: `string` = `body`\
A group of selectors of a container element.

`target` : `string` = `a[href]:not([target])`\
A group of selectors of target `HTMLAnchorElement`.

### Methods

Same as `EventTarget`. `addEventListener` and `removeEventListener`.

### Events

All events are instances of `CustomEvent` and fired from an instance of PJAX.

```
loadstart -> beforeunload -> unload -> contentLoaded -> loadend

loadstart -> beforeunload -------- (canceled) --------> loadend
```

#### loadstart

Fired when have started loading the next page.

#### beforeunload

Cancelable.

Fired before fetching new resouces.

When canceled, PJAX will stop loading and will not fire `unload` and `contentLoaded`.

##### Properties

`contentLoadedEvent.detail.url`: `string`\
a URL of the new page.

#### unload

Fired before replacing a container element.

#### contentLoaded

Fired after replacing a container element and before executing JavaScript.

##### Properties

`contentLoadedEvent.detail.document`: `Document`\
`Document` of the new page.

You can use it, for example, to sync `<meta name="twitter:card">`.

```js
pjax.addEventListener("contentLoaded", event => {
  const newDocument = event.detail.document;
  const oldCard = document.head.querySelector('meta[name="twitter:card"]');
  const newCard = newDocument.head.querySelector('meta[name="twitter:card"]');
  oldCard.replaceWith(newCard);
});
```

#### loadend

Fired when have finished all progress.

## LICENSE

CC0-1.0
