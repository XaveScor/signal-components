import { atom, Atom, AtomState, Ctx } from "@reatom/core";
import { useCtx } from "@reatom/npm-react";
import React from "react";

type Arg = {
  spy: <_, A extends Atom>(a: A) => AtomState<A>;
};
export type CallHook<T> = (arg: Arg) => T;
type RenderHook = () => void;
type CreateWireHookArg = {
  ctx: Ctx;
  rerender: () => void;
};
export const createWireHook = ({ ctx, rerender }: CreateWireHookArg) => {
  const subscriptions = new Array<RenderHook>();
  let unsubscribe = () => {};
  const signals = new Set<Atom>();
  return {
    render() {
      signals.clear();
      subscriptions.forEach((sub) => sub());
    },
    rewireHooks() {
      unsubscribe();
      let val = 0;
      const subscribeAtom = atom((ctx) => {
        signals.forEach((a) => {
          ctx.spy(a);
        });
        return ++val;
      });

      let firstTime = true;
      unsubscribe = ctx.subscribe(subscribeAtom, () => {
        if (firstTime) {
          firstTime = false;
          return;
        }
        rerender();
      });

      return unsubscribe;
    },
    wireHook<T>(callhook: CallHook<T>): Atom<T> {
      const result = atom<T | undefined>(undefined);

      const renderHook: RenderHook = () => {
        const ctx = useCtx();
        const myCtx = React.useMemo<Arg>(
          () => ({
            spy: (a) => {
              signals.add(a);
              return ctx.get(a);
            },
          }),
          [ctx],
        );

        result(ctx, callhook(myCtx));
      };

      renderHook();
      subscriptions.push(renderHook);
      return result as Atom<T>;
    },
  };
};
