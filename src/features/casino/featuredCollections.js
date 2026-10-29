import { getGameId } from "../../lib/gameEngine";

export function buildFeaturedCollections(games) {
  const worlds = new Map();
  for (const game of games) {
    if (!game.collection) continue;
    if (!worlds.has(game.collection)) worlds.set(game.collection, []);
    worlds.get(game.collection).push(game);
  }
  // Deal one chapter from every world before returning to a second chapter.
  const newWorlds = [];
  const groups = [...worlds.values()];
  for (let chapter = 0; groups.some((group) => chapter < group.length); chapter++) {
    for (const group of groups) if (group[chapter]) newWorlds.push(group[chapter]);
  }
  const covers = new Set();
  const varied = newWorlds.filter((game) => {
    const cover = game.artwork || game.collection;
    if (covers.has(cover)) return false;
    covers.add(cover);
    return true;
  });
  const familiar = games.filter((game) => !game.collection).slice(0, 12);
  const lead = [...familiar, ...varied.slice(0, 12)];
  const selected = new Set(lead.map(getGameId));
  return {
    featuredPicks: [...lead, ...games.filter((game) => !selected.has(getGameId(game)))],
    newWorlds,
    worldCount: worlds.size,
  };
}
