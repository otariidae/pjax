import {
  isSameOrigin,
  isSamePath,
  isSameParams,
  dehashURL,
  createEqualElement,
} from "../src/util";
import { strict as t } from "assert";
import { JSDOM } from "jsdom";

describe("isSameOrigin", () => {
  it("same origin", () => {
    t.ok(
      isSameOrigin(
        new URL("http://www.exemple.com"),
        new URL("http://www.exemple.com"),
      ),
    );
  });
  it("defferent subdmain: not same origin", () => {
    t.ok(
      !isSameOrigin(
        new URL("http://www.exemple.com/"),
        new URL("http://blog.exemple.com/"),
      ),
    );
    t.ok(
      !isSameOrigin(
        new URL("http://www.exemple.com/"),
        new URL("http://exemple.com/"),
      ),
    );
  });
  it("http vs https: not same origin", () => {
    t.ok(
      !isSameOrigin(
        new URL("http://www.exemple.com/"),
        new URL("https://www.exemple.com/"),
      ),
    );
  });
  it("with hash: same origin", () => {
    t.ok(
      isSameOrigin(
        new URL("http://www.exemple.com/"),
        new URL("http://www.exemple.com/#anchor"),
      ),
    );
  });
  it("defferent path, but same origin", () => {
    t.ok(
      isSameOrigin(
        new URL("http://www.exemple.com/foo.html"),
        new URL("http://www.exemple.com/article/bar.html"),
      ),
    );
  });
  it("specified 80 port vs unspecfied port: same origin", () => {
    t.ok(
      isSameOrigin(
        new URL("http://www.exemple.com/"),
        new URL("http://www.exemple.com:80/"),
      ),
    );
  });
  it("specified 81 port vs unspecfied port: not same origin", () => {
    t.ok(
      !isSameOrigin(
        new URL("http://www.exemple.com/"),
        new URL("http://www.exemple.com:81/"),
      ),
    );
  });
});

describe("isSamePath", () => {
  it("same path", () => {
    t.ok(
      isSamePath(
        new URL("http://www.exemple.com/path/to/index.html"),
        new URL("http://www.exemple.com/path/to/index.html"),
      ),
    );
  });
  it("defferent origin, but same path", () => {
    t.ok(
      isSamePath(
        new URL("http://www.exemple.net/path/to/index.html"),
        new URL("http://www.exemple.com/path/to/index.html"),
      ),
    );
  });
  it("not same path", () => {
    t.ok(
      !isSamePath(
        new URL("http://www.exemple.com/path/to/index.html"),
        new URL("http://www.exemple.com/path/to/not/same/index.html"),
      ),
    );
  });
  it("not same file", () => {
    t.ok(
      !isSamePath(
        new URL("http://www.exemple.com/path/to/index.html"),
        new URL("http://www.exemple.com/path/to/about.html"),
      ),
    );
  });
});

describe("isSameParams", () => {
  it("same query", () => {
    t.ok(
      isSameParams(
        new URL("http://www.example.com/?p=1"),
        new URL("http://www.example.com/?p=1"),
      ),
    );
  });
  it("defferent order, but same query", () => {
    t.ok(
      isSameParams(
        new URL("http://www.example.com/?p=1&q=a"),
        new URL("http://www.example.com/?q=a&p=1"),
      ),
    );
  });
  it("not same query", () => {
    t.ok(
      !isSameParams(
        new URL("http://www.example.com/?p=1"),
        new URL("http://www.example.com/?p=2"),
      ),
    );
  });
  it("not same length", () => {
    t.ok(
      !isSameParams(
        new URL("http://www.example.com/?p=1"),
        new URL("http://www.example.com/?p=1&q=a"),
      ),
    );
  });
  it("+ and %20 are same", () => {
    t.ok(
      isSameParams(
        new URL("http://www.example.com/?p=1+2"),
        new URL("http://www.example.com/?p=1%202"),
      ),
    );
  });
});

describe("dehashURL", () => {
  const { window } = new JSDOM("");
  const { document } = window;

  it("no path", () => {
    const a = document.createElement("a");
    a.href = "http://www.example.com/#hash";

    t.equal(dehashURL(a), "http://www.example.com/");
    t.notEqual(dehashURL(a), "http://www.example.com");
  });
  it("path + filename", () => {
    const a = document.createElement("a");
    a.href = "http://www.example.com/path/to/index.html#hash";

    t.equal(dehashURL(a), "http://www.example.com/path/to/index.html");
  });
});

describe("createEqualElement", () => {
  const { window } = new JSDOM("");
  // @ts-ignore
  global.document = window.document;

  const disabledScript = window.document.createElement("script");
  disabledScript.outerHTML = `<script type="text/javascript">console.log("foo")</script>`;
  const copiedScript = createEqualElement(disabledScript);

  it("equal", () => {
    t.ok(disabledScript.isEqualNode(copiedScript));
  });
  it("not same", () => {
    t.ok(!disabledScript.isSameNode(copiedScript));
  });

  // @ts-ignore
  delete global.document;
});
