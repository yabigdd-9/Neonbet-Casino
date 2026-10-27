import publicAddresses from "./public-addresses.json";
// Manual verification configuration.
// Live wallet addresses and personal links are externalized here as safe placeholders.
// Buyers replace VERIFICATION_* values (or the public QR assets) before distribution.

export const verificationConfig = {
  feeUsd: 50,
  referenceFormat: "@TelegramOrWhatsAppUsername + transaction hash",
  contactMethods: ["Telegram", "WhatsApp"],
  // Empty by default for sale builds. Operators paste their own support links via VITE_ env
  // (see config/contact.js) or edit these directly.
  contactLinks: {
    telegram: "",
    whatsapp: "",
  },
  acceptedCrypto: [
    { name: "BTC", network: "Bitcoin", label: "BTC deposit address", address: import.meta.env.VITE_BTC_BITCOIN_ADDRESS || publicAddresses.VITE_BTC_BITCOIN_ADDRESS || "", notice: "Send BTC on Bitcoin only" },
    { name: "ETH", network: "Ethereum (ERC20)", label: "ETH deposit address", address: import.meta.env.VITE_ETH_ERC20_ADDRESS || publicAddresses.VITE_ETH_ERC20_ADDRESS || "", notice: "Send ETH on Ethereum only" },
    { name: "USDT", network: "BSC (BEP20)", label: "USDT deposit address", address: import.meta.env.VITE_USDT_BSC_ADDRESS || publicAddresses.VITE_USDT_BSC_ADDRESS || "", notice: "Send USDT on BNB Smart Chain only" },
    { name: "USDT", network: "Tron (TRC20)", label: "USDT deposit address", address: import.meta.env.VITE_USDT_TRON_ADDRESS || publicAddresses.VITE_USDT_TRON_ADDRESS || "", notice: "Send USDT on Tron only" },
    { name: "USDT", network: "Ethereum (ERC20)", label: "USDT deposit address", address: import.meta.env.VITE_USDT_ETH_ADDRESS || publicAddresses.VITE_USDT_ETH_ADDRESS || "", notice: "Send USDT on Ethereum only" },
    { name: "USDT", network: "Solana", label: "USDT deposit address", address: import.meta.env.VITE_USDT_SOL_ADDRESS || publicAddresses.VITE_USDT_SOL_ADDRESS || "", notice: "Send USDT on Solana only" },
    { name: "SOL", network: "Solana", label: "SOL deposit address", address: import.meta.env.VITE_SOL_SOLANA_ADDRESS || publicAddresses.VITE_SOL_SOLANA_ADDRESS || "", notice: "Send SOL on Solana only" },
    { name: "TRX", network: "Tron", label: "TRX deposit address", address: import.meta.env.VITE_TRX_TRON_ADDRESS || publicAddresses.VITE_TRX_TRON_ADDRESS || "", notice: "Send TRX on Tron only" },
    { name: "BNB", network: "BSC (BEP20)", label: "BNB deposit address", address: import.meta.env.VITE_BNB_BSC_ADDRESS || publicAddresses.VITE_BNB_BSC_ADDRESS || "", notice: "Send BNB on BNB Smart Chain only" },
  ],
};

export default verificationConfig;
