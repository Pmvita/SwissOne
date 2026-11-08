// Global type fix for React 18/19 type conflicts
// This resolves type conflicts between React 18 and 19 types from dependencies like recharts
declare module 'next/link' {
  import { ComponentProps, ReactNode } from 'react';
  
  interface LinkProps extends Omit<ComponentProps<'a'>, 'href'> {
    href: string | { pathname?: string; query?: Record<string, any> };
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    prefetch?: boolean;
    locale?: string | false;
    children?: ReactNode;
  }
  
  const Link: React.ForwardRefExoticComponent<
    LinkProps & React.RefAttributes<HTMLAnchorElement>
  >;
  
  export default Link;
}

