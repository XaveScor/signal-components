import { describe, test, expect } from "vitest";
import { defaults } from "./defaults";
import { isAtom } from "@reatom/core";
import { createTestCtx } from "@reatom/testing";
import { createPropsProxy } from "./innerProps";

describe("defaults", () => {
  test("simple", () => {
    const ctx = createTestCtx();
    const { insideProps } = createPropsProxy<{ x?: number }>(ctx, {});
    const defaultsObject = { x: 1 };
    const filledProps = defaults(insideProps, defaultsObject);

    expect(isAtom(filledProps.x)).toBeTruthy();
    expect(ctx.get(filledProps.x)).toBe(1);
  });

  test("save untouched props", () => {
    const ctx = createTestCtx();
    const { insideProps } = createPropsProxy<{ x?: number; y?: number }>(
      ctx,
      {},
    );
    const defaultsObject = { x: 1 };
    const filledProps = defaults(insideProps, defaultsObject);

    expect(isAtom(filledProps.y)).toBeTruthy();
    expect(ctx.get(filledProps.y)).toBe(undefined);
  });

  test("don't change prop with value", () => {
    const ctx = createTestCtx();
    const { insideProps } = createPropsProxy<{ x?: number }>(ctx, { x: 2 });
    const defaultsObject = { x: 1 };
    const filledProps = defaults(insideProps, defaultsObject);

    expect(isAtom(filledProps.x)).toBeTruthy();
    expect(ctx.get(filledProps.x)).toBe(2);
  });
});
