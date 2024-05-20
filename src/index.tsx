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

function unwrapValue<T>(ctx: Ctx, value: Atom<T> | T) {
  if (isAtom(value)) {
    return ctx.get(value);
  }
  return value;
}

type PropsProxy<T> = {
  insideProps: InsideProps<T>;
  setProps: (props: OutsideProps<T>) => void;
};
function createPropsProxy<Props>(ctx: Ctx): PropsProxy<Props> {
  const propsMap = new Map<string, AtomMut>();
  let outsideProps = {} as OutsideProps<Props>;
  return {
    insideProps: new Proxy({} as InsideProps<Props>, {
      get(target: InsideProps<Props>, p: string, receiver: any) {
        if (propsMap.has(p)) {
          return propsMap.get(p);
        }
        // @ts-ignore
        const outsideValue = outsideProps[p];
        const a = atom(unwrapValue(ctx, outsideValue));
        propsMap.set(p, a);
        return a;
      },
    }),
    setProps: (props) => {
      outsideProps = props;
      for (const [propName, propValue] of propsMap) {
        // @ts-ignore
        const outsideValue = props[propName];
        if (ctx.get(propValue) !== unwrapValue(ctx, outsideValue)) {
          propValue(ctx, unwrapValue(ctx, outsideValue));
        }
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
      const renderAtom = atom((ctx) => wrapped(ctx));
      return React.memo(
        reatomComponent(() => {
          const [component] = useAtom(renderAtom);
          return component;
        }),
      );
    }, []);

    return <Component />;
  };
}
