import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Menu,
  X,
  Search,
  Wallet,
  Trophy,
  Gift,
  Flame,
  Dice5,
  CircleDollarSign,
  ShieldCheck,
  Star,
  Gamepad2,
  Sparkles,
  Bell,
  Play,
  Bitcoin,
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  MessageCircle,
  Send,
} from "lucide-react";
import "./styles.css";

const games = [
  { title: "Neon Fruits", type: "Slots", tag: "Hot", emoji: "🍒", gradient: "from-pink-500 to-orange-400", symbols: ["🍒", "🍋", "🍇", "🍉", "⭐", "💎", "7"] },
  { title: "Crypto Mines", type: "Instant", tag: "New", emoji: "💣", gradient: "from-cyan-400 to-blue-600", symbols: ["💣", "💎", "₿", "⚡", "🪙", "⭐", "7"] },
  { title: "Royal Blackjack", type: "Cards", tag: "Live", emoji: "🃏", gradient: "from-emerald-400 to-green-700", symbols: ["A", "K", "Q", "J", "♠️", "♥️", "7"] },
  { title: "Lightning Roulette", type: "Table", tag: "Top", emoji: "🎡", gradient: "from-purple-500 to-indigo-700", symbols: ["🎡", "⚡", "🔴", "⚫", "💎", "⭐", "7"] },
  { title: "Dragon Jackpot", type: "Slots", tag: "Mega", emoji: "🐉", gradient: "from-yellow-400 to-red-500", symbols: ["🐉", "🔥", "💰", "🏮", "⭐", "💎", "7"] },
  { title: "Crash Rocket", type: "Instant", tag: "Fast", emoji: "🚀", gradient: "from-sky-400 to-violet-600", symbols: ["🚀", "🌕", "⚡", "💎", "🔥", "⭐", "7"] },
  { title: "Baccarat Club", type: "Cards", tag: "VIP", emoji: "♣️", gradient: "from-neutral-300 to-neutral-700", symbols: ["♣️", "♦️", "♥️", "♠️", "A", "⭐", "7"] },
  { title: "Gold Rush", type: "Slots", tag: "Gold", emoji: "💰", gradient: "from-amber-300 to-yellow-700", symbols: ["💰", "⛏️", "🏆", "🪙", "⭐", "💎", "7"] },
];

const payoutRows = [
  ["Five 7s", "50x"],
  ["Five matching", "20x"],
  ["Four matching", "8x"],
  ["Three matching", "3x"],
  ["Two matching", "1.5x"],
  ["Bonus mix", "2x"],
];

const betOptions = [0.25, 0.4, 0.5, 0.75, 0.8, 1.2];

function formatMoney(amount) {
  return `$${amount.toFixed(2)}`;
}

