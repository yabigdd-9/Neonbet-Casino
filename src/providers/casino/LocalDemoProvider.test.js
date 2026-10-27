import { it, expect } from "vitest";
import { LocalDemoProvider } from "./LocalDemoProvider";
const game = { title: "Test", type: "Slots" };
it("provides asynchronous discovery and expiring demo sessions", async () => {
  const provider = new LocalDemoProvider({ games: [game] });
  expect(await provider.getGames()).toEqual([game]);
  expect(await provider.getCategories()).toEqual(["Slots"]);
  expect(await provider.getGame("Test")).toEqual(game);
  expect(await provider.getGame("missing")).toBeNull();
  expect(await provider.launchDemo(game)).toMatchObject({ mode: "demo", gameId: "Slots-Test" });
  await expect(provider.launchReal()).rejects.toMatchObject({ code: "UNAVAILABLE" });
  await expect(provider.launchDemo({ title: "Unknown" })).rejects.toMatchObject({ code: "INVALID_REQUEST" });
});
