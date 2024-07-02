import { describe, expectTypeOf, test } from "vitest";
import { ConvertToAtom } from "./ConvertToAtom";
import { Atom } from "@reatom/core";

describe("types", () => {
  describe("convert to atom", () => {
    test("atom", () => {
      type A = Atom<number>;
      type Result = ConvertToAtom<A>;
      expectTypeOf<Result>().toMatchTypeOf<A>();
    });

    test("number", () => {
      type Result = ConvertToAtom<number>;
      expectTypeOf<Result>().toMatchTypeOf<Atom<number>>();
    });
  });
});
