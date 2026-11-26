import Image from "next/image";

/** iyzico resmî logo paketinden: iyzico ile Öde, Mastercard, Visa, American Express, Troy. */
export const DEFAULT_PAYMENT_LOGOS = "/payment/logo-band.png";

/**
 * iyzico'nun web sitesinde istediği ödeme logoları bandı.
 * Panelden farklı bir bant yüklenmediyse resmî paketteki bant gösterilir.
 * Şeffaf PNG koyu zeminde okunmadığı için beyaz bir kutu içinde gösterilir.
 */
export function PaymentLogos({ src }: { src?: string }) {
  const custom = src && src !== DEFAULT_PAYMENT_LOGOS;
  return (
    <div className="inline-flex items-center rounded-lg bg-white px-3 py-2 shadow-sm">
      {custom ? (
        <div className="relative h-7 w-[300px] max-w-full">
          <Image src={src} alt="Ödeme yöntemleri: iyzico ile Öde, Mastercard, Visa" fill sizes="300px" className="object-contain" />
        </div>
      ) : (
        <Image
          src={DEFAULT_PAYMENT_LOGOS}
          alt="Ödeme yöntemleri: iyzico ile Öde, Mastercard, Visa, American Express, Troy"
          width={1287}
          height={96}
          sizes="(min-width: 768px) 360px, 80vw"
          className="h-auto w-[300px] max-w-full md:w-[360px]"
        />
      )}
    </div>
  );
}
