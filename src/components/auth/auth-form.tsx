"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { parseLoginRequest, parseSignupRequest, parseWeddingSetupRequest } from "@/features/auth/requests";
import { RELATIONSHIP_TYPES } from "@/types/domain";
import { AppError } from "@/lib/api/errors";
import { postAuth, useAuthReady } from "./auth-client";

const fieldClass = "mt-2 block w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-[15px] text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-60";
const buttonClass = "flex min-h-12 w-full items-center justify-center rounded-full bg-primary-container px-6 py-3 font-semibold text-on-primary transition hover:bg-primary disabled:cursor-wait disabled:opacity-60";

function PasswordField({ signup, pending }: { signup: boolean; pending: boolean }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="block font-medium"><label htmlFor="password">Password</label>
      <span className="relative block">
        <input id="password" name="password" required type={visible ? "text" : "password"}
          autoComplete={signup ? "new-password" : "current-password"} disabled={pending}
          aria-describedby={signup ? "password-hint" : undefined} className={`${fieldClass} pr-20`} />
        <button type="button" aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible}
          onClick={() => setVisible(!visible)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-xs font-semibold text-primary">
          {visible ? "Hide" : "Show"}
        </button>
      </span>
      {signup && <span id="password-hint" className="mt-2 block text-xs font-normal text-on-surface-variant">At least 8 characters. A memorable phrase works well.</span>}
    </div>
  );
}

export function AuthForm({ mode }: { mode: "signup" | "login" }) {
  const signup = mode === "signup";
  const router = useRouter();
  const ready = useAuthReady();
  const [step, setStep] = useState(1);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const errorRef = useRef<HTMLDivElement>(null);
  const weddingRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const account = useRef<ReturnType<typeof parseSignupRequest> | null>(null);

  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);
  useEffect(() => { if (step === 2) weddingRef.current?.focus(); }, [step]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      if (signup && step === 1) {
        const profile = parseSignupRequest(data);
        if (data.confirmPassword !== profile.password) throw new Error("Your passwords do not match.");
        account.current = profile;
        setStep(2);
        return;
      }
      const body = signup
        ? { ...account.current, wedding: parseWeddingSetupRequest(data) }
        : parseLoginRequest(data);
      setPending(true);
      await postAuth(`/api/v1/auth/${signup ? "register" : "login"}`, body);
      account.current = null;
      router.replace("/dashboard");
      router.refresh();
    } catch (failure) {
      setPending(false);
      setError(failure instanceof AppError ? failure.details[0] || failure.message
        : failure instanceof TypeError ? "We couldn’t connect. Check your connection and try again."
        : failure instanceof Error ? failure.message : "Please try again.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-[460px]">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">{signup ? "Your story starts here" : "Together, again"}</p>
      <h1 className="font-display-lg text-[32px] leading-tight text-primary sm:text-[38px]">{signup ? step === 1 ? "Create an account" : "Tell us about your wedding" : "Log in"}</h1>
      <p className="mb-7 mt-3 text-[15px] leading-relaxed text-on-surface-variant">
        {signup ? step === 1 ? "A little less juggling. A lot more celebrating. Let’s bring your wedding plans together."
          : "Just a few details to make this space yours. You can start planning right after setup."
          : "Welcome back. Your wedding plans and your family are waiting for you."}
      </p>
      {signup && <ol aria-label="Signup progress" className="mb-7 flex items-center gap-3 text-sm">
        <li aria-current={step === 1 ? "step" : undefined} className="flex items-center gap-2 font-semibold text-primary"><span className="flex size-7 items-center justify-center rounded-full bg-primary text-white">1</span> Your account</li>
        <li aria-hidden="true" className="h-px flex-1 bg-outline-variant" />
        <li aria-current={step === 2 ? "step" : undefined} className={`flex items-center gap-2 ${step === 2 ? "font-semibold text-primary" : "text-on-surface-variant"}`}><span className={`flex size-7 items-center justify-center rounded-full ${step === 2 ? "bg-primary text-white" : "bg-surface-container"}`}>2</span> Your wedding</li>
      </ol>}
      {error && <div ref={errorRef} role="alert" tabIndex={-1} className="mb-5 rounded-xl border border-error/20 bg-error-container/40 p-4 text-sm text-on-error-container">{error}</div>}
      <form onSubmit={submit} className="space-y-5" aria-busy={pending}>
        <fieldset hidden={signup && step !== 1} disabled={pending || (signup && step !== 1)} className="space-y-5">
          <legend className="sr-only">{signup ? "Account details" : "Login details"}</legend>
          {signup && <label className="block font-medium" htmlFor="name">Your full name<input ref={nameRef} id="name" name="name" autoComplete="name" required maxLength={100} className={fieldClass} /></label>}
          <label className="block font-medium" htmlFor="email">Email address<input id="email" name="email" type="email" autoComplete="email" required maxLength={254} className={fieldClass} /></label>
          <PasswordField signup={signup} pending={pending} />
          {signup && <>
            <label className="block font-medium" htmlFor="confirmPassword">Confirm password<input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required className={fieldClass} /></label>
            <label className="block font-medium" htmlFor="relationshipType">Your relationship to the couple
              <select id="relationshipType" name="relationshipType" required defaultValue="" className={fieldClass}>
                <option value="" disabled>Select your relationship</option>
                {RELATIONSHIP_TYPES.map(value => <option key={value} value={value}>{value === "BRIDE" ? "Bride" : value === "GROOM" ? "Groom" : value.toLowerCase().replace(/_/g, " ").replace(/^(bride|groom) /, "$1’s ").replace(/^./, letter => letter.toUpperCase())}</option>)}
              </select>
            </label>
          </>}
        </fieldset>
        {signup && <fieldset hidden={step !== 2} disabled={pending || step !== 2} className="space-y-5">
          <legend className="sr-only">Wedding details</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block font-medium" htmlFor="groomName">Groom’s name<input ref={weddingRef} id="groomName" name="groomName" autoComplete="off" required maxLength={100} className={fieldClass} /></label>
            <label className="block font-medium" htmlFor="brideName">Bride’s name<input id="brideName" name="brideName" autoComplete="off" required maxLength={100} className={fieldClass} /></label>
          </div>
          <label className="block font-medium" htmlFor="weddingDate">Wedding date<input id="weddingDate" name="weddingDate" type="date" required className={fieldClass} /></label>
          <label className="block font-medium" htmlFor="location">Wedding location<input id="location" name="location" autoComplete="off" placeholder="City or primary wedding location" required maxLength={200} className={fieldClass} /></label>
        </fieldset>}
        <button type="submit" disabled={!ready || pending} className={buttonClass}>
          {pending ? signup ? "Creating your workspace…" : "Logging in…" : signup ? step === 1 ? "Continue to wedding details →" : "Create my wedding workspace" : "Log in"}
        </button>
        {signup && step === 2 && <button type="button" disabled={pending} onClick={() => {
          setError(""); setStep(1); requestAnimationFrame(() => nameRef.current?.focus());
        }} className="w-full rounded-lg py-2 font-semibold text-primary">← Back to account details</button>}
      </form>
      <p className="mt-7 text-center text-sm text-on-surface-variant">
        {signup ? "Already have an account? " : "New to Make My Marriage? "}
        <Link href={signup ? "/login" : "/signup"} className="font-semibold text-primary underline decoration-primary/30 underline-offset-4">{signup ? "Log in" : "Create an account"}</Link>
      </p>
    </div>
  );
}
