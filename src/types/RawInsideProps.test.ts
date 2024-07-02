import { describe, expectTypeOf, test } from "vitest";
import { RawInsideProps } from "./RawInsideProps";
import { Atom } from "@reatom/core";

describe("types", () => {
  describe("raw inside props", () => {
    test("simple test", () => {
      type Obj = {
        x: number;
      };
      type Result = RawInsideProps<Obj>;
      expectTypeOf<Result>().toMatchTypeOf<{
        x: Atom<number>;
      }>();
    });

    test("optional", () => {
      type Obj = {
        x?: number;
      };
      type Result = RawInsideProps<Obj>;
      expectTypeOf<Result>().toMatchTypeOf<{
        x: Atom<number | undefined>;
      }>();
    });

    test("should remove properties with `on` prefix", () => {
      type Obj = {
        onClick: number;
      };
      type Result = RawInsideProps<Obj>;
      expectTypeOf<Result>().not.toHaveProperty("onClick");
    });
  });
});
