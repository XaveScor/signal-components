import { describe, expectTypeOf, test } from "vitest";
import { SplitPropsByName } from "./SplitPropsByName";

describe("types", () => {
  describe("split props by name", () => {
    describe("on functions", () => {
      test("simple test", () => {
        type Obj = {
          onClick: void;
        };
        type Result = SplitPropsByName<Obj>["onFunctions"];
        expectTypeOf<Result>().toHaveProperty("onClick");
      });

      test("should remove properties without `on` prefix", () => {
        type Obj = {
          a: number;
        };
        type Result = SplitPropsByName<Obj>["onFunctions"];
        expectTypeOf<Result>().not.toHaveProperty("a");
      });
    });

    describe("atoms", () => {
      test("simple test", () => {
        type Obj = {
          x: void;
        };
        type Result = SplitPropsByName<Obj>["atoms"];
        expectTypeOf<Result>().toHaveProperty("x");
      });

      test("should remove properties with `on` prefix", () => {
        type Obj = {
          onClick: void;
        };
        type Result = SplitPropsByName<Obj>["atoms"];
        expectTypeOf<Result>().not.toHaveProperty("onClick");
      });
    });
  });
});
