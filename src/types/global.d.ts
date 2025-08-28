// Type definitions for modules without types
declare module "react/jsx-runtime" {
  const content: string;
  export default content;
}

declare module "*.svg" {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";

declare module "lucide-react" {
  import { LucideProps } from "lucide-react/dist/lucide-react";
  export const Brain: React.FC<LucideProps>;
  export const Book: React.FC<LucideProps>;
  export const UserCheck: React.FC<LucideProps>;
  export const Users: React.FC<LucideProps>;
  export const Clock: React.FC<LucideProps>;
  export const Heart: React.FC<LucideProps>;
  export const Smartphone: React.FC<LucideProps>;
  export const Eye: React.FC<LucideProps>;
  export const Plane: React.FC<LucideProps>;
  export const LogIn: React.FC<LucideProps>;
}
