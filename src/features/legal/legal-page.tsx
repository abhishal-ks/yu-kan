import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import SiteFooter from "@/components/site-footer";

type LegalPageProps = {
  title: string;
  intro: string;
  children: ReactNode;
};

export default function LegalPage({ title, intro, children }: LegalPageProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-5 py-6 sm:px-8">
      <header className="flex items-center justify-between border-b border-slate-200 pb-5">
        <Link href="/" className="flex items-center" aria-label="YuKan home">
          <Image
            src="/yukan-logo.svg"
            alt="YuKan"
            width={216}
            height={56}
            priority
            className="h-10 w-auto"
          />
        </Link>
        <Link
          href="/"
          className="text-sm font-medium text-slate-600 transition hover:text-red-700"
        >
          Back to YuKan
        </Link>
      </header>

      <article className="flex-1 py-10 sm:py-14">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-700">
          YuKan policies
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
          {intro}
        </p>
        <div className="mt-10 space-y-9 text-sm leading-7 text-slate-700 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-slate-950 [&_li]:ml-5 [&_li]:list-disc [&_ol]:space-y-2 [&_p+p]:mt-3 [&_ul]:mt-3 [&_ul]:space-y-2 [&_a]:font-medium [&_a]:text-red-700 [&_a]:underline [&_a]:underline-offset-4">
          {children}
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}
