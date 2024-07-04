import { describe, expectTypeOf, test } from "vitest";
import { OnFunctionsOutsideProps } from "./OnFunctionsOutsideProps";

type IsOptional<T, K extends keyof T> = {} extends Pick<T, K> ? true : false;
type F = (x: number) => void;
describe("types", () => {
  describe("onFunction props", () => {
    test("simple test", () => {
      type Obj = {
        onClick: F;
      };
      type Result = OnFunctionsOutsideProps<Obj>;
      expectTypeOf<Result>().toHaveProperty("onClick").toMatchTypeOf<F>();
    });

    test("function should return void", () => {
      type Obj = {
        onClick: () => number;
      };
      type Result = OnFunctionsOutsideProps<Obj>;
      expectTypeOf<Result>().toHaveProperty("onClick").toBeNever();
    });

    test("function should return ONLY void", () => {
      type Obj = {
        onClick: () => number | void;
      };
      type Result = OnFunctionsOutsideProps<Obj>;
      expectTypeOf<Result>().toHaveProperty("onClick").toBeNever();
    });

    test("cannot be undefined", () => {
      type Obj = {
        onClick: undefined;
      };
      type Result = OnFunctionsOutsideProps<Obj>;

      expectTypeOf<Result>().toHaveProperty("onClick").toBeNever();
    });

    test("optional f", () => {
      type Obj = {
        onClick?: F;
      };
      type Result = OnFunctionsOutsideProps<Obj>;
      expectTypeOf<IsOptional<Result, "onClick">>().toMatchTypeOf<true>();

      expectTypeOf<Result>()
        .toHaveProperty("onClick")
        .toMatchTypeOf<F | undefined>();
    });

    test("on should be a function", () => {
      type Obj = {
        onClick: number;
      };
      type Result = OnFunctionsOutsideProps<Obj>;
      expectTypeOf<Result>().toHaveProperty("onClick").toBeNever();
    });

    test("should remove properties without `on` prefix", () => {
      type Obj = {
        a: number;
      };
      type Result = OnFunctionsOutsideProps<Obj>;
      expectTypeOf<Result>().not.toHaveProperty("a");
    });
  });
});
