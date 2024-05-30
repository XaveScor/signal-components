import React from "react";
import { Atom } from "@reatom/core";
import { useAtom } from "@reatom/npm-react";

export function createComponentsStore() {
  const atomsMap = new Map<Atom, React.ComponentType>();

  return {
    renderAtom(atom: Atom) {
      const Cached = atomsMap.get(atom);
      if (Cached) {
        return <Cached />;
      }
      const Component = () => {
        const [value] = useAtom(atom);
        return value;
      };
      atomsMap.set(atom, Component);
      return <Component />;
    },
  };
}
