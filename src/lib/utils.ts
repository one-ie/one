import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Type guard to check if a component is a React component
 */
export function isReactComponent(component: any): boolean {
  return typeof component === 'function' || (typeof component === 'object' && component !== null && '$$typeof' in component)
}

/**
 * Utility to determine whether to use class or className
 * Use in .astro files like this:
 * <Component {...attrs({ class: "my-class", isReact: true })}>
 */
export function attrs(props: { class?: string; className?: string; isReact?: boolean }) {
  if (props.isReact) {
    return {
      className: props.class || props.className
    }
  }
  return {
    class: props.class || props.className
  }
}