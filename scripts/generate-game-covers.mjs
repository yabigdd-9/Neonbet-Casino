// Original local vector covers. No external artwork, fonts or image requests.
import { mkdirSync, writeFileSync } from "node:fs";

const gem =
  '<path d="m240 70 90 72-90 132-90-132Z" fill="url(#metal)"/><path d="m150 142 180 0M240 70l-30 72 30 132 30-132Z" fill="none" stroke="#fff" stroke-opacity=".65" stroke-width="3"/>';
const tower = (x, h) =>
  `<path d="M${x} 255V${h}h18v-18h18v18h18v-18h18v18h18v${255 - h}Z" fill="url(#metal)"/><path d="M${x + 35} 255v-55q10-20 20 0v55" fill="#101329"/>`;
const scenes = {
  gem: ["#30155b", "#b99bff", gem],
  space: [
    "#0c2155",
    "#7edcfc",
    '<circle cx="240" cy="161" r="76" fill="url(#metal)"/><ellipse cx="240" cy="170" rx="146" ry="31" transform="rotate(-26 240 170)" fill="none" stroke="#f9dca4" stroke-width="18"/><circle cx="362" cy="75" r="19" fill="#ffc2a3"/><path d="m100 94 52 4-29 9Z" fill="#a4ddff"/>',
  ],
  fruit: [
    "#401238",
    "#ff6c96",
    '<path d="M235 145q-5-65 53-87-14 56-53 87Zm0 0q-68-49-90-18" fill="none" stroke="#99dfa0" stroke-width="12"/><circle cx="188" cy="196" r="53" fill="url(#metal)"/><circle cx="288" cy="195" r="58" fill="url(#metal)"/><path d="M157 172q8-14 23-14m78 7q10-14 26-12" stroke="#fff" stroke-opacity=".65" stroke-width="9" stroke-linecap="round"/>',
  ],
  candy: [
    "#41144f",
    "#ff9fdd",
    '<path d="M244 183v112" stroke="#f9e5ff" stroke-width="14"/><circle cx="244" cy="150" r="81" fill="url(#metal)"/><path d="M244 150q-47-57-60-4t72 47q65-18 26-76" fill="none" stroke="#fff1fb" stroke-width="16" stroke-linecap="round"/><path d="m102 191 22 15 30-11 16 38-34 16-20 22-10-31-25-18Z" fill="#7ee6df"/>',
  ],
  ocean: [
    "#073846",
    "#67e5e5",
    '<path d="M0 244q60-35 120 0t120 0 120 0 120 0v116H0Z" fill="#237ea5" opacity=".6"/><path d="M151 231q0-124 89-140 89 16 89 140l-89 35Z" fill="url(#metal)"/><path d="m240 91 0 163m0-156-65 137m65-137 65 137" stroke="#fff" stroke-opacity=".5" stroke-width="4"/><circle cx="240" cy="230" r="32" fill="#fff5e3"/><circle cx="114" cy="117" r="12" fill="none" stroke="#8af5ec" stroke-width="3"/><circle cx="367" cy="182" r="18" fill="none" stroke="#8af5ec" stroke-width="3"/>',
  ],
  dragon: [
    "#481b24",
    "#ffb362",
    '<path d="m128 247 33-91 26 35 21-104 32 42 49-65-5 65 69 9-42 42 39 40-86 48-31-37-38 39Z" fill="url(#metal)"/><path d="m220 169 30-17-7 25Z" fill="#fff7ce"/><path d="m298 197 64 13-35 14 37 23-72-12Z" fill="#ff714b"/><path d="m184 224 37 18 20-27" fill="none" stroke="#401b35" stroke-width="8"/>',
  ],
  jungle: [
    "#103d30",
    "#c4d882",
    '<path d="M0 265Q62 58 151 68L86 269Zm480 0Q424 59 333 71l63 198Z" fill="#347753"/><path d="m167 113 20-48 43 39h24l44-39 17 48 14 67-25 72-64 34-65-34-26-72Z" fill="url(#metal)"/><path d="m170 142 46 18-8 13-43-9m145-22-46 18 8 13 43-9m-103 38 26 0 12 14-25 16-25-16Z" fill="#162a30"/><path d="m226 143-10-35m37 35 10-35" stroke="#162a30" stroke-width="13"/>',
  ],
  egypt: [
    "#3d2735",
    "#f5ce82",
    '<circle cx="240" cy="118" r="48" fill="#f9ce7a"/><path d="m240 116 132 157H108Z" fill="url(#metal)"/><path d="m240 116 32 157h100Z" fill="#a77c58"/><path d="M155 190h102m-129 33h136m-161 34h168" stroke="#4e4350" stroke-opacity=".4" stroke-width="3"/>',
  ],
  pirate: [
    "#152b43",
    "#e4bc80",
    '<path d="M113 212h254l-44 58H155Z" fill="url(#metal)"/><path d="M235 72v155m9-130 95 105h-95Zm-19 11-73 85h73Z" fill="#eee3c7" stroke="#d1ac71" stroke-width="4"/><path d="M241 63v-12h61l-14 16 14 15h-61Z" fill="#eb796d"/><path d="M0 288q60-30 120 0t120 0 120 0 120 0" fill="none" stroke="#81c6d2" stroke-width="7"/>',
  ],
  viking: [
    "#163340",
    "#a0d8e7",
    '<path d="M165 132q75-97 150 0v98l-75 49-75-49Z" fill="url(#metal)"/><path d="M161 159q-83-36-47-98 0 57 54 63m151 35q83-36 47-98 0 57-54 63" fill="#f7dfb4"/><path d="M240 91v142m-68-49h136" stroke="#24455d" stroke-width="16"/><path d="m189 210 31 12m71-12-31 12" stroke="#152738" stroke-width="8"/>',
  ],
  winter: [
    "#15384f",
    "#a3eaff",
    '<path d="m98 263 88-166 59 102 39-136 103 200Z" fill="url(#metal)"/><path d="m186 97-29 56 29-10 20 27 8-21Zm98-34-25 90 24-17 19 22 11-18Z" fill="#ecfaff"/><path d="M0 285q120-48 240 0t240 0v75H0Z" fill="#c3ecf2"/>',
  ],
  lantern: [
    "#44172c",
    "#ffb78d",
    '<path d="M0 60q240 61 480 0" fill="none" stroke="#d6a778" stroke-width="4"/><path d="M240 91v30m0 138v41" stroke="#ffdb9b" stroke-width="7"/><rect x="177" y="118" width="126" height="143" rx="47" fill="url(#metal)"/><path d="M208 119q-27 74 0 140m64-140q27 74 0 140m-95-82h126m-126 32h126" fill="none" stroke="#973f54" stroke-width="4"/><path d="M210 115h60m-60 149h60" stroke="#ffe1ab" stroke-width="10"/>',
  ],
  castle: [
    "#2f224b",
    "#c7b3fb",
    tower(104, 165) + tower(194, 112) + tower(285, 165) + '<path d="m191 111 48-58 48 58Z" fill="#f4d5a0"/>',
  ],
  forest: [
    "#123f35",
    "#a4e5af",
    '<path d="m147 74 65 119h-33l46 65H70l46-65H83Zm162-21 72 138h-35l45 67H229l44-67h-35Z" fill="url(#metal)"/><path d="M145 249v42m165-42v42" stroke="#d2b58a" stroke-width="16"/><circle cx="240" cy="146" r="5" fill="#ffdf90"/><circle cx="92" cy="100" r="4" fill="#ffdf90"/><circle cx="387" cy="206" r="5" fill="#ffdf90"/>',
  ],
  magic: [
    "#2e1853",
    "#d2a7ff",
    '<path d="m162 190 74-132 67 132Z" fill="url(#metal)"/><ellipse cx="234" cy="192" rx="113" ry="20" fill="#b39ae4"/><path d="m309 248 49-72" stroke="#ffe3a6" stroke-width="10" stroke-linecap="round"/><path d="m354 153 7 15 17 3-13 13 1 18-16-9-16 7 4-18-11-14 18-1Z" fill="#fff1bf"/><circle cx="198" cy="142" r="9" fill="#fff0c2"/>',
  ],
  racing: [
    "#302346",
    "#f0a7cf",
    '<path d="m85 218 36-52 62-8 34-44h75l47 52 33 14 23 43H85Z" fill="url(#metal)"/><path d="m215 127-24 30h105l-29-30Z" fill="#132e46"/><circle cx="153" cy="223" r="29" fill="#111c32" stroke="#b5d9e3" stroke-width="9"/><circle cx="325" cy="223" r="29" fill="#111c32" stroke="#b5d9e3" stroke-width="9"/><path d="M48 277h384m-356 13h57m51 0h57m51 0h57m51 0h57" stroke="#a1b1d2" stroke-width="4"/>',
  ],
  sports: [
    "#173c43",
    "#f5d38c",
    '<path d="M187 86h106v70q0 77-53 77t-53-77Zm0 20h-44q-4 79 55 74m95-74h44q4 79-55 74" fill="url(#metal)" stroke="#ffe8a9" stroke-width="6"/><path d="M240 232v39m-43 3h86" stroke="#f5ce83" stroke-width="14"/><path d="m240 111 8 17 19 2-14 14 3 20-16-10-17 10 4-20-14-14 19-2Z" fill="#8e6f62"/>',
  ],
  cards: [
    "#182e45",
    "#a8dbe7",
    '<g transform="rotate(-16 219 172)"><rect x="142" y="76" width="116" height="176" rx="13" fill="#c3c0ea"/><path d="m200 122 27 37-27 38-28-38Z" fill="#5b4a8a"/></g><g transform="rotate(12 277 180)"><rect x="221" y="92" width="116" height="176" rx="13" fill="#fff0d5"/><path d="M279 144c-41-34-62 26 0 63 62-37 41-97 0-63Z" fill="#e36585"/></g>',
  ],
  dice: [
    "#24324c",
    "#c1bcff",
    '<g transform="rotate(-17 212 178)"><rect x="135" y="105" width="139" height="139" rx="28" fill="url(#metal)"/><g fill="#33305b"><circle cx="169" cy="139" r="10"/><circle cx="239" cy="139" r="10"/><circle cx="204" cy="174" r="10"/><circle cx="169" cy="209" r="10"/><circle cx="239" cy="209" r="10"/></g></g><rect x="269" y="171" width="80" height="80" rx="17" fill="#f4d394"/><circle cx="290" cy="192" r="7" fill="#534367"/><circle cx="328" cy="231" r="7" fill="#534367"/>',
  ],
  wheel: [
    "#15383f",
    "#e0ce94",
    '<circle cx="240" cy="171" r="99" fill="#172c3f" stroke="url(#metal)" stroke-width="18"/><path d="m240 73 0 196m-98-98h196m-167-69 138 138m0-138L171 240" stroke="#85b9b6" stroke-width="5"/><circle cx="240" cy="171" r="29" fill="url(#metal)"/><path d="m223 47 17 33 17-33Z" fill="#fff1bd"/>',
  ],
  plinko: [
    "#2e2050",
    "#c3a9ff",
    Array.from({ length: 5 }, (_, row) =>
      Array.from(
        { length: row + 2 },
        (_, col) =>
          `<circle cx="${240 - (row + 1) * 23 + col * 46}" cy="${96 + row * 34}" r="6" fill="#a5a0e8"/>`,
      ).join(""),
    ).join("") +
      '<circle cx="240" cy="69" r="18" fill="#f9d997"/><path d="M122 276h236" stroke="url(#metal)" stroke-width="24" stroke-linecap="round"/>',
  ],
  treasure: [
    "#382b35",
    "#f5d08b",
    '<path d="M133 172q0-77 107-77t107 77v88H133Z" fill="url(#metal)"/><path d="M133 175h214m-172-56v140m130-140v140" stroke="#695264" stroke-width="13"/><rect x="221" y="165" width="38" height="47" rx="5" fill="#fff0ba"/><circle cx="240" cy="184" r="6" fill="#6b5267"/><circle cx="113" cy="266" r="26" fill="#d9a66e"/><circle cx="360" cy="255" r="21" fill="#f2d28d"/>',
  ],
  neon: [
    "#122940",
    "#78e0df",
    '<path d="M96 252V139h58v113m15 0V88h65v164m19 0V122h57v130m16 0V69h59v183" fill="#254659" stroke="#64bcc9" stroke-width="3"/><path d="m252 76-42 75h41l-25 70 74-96h-49l31-49Z" fill="url(#metal)"/><path d="M52 282h376" stroke="#dc8ec6" stroke-width="5"/>',
  ],
};

