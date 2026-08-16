// Promotion content (configurable, not embedded in component logic).
export const promos = [
  {
    title: "Free $100 Sign-Up Bonus",
    detail:
      "New accounts can claim $100 plus a 300% welcome match after verification. Bonus funds require 10x rollover.",
    icon: "Gift",
  },
  {
    title: "Daily Rewards",
    detail: "Fresh drops, missions and member rewards every day",
    icon: "Flame",
  },
  {
    title: "VIP Club",
    detail: "Level up with missions, rewards and exclusive account perks",
    icon: "Trophy",
  },
];

// Account terms / rules shown in the Terms section and policy modal.
export const terms = [
  {
    title: "Bonus Offer",
    detail:
      "Eligible new accounts may receive a $100 sign-up bonus and a 300% welcome match after account review and verification approval.",
  },
  {
    title: "10x Rollover",
    detail:
      "Bonus funds and bonus-linked winnings must be wagered 10 times before they are treated as eligible for withdrawal review.",
  },
  {
    title: "Verification Fee",
    detail:
      "The $75 verification payment is reviewed manually. It does not create an instant deposit, automatic approval, casino credit, or guaranteed withdrawal.",
  },
  {
    title: "Crypto Networks",
    detail:
      "Only send the selected asset on the displayed network. Wrong-network, wrong-asset, NFT, or unsupported smart-contract transfers may be unrecoverable.",
  },
  {
    title: "Proof Required",
    detail:
      "After payment, send your Telegram or WhatsApp username plus the transaction hash so verification can be checked against the selected wallet and network.",
  },
  {
    title: "Account Approval",
    detail:
      "Accounts, bonuses, provider access, game access, and verification status may be approved, delayed, limited, or rejected after review.",
  },
  {
    title: "Withdrawals",
    detail:
      "Any withdrawal review requires completed verification, completed rollover, matching account details, and compliance with the published account rules.",
  },
  {
    title: "Availability",
    detail:
      "Games, providers, bonuses, payment methods, and account features can vary by region, account status, technical availability, and admin review.",
  },
];

export const policyPages = {
  terms: {
    title: "Terms",
    eyebrow: "Account terms",
    sections: [
      [
        "Bonuses",
        "The $100 sign-up bonus and 300% match are subject to account approval, verification, rollover review, and published limits.",
      ],
      [
        "Verification",
        "The $75 verification fee is reviewed manually and does not create an instant deposit, casino credit, withdrawal approval, or automated payment confirmation.",
      ],
      [
        "Withdrawals",
        "Withdrawal requests require admin review, completed verification, matching account details, and completion of any applicable rollover requirement.",
      ],
      [
        "Game Access",
        "Game access, provider availability, bonus eligibility, and account access can be limited, delayed, or rejected after review.",
      ],
    ],
  },
  privacy: {
    title: "Privacy",
    eyebrow: "Data notice",
    sections: [
      [
        "Account Data",
        "The site may store email, username, phone, verification status, transaction hashes, withdrawal requests, admin notes, and bonus/rollover records.",
      ],
      [
        "Manual Review",
        "Transaction hashes, wallet addresses, and account notes are used for manual verification, withdrawal review, and account support.",
      ],
      [
        "Contact",
        "Telegram and WhatsApp contact links may open external services with their own privacy practices.",
      ],
      [
        "Retention",
        "Admin records should be kept only as long as needed for account review, compliance, support, and dispute handling.",
      ],
    ],
  },
  responsible: {
    title: "Responsible Play",
    eyebrow: "Player safety",
    sections: [
      [
        "Adults Only",
        "This site is intended for adults only. Do not use it where online gambling is prohibited.",
      ],
      [
        "Limits",
        "Only play within limits you can afford. Take breaks and do not treat gambling-style gameplay as income.",
      ],
      [
        "Support",
        "If gambling stops being recreational, pause play and seek professional or local support resources.",
      ],
      [
        "Access",
        "Admins may restrict account access, bonuses, withdrawals, or game access where review flags, regional rules, or safety concerns apply.",
      ],
    ],
  },
};

export default promos;
