import { expect, it } from "vitest";
import { SoftSwissCandidate } from "./SoftSwissCandidate";

it("fails closed for all operations and advertises no enabled capability", async () => {
  const candidate = new SoftSwissCandidate();
  expect(candidate.capabilities).toEqual({ demo: false, real: false });
  expect(Object.isFrozen(candidate.capabilities)).toBe(true);
  await expect(candidate.getGames()).rejects.toMatchObject({ code: "UNAVAILABLE" });
  await expect(candidate.getGame("synthetic-game")).rejects.toMatchObject({ code: "UNAVAILABLE" });
  await expect(candidate.launchDemo({ title: "Synthetic", type: "test" })).rejects.toMatchObject({
    code: "UNAVAILABLE",
  });
  await expect(candidate.launchReal({ title: "Synthetic", type: "test" })).rejects.toMatchObject({
    code: "UNAVAILABLE",
  });
});
