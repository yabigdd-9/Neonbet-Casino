export class ProviderError extends Error {
  constructor(
    public code: "UNAVAILABLE" | "INVALID_REQUEST" | "INVALID_SIGNATURE" | "CONFLICT" | "RETRYABLE",
    message: string,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}
export interface ProviderGame {
  id?: string;
  title: string;
  type: string;
}
export interface LaunchSession {
  id: string;
  mode: "demo" | "sandbox";
  gameId: string;
  expiresAt: string;
}
export interface PaymentRequest {
  amountCents: number;
  currency: string;
  idempotencyKey: string;
}
export interface PaymentRecord extends PaymentRequest {
  id: string;
  kind: "deposit" | "withdrawal";
  status: "simulated" | "pending" | "completed" | "failed";
}
export interface CasinoAdapter {
  readonly capabilities: { demo: boolean; real: boolean };
  getGames(): Promise<ProviderGame[]>;
  getGame(id: string): Promise<ProviderGame | null>;
  launchDemo(game: ProviderGame): Promise<LaunchSession>;
}
export interface PaymentAdapter {
  readonly capabilities: { simulated: boolean; live: boolean };
  createDeposit(request: PaymentRequest): Promise<PaymentRecord>;
  createWithdrawal(request: PaymentRequest): Promise<PaymentRecord>;
  getTransaction(id: string): Promise<PaymentRecord | null>;
}
