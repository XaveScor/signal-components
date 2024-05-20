import React from "react";
import { Atom, CtxSpy, AtomState, atom, isAtom, Ctx } from "@reatom/core";
import { reatomComponent, useAtom, useCtx } from "@reatom/npm-react";

type ConvertToAtom<T> = T extends Atom ? T : Atom<T>;
type InsideProps<Props> = {
  [K in keyof Props]: ConvertToAtom<Props[K]>;
};

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

export function declareComponent<Props>(
  component: Component<Props>,
): ReturnComponent<Props> {
  // @ts-ignore TODO: implement ref support later
  return (props: OutsideProps<Props>) => {
    const propsObj: InsideProps<Props> = React.useMemo(() => {
      // @ts-ignore
      const res: InsideProps<Props> = {};
      for (const propName of Object.keys(props)) {
        // @ts-ignore
        res[propName] = atom(null);
      }
      return res;
    }, []);
    const ctx = useCtx();
    for (const [propName, propValue] of Object.entries(props)) {
      const outsideValue = unwrapValue(ctx, propValue);
      // @ts-ignore
      const insideAtom = propsObj[propName];

      if (ctx.get(insideAtom) !== outsideValue) {
        insideAtom(ctx, outsideValue);
      }
    }

    const wrapped = React.useMemo(() => {
      return component(propsObj);
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
