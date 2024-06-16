import { describe, test, expect } from "vitest";
import { html } from "./html";
import { customRender } from "./test-utils";
import { act } from "@testing-library/react";
import { atom } from "@reatom/core";

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
});
