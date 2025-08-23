declare module "vue" {
  export type MaybeRef<T> = T | (() => T) | { value: T };
  export type MaybeRefOrGetter<T> = MaybeRef<T> | (() => T);
  export type ComponentPublicInstance = any;
  export function toValue<T>(v: MaybeRefOrGetter<T>): T;
}
