import { describe, test, expect } from "vitest";
import { isAtom } from "@reatom/core";
import { createTestCtx } from "@reatom/testing";
import { createPropsProxy } from "./innerProps";
import { rest } from "./rest";

describe("rest", () => {
  test("spread", () => {
    const ctx = createTestCtx();
    const { insideProps } = createPropsProxy(ctx, { x: 1, y: "string" });
    const spread = { ...rest(insideProps, ["x"]) };

    expect(Object.keys(spread)).toEqual(["y"]);
    expect(isAtom(spread.y)).toBeTruthy();
    expect(ctx.get(spread.y)).toBe("string");
  });
});
