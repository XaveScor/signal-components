import { describe, expectTypeOf, test } from "vitest";
import { MoveUndefinedToOptional } from "./MoveUndefinedToOptional";

type IsOptional<T, K extends keyof T> = {} extends Pick<T, K> ? true : false;
type Noop = () => void;
describe("types", () => {
  describe("move undefined to optional", () => {
    test("optional parameter", () => {
      type Obj = {
        onClick?: Noop;
      };
      type Result = MoveUndefinedToOptional<Obj>;
      type IsOptionalResult = IsOptional<Result, "onClick">;
      expectTypeOf<IsOptionalResult>().toMatchTypeOf<true>();
    });

    test("required parameter", () => {
      type Obj = {
        onClick: Noop;
      };
      type Result = MoveUndefinedToOptional<Obj>;
      type IsOptionalResult = IsOptional<Result, "onClick">;
      expectTypeOf<IsOptionalResult>().toMatchTypeOf<false>();
    });

    test("undefined parameter", () => {
      type Obj = {
        onClick: undefined;
      };
      type Result = MoveUndefinedToOptional<Obj>;
      type IsOptionalResult = IsOptional<Result, "onClick">;
      expectTypeOf<IsOptionalResult>().toMatchTypeOf<true>();
    });

    test("or undefined parameter", () => {
      type Obj = {
        onClick: Noop | undefined;
      };
      type Result = MoveUndefinedToOptional<Obj>;
      type IsOptionalResult = IsOptional<Result, "onClick">;
      expectTypeOf<IsOptionalResult>().toMatchTypeOf<true>();
      expectTypeOf<Result>()
        .toHaveProperty("onClick")
        .toMatchTypeOf<Noop | undefined>();
    });
  });
});
