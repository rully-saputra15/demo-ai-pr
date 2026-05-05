"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const SERVICES = [
  "Product Direction",
  "Interface Systems",
  "Delivery Support",
  "Brand Identity",
  "Content Strategy",
];

const BUDGET_OPTIONS = [
  { label: "Under $10k", value: 10000 },
  { label: "$10k – $25k", value: 25000 },
  { label: "$25k – $50k", value: 50000 },
  { label: "$50k+", value: 100000 },
];

const TIMELINES = [
  "Less than 1 month",
  "1–3 months",
  "3–6 months",
  "6+ months",
];

const TOTAL_STEPS = 3;
const MAX_DESC_LENGTH = 500;

type FormData = {
  projectName: string;
  description: string;
  services: string[];
  budget: number | null;
  timeline: string;
  contactName: string;
  email: string;
  company: string;
};

const initialFormData: FormData = {
  projectName: "",
  description: "",
  services: [],
  budget: null,
  timeline: "",
  contactName: "",
  email: "",
  company: "",
};

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // BUG 1 — Stale closure: `formData` is captured at mount time and never updates.
  // The interval will always check the initial empty `projectName`, so the
  // auto-save message never appears even after the user fills in the field.
  // Fix: add `formData` to the dependency array.
  useEffect(() => {
    const id = setInterval(() => {
      if (formData.projectName.trim()) {
        setLastSaved(new Date().toLocaleTimeString());
      }
    }, 5000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // BUG 2 — Off-by-one in progress calculation.
  // On step 1 the bar shows 33 % instead of 0 %; on step 2 it shows 66 % instead
  // of 50 %. The correct formula is: ((step - 1) / (TOTAL_STEPS - 1)) * 100
  const progress = (step / TOTAL_STEPS) * 100;

  // BUG 3 — Direct array mutation makes React's bailout optimisation skip
  // re-renders in concurrent/strict mode because the object reference does not
  // change between renders.  The correct pattern is to spread into a new array:
  //   setFormData(prev => ({ ...prev, services: [...prev.services, service] }))
  const toggleService = (service: string) => {
    const services = formData.services; // same reference — mutated in place below
    const idx = services.indexOf(service);
    if (idx === -1) {
      services.push(service);
    } else {
      services.splice(idx, 1);
    }
    setFormData({ ...formData, services }); // spreading with the mutated ref
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.projectName.trim()) return;
      // BUG 4 — >= instead of > means exactly 500 characters is rejected even
      // though the counter shows "500 / 500", implying the limit is inclusive.
      if (formData.description.length >= MAX_DESC_LENGTH) return;
    }
    if (step === 2) {
      if (!formData.budget || !formData.timeline) return;
    }
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    }
  };

  // BUG 5 — Broken email regex: [^\s@.]+ excludes dots from the domain segment,
  // so every address of the form "user@example.com" fails validation and the
  // form can never be submitted.
  // Fix: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@.]+$/.test(email);

  const handleSubmit = async () => {
    if (!formData.contactName.trim() || !isValidEmail(formData.email)) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#f8f1e5] flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#213a31] mb-6">
            <svg
              className="w-8 h-8 text-emerald-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl text-stone-950 mb-4">
            We&apos;ll be in touch.
          </h1>
          <p className="text-stone-600 leading-7 mb-8">
            Thanks for reaching out,{" "}
            {formData.contactName.split(" ")[0]}. Expect a response within
            48 hours.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-stone-950 px-6 py-3 text-sm font-medium text-stone-50 transition hover:bg-stone-800"
          >
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(234,117,52,0.12),_transparent_30%),linear-gradient(180deg,_#f8f1e5_0%,_#efe6d7_100%)] text-stone-950">
      <div className="mx-auto max-w-2xl px-6 py-12 sm:py-20">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 transition mb-8"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Northstar Atelier
          </Link>
          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl text-stone-950">
            Start a project
          </h1>
          <p className="mt-3 text-stone-600 leading-7">
            Tell us what you&apos;re building. We&apos;ll follow up within 48 hours.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-10">
          <div className="flex justify-between text-xs text-stone-400 uppercase tracking-widest mb-3">
            <span>
              Step {step} of {TOTAL_STEPS}
            </span>
            {lastSaved && <span>Draft saved {lastSaved}</span>}
          </div>
          <div className="h-1 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-stone-950 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-3">
            {["Services", "Budget & Timeline", "Contact"].map((label, i) => (
              <span
                key={label}
                className={`text-xs ${
                  i + 1 <= step
                    ? "text-stone-800 font-medium"
                    : "text-stone-400"
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Form card */}
        <div className="rounded-[2rem] border border-stone-900/10 bg-[#fffdf8]/90 p-8 shadow-[0_24px_80px_rgba(49,34,17,0.08)] sm:p-10">
          {/* ── Step 1 ── */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-stone-950">
                What are you working on?
              </h2>

              <div>
                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">
                  Project name *
                </label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, projectName: e.target.value }))
                  }
                  placeholder="e.g. Meridian Launch Campaign"
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">
                  Brief ({formData.description.length} / {MAX_DESC_LENGTH})
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe the problem you're solving, the audience, and any constraints…"
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none transition resize-none"
                />
                {formData.description.length >= MAX_DESC_LENGTH && (
                  <p className="mt-1 text-xs text-red-500">
                    Description must be under {MAX_DESC_LENGTH} characters to
                    continue.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-3">
                  Services needed (select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {SERVICES.map((service) => {
                    const selected = formData.services.includes(service);
                    return (
                      <button
                        key={service}
                        type="button"
                        onClick={() => toggleService(service)}
                        className={`rounded-full border px-4 py-2 text-sm transition ${
                          selected
                            ? "border-stone-900 bg-stone-950 text-stone-50"
                            : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
                        }`}
                      >
                        {service}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <div className="space-y-8">
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-stone-950">
                Scope &amp; timeline
              </h2>

              <div>
                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-3">
                  Budget range *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {BUDGET_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setFormData((p) => ({ ...p, budget: option.value }))
                      }
                      className={`rounded-xl border px-4 py-4 text-sm text-left transition ${
                        formData.budget === option.value
                          ? "border-stone-900 bg-stone-950 text-stone-50"
                          : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-3">
                  Preferred timeline *
                </label>
                <div className="space-y-2">
                  {TIMELINES.map((timeline) => (
                    <button
                      key={timeline}
                      type="button"
                      onClick={() =>
                        setFormData((p) => ({ ...p, timeline }))
                      }
                      className={`w-full rounded-xl border px-4 py-3 text-sm text-left transition ${
                        formData.timeline === timeline
                          ? "border-stone-900 bg-stone-950 text-stone-50"
                          : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
                      }`}
                    >
                      {timeline}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-stone-950">
                Who should we contact?
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">
                    Your name *
                  </label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        contactName: e.target.value,
                      }))
                    }
                    placeholder="Alex Rivera"
                    className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, company: e.target.value }))
                    }
                    placeholder="Meridian Labs"
                    className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">
                  Email address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="alex@meridian.co"
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none transition"
                />
              </div>

              {/* Inquiry summary */}
              <div className="rounded-xl bg-stone-50 border border-stone-100 p-5 space-y-3">
                <p className="text-xs uppercase tracking-widest text-stone-400">
                  Summary
                </p>
                <p className="text-sm text-stone-700">
                  <span className="font-medium text-stone-900">
                    {formData.projectName || "Untitled project"}
                  </span>
                  {formData.services.length > 0 && (
                    <>
                      {" "}
                      &middot; {formData.services.length} service
                      {formData.services.length !== 1 ? "s" : ""}
                    </>
                  )}
                </p>
                {formData.budget && (
                  <p className="text-sm text-stone-600">
                    Budget:{" "}
                    {
                      BUDGET_OPTIONS.find((b) => b.value === formData.budget)
                        ?.label
                    }{" "}
                    &middot; {formData.timeline}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Navigation ── */}
          <div className="mt-10 flex items-center justify-between">
            {/*
             * BUG 6 — Tailwind's `invisible` hides the element visually but
             * keeps it fully interactive in the DOM (pointer-events are NOT
             * disabled).  On step 1 the Back button is invisible yet still
             * clickable, decrementing `step` to 0 and rendering a blank form.
             * Fix: use `hidden` (display:none) or guard the handler with
             *   onClick={() => step > 1 && setStep((s) => s - 1)}
             */}
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className={`rounded-full border border-stone-200 px-5 py-2.5 text-sm text-stone-700 transition hover:border-stone-900 ${
                step === 1 ? "invisible" : ""
              }`}
            >
              Back
            </button>

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={handleNext}
                className="rounded-full bg-stone-950 px-6 py-2.5 text-sm font-medium text-stone-50 transition hover:bg-stone-800"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="rounded-full bg-stone-950 px-6 py-2.5 text-sm font-medium text-stone-50 transition hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Sending…" : "Send inquiry"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
