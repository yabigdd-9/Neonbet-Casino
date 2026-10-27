// Promotion content (configurable, not embedded in component logic).
export const promos = [
  {
    title: "$50 Simulated Balance",
    detail: "Start with $50 in simulated credits and a $1,500 (30×) wagering target. No cash value.",
    icon: "Gift",
  },
  {
    title: "Daily Rewards",
    detail: "Claim 5 simulated credits each UTC day, or 10 on weekends.",
    icon: "Flame",
  },
  {
    title: "Weekend Boost",
    detail: "The daily demo reward doubles to 10 credits on Saturday and Sunday UTC.",
    icon: "Trophy",
  },
];

// Account terms / rules shown in the Terms section and policy modal.
export const terms = [
  {
    title: "Bonus Offer",
    detail: "The $50 starting balance is simulated and has no cash value.",
  },
  {
    title: "30× simulated target",
    detail: "The $1,500 target tracks simulated wagers only and does not unlock cash withdrawals.",
  },
  {
    title: "Verification",
    detail: "Real-money verification and payments are not available. Do not send funds.",
  },
  {
    title: "Crypto Networks",
    detail: "Crypto deposits are not enabled. Do not send cryptocurrency.",
  },
  {
    title: "Proof Required",
    detail: "No payment is required for the simulated arcade.",
  },
  {
    title: "Account Approval",
    detail:
      "Accounts, bonuses, provider access, game access, and verification status may be approved, delayed, limited, or rejected after review.",
  },
  {
    title: "Withdrawals",
    detail: "Simulated balances cannot be withdrawn and have no cash value.",
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
        "The simulated $50 starting balance has no cash value. Its 30× target tracks simulated wagering only.",
      ],
      [
        "Verification",
        "Real-money verification and deposits are not available. No payment is required for demo play.",
      ],
      ["Withdrawals", "Real-money withdrawals are not available."],
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