function pickWeightedOutcome() {
  const roll = Math.random();

  if (roll < 0.12) return "five";
  if (roll < 0.28) return "four";
  if (roll < 0.55) return "three";
  if (roll < 0.8) return "two";
  if (roll < 0.9) return "bonus";
  return "miss";
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function buildSpin(game) {
  const symbols = game.symbols || ["🍒", "🍋", "💎", "⭐", "7"];
  const seven = symbols.includes("7") ? "7" : symbols[0];
  const premium = symbols.includes("💎") ? "💎" : symbols[1] || symbols[0];
  const star = symbols.includes("⭐") ? "⭐" : symbols[2] || symbols[0];
  const matchSymbol = symbols[Math.floor(Math.random() * symbols.length)];
  const filler = () => symbols[Math.floor(Math.random() * symbols.length)];
  const outcome = pickWeightedOutcome();

  if (outcome === "five") return { reels: Array(5).fill(seven), multiplier: 50, label: "Jackpot hit" };
  if (outcome === "four") return { reels: shuffle([matchSymbol, matchSymbol, matchSymbol, matchSymbol, filler()]), multiplier: 8, label: "Four of a kind" };
  if (outcome === "three") return { reels: shuffle([matchSymbol, matchSymbol, matchSymbol, filler(), filler()]), multiplier: 3, label: "Three match" };
  if (outcome === "two") return { reels: shuffle([matchSymbol, matchSymbol, filler(), filler(), filler()]), multiplier: 1.5, label: "Small win" };
  if (outcome === "bonus") return { reels: shuffle([premium, star, seven, filler(), filler()]), multiplier: 2, label: "Bonus mix" };

  return { reels: shuffle([filler(), filler(), filler(), filler(), filler()]), multiplier: 0, label: "Try again" };
}

const promos = [
  { title: "Free $100 Sign-Up Bonus", detail: "New accounts can claim $100 plus a 300% welcome match after verification. Bonus funds require 10x rollover.", icon: Gift },
  { title: "Daily Rewards", detail: "Fresh drops, missions and member rewards every day", icon: Flame },
  { title: "VIP Club", detail: "Level up with missions, rewards and exclusive account perks", icon: Trophy },
];

const slotProviders = [
  {
    name: "Pragmatic Play",
    highlight: "Live-style hits and high-volatility slots",
    games: ["Gates of Olympus", "Sweet Bonanza", "The Dog House", "Big Bass Bonanza", "Starlight Princess", "Sugar Rush", "Wolf Gold", "Madame Destiny Megaways"],
  },
  {
    name: "NetEnt",
    highlight: "Classic premium slot catalogue",
    games: ["Starburst", "Gonzo's Quest", "Dead or Alive 2", "Twin Spin", "Jack and the Beanstalk", "Divine Fortune", "Finn and the Swirly Spin", "Blood Suckers"],
  },
  {
    name: "Play'n GO",
    highlight: "Mobile-first adventure slots",
    games: ["Book of Dead", "Reactoonz", "Legacy of Dead", "Rise of Olympus", "Moon Princess", "Rich Wilde and the Tome of Madness", "Fire Joker", "Honey Rush"],
  },
  {
    name: "Hacksaw Gaming",
    highlight: "Modern crashy volatility and clean visuals",
    games: ["Wanted Dead or a Wild", "Chaos Crew", "RIP City", "Hand of Anubis", "Stack'em", "Dork Unit", "Le Bandit", "Itero"],
  },
  {
    name: "Nolimit City",
    highlight: "Extreme-volatility feature slots",
    games: ["Mental", "Tombstone RIP", "San Quentin", "Deadwood", "Fire in the Hole xBomb", "Punk Rocker", "The Rave", "Bonus Bunnies"],
  },
  {
    name: "Red Tiger",
    highlight: "Daily jackpot style and crisp math models",
    games: ["Dynamite Riches", "Gonzo's Quest Megaways", "Pirates' Plenty", "Dragon's Fire", "Mystery Reels", "Piggy Riches Megaways", "Jingle Bells", "Well of Wishes"],
  },
  {
    name: "Big Time Gaming",
    highlight: "Megaways slot mechanics",
    games: ["Bonanza Megaways", "Extra Chilli", "White Rabbit", "Danger High Voltage", "Who Wants To Be A Millionaire", "Dragon Born", "Wild Flower", "Millionaire Rush"],
  },
  {
    name: "Relax Gaming",
    highlight: "Feature-rich originals and aggregation",
    games: ["Money Train 2", "Money Train 3", "Temple Tumble", "Snake Arena", "Iron Bank", "Book of 99", "Wild Chapo 2", "Dead Man's Trail"],
  },
  {
    name: "Push Gaming",
    highlight: "Cinematic bonus mechanics",
    games: ["Jammin' Jars", "Razor Shark", "Fat Rabbit", "Wild Swarm", "Retro Tapes", "Big Bamboo", "Bison Battle", "Mount Magmas"],
  },
  {
    name: "Yggdrasil",
    highlight: "Fantasy themes and network mechanics",
    games: ["Valley of the Gods", "Vikings Go Berzerk", "Holmes and the Stolen Stones", "Golden Fish Tank", "Cazino Zeppelin", "Aldo's Journey", "Baron Samedi", "Raptor DoubleMax"],
  },
  {
    name: "ELK Studios",
    highlight: "Polished arcade-style slot sessions",
    games: ["Pirots", "Nitropolis", "Cygnus", "Wild Toro", "Katmandu", "Taco Brothers", "Gold", "Ecuador Gold"],
  },
  {
    name: "Quickspin",
    highlight: "Colorful mobile slot catalogue",
    games: ["Sakura Fortune", "Big Bad Wolf", "Sticky Bandits", "Eastern Emeralds", "Second Strike", "Golden Glyph", "Wild Cauldron", "Ticket to the Stars"],
  },
  {
    name: "Thunderkick",
    highlight: "Distinctive art-led slot releases",
    games: ["Esqueleto Mariachi", "Pink Elephants", "Midas Golden Touch", "Raven's Eye", "Beat the Beast", "Carnival Queen", "Jin Chan's Pond of Riches", "The Wildos"],
  },
  {
    name: "Blueprint Gaming",
    highlight: "UK-style features and branded slots",
    games: ["Fishin' Frenzy", "King Kong Cash", "Eye of Horus", "Ted", "The Goonies", "Genie Jackpots", "Worms Reloaded", "Buffalo Rising"],
  },
  {
    name: "Wazdan",
    highlight: "Fast mobile slots and adjustable features",
    games: ["9 Burning Dragons", "Magic Spins", "Sizzling 777 Deluxe", "Power of Gods", "Larry the Leprechaun", "Black Horse Deluxe", "Hot Slot", "Coins"],
  },
  {
    name: "BGaming",
    highlight: "Crypto-casino friendly slot catalogue",
    games: ["Elvis Frog in Vegas", "Aztec Magic", "Bonanza Billion", "Wild Cash", "Fruit Million", "Aloha King Elvis", "Lucky Lady Moon", "Gemza"],
  },
  {
    name: "Playson",
    highlight: "Simple, fast-loading slots",
    games: ["Solar Queen", "Book of Gold", "Buffalo Power", "Wolf Power", "Legend of Cleopatra", "Royal Coins", "Sunny Fruits", "Pearl Beauty"],
  },
  {
    name: "Evoplay",
    highlight: "Instant games and lightweight slots",
    games: ["Temple of Thunder", "Fruit Super Nova", "Elven Princesses", "Hot Triple Sevens", "Penalty Shoot-out", "Dungeon", "Mystery Planet", "Candy Dreams"],
  },
  {
    name: "Endorphina",
    highlight: "Classic reels and casino lobby staples",
    games: ["2022 Hit Slot", "Chance Machine 100", "Book of Santa", "Asgardians", "Minotaurus", "Satoshi's Secret", "Twerk", "The Emirate"],
  },
  {
    name: "4ThePlayer",
    highlight: "Bonus-buy style modern slots",
    games: ["9k Yeti", "4 Fantastic Fish", "6 Wild Sharks", "3 Secret Cities", "5 Lions Megaways", "10x Rewind", "90k Yeti Gigablox", "7 Gold Gigablox"],
  },
  {
    name: "NoLimit City Partners",
    highlight: "Bonus-hunt style lobby entries",
    games: ["Road Rage", "Bushido Ways", "True Grit Redemption", "East Coast vs West Coast", "Tomb of Akhenaten", "Poison Eve", "Serial", "Kenneth Must Die"],
  },
  {
    name: "iSoftBet",
    highlight: "Aggregator-friendly classic slots",
    games: ["Gold Digger", "Moriarty Megaways", "Aztec Gold Extra Gold", "Hot Spin", "Vegas High Roller", "Lucky Stripes", "Western Gold", "Merlin's Gold"],
  },
  {
    name: "Spinomenal",
    highlight: "Large themed catalogue for lobby depth",
    games: ["Book of Demi Gods", "Majestic King", "Queen of Ice", "Story of Vikings", "Egyptian Rebirth", "Fairytale Beauties", "Wolf Fang", "Times of Egypt"],
  },
  {
    name: "Mascot Gaming",
    highlight: "Bonus tools and colorful arcade slots",
    games: ["Bastet and Cats", "The Myth", "Fruit Vegas", "Riesterer", "May the Luck Be With You", "Merlin's Tower", "Across the Universe", "Candy Splash"],
  },
];

const verificationConfig = {
  feeUsd: 75,
  referenceFormat: "@TelegramOrWhatsAppUsername + transaction hash",
  contactMethods: ["Telegram", "WhatsApp"],
  contactLinks: {
    telegram: "https://t.me/yabigdd",
    whatsapp: "https://wa.me/642904556680?text=Hi%20NeonBet%2C%20I%20want%20to%20verify%20my%20account.",
  },
  acceptedCrypto: [
    {
      name: "USDT",
      network: "BSC",
      label: "USDT BSC wallet",
      address: "0x3f8bf0bd8516773cc12cf462622fa601cf8a7d29",
      qrCodeSrc: "./verification-usdt-bsc.svg",
      notice: "Send USDT on BSC / BEP20 only",
      note: "Use the BSC / BEP20 network only",
    },
    {
      name: "BTC",
      network: "BTC",
      label: "BTC wallet",
      address: "1PjtLkUfRnuLEG6qiSz6KUdM77bz1AU3Sx",
      qrCodeSrc: "./verification-btc.svg",
      notice: "Send BTC on the Bitcoin network only",
      note: "Do not send tokens or smart-contract deposits",
    },
    {
      name: "ETH",
      network: "ETH",
      label: "ETH wallet",
      address: "0x3f8bf0bd8516773cc12cf462622fa601cf8a7d29",
      qrCodeSrc: "./verification-eth.svg",
      notice: "Send ETH on the Ethereum network only",
      note: "Do not send NFTs to this address",
    },
    {
      name: "BNB",
      network: "BSC",
      label: "BNB BSC wallet",
      address: "0x3f8bf0bd8516773cc12cf462622fa601cf8a7d29",
      qrCodeSrc: "./verification-bnb-bsc.svg",
      notice: "Send BNB on BSC / BEP20 only",
      note: "Use the BSC / BEP20 network only",
    },
  ],
};

const lobbyStats = [
  ["$100", "Sign-up bonus"],
  ["10x", "Bonus rollover"],
  ["24+", "Slot providers"],
  ["$75", "Verification"],
];

function scrollToSection(sectionId) {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Sidebar({ open, setOpen }) {
  const links = [
    ["Lobby", Gamepad2, "lobby"],
    ["Slots", Dice5, "featured-games"],
    ["Live Tables", CircleDollarSign, "featured-games"],
    ["Promotions", Gift, "promotions"],
    ["Verification", ShieldCheck, "verification"],
    ["VIP Club", Trophy, "vip"],
    ["Responsible Play", ShieldCheck, "footer"],
  ];

  return (
    <>
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-950/95 border-r border-white/10 backdrop-blur-xl p-5 transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-cyan-400 text-slate-950 grid place-items-center font-black shadow-neon">NB</div>
            <div>
              <div className="font-black text-xl tracking-tight">NeonBet</div>
              <div className="text-xs text-cyan-300">casino lobby</div>
            </div>
          </div>
          <button className="lg:hidden" onClick={() => setOpen(false)}><X /></button>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-cyan-500/15 to-purple-500/15 border border-cyan-300/20 p-4 mb-5">
          <p className="text-sm text-slate-300">Sign-Up Bonus</p>
          <p className="text-3xl font-black text-white mt-1">$100</p>
          <p className="text-xs text-slate-400 mt-1">Plus 300% match, 10x rollover</p>
        </div>

        <nav className="space-y-2">
          {links.map(([label, Icon, sectionId]) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                scrollToSection(sectionId);
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-2xl text-left text-slate-300 hover:bg-white/10 hover:text-white transition"
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-5 left-5 right-5 rounded-3xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center gap-2 text-amber-300 font-bold"><ShieldCheck size={18}/> Account Notice</div>
          <p className="text-xs text-slate-400 mt-2">Bonuses and verification are subject to approval, local rules, and account terms.</p>
        </div>
      </aside>
      {open && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setOpen(false)} />}
    </>
  );
}

function Header({ setOpen, balance }) {
  return (
    <header className="sticky top-0 z-20 bg-slate-950/70 backdrop-blur-xl border-b border-white/10">
      <div className="lg:ml-72 px-4 md:px-8 py-4 flex items-center gap-4">
        <button onClick={() => setOpen(true)} className="lg:hidden p-2 rounded-xl bg-white/10"><Menu /></button>

        <div className="hidden md:flex items-center gap-2 flex-1 max-w-xl rounded-2xl bg-white/10 border border-white/10 px-4 py-3">
          <Search size={18} className="text-slate-400" />
          <input className="bg-transparent outline-none w-full text-sm" placeholder="Search games, providers, jackpots..." />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollToSection("featured-games")}
            className="hidden sm:flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15"
          >
            <Wallet size={18} /> ${balance.toFixed(2)}
          </button>
          <button className="p-3 rounded-2xl bg-white/10 hover:bg-white/15"><Bell size={18} /></button>
          <button
            type="button"
            onClick={() => scrollToSection("verification")}
            className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15"
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("verification")}
            className="px-4 py-3 rounded-2xl bg-cyan-400 text-slate-950 font-black shadow-neon hover:scale-[1.02] transition"
          >
            Register
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero({ onClaim }) {
  return (
    <section id="lobby" className="relative scroll-mt-24 overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 p-6 md:p-10 shadow-neon">
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute right-24 bottom-0 h-52 w-52 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />

      <div className="relative grid lg:grid-cols-2 gap-8 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-400/10 border border-cyan-300/30 px-4 py-2 text-cyan-200 text-sm mb-5">
            <Sparkles size={16} /> Premium crypto casino style
          </div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight">
            Play the <span className="text-cyan-300">neon lobby</span>.
          </h1>
          <p className="text-slate-300 mt-5 max-w-xl">
            Claim a free $100 sign-up bonus, unlock a 300% welcome match and clear a 10x rollover requirement.
          </p>
          <div className="flex flex-wrap gap-3 mt-7">
            <button
              type="button"
              onClick={onClaim}
              className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-cyan-400 text-slate-950 font-black shadow-neon"
            >
              <Play size={18}/> Claim $100
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("promotions")}
              className="px-6 py-4 rounded-2xl bg-white/10 border border-white/10 font-bold"
            >
              View Promotions
            </button>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {lobbyStats.map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <div className="text-xl font-black text-white">{value}</div>
                <div className="text-xs text-slate-400">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="rounded-[2rem] bg-black/30 border border-white/10 p-5">
            <div className="grid grid-cols-3 gap-3 text-center">
              {["7", "🍒", "💎", "BAR", "⭐", "777", "🍋", "🔥", "X"].map((item) => (
                <div key={item} className="aspect-square rounded-3xl bg-white/10 border border-white/10 grid place-items-center text-3xl font-black">
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-5 h-3 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-3/4 bg-cyan-400" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactButtons({ compact = false }) {
  const baseClass = compact
    ? "inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition hover:scale-[1.02]"
    : "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-4 font-black transition hover:scale-[1.02]";

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <a
        href={verificationConfig.contactLinks.telegram}
        target="_blank"
        rel="noreferrer"
        className={`${baseClass} bg-cyan-400 text-slate-950 shadow-neon`}
      >
        <Send size={18} />
        Telegram
      </a>
      <a
        href={verificationConfig.contactLinks.whatsapp}
        target="_blank"
        rel="noreferrer"
        className={`${baseClass} border border-emerald-300/30 bg-emerald-400/15 text-emerald-100`}
      >
        <MessageCircle size={18} />
        WhatsApp
      </a>
    </div>
  );
}

function GameCard({ game, onPlay }) {
  return (
    <div className="group rounded-3xl bg-white/[0.06] border border-white/10 overflow-hidden hover:-translate-y-1 hover:shadow-neon transition">
      <div className={`h-36 bg-gradient-to-br ${game.gradient} grid place-items-center relative`}>
        <div className="absolute top-3 right-3 text-xs font-black rounded-full bg-black/35 px-3 py-1">{game.tag}</div>
        <div className="text-6xl group-hover:scale-110 transition">{game.emoji}</div>
      </div>
      <div className="p-4">
        <div className="text-xs text-cyan-300">{game.type}</div>
        <div className="font-black text-lg">{game.title}</div>
        <button
          type="button"
          onClick={() => onPlay(game)}
          className="mt-4 w-full rounded-2xl bg-white/10 hover:bg-cyan-400 hover:text-slate-950 py-3 font-black transition"
        >
          Play
        </button>
      </div>
    </div>
  );
}

function SlotGameModal({ game, balance, setBalance, onClose }) {
  const [bet, setBet] = useState(0.5);
  const [reels, setReels] = useState(game?.symbols?.slice(0, 5) || ["🍒", "⭐", "💎", "7", "🍋"]);
  const [result, setResult] = useState({ label: "Ready", win: 0, multiplier: 0 });
  const [spinning, setSpinning] = useState(false);

  if (!game) return null;

  function spin() {
    if (spinning || balance < bet) return;

    setSpinning(true);
    setBalance((current) => Number((current - bet).toFixed(2)));

    window.setTimeout(() => {
      const spinResult = buildSpin(game);
      const win = Number((bet * spinResult.multiplier).toFixed(2));

      setReels(spinResult.reels);
      setResult({ label: spinResult.label, win, multiplier: spinResult.multiplier });
      setBalance((current) => Number((current + win).toFixed(2)));
      setSpinning(false);
    }, 650);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-slate-950 shadow-neon">
        <div className={`h-2 bg-gradient-to-r ${game.gradient}`} />
        <div className="grid gap-6 p-5 md:grid-cols-[1.2fr_0.8fr] md:p-7">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{game.type}</div>
                <h2 className="mt-2 text-3xl font-black">{game.title}</h2>
                <p className="mt-2 text-sm text-slate-400">High-frequency local slot session. Balance is simulated in this browser.</p>
              </div>
              <button type="button" onClick={onClose} className="rounded-2xl bg-white/10 p-3 hover:bg-white/15">
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 rounded-[2rem] border border-white/10 bg-black/30 p-4">
              <div className="grid grid-cols-5 gap-2">
                {reels.map((symbol, index) => (
                  <div
                    key={`${symbol}-${index}`}
                    className={`grid aspect-square place-items-center rounded-3xl border border-white/10 bg-white/10 text-4xl font-black transition ${
                      spinning ? "scale-95 animate-pulse text-cyan-200" : "text-white"
                    }`}
                  >
                    {spinning ? game.symbols[(index + Math.floor(Math.random() * game.symbols.length)) % game.symbols.length] : symbol}
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-center">
                <div className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">{result.label}</div>
                <div className={result.win > 0 ? "mt-1 text-3xl font-black text-cyan-300" : "mt-1 text-3xl font-black text-slate-300"}>
                  {result.win > 0 ? `+$${result.win.toFixed(2)}` : "$0.00"}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Balance</div>
              <div className="mt-1 text-4xl font-black text-white">${balance.toFixed(2)}</div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {betOptions.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setBet(amount)}
                    className={`rounded-2xl border px-3 py-3 text-sm font-black transition ${
                      bet === amount ? "border-cyan-300/40 bg-cyan-400 text-slate-950" : "border-white/10 bg-black/20 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {formatMoney(amount)}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={spin}
                disabled={spinning || balance < bet}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-4 font-black text-slate-950 shadow-neon transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Play size={18} />
                {spinning ? "Spinning..." : `Spin ${formatMoney(bet)}`}
              </button>
              {balance < bet && <p className="mt-3 text-sm text-amber-200">Balance is too low for this bet.</p>}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
              <h3 className="font-black">Payout Table</h3>
              <div className="mt-3 space-y-2">
                {payoutRows.map(([label, payout]) => (
                  <div key={label} className="flex items-center justify-between rounded-2xl bg-black/20 px-3 py-2 text-sm">
                    <span className="text-slate-300">{label}</span>
                    <span className="font-black text-cyan-300">{payout}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-500">
                This is a simulated browser game with tuned frequent wins. It is not connected to deposits, withdrawals, or provider game servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CopyButton({ value, label, copiedKey, setCopiedKey, id }) {
  const copied = copiedKey === id;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(id);
      window.setTimeout(() => setCopiedKey(""), 1800);
    } catch {
      setCopiedKey("");
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-black text-slate-950 shadow-neon transition hover:scale-[1.02]"
    >
      {copied ? <CheckCircle2 size={17} /> : <Copy size={17} />}
      {copied ? "Copied" : label}
    </button>
  );
}

function PaymentMethods() {
  return (
    <section id="payment-methods" className="scroll-mt-24">
      <div className="mb-5">
        <h2 className="text-2xl md:text-3xl font-black">Crypto Payment Methods</h2>
        <p className="text-slate-400">
          Crypto is accepted for manual account verification only, not deposits or wagering.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {verificationConfig.acceptedCrypto.map((method) => (
          <div key={`${method.name}-${method.network}`} className="rounded-3xl bg-white/[0.06] border border-white/10 p-6">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950 shadow-neon">
              <Bitcoin />
            </div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{method.network}</div>
            <h3 className="mt-2 text-2xl font-black">{method.name}</h3>
            <p className="mt-3 text-sm text-slate-400">{method.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SlotProviderLibrary() {
  const totalGames = slotProviders.reduce((sum, provider) => sum + provider.games.length, 0);

  return (
    <section id="providers" className="scroll-mt-24">
      <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-black">Slot Providers & Games</h2>
          <p className="text-slate-400">
            {slotProviders.length} providers and {totalGames}+ slot titles listed for a deep lobby preview.
          </p>
        </div>
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-sm font-bold text-cyan-200">
          Provider availability depends on region, licensing and account status.
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {slotProviders.map((provider) => (
          <article key={provider.name} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-black">{provider.name}</h3>
                <p className="mt-1 text-sm text-slate-400">{provider.highlight}</p>
              </div>
              <div className="rounded-2xl bg-black/25 px-3 py-2 text-sm font-black text-cyan-300">
                {provider.games.length}
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {provider.games.map((game) => (
                <span key={game} className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs font-bold text-slate-200">
                  {game}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function VerificationPanel() {
  const [copiedKey, setCopiedKey] = useState("");
  const [selectedMethodIndex, setSelectedMethodIndex] = useState(0);
  const selectedMethod = verificationConfig.acceptedCrypto[selectedMethodIndex];
  const referenceExample = "@yourname + 0x/txid...";

  return (
    <section className="grid scroll-mt-24 xl:grid-cols-[1.2fr_0.8fr] gap-5" id="verification">
      <div className="relative overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/70 p-6 md:p-8">
        <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-3 text-cyan-200">
            <ShieldCheck />
            <span className="text-sm font-black uppercase tracking-[0.2em]">Manual account verification</span>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h2 className="text-3xl md:text-5xl font-black leading-tight">
                Verify your account for <span className="text-cyan-300">${verificationConfig.feeUsd} USD</span>.
              </h2>
              <p className="mt-4 max-w-2xl text-slate-300">
                Send crypto to the listed wallet, then message your Telegram or WhatsApp username with the transaction hash. A team member confirms the payment manually before marking the account verified.
              </p>
            </div>
            <div className="rounded-3xl bg-black/25 border border-white/10 p-5 text-center">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Verification fee</div>
              <div className="mt-1 text-5xl font-black text-white">${verificationConfig.feeUsd}</div>
              <div className="text-sm text-slate-400">USD equivalent</div>
            </div>
          </div>

          <div className="mt-7 grid gap-4 lg:grid-cols-3">
            <div className="rounded-3xl bg-white/[0.06] border border-white/10 p-5">
              <div className="flex items-center gap-2 font-black text-amber-200">
                <Clock3 size={18} /> Manual review
              </div>
              <p className="mt-3 text-sm text-slate-400">
                Verification is not instant. Confirmation depends on network settlement and manual admin review.
              </p>
            </div>
            <div className="rounded-3xl bg-white/[0.06] border border-white/10 p-5">
              <div className="flex items-center gap-2 font-black text-cyan-200">
                <MessageCircle size={18} /> Send proof
              </div>
              <p className="mt-3 text-sm text-slate-400">
                Contact via {verificationConfig.contactMethods.join(" or ")} with your username and transaction hash.
              </p>
            </div>
            <div className="rounded-3xl bg-white/[0.06] border border-white/10 p-5">
              <div className="flex items-center gap-2 font-black text-emerald-200">
                <CheckCircle2 size={18} /> Account badge
              </div>
              <p className="mt-3 text-sm text-slate-400">
                The fee unlocks account verification only. Bonus eligibility is reviewed separately under account terms.
              </p>
            </div>
          </div>
          <div className="mt-7 rounded-3xl border border-white/10 bg-white/[0.06] p-5">
            <div className="mb-4 flex items-center gap-2 font-black text-white">
              <ExternalLink size={18} /> Send verification proof
            </div>
            <ContactButtons compact />
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Replace the Telegram username and WhatsApp number in the contact config before publishing.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] bg-white/[0.06] border border-white/10 p-6 md:p-8">
        <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {verificationConfig.acceptedCrypto.map((method, index) => {
            const selected = selectedMethodIndex === index;

            return (
              <button
                key={`${method.name}-${method.network}`}
                type="button"
                onClick={() => {
                  setSelectedMethodIndex(index);
                  setCopiedKey("");
                }}
                className={`rounded-2xl border px-3 py-3 text-sm font-black transition ${
                  selected
                    ? "border-cyan-300/40 bg-cyan-400 text-slate-950 shadow-neon"
                    : "border-white/10 bg-black/20 text-slate-300 hover:bg-white/10"
                }`}
              >
                {method.name}
                <span className="block text-[11px] font-bold opacity-75">{method.network}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{selectedMethod.label}</div>
            <h3 className="mt-2 text-2xl font-black">Payment details</h3>
          </div>
          <img
            src={selectedMethod.qrCodeSrc}
            alt={`${selectedMethod.name} ${selectedMethod.network} verification QR code`}
            className="h-20 w-20 rounded-2xl border border-white/10 bg-white p-1"
          />
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-3xl bg-black/25 border border-white/10 p-4">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Wallet address</div>
            <div className="mt-2 break-all font-mono text-sm text-slate-100">{selectedMethod.address}</div>
            <div className="mt-3 inline-flex rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs font-black text-amber-200">
              {selectedMethod.notice}
            </div>
            <div className="mt-4">
              <CopyButton
                value={selectedMethod.address}
                label="Copy wallet"
                copiedKey={copiedKey}
                setCopiedKey={setCopiedKey}
                id="wallet"
              />
            </div>
          </div>

          <div className="rounded-3xl bg-black/25 border border-white/10 p-4">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Required reference</div>
            <div className="mt-2 text-sm font-bold text-white">{verificationConfig.referenceFormat}</div>
            <div className="mt-2 font-mono text-xs text-slate-400">{referenceExample}</div>
            <div className="mt-4">
              <CopyButton
                value={referenceExample}
                label="Copy example"
                copiedKey={copiedKey}
                setCopiedKey={setCopiedKey}
                id="reference"
              />
            </div>
          </div>
        </div>

        <p className="mt-5 text-xs leading-5 text-slate-500">
          Manual crypto verification is separate from bonuses and gameplay. Do not send funds expecting instant deposits, withdrawals, wagering access, or automated confirmation.
        </p>
      </div>
    </section>
  );
}

function App() {
  const [open, setOpen] = useState(false);
  const [balance, setBalance] = useState(100);
  const [activeGame, setActiveGame] = useState(null);

  return (
    <div className="min-h-screen text-white bg-slate-950">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.15),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.14),transparent_35%)] pointer-events-none" />
      <Sidebar open={open} setOpen={setOpen} />
      <Header setOpen={setOpen} balance={balance} />

      <main className="relative lg:ml-72 px-4 md:px-8 py-8 space-y-8">
        <Hero onClaim={() => scrollToSection("verification")} />

        <section id="featured-games" className="scroll-mt-24">
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <h2 className="text-2xl md:text-3xl font-black">Featured Games</h2>
              <p className="text-slate-400">Fast picks styled for a crypto casino lobby.</p>
            </div>
            <button
              type="button"
              onClick={() => scrollToSection("providers")}
              className="hidden sm:block rounded-2xl px-4 py-3 bg-white/10 border border-white/10"
            >
              View all
            </button>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {games.map((game) => <GameCard key={game.title} game={game} onPlay={setActiveGame} />)}
          </div>
        </section>

        <SlotProviderLibrary />
        <PaymentMethods />
        <VerificationPanel />

        <section id="promotions" className="grid scroll-mt-24 lg:grid-cols-3 gap-5">
          {promos.map(({ title, detail, icon: Icon }) => (
            <div key={title} className="rounded-3xl bg-white/[0.06] border border-white/10 p-6">
              <div className="h-12 w-12 rounded-2xl bg-amber-300 text-slate-950 grid place-items-center mb-5 shadow-gold">
                <Icon />
              </div>
              <h3 className="font-black text-xl">{title}</h3>
              <p className="text-slate-400 mt-2">{detail}</p>
            </div>
          ))}
        </section>

        <section id="vip" className="grid scroll-mt-24 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 rounded-3xl bg-white/[0.06] border border-white/10 p-6">
            <h2 className="text-2xl font-black mb-5">Leaderboard</h2>
            {["LuckyDion", "NeonWolf", "KiwiJackpot", "SpinQueen"].map((name, i) => (
              <div key={name} className="flex items-center gap-4 py-4 border-b border-white/10 last:border-none">
                <div className="h-10 w-10 rounded-2xl bg-white/10 grid place-items-center font-black">#{i + 1}</div>
                <div className="font-bold flex-1">{name}</div>
                <div className="text-cyan-300 font-black">{(98000 - i * 13750).toLocaleString()} pts</div>
              </div>
            ))}
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-amber-300/15 to-orange-500/10 border border-amber-300/20 p-6">
            <div className="flex items-center gap-2 text-amber-200 font-black"><Star /> VIP Progress</div>
            <h2 className="text-4xl font-black mt-5">Gold II</h2>
            <p className="text-slate-300 mt-2">Complete missions to unlock rewards and account perks.</p>
            <div className="mt-6 h-4 rounded-full bg-black/30 overflow-hidden">
              <div className="h-full w-[62%] bg-amber-300" />
            </div>
            <p className="text-sm text-slate-400 mt-3">62% to Gold III</p>
          </div>
        </section>

        <footer id="footer" className="scroll-mt-24 text-center text-xs text-slate-500 py-8">
          NeonBet bonuses, provider availability and verification are subject to account approval, local rules and published terms. The $75 crypto verification fee is reviewed manually and is not an instant deposit or automated payment confirmation.
        </footer>
      </main>

      {activeGame && (
        <SlotGameModal
          game={activeGame}
          balance={balance}
          setBalance={setBalance}
          onClose={() => setActiveGame(null)}
        />
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);

export default App;
