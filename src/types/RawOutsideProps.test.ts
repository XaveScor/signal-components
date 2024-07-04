import { describe, expectTypeOf, test } from "vitest";
import { Atom } from "@reatom/core";
import { RawOutsideProps } from "./RawOutsideProps";

type IsOptional<T, K extends keyof T> = {} extends Pick<T, K> ? true : false;
describe("types", () => {
  describe("raw outside props", () => {
    test("simple test", () => {
      type Obj = {
        x: number;
      };
      type Result = RawOutsideProps<Obj>;
      expectTypeOf<Result>().toMatchTypeOf<{
        x: Atom<number> | number;
      }>();
    });

    test("optional", () => {
      type Obj = {
        x?: number;
      };
      type Result = RawOutsideProps<Obj>;
      expectTypeOf<IsOptional<Result, "x">>().toMatchTypeOf<true>();
      expectTypeOf<Result>().toMatchTypeOf<{
        x?: Atom<number | undefined> | number | undefined;
      }>();
    });

    test("should remove properties with `on` prefix", () => {
      type Obj = {
        onClick: number;
      };
      type Result = RawOutsideProps<Obj>;
      expectTypeOf<Result>().not.toHaveProperty("onClick");
    });
  });
});
