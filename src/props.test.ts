import { describe, test, expect, vi } from "vitest";
import { isAtom } from "@reatom/core";
import { createTestCtx } from "@reatom/testing";
import { createPropsProxy } from "./innerProps";

describe("props", () => {
  describe("innerProps", () => {
    test("spread", () => {
      const ctx = createTestCtx();
      const { insideProps } = createPropsProxy<{ x: number }>(ctx, { x: 1 });
      const spread = { ...insideProps };

      expect(Object.keys(spread)).toEqual(["x"]);
      expect(isAtom(spread.x)).toBeTruthy();
      expect(ctx.get(spread.x)).toBe(1);
    });

    test("#10. get value after change", () => {
      const ctx = createTestCtx();
      const { insideProps, setProps } = createPropsProxy<{ x: number }>(ctx, {
        x: 1,
      });
      setProps({ x: 2 });

      expect(ctx.get(insideProps.x)).toBe(2);
    });

    describe("stable functions", () => {
      test("functions with `on` prefix should be stable functions", () => {
        const ctx = createTestCtx();
        const { insideProps, setProps } = createPropsProxy<{
          onChange: () => void;
        }>(ctx, {
          onChange: () => {},
        });

        const onChange = insideProps.onChange;
        expect(onChange).toStrictEqual(expect.any(Function));

        setProps({ onChange: () => {} });

        expect(insideProps.onChange).toStrictEqual(expect.any(Function));
        expect(insideProps.onChange).toStrictEqual(onChange);
      });

      test("functions should call the latest received function", () => {
        const ctx = createTestCtx();
        const fn = vi.fn();
        const { insideProps, setProps } = createPropsProxy<{
          onChange: () => void;
        }>(ctx, {
          onChange: () => {
            fn("initial");
          },
        });

        insideProps.onChange();

        setProps({
          onChange: () => {
            fn("changed");
          },
        });
        insideProps.onChange();

        setProps({
          onChange: () => {
            fn("the latest");
          },
        });
        insideProps.onChange();

        expect(fn).toHaveBeenCalledWith("initial");
        expect(fn).toHaveBeenCalledWith("changed");
        expect(fn).toHaveBeenCalledWith("the latest");
      });

      test("optional functions", () => {
        const ctx = createTestCtx();
        const { insideProps } = createPropsProxy<{
          onChange?: () => void;
        }>(ctx, {});

        expect(insideProps.onChange).toStrictEqual(expect.any(Function));
        expect(() => insideProps.onChange()).not.toThrow();
      });
    });
  });
});
