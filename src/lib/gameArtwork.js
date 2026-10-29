const themes = [
  ["fruit", /fruit|cherry|lemon|orchard/],
  ["candy", /candy|sweet|sugar|donut|honey|chocolate/],
  ["ocean", /ocean|sea|coral|fish|bass|shark|pearl|mermaid|lagoon/],
  ["dragon", /dragon|phoenix|fire|volcano/],
  ["jungle", /jungle|tiger|panda|safari|lion|wolf|bamboo/],
  ["egypt", /egypt|pharaoh|anubis|horus|cleopatra|pyramid/],
  ["pirate", /pirate|corsair|cove/],
  ["viking", /viking|saga|asgard/],
  ["winter", /winter|snow|frost|arctic|polar|penguin|ice/],
  ["lantern", /lantern|koi|sakura|samurai|silk/],
  ["castle", /castle|royal|palace|crown|king|queen/],
  ["forest", /forest|grove|clover|garden|meadow|mushroom|firefly/],
  ["magic", /magic|wizard|library|enchanted|witch|unicorn/],
  ["racing", /racing|race|speedway|circuit/],
  ["sports", /football|basketball|sport|arena/],
  ["cards", /card|blackjack|baccarat|draw|masquerade/],
  ["dice", /dice|seven|odd/],
  ["wheel", /wheel|roulette|carousel/],
  ["plinko", /plinko|drop|color|keno/],
  ["treasure", /gold|treasure|coin|vault|mine|western|chest/],
  ["gem", /gem|ruby|diamond|crystal|prism|sapphire/],
  ["space", /space|orbit|cosmic|astral|galactic|rocket|meteor|moon|star/],
  ["neon", /neon|cyber|disco|retro|electric|arcade/],
];
// Rows follow the original generated atlas; no official provider art is used.
const atlasThemes = [
  "fruit",
  "space",
  "cards",
  "wheel",
  "dragon",
  "treasure",
  "ocean",
  "crystal",
  "jungle",
  "candy",
  "winter",
  "pirate",
  "egypt",
  "viking",
  "lantern",
  "magic",
  "forest",
  "castle",
  "racing",
  "sports",
  "dice",
  "plinko",
  "neon",
  "gem",
];

export function gameArtwork(game) {
  const hash = [...game.title].reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 0);
  const theme =
    game.artwork ||
    themes.find(([, pattern]) => pattern.test(game.title.toLowerCase()))?.[0] ||
    themes[hash % themes.length][0];
  const tile = atlasThemes.indexOf(
    theme === "gem" && /cosmic|crystal|amethyst/i.test(game.title) ? "crystal" : theme,
  );
  return {
    src: `${import.meta.env.BASE_URL}game-covers/casino-atlas.png`,
    fallback: `${import.meta.env.BASE_URL}game-covers/${theme}.svg`,
    column: tile % 6,
    row: Math.floor(tile / 6),
  };
}
