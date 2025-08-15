// Type declarations for jest-axe
declare module "jest-axe" {
  export function axe(element: Element, options?: any): Promise<any>;
  export const toHaveNoViolations: any;
}
