import React from "react";
import { Atom, AtomState, CtxSpy } from "@reatom/core";
import { reatomComponent, useCtx } from "@reatom/npm-react";
import { AnyF, InsideProps, OutsideProps } from "./types";
import { createPropsProxy } from "./innerProps";
import { createComponentsStore } from "./componentsStore";

type ReturnComponent<Props> = React.FC<OutsideProps<Props>>;
export type RenderCtx = CtxSpy & {
  component: {
    <
      A extends Atom<string | number | boolean | null | undefined>,
      B extends string | number | boolean | null | undefined,
    >(
      anAtom: A,
      mapper: (value: AtomState<A>) => B,
    ): React.ReactElement;
    <A extends Atom<string | number | boolean | null | undefined>>(
      anAtom: A,
    ): React.ReactElement;
  };
};
type RenderArg = {
  ctx: RenderCtx;
};
type RenderF = (arg: RenderArg) => React.ReactElement;
type ComponentArg<Props> = {};
type Component<Props> = (
  props: InsideProps<Props>,
  arg: ComponentArg<Props>,
) => RenderF;

export function declareComponent<Props>(
  component: Component<Props>,
): ReturnComponent<Props> {
  // @ts-ignore TODO: implement ref support later
  return (props: OutsideProps<Props>) => {
    const rootCtx = useCtx();
    const { insideProps, setProps } = React.useMemo(
      () => createPropsProxy<Props>(rootCtx, props),
      [],
    );
    setProps(props);

    const componentsStore = React.useMemo(() => createComponentsStore(), []);

    const wrapped = React.useMemo(() => {
      return component(insideProps, {});
    }, []);

    const Component = React.useMemo(() => {
      return React.memo(
        reatomComponent(({ ctx }) => {
          const renderCtx = React.useMemo(() => {
            return {
              ...ctx,
              component: (atom: Atom, mapper?: AnyF) =>
                componentsStore.renderAtom(atom, mapper),
            } as RenderCtx;
          }, [ctx]);

          return wrapped({ ctx: renderCtx });
        }),
      );
    }, []);

    return <Component />;
  };
}

export { defaults } from "./defaults";
export { rest } from "./rest";
