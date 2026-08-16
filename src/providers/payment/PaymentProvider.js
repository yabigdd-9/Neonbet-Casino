// Payment provider abstraction.
// No real-money operation is implemented. MockPaymentProvider documents the
// interface a real gateway integration must satisfy.

export class PaymentProvider {
  createDeposit(_request) {
    throw new Error("createDeposit() not implemented");
  }
  createWithdrawal(_request) {
    throw new Error("createWithdrawal() not implemented");
  }
  getTransaction(_id) {
    throw new Error("getTransaction() not implemented");
  }
  verifyWebhook(_payload) {
    throw new Error("verifyWebhook() not implemented");
  }
}

// Safe mock for demos / tests. Never performs real transfers.
export class MockPaymentProvider extends PaymentProvider {
  constructor() {
    super();
    this.requests = [];
  }

  createDeposit(request) {
    const id = `mock-deposit-${Date.now()}`;
    const record = { id, ...request, status: "simulated", createdAt: new Date().toISOString() };
    this.requests.push(record);
    return record;
  }

  createWithdrawal(request) {
    const id = `mock-withdrawal-${Date.now()}`;
    const record = { id, ...request, status: "simulated", createdAt: new Date().toISOString() };
    this.requests.push(record);
    return record;
  }

  getTransaction(id) {
    return this.requests.find((record) => record.id === id) || null;
  }

  verifyWebhook() {
    throw new Error("Webhook verification requires a real payment backend.");
  }
}

export default MockPaymentProvider;
