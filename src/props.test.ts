import { describe, test, expect, vi, expectTypeOf } from "vitest";
import { atom, Atom, isAtom } from "@reatom/core";
import { createTestCtx } from "@reatom/testing";
import { createPropsProxy } from "./innerProps";
import { getAllPropsSignal } from "./getAllPropsSignal";

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

      test("functions inside `on` props and non-capitalized next letter should be an atom", () => {
        type Props = {
          only: () => void;
        };
        const value: Props = {
          only: () => 1,
        };
        const ctx = createTestCtx();
        const { insideProps } = createPropsProxy<Props>(ctx, value);

        expectTypeOf(insideProps)
          .toHaveProperty("only")
          .toMatchTypeOf<Atom<() => void>>();

        expect(isAtom(insideProps.only)).toBeTruthy();
      });

      test("functions inside `on` props and capitalized next letter should be a function", () => {
        type Props = {
          onClick: () => void;
        };
        const value: Props = {
          onClick: () => 1,
        };
        const ctx = createTestCtx();
        const { insideProps } = createPropsProxy<Props>(ctx, value);

        expectTypeOf(insideProps)
          .toHaveProperty("onClick")
          .toMatchTypeOf<() => void>();

        expect(insideProps.onClick).toStrictEqual(expect.any(Function));
      });

      test("stable functions can have only void return type", () => {
        type Props = {
          onClick: () => number;
        };

        expectTypeOf<typeof createPropsProxy<Props>>()
          .returns.toHaveProperty("insideProps")
          .toHaveProperty("onClick")
          .toBeNever();
      });

      test("optional functions", () => {
        const ctx = createTestCtx();
        const { insideProps } = createPropsProxy<{
          onChange?: () => void;
        }>(ctx, {});

        expect(insideProps.onChange).toStrictEqual(expect.any(Function));
        expect(() => insideProps.onChange()).not.toThrow();

        expectTypeOf(insideProps.onChange).toMatchTypeOf<() => void>();
        expectTypeOf(insideProps.onChange).not.toBeUndefined();
      });
    });

    describe("`allProps` prop", () => {
      describe("type infer", () => {
        test("should be Atom", () => {
          const ctx = createTestCtx();
          const { insideProps } = createPropsProxy<{
            a: number;
          }>(ctx, {
            a: 1,
          });

          expectTypeOf(getAllPropsSignal(insideProps)).toMatchTypeOf<
            Atom<{ a: number }>
          >();
        });

        test("primitive", () => {
          const ctx = createTestCtx();
          const { insideProps } = createPropsProxy<{
            a: number;
          }>(ctx, {
            a: 1,
          });

          expectTypeOf(getAllPropsSignal(insideProps)).toMatchTypeOf<
            Atom<{ a: number }>
          >();
        });

        test("atom", () => {
          const ctx = createTestCtx();
          const { insideProps } = createPropsProxy<{
            a: number;
          }>(ctx, {
            a: atom(1),
          });

          expectTypeOf(getAllPropsSignal(insideProps)).toMatchTypeOf<
            Atom<{ a: number }>
          >();
        });
      });

      test("sAllProps should be Atom", () => {
        const ctx = createTestCtx();
        const { insideProps } = createPropsProxy<{
          a: number;
        }>(ctx, {
          a: 1,
        });

        const x = getAllPropsSignal(insideProps);
        expect(isAtom(getAllPropsSignal(insideProps))).toBeTruthy();
        expectTypeOf(getAllPropsSignal(insideProps)).toMatchTypeOf<
          Atom<{ a: number }>
        >();
      });

      describe("should update", () => {
        test("primitive => primitive", () => {
          const ctx = createTestCtx();
          const { insideProps, setProps } = createPropsProxy<{
            a: number;
          }>(ctx, {
            a: 1,
          });

          const allProps = getAllPropsSignal(insideProps);
          expect(ctx.get(allProps)).toEqual({ a: 1 });

          setProps({ a: 2 });
          expect(ctx.get(allProps)).toEqual({ a: 2 });
        });

        test("primitive => atom", () => {
          const ctx = createTestCtx();
          const { insideProps, setProps } = createPropsProxy<{
            a: number;
          }>(ctx, {
            a: 1,
          });

          const allProps = getAllPropsSignal(insideProps);
          expect(ctx.get(allProps)).toEqual({ a: 1 });

          setProps({ a: atom(2) });
          expect(ctx.get(allProps)).toEqual({ a: 2 });
        });

        test("atom => primitive", () => {
          const ctx = createTestCtx();
          const { insideProps, setProps } = createPropsProxy<{
            a: number;
          }>(ctx, {
            a: atom(1),
          });

          const allProps = getAllPropsSignal(insideProps);
          expect(ctx.get(allProps)).toEqual({ a: 1 });

          setProps({ a: 2 });
          expect(ctx.get(allProps)).toEqual({ a: 2 });
        });

        test("atom => atom", () => {
          const ctx = createTestCtx();
          const { insideProps, setProps } = createPropsProxy<{
            a: number;
          }>(ctx, {
            a: atom(1),
          });

          const allProps = getAllPropsSignal(insideProps);
          expect(ctx.get(allProps)).toEqual({ a: 1 });

          setProps({ a: atom(2) });
          expect(ctx.get(allProps)).toEqual({ a: 2 });
        });

        test("atom => primitive + change original atom", () => {
          const ctx = createTestCtx();
          const original = atom(1);
          const { insideProps, setProps } = createPropsProxy<{
            a: number;
          }>(ctx, {
            a: original,
          });

          const allProps = getAllPropsSignal(insideProps);
          expect(ctx.get(allProps)).toEqual({ a: 1 });

          setProps({ a: 2 });
          expect(ctx.get(allProps)).toEqual({ a: 2 });

          original(ctx, 3);
          expect(ctx.get(allProps)).toEqual({ a: 2 });
        });

        test("atom => atom + change original atom", () => {
          const ctx = createTestCtx();
          const original = atom(1);
          const { insideProps, setProps } = createPropsProxy<{
            a: number;
          }>(ctx, {
            a: original,
          });

          const allProps = getAllPropsSignal(insideProps);
          expect(ctx.get(allProps)).toEqual({ a: 1 });

          setProps({ a: atom(2) });
          expect(ctx.get(allProps)).toEqual({ a: 2 });

          original(ctx, 3);
          expect(ctx.get(allProps)).toEqual({ a: 2 });
        });
      });

      test("change atom", () => {
        const ctx = createTestCtx();
        const original = atom(1);
        const { insideProps, setProps } = createPropsProxy<{
          a: number;
        }>(ctx, {
          a: original,
        });

        const allProps = getAllPropsSignal(insideProps);
        expect(ctx.get(allProps)).toEqual({ a: 1 });

        original(ctx, 2);
        expect(ctx.get(allProps)).toEqual({ a: 2 });
      });
    });
  });

  describe("outsideProps", () => {
    describe("stable functions", () => {
      test("optional", () => {
        const ctx = createTestCtx();
        const { insideProps, setProps } = createPropsProxy<{
          onClick?: (x: number) => void;
        }>(ctx, { onClick: undefined });

        expectTypeOf(insideProps.onClick).toMatchTypeOf<(x: number) => void>();
        expectTypeOf(setProps)
          .parameter(0)
          .toHaveProperty("onClick")
          .toMatchTypeOf<undefined | ((x: number) => void)>();
      });
    });
  });
});
