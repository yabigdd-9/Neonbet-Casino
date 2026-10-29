import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { expect, it } from "vitest";
import GameArtwork from "./GameArtwork";

it("recovers a failed shared atlas with the local theme cover without retaining sprite offsets", () => {
  const { container } = render(<GameArtwork game={{ title: "Neon Fruits" }} />);
  const image = container.querySelector("img");
  expect(image.getAttribute("src")).toContain("casino-atlas.png");
  fireEvent.error(image);
  expect(image.getAttribute("src")).toContain("fruit.svg");
  expect(image.className).toBe("game-cover-fallback");
  expect(image.style.left).toBe("");
  expect(image.style.top).toBe("");
  fireEvent.error(image);
  expect(image.getAttribute("src")).toContain("fruit.svg");
});