mkdirSync("public/game-covers", { recursive: true });
for (const [theme, [background, accent, scene]] of Object.entries(scenes)) {
  const stars = Array.from(
    { length: 18 },
    (_, i) =>
      `<circle cx="${22 + ((i * 97) % 440)}" cy="${24 + ((i * 53) % 300)}" r="${i % 3 === 0 ? 2 : 1}" fill="#fff" opacity=".35"/>`,
  ).join("");
  writeFileSync(
    `public/game-covers/${theme}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360"><defs><radialGradient id="bg"><stop stop-color="${accent}" stop-opacity=".3"/><stop offset="1" stop-color="${background}"/></radialGradient><linearGradient id="metal" x2=".7" y2="1"><stop stop-color="#fff0ce"/><stop offset=".4" stop-color="${accent}"/><stop offset="1" stop-color="${accent}" stop-opacity=".5"/></linearGradient></defs><path fill="${background}" d="M0 0h480v360H0Z"/><path fill="url(#bg)" d="M0 0h480v360H0Z"/>${stars}<circle cx="240" cy="171" r="132" fill="none" stroke="${accent}" stroke-opacity=".15"/><ellipse cx="240" cy="284" rx="139" ry="19" fill="#030915" opacity=".35"/>${scene}<path d="M0 318h480v42H0Z" fill="#060f20" opacity=".2"/></svg>\n`,
  );
}
console.log(`Generated ${Object.keys(scenes).length} original game covers.`);
