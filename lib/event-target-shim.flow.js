declare module "event-target-shim" {
  declare export class EventTarget {
    addEventListener(
      type: string,
      listener: EventListener,
      optionsOrUseCapture?: EventListenerOptionsOrUseCapture
    ): void;
    dispatchEvent(evt: Event): boolean;
    removeEventListener(
      type: string,
      listener: EventListener,
      optionsOrUseCapture?: EventListenerOptionsOrUseCapture
    ): void;
  }
}
