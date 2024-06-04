import React from "react";
import { Atom, AtomState, Ctx, CtxSpy } from "@reatom/core";
import { reatomComponent, useCtx } from "@reatom/npm-react";
import { InsideProps, OutsideProps } from "./types";
import { createPropsProxy } from "./innerProps";
import { createComponentsStore } from "./componentsStore";
import { Arg, createWireHook } from "./wireHook";

type ReturnComponent<Props> = React.FC<OutsideProps<Props>>;
type ComponentF = {
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
type RenderArg = {
  reatomCtx: Ctx;
  spy: Arg["spy"];
  component: ComponentF;
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
    const [, setState] = React.useState(0);
    const rerender = React.useCallback(() => setState((s) => s + 1), []);

    const { rewireHooks, render, runWires } = React.useMemo(
      () => createWireHook({ rerender, ctx: rootCtx }),
      [],
    );
    const firstRender = React.useRef<RenderF | null>(null);
    if (!firstRender.current) {
      runWires(() => {
        firstRender.current = component(insideProps, {});
      });
    } else {
      render();
    }
    React.useEffect(() => rewireHooks(), []);
    // because runWires is sync
    const wrapped = firstRender.current!;

    const InitPhase = React.useMemo(
      () =>
        React.memo(() => {
          const componentsStore = createComponentsStore();

          const RenderPhase = reatomComponent(({ ctx }) => {
            return wrapped({
              reatomCtx: ctx,
              component: componentsStore.renderAtom,
              spy: (anAtom) => ctx.spy(anAtom),
            });
          });

          return <RenderPhase />;
        }),
      [],
    );

    return <InitPhase />;
  };
}

export { defaults } from "./defaults";
export { rest } from "./rest";
export { wireHook } from "./wireHook";
