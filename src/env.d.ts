/// <reference types="astro/client" />
/// <reference types="astro/server" />

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}