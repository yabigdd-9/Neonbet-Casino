// Promotion content (configurable, not embedded in component logic).
export const promos = [
  {
    title: "100 Demo Credits",
    detail: "Start each browser session with 100 simulated credits. No sign-up or payment required.",
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
    detail: "The initial balance and daily rewards are simulated credits with no cash value.",
  },
  {
    title: "10x Rollover",
    detail: "Demo credits and simulated winnings cannot be withdrawn.",
  },
  {
    title: "Verification Fee",
    detail: "Real-money account verification and payments are not available. Do not send funds.",
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
    detail: "Demo accounts are local to the browser and are not real-money accounts.",
  },
  {
    title: "Withdrawals",
    detail: "Real-money withdrawals are not available.",
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
      ["Bonuses", "Demo credits have no cash value and cannot be withdrawn."],
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
