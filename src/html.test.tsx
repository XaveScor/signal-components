import React, {
  ButtonHTMLAttributes,
  ComponentProps,
  JSX,
  MouseEventHandler,
  SyntheticEvent,
} from "react";
import { describe, test, expect, expectTypeOf } from "vitest";
import { html } from "./html";
import { customRender } from "./test-utils";
import { act } from "@testing-library/react";
import { atom } from "@reatom/core";
import { ReturnComponent } from "./declareComponent";

describe("html", () => {
  test("span", () => {
    const x = atom(1);
    const { ctx, rendered } = customRender(<html.span>{x}</html.span>);
    expect(rendered.asFragment()).toMatchSnapshot();

    act(() => {
      x(ctx, 2);
    });
    expect(rendered.asFragment()).toMatchSnapshot();

    rendered.rerender(<html.span>10</html.span>);
    expect(rendered.asFragment()).toMatchSnapshot();
  });

  test("div", () => {
    const x = atom(1);
    const { ctx, rendered } = customRender(<html.div>{x}</html.div>);
    expect(rendered.asFragment()).toMatchSnapshot();

    act(() => {
      x(ctx, 2);
    });
    expect(rendered.asFragment()).toMatchSnapshot();

    rendered.rerender(<html.div>10</html.div>);
    expect(rendered.asFragment()).toMatchSnapshot();
  });

  describe("#34 bug", () => {
    test("onClick prop should infer right type", () => {
      type ButtonProps = ComponentProps<typeof html.button>;

      expectTypeOf<NonNullable<ButtonProps["onClick"]>>().toMatchTypeOf<
        (e: React.MouseEvent<HTMLButtonElement>) => void
      >();
    });

    test("ReturnComponent should infer right on* type", () => {
      type Component = ReturnComponent<{ onClick: (x: number) => void }>;
      type Props = ComponentProps<Component>;

      expectTypeOf<NonNullable<Props["onClick"]>>().toMatchTypeOf<
        (x: number) => void
      >();
    });

    test("ReturnComponent should infer right on* type for JSX.IntrinsicElements", () => {
      type Component = ReturnComponent<JSX.IntrinsicElements["button"]>;
      type Props = ComponentProps<Component>;

      expectTypeOf<NonNullable<Props["onClick"]>>().toMatchTypeOf<
        (e: React.MouseEvent<HTMLButtonElement>) => void
      >();
    });

    test("ReturnComponent should infer right on* type for JSX.IntrinsicElements", () => {
      type Component = ReturnComponent<JSX.IntrinsicElements["button"]>;
      type Props = ComponentProps<Component>;

      expectTypeOf<NonNullable<Props["onClick"]>>().toMatchTypeOf<
        (e: React.MouseEvent<HTMLButtonElement>) => void
      >();
    });

    test("ReturnComponent should infer right on* type for JSX.IntrinsicElements['onclick']", () => {
      type Component = ReturnComponent<{
        onClick: JSX.IntrinsicElements["button"]["onClick"];
      }>;
      type Props = ComponentProps<Component>;

      expectTypeOf<NonNullable<Props["onClick"]>>().toMatchTypeOf<
        (e: React.MouseEvent<HTMLButtonElement>) => void
      >();
    });

    test("ReturnComponent should infer right on* type for JSX.IntrinsicElements['onclick']", () => {
      type Component = ReturnComponent<{
        onClick: JSX.IntrinsicElements["button"]["onClick"];
      }>;
      type Props = ComponentProps<Component>;

      expectTypeOf<NonNullable<Props["onClick"]>>().toMatchTypeOf<
        (e: React.MouseEvent<HTMLButtonElement>) => void
      >();
    });

    test("ReturnComponent should infer right on* type for ButtonHTMLAttributes", () => {
      type Component = ReturnComponent<{
        onClick: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
      }>;
      type Props = ComponentProps<Component>;

      expectTypeOf<NonNullable<Props["onClick"]>>().toMatchTypeOf<
        (e: React.MouseEvent<HTMLButtonElement>) => void
      >();
    });

    test("ReturnComponent should infer right on* type for MouseEventHandler", () => {
      type Component = ReturnComponent<{
        onClick: MouseEventHandler<HTMLButtonElement> | undefined;
      }>;
      type Props = ComponentProps<Component>;

      expectTypeOf<NonNullable<Props["onClick"]>>().toMatchTypeOf<
        (e: React.MouseEvent<HTMLButtonElement>) => void
      >();
    });

    test("ReturnComponent should infer right on* type for bivarianceHack", () => {
      type EventHandler<E extends SyntheticEvent<any>> = {
        bivarianceHack(event: E): void;
      }["bivarianceHack"];
      type Component = ReturnComponent<{
        onClick: EventHandler<React.MouseEvent<HTMLButtonElement>> | undefined;
      }>;
      type Props = ComponentProps<Component>;

      expectTypeOf<NonNullable<Props["onClick"]>>().toMatchTypeOf<
        ((e: React.MouseEvent<HTMLButtonElement>) => void) | undefined
      >();
    });

    test("ReturnComponent should infer right on* type for MouseEvent", () => {
      type Component = ReturnComponent<{
        onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
      }>;
      type Props = ComponentProps<Component>;

      expectTypeOf<Props["onClick"]>().toMatchTypeOf<
        (e: React.MouseEvent<HTMLButtonElement>) => void
      >();
    });
  });
});
