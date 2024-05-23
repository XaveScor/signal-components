import { atom, Atom, AtomMut, Ctx, isAtom } from "@reatom/core";
import { InsideProps, OutsideProps } from "./types";

type UnsubscribeFn = () => void;
const emptyUnsubscribe: UnsubscribeFn = () => {};
function setAtomValue<T>(
  ctx: Ctx,
  atom: AtomMut<T>,
  value: T | Atom<T>,
): UnsubscribeFn {
  if (isAtom(value)) {
    return ctx.subscribe(value, (newValue) => {
      atom(ctx, newValue);
    });
  }
  atom(ctx, value);
  return emptyUnsubscribe;
}

type PropsProxy<T> = {
  insideProps: InsideProps<T>;
  setProps: (props: OutsideProps<T>) => void;
};
type MapElement = {
  unsubscribe: UnsubscribeFn;
  atom: AtomMut;
};
export function createPropsProxy<Props>(
  ctx: Ctx,
  outsideProps: OutsideProps<Props>,
): PropsProxy<Props> {
  const propsMap = new Map<string, MapElement>();
  let rawOutsideProps = outsideProps;
  return {
    insideProps: new Proxy({} as InsideProps<Props>, {
      get(target: InsideProps<Props>, p: string, receiver: any) {
        const el = propsMap.get(p);
        if (el) {
          return el.atom;
        }
        // @ts-ignore
        const outsideValue = outsideProps[p];
        const a = atom(undefined);
        const unsubscribe = setAtomValue(ctx, a, outsideValue);
        propsMap.set(p, { atom: a, unsubscribe });
        return a;
      },
    }),
    setProps: (props) => {
      rawOutsideProps = props;
      for (const [propName, { atom, unsubscribe }] of propsMap) {
        // @ts-ignore
        const outsideValue = props[propName];
        const newUnsubscribe = setAtomValue(ctx, atom, outsideValue);
        unsubscribe();
        propsMap.set(propName, { atom, unsubscribe: newUnsubscribe });
      }
    },
  };
}
