import { bind } from "@reatom/lens";
import { Ctx, Fn } from "@reatom/core";
import { Binded } from "@reatom/lens";

type CreateBindCtxArg = {
  ctx: Ctx;
};

type Context = {
  ctx: Ctx;
};

let context: null | Context = null;
export function bindCtx<T extends Fn>(fn: T): Binded<T> {
  if (!context) {
    throw new Error(
      "bindCtx must be called inside signal-components init phase",
    );
  }

  return bind(context.ctx, fn);
}

export const createBindCtx = ({ ctx }: CreateBindCtxArg) => {
  return {
    runBinded(fn: () => void) {
      const prevContext = context;
      context = {
        ctx,
      };
      try {
        fn();
      } finally {
        context = prevContext;
      }
    },
  };
};
