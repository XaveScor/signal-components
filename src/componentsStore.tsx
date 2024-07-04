import React from "react";
import { atom, Atom } from "@reatom/core";
import { useAtom } from "@reatom/npm-react";
import { AnyF, OutsideProps } from "./types";
import { declareComponent } from "./declareComponent";

type CtxComponentProps = { m?: AnyF };

export function createComponentsStore() {
  const atomsMap = new Map<
    Atom,
    React.ComponentType<OutsideProps<CtxComponentProps>>
  >();

  return {
    renderAtom(anAtom: Atom, mapper?: AnyF) {
      const Cached = atomsMap.get(anAtom);
      if (Cached) {
        return <Cached m={mapper} />;
      }
      const Component = declareComponent<CtxComponentProps>(({ m }) => {
        const mappedAtom = atom((ctx) => {
          const unwrappedMapped = ctx.spy(m) ?? ((v) => v);

          return unwrappedMapped(ctx.spy(anAtom));
        });
        return () => {
          const [value] = useAtom(mappedAtom);
          return <>{value}</>;
        };
      });
      atomsMap.set(anAtom, Component);
      return <Component m={mapper} />;
    },
  };
}
