import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="flex flex-col gap-4 border-t border-slate-200 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <p>Independent insights for independent creators.</p>
        <p>
          Read-only YouTube access · Analytics and questions are sent to Google
          Gemini only when you request analysis or answers.
        </p>
        <p>YuKan · Operated by Abhishal Kumar Sharma</p>
      </div>
      <nav aria-label="Legal and contact">
        <ul className="flex flex-wrap gap-x-4 gap-y-2">
          <li>
            <Link className="hover:text-slate-800" href="/privacy">
              Privacy
            </Link>
          </li>
          <li>
            <Link className="hover:text-slate-800" href="/terms">
              Terms
            </Link>
          </li>
          <li>
            <a
              className="hover:text-slate-800"
              href="mailto:abhishalsharma2002@gmail.com"
            >
              Contact
            </a>
          </li>
        </ul>
      </nav>
    </footer>
  );
}
