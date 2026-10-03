import Image from "next/image";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="w-full bg-surface-container-low border-t border-outline-variant/30 mt-space-xl">
      <div className="max-w-[1440px] mx-auto px-gutter-mobile lg:px-margin py-space-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-space-xl mb-space-xl">
          <div className="lg:col-span-2 flex flex-col items-start gap-space-md">
            <div className="flex items-center gap-space-sm">
              <Image src="/images/landing/brand.png" alt="Make My Marriage Logo" width={512} height={512} sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 560px" className="h-7 w-auto object-contain" />
              <span className="font-display-md text-headline-sm text-primary tracking-tight font-semibold">Make My Marriage</span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">Make My Marriage — The wedding planning &amp; family collaboration workspace built for Indian weddings.</p>
          </div>
          <div className="flex flex-col gap-space-sm">
            <h3 className="font-label-lg text-label-lg text-on-surface uppercase tracking-wider">Product</h3>
            <div className="flex flex-col gap-space-xs">
              <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#features">Features</a>
              <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#how-it-works">How It Works</a>
              <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#for-families">For Families</a>
              <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#guest-experience">Guest Experience</a>
            </div>
          </div>
          <div className="flex flex-col gap-space-sm">
            <h3 className="font-label-lg text-label-lg text-on-surface uppercase tracking-wider">Help</h3>
            <div className="flex flex-col gap-space-xs">
              <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#faq">FAQ</a>
            </div>
          </div>
          <div className="flex flex-col gap-space-sm">
            <h3 className="font-label-lg text-label-lg text-on-surface uppercase tracking-wider">Account</h3>
            <div className="flex flex-col gap-space-xs">
              <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="/login">Login</Link>
              <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="/signup">Start Planning</Link>
            </div>
          </div>
        </div>
        <div className="pt-space-lg border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-space-sm text-center sm:text-left">
          <p className="font-body-sm text-body-sm text-on-surface-variant">© Make My Marriage. Crafted with care for Indian families.</p>
        </div>
      </div>
    </footer>
  );
}
