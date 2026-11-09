import type { Metadata } from "next";
import LegalPage from "@/features/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service | YuKan",
  description:
    "Read the terms for using YuKan, an independent tool for YouTube channel analytics and AI-generated insights.",
};

export default function TermsOfServicePage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro="Last updated: November 9, 2026. These terms apply to your use of YuKan, operated by Abhishal Kumar Sharma (&quot;we&quot; or &quot;us&quot;) in India. By using YuKan, you agree to these terms. If you do not agree, do not use the service."
    >
      <section>
        <h2>What YuKan does</h2>
        <p>
          YuKan is an independent tool that uses read-only Google authorization
          to retrieve limited information about your YouTube channel and up to
          10 recent uploads, review available video-level analytics for the
          preceding 90 days, and provide AI-generated analysis and answers.
          Metrics may be incomplete, delayed, or unavailable. YuKan is not
          affiliated with, endorsed by, or sponsored by Google or YouTube.
        </p>
      </section>

      <section>
        <h2>Your account and authorization</h2>
        <p>
          You must be legally able to agree to these terms and have the right
          to connect the Google and YouTube account you use. You are responsible
          for keeping your account and devices secure. Google sign-in and
          YouTube API access are subject to Google&apos;s and YouTube&apos;s
          applicable terms and policies.
        </p>
        <p>
          You may disconnect by signing out of YuKan and revoke authorization
          separately through your Google Account permissions. Signing out clears
          the authentication cookies stored by YuKan but does not, by itself,
          revoke access in Google.
        </p>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>
            use YuKan unlawfully, interfere with its operation, or attempt
            unauthorized access to the service or another person&apos;s data;
          </li>
          <li>
            bypass technical limits, abuse the service, or use it in a way that
            violates Google, YouTube, or other applicable service terms; or
          </li>
          <li>
            submit information or prompts that you do not have the right to
            provide or that violate another person&apos;s rights.
          </li>
        </ul>
      </section>

      <section>
        <h2>AI-generated information</h2>
        <p>
          YuKan uses Google Gemini to produce analysis and answers from the
          channel data, metrics, and (for questions) conversation context you
          ask it to process. AI output can be inaccurate, incomplete, or
          unsuitable for your situation. It is for informational purposes only,
          is not professional or business advice, and is not a promise of
          channel growth or any particular result. You are responsible for
          reviewing it and deciding whether to act on it.
        </p>
      </section>

      <section>
        <h2>Your content and YuKan&apos;s materials</h2>
        <p>
          You retain any rights you have in information and content you submit.
          You give us permission to process it only as reasonably necessary to
          operate YuKan and provide the features you request, as described in
          the <a href="/privacy">Privacy Policy</a>. YuKan, its name, design,
          and software are owned by their respective rights holders. These
          terms do not transfer ownership of either party&apos;s materials.
        </p>
      </section>

      <section>
        <h2>Availability and changes</h2>
        <p>
          YuKan is provided without a guarantee of uninterrupted availability,
          error-free operation, or continued access to any particular feature.
          We may modify, suspend, or discontinue all or part of the service
          where reasonably necessary, including for security, legal, or
          operational reasons.
        </p>
      </section>

      <section>
        <h2>Disclaimers and liability</h2>
        <p>
          To the extent permitted by applicable law, YuKan is provided
          &quot;as is&quot; and &quot;as available&quot;, without warranties
          that cannot lawfully be excluded. To the extent permitted by law, we
          are not liable for indirect or consequential loss, or loss of data,
          profits, or business arising from use of or inability to use YuKan.
          Nothing in these terms excludes or limits liability or consumer
          rights that cannot be excluded or limited under applicable law.
        </p>
      </section>

      <section>
        <h2>Governing law and contact</h2>
        <p>
          These terms are governed by the laws of India, subject to any
          mandatory consumer protections and rules that apply where you live.
          For questions about these terms, contact Abhishal Kumar Sharma at{" "}
          <a href="mailto:abhishalsharma2002@gmail.com">
            abhishalsharma2002@gmail.com
          </a>
          .
        </p>
      </section>
    </LegalPage>
  );
}
