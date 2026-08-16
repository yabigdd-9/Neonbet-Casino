// Manual verification configuration.
// Live wallet addresses and personal links are externalized here as safe placeholders.
// Buyers replace VERIFICATION_* values (or the public QR assets) before distribution.

export const verificationConfig = {
  feeUsd: 75,
  referenceFormat: "@TelegramOrWhatsAppUsername + transaction hash",
  contactMethods: ["Telegram", "WhatsApp"],
  // Empty by default for sale builds. Operators paste their own support links via VITE_ env
  // (see config/contact.js) or edit these directly.
  contactLinks: {
    telegram: "",
    whatsapp: "",
  },
  acceptedCrypto: [
    {
      name: "USDT",
      network: "BSC",
      label: "USDT BSC wallet",
      address: "",
      qrCodeSrc: "/verification/usdt-bsc.svg",
      notice: "Send USDT on BSC / BEP20 only",
      note: "Use the BSC / BEP20 network only",
    },
    {
      name: "BTC",
      network: "BTC",
      label: "BTC wallet",
      address: "",
      qrCodeSrc: "/verification/btc.svg",
      notice: "Send BTC on the Bitcoin network only",
      note: "Do not send tokens or smart-contract deposits",
    },
    {
      name: "ETH",
      network: "ETH",
      label: "ETH wallet",
      address: "",
      qrCodeSrc: "/verification/eth.svg",
      notice: "Send ETH on the Ethereum network only",
      note: "Do not send NFTs to this address",
    },
    {
      name: "BNB",
      network: "BSC",
      label: "BNB BSC wallet",
      address: "",
      qrCodeSrc: "/verification/bnb-bsc.svg",
      notice: "Send BNB on BSC / BEP20 only",
      note: "Understanding network rules prevents loss.",
    },
  ],
};

export default verificationConfig;
