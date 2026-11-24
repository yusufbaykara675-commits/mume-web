import "server-only";

/**
 * Ödeme altyapısı — ŞU AN KAPALI.
 *
 * Siparişler WhatsApp üzerinden tamamlanır ve ödeme durumu yönetim panelinden elle
 * güncellenir. iyzico veya PayTR ile sözleşme yapıldığında aşağıdaki sağlayıcılardan
 * biri uygulanır ve PAYMENT_PROVIDER ortam değişkeni ayarlanır.
 *
 * KURAL: Bir sipariş yalnızca sağlayıcının imzalı geri bildirimi (callback/webhook)
 * sunucu tarafında doğrulandıktan sonra "ODENDI" olarak işaretlenebilir.
 */

export type PaymentInit = {
  orderId: string;
  orderCode: string;
  amountCents: number;
  customer: { name: string; phone: string; email?: string | null; ip: string };
  items: { id: string; name: string; unitPriceCents: number; quantity: number }[];
  callbackUrl: string;
};

export type PaymentInitResult = { redirectUrl?: string; iframeToken?: string; providerReference: string };

export type VerifiedPayment = { orderCode: string; providerReference: string; amountCents: number; success: boolean };

export interface PaymentProvider {
  readonly name: "iyzico" | "paytr";
  /** Ödeme oturumu başlatır (henüz ödeme alınmış sayılmaz). */
  initialize(input: PaymentInit): Promise<PaymentInitResult>;
  /** Sağlayıcıdan gelen bildirimi imza/hash ile doğrular. Doğrulanamazsa hata fırlatır. */
  verifyCallback(request: Request): Promise<VerifiedPayment>;
}

export class PaymentsDisabledError extends Error {
  constructor() {
    super("Online ödeme henüz etkin değil.");
  }
}

class NotImplementedProvider implements PaymentProvider {
  constructor(readonly name: "iyzico" | "paytr") {}
  async initialize(): Promise<PaymentInitResult> {
    throw new Error(`${this.name} entegrasyonu henüz uygulanmadı. Bkz. src/lib/payments/README.md`);
  }
  async verifyCallback(): Promise<VerifiedPayment> {
    throw new Error(`${this.name} geri bildirimi doğrulanamaz: entegrasyon uygulanmadı.`);
  }
}

export function paymentsEnabled(): boolean {
  const p = (process.env.PAYMENT_PROVIDER || "none").toLowerCase();
  return p === "iyzico" || p === "paytr";
}

export function getPaymentProvider(): PaymentProvider {
  const p = (process.env.PAYMENT_PROVIDER || "none").toLowerCase();
  if (p === "iyzico" || p === "paytr") return new NotImplementedProvider(p);
  throw new PaymentsDisabledError();
}
