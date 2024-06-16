import React from "react";
import { ReturnComponent } from "./declareComponent";
import { wrap } from "./wrap";

const cache = new Map<
  keyof React.JSX.IntrinsicElements,
  ReturnComponent<any>
>();

export const html = new Proxy<{
  [K in keyof React.JSX.IntrinsicElements]: ReturnComponent<
    React.JSX.IntrinsicElements[K]
  >;
}>(
  // @ts-ignore
  {},
  {
    get(target, tag: keyof React.JSX.IntrinsicElements) {
      if (cache.has(tag)) {
        return cache.get(tag);
      }
      const ret = wrap(tag);
      cache.set(tag, ret);
      return ret;
    },
  },
);
