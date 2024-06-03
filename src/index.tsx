import React from "react";
import { Atom, AtomState, CtxSpy } from "@reatom/core";
import { reatomComponent, useCtx } from "@reatom/npm-react";
import { AnyF, InsideProps, OutsideProps } from "./types";
import { createPropsProxy } from "./innerProps";
import { createComponentsStore } from "./componentsStore";
import { CallHook, createWireHook } from "./wireHook";

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
type ComponentArg<Props> = {
  wireHook<T>(callhook: CallHook<T>): Atom<T>;
};
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

    const { wireHook, rewireHooks, render } = React.useMemo(
      () => createWireHook({ rerender, ctx: rootCtx }),
      [],
    );
    const firstRender = React.useRef<RenderF | null>(null);
    if (!firstRender.current) {
      firstRender.current = component(insideProps, { wireHook });
    } else {
      render();
    }
    React.useEffect(() => rewireHooks(), []);
    const wrapped = firstRender.current;

    const InitPhase = React.useMemo(
      () =>
        React.memo(() => {
          const componentsStore = createComponentsStore();

          const RenderPhase = reatomComponent(({ ctx }) => {
            const renderCtx = React.useMemo(() => {
              return {
                ...ctx,
                component: (atom: Atom, mapper?: AnyF) =>
                  componentsStore.renderAtom(atom, mapper),
              } as RenderCtx;
            }, [ctx]);

            return wrapped({ ctx: renderCtx });
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
