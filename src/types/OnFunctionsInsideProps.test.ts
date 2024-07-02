import { describe, expectTypeOf, test } from "vitest";
import { OnFunctionInsideProps } from "./OnFunctionInsideProps";

type IsOptional<T, K extends keyof T> = {} extends Pick<T, K> ? true : false;
type F = (x: number) => void;
describe("types", () => {
  describe("onFunction props", () => {
    test("simple test", () => {
      type Obj = {
        onClick: F;
      };
      type Result = OnFunctionInsideProps<Obj>;
      expectTypeOf<Result>().toHaveProperty("onClick").toMatchTypeOf<F>();
    });

    test("function should return void", () => {
      type Obj = {
        onClick: () => number;
      };
      type Result = OnFunctionInsideProps<Obj>;
      expectTypeOf<Result>().toHaveProperty("onClick").toBeNever();
    });

    test("optional f", () => {
      type Obj = {
        onClick?: F;
      };
      type Result = OnFunctionInsideProps<Obj>;
      expectTypeOf<IsOptional<Result, "onClick">>().toMatchTypeOf<false>();

      expectTypeOf<Result>().toHaveProperty("onClick").toMatchTypeOf<F>();
      expectTypeOf<Result>().toHaveProperty("onClick").not.toBeUndefined();
    });

    test("on should be a function", () => {
      type Obj = {
        onClick: number;
      };
      type Result = OnFunctionInsideProps<Obj>;
      expectTypeOf<Result>().toHaveProperty("onClick").toBeNever();
    });

    test("should remove properties without `on` prefix", () => {
      type Obj = {
        a: number;
      };
      type Result = OnFunctionInsideProps<Obj>;
      expectTypeOf<Result>().not.toHaveProperty("a");
    });
  });
});
