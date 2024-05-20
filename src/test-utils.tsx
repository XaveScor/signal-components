import React, { StrictMode } from "react";
import { createTestCtx, TestCtx } from "@reatom/testing";
import { render } from "@testing-library/react";
import { reatomContext } from "@reatom/npm-react";

export function customRender(element: React.ReactElement) {
  const ctx = createTestCtx();
  const rendered = render(element, {
    wrapper: ({ children }) => (
      <StrictMode>
        <reatomContext.Provider value={ctx}>{children}</reatomContext.Provider>
      </StrictMode>
    ),
  });

  return { rendered, ctx };
}
