import { atom, Atom, AtomMut, Ctx, isAtom } from "@reatom/core";
import { AllPropsProp, AnyF, InsideProps, OutsideProps } from "./types";
import { sAllProps } from "./specialProps";

type UnsubscribeFn = () => void;
const emptyUnsubscribe: UnsubscribeFn = () => {};
function setAtomValue<T>(
  ctx: Ctx,
  anAtom: AtomMut<T>,
  value: T | Atom<T>,
): UnsubscribeFn {
  if (isAtom(value)) {
    return ctx.subscribe(value, (newValue) => {
      anAtom(ctx, newValue);
    });
  }
  anAtom(ctx, typeof value === "function" ? () => value : value);
  return emptyUnsubscribe;
}

type PropsProxy<T> = {
  insideProps: InsideProps<T>;
  setProps: (props: OutsideProps<T>) => void;
};
type MapElement =
  | {
      type: "atom";
      unsubscribe: UnsubscribeFn;
      cached: AtomMut;
    }
  | {
      type: "function";
      ref: {
        f: AnyF;
      };
      cached: AnyF;
    };
const stableFnRegexp = /^on[A-Z]/;
function divideProp(name: string): MapElement["type"] {
  if (stableFnRegexp.test(name)) {
    return "function";
  }
  return "atom";
}

const emptyFn = () => {};
export function createPropsProxy<Props>(
  ctx: Ctx,
  outsideProps: OutsideProps<Props>,
): PropsProxy<Props> {
  const propsMap = new Map<string, MapElement>();
  let rawOutsideProps = outsideProps;
  let allPropsAtom: Atom<AllPropsProp<Props>> | undefined = undefined;
  const updateAllPropsAtom = atom(0);
  function getAllPropsAtom() {
    if (allPropsAtom) {
      return allPropsAtom;
    }

    allPropsAtom = atom((ctx) => {
      ctx.spy(updateAllPropsAtom);

      const allProps = {} as AllPropsProp<Props>;
      for (const [propName, el] of Object.entries(rawOutsideProps)) {
        if (isAtom(el)) {
          // @ts-ignore
          allProps[propName] = ctx.spy(el);
        } else {
          // @ts-ignore
          allProps[propName] = el;
        }
      }
      return allProps;
    });

    return allPropsAtom;
  }

  function get(p: string) {
    const el = propsMap.get(p);
    if (el) {
      return el.cached;
    }
    // @ts-ignore
    const outsideValue = rawOutsideProps[p];
    switch (divideProp(p)) {
      case "atom":
        const anAtom = atom(undefined);
        const unsubscribe = setAtomValue(ctx, anAtom, outsideValue);
        propsMap.set(p, { type: "atom", cached: anAtom, unsubscribe });
        return anAtom;
      case "function":
        const ref = {
          f: outsideValue ?? emptyFn,
        };
        const f: AnyF = (...args) => {
          return ref.f(...args);
        };
        propsMap.set(p, { type: "function", cached: f, ref });
        return f;
    }
  }
  return {
    insideProps: new Proxy({} as InsideProps<Props>, {
      get(
        target: InsideProps<Props>,
        p: string | typeof sAllProps,
        receiver: any,
      ) {
        if (p === sAllProps) {
          return getAllPropsAtom();
        }
        return get(p);
      },
      ownKeys(target: InsideProps<Props>): ArrayLike<string | symbol> {
        return Object.keys(rawOutsideProps);
      },
      getOwnPropertyDescriptor(
        target: InsideProps<Props>,
        p: string,
      ): PropertyDescriptor | undefined {
        return {
          value: get(p),
          configurable: true,
          enumerable: true,
        };
      },
    }),
    setProps: (props) => {
      rawOutsideProps = props;
      for (const [propName, el] of propsMap) {
        // @ts-ignore
        const outsideValue = props[propName];
        switch (el.type) {
          case "atom":
            const { cached, unsubscribe } = el;
            el.unsubscribe = setAtomValue(ctx, cached, outsideValue);
            unsubscribe();
            break;
          case "function":
            const { ref } = el;
            ref.f = outsideValue ?? emptyFn;
            break;
        }
      }
      updateAllPropsAtom(ctx, (x) => x + 1);
    },
  };
}
