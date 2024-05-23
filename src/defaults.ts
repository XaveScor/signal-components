import { atom, Atom, AtomState } from "@reatom/core";

type StateObj<Props extends Record<string, Atom>> = Partial<{
  [K in keyof Props]: AtomState<Props[K]>;
}>;
type FilledProps<
  Props extends Record<string, Atom>,
  Obj extends StateObj<Props>,
> = {
  [K in keyof Obj]-?: Atom<Obj[K]>;
} & Omit<Props, keyof Obj>;

export function defaults<
  Props extends Record<string, Atom>,
  Obj extends StateObj<Props>,
>(props: Props, defaultsObject: Obj): FilledProps<Props, Obj> {
  const filledProps = {};
  for (const key in defaultsObject) {
    // @ts-ignore
    filledProps[key] = atom((ctx) => {
      const val = ctx.spy(props[key]);
      return val ?? defaultsObject[key];
    });
  }
  // @ts-ignore
  return new Proxy(props, {
    get(target: Props, p: string, receiver: any): any {
      if (p in filledProps) {
        // @ts-ignore
        return filledProps[p];
      }

      return Reflect.get(target, p, receiver);
    },
  });
}
