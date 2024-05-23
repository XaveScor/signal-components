import { Atom } from "@reatom/core";

type Rest<
  Props extends Record<string, Atom>,
  Excluded extends keyof Props,
> = Omit<Props, Excluded>;
export function rest<
  Props extends Record<string, Atom>,
  Excluded extends keyof Props,
>(props: Props, excluded: Excluded[]): Rest<Props, Excluded> {
  const excludedSet = new Set(excluded);
  // https://stackoverflow.com/questions/43185453/object-assign-and-proxies
  return new Proxy(props, {
    ownKeys(target: Props): ArrayLike<string | symbol> {
      return Object.keys(target).filter(
        (key) => !excludedSet.has(key as Excluded),
      );
    },
    getOwnPropertyDescriptor(
      target: Props,
      p: string | symbol,
    ): PropertyDescriptor | undefined {
      return {
        value: Reflect.get(target, p),
        configurable: true,
        enumerable: true,
      };
    },
  });
}
