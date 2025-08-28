import "react";

declare module "react" {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // Add any custom HTML attributes here if needed
  }

  interface IntrinsicElements {
    // Add any custom elements here if needed
    [elemName: string]: any;
  }
}

// This ensures TypeScript recognizes the JSX namespace
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
