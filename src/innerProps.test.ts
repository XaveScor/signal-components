import { describe, test, expect } from "vitest";
import { isAtom } from "@reatom/core";
import { createTestCtx } from "@reatom/testing";
import { createPropsProxy } from "./innerProps";

describe("innerProps", () => {
  test("spread", () => {
    const ctx = createTestCtx();
    const { insideProps } = createPropsProxy(ctx, { x: 1 });
    const spread = { ...insideProps };

    expect(Object.keys(spread)).toEqual(["x"]);
    expect(isAtom(spread.x)).toBeTruthy();
    expect(ctx.get(spread.x)).toBe(1);
  });

  test("#10. get value after change", () => {
    const ctx = createTestCtx();
    const { insideProps, setProps } = createPropsProxy(ctx, { x: 1 });
    setProps({ x: 2 });

    expect(ctx.get(insideProps.x)).toBe(2);
  });
});
