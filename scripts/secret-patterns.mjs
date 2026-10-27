export const patterns = [
  ["EVM address", /(?<![a-zA-Z0-9])0x[0-9a-fA-F]{40}(?![a-zA-Z0-9])/],
  [
    "Bitcoin address",
    /(?<![a-zA-Z0-9])(?:[13][a-km-zA-HJ-NP-Z1-9]{25,33}|bc1[ac-hj-np-z02-9]{25,87})(?![a-zA-Z0-9])/,
  ],
  ["Contact link", /(?:t\.me\/[a-zA-Z0-9_]+|wa\.me\/[0-9]+)/],
  ["JWT", /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/],
  ["Private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ["API key", /sk-[a-zA-Z0-9]{20,}/],
];
export const detectSecret = (content) => patterns.find(([, pattern]) => pattern.test(content))?.[0] || null;
