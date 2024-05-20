import React from "react";
import {
  Atom,
  CtxSpy,
  AtomState,
  atom,
  isAtom,
  Ctx,
  AtomMut,
} from "@reatom/core";
import { reatomComponent, useAtom, useCtx } from "@reatom/npm-react";

type ConvertToAtom<T> = T extends Atom ? T : Atom<T>;
type InsideProps<Props> = Required<{
  [K in keyof Props]: NonNullable<ConvertToAtom<Props[K]>>;
}>;

type OutsideProps<Props> = {
  [K in keyof Props]:
    | ConvertToAtom<Props[K]>
    | AtomState<ConvertToAtom<Props[K]>>;
};
type ReturnComponent<Props> = React.FC<OutsideProps<Props>>;

type RenderF = (ctx: CtxSpy) => React.ReactElement;

type Component<Props> = (props: InsideProps<Props>) => RenderF;

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
function createPropsProxy<Props>(ctx: Ctx): PropsProxy<Props> {
  const propsMap = new Map<string, MapElement>();
  let outsideProps = {} as OutsideProps<Props>;
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
      outsideProps = props;
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

export function declareComponent<Props>(
  component: Component<Props>,
): ReturnComponent<Props> {
  // @ts-ignore TODO: implement ref support later
  return (props: OutsideProps<Props>) => {
    const ctx = useCtx();
    const { insideProps, setProps } = React.useMemo(
      () => createPropsProxy<Props>(ctx),
      [],
    );
    setProps(props);

    const wrapped = React.useMemo(() => {
      return component(insideProps);
    }, []);

    const Component = React.useMemo(() => {
      return React.memo(reatomComponent(({ ctx }) => wrapped(ctx)));
    }, []);

    return <Component />;
  };
}
