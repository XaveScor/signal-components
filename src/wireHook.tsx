import { atom, Atom, Ctx } from "@reatom/core";

type RenderHook = () => void;
export const createWireHook = (ctx: Ctx) => {
  const res = {
    subscriptions: new Array<RenderHook>(),
    wireHook<T>(callhook: () => T): Atom<T> {
      const result = atom<undefined | T>(undefined);
      const hook = () => {
        result(ctx, callhook());
      };
      hook();
      res.subscriptions.push(hook);
      return result as Atom<T>;
    },
  };

  return res;
};
