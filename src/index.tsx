import React from "react";
import { CtxSpy } from "@reatom/core";
import { reatomComponent, useCtx } from "@reatom/npm-react";
import { InsideProps, OutsideProps } from "./types";
import { createPropsProxy } from "./innerProps";

type ReturnComponent<Props> = React.FC<OutsideProps<Props>>;

type RenderArg = {
  ctx: CtxSpy;
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
    const ctx = useCtx();
    const { insideProps, setProps } = React.useMemo(
      () => createPropsProxy<Props>(ctx, props),
      [],
    );
    setProps(props);

    const wrapped = React.useMemo(() => {
      return component(insideProps, {});
    }, []);

    const Component = React.useMemo(() => {
      return React.memo(reatomComponent(({ ctx }) => wrapped({ ctx })));
    }, []);

    return <Component />;
  };
}

export { defaults } from "./defaults";
export { rest } from "./rest";
