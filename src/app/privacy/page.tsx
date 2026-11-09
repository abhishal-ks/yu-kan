import type { Metadata } from "next";
import LegalPage from "@/features/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy | YuKan",
  description:
    "Learn how YuKan handles Google account authorization, YouTube channel data, analytics, and questions submitted for AI analysis.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="Last updated: November 9, 2026. This policy explains how Abhishal Kumar Sharma (&quot;we&quot;) handles information when you use YuKan, a tool for reviewing your YouTube channel analytics."
    >
      <section>
        <h2>Information we process</h2>
        <p>
          When you connect Google, YuKan receives authorization to use the
          following read-only YouTube API scopes: YouTube account and channel
          data, and YouTube Analytics data. To provide the service, YuKan
          requests your channel name and profile image, details about up to
          your 10 most recent uploads (including video titles, IDs, publication
          dates, and durations), and available video-level metrics for the
          preceding 90 days. Metrics may include views, watch time, average
          view duration and percentage, subscribers gained, likes, comments,
          and shares.
        </p>
        <p>
          YuKan does not request access to create, edit, upload, or delete
          YouTube content. The app does not request your Google password or
          retrieve your Google account email address for its analysis.
        </p>
        <p>
          If you use the analysis or question features, the relevant channel
          data and analytics are sent to Google Gemini to generate the
          requested response. For questions, this also includes the question
          you submit and up to eight recent conversation messages held in the
          open page. Please do not include sensitive personal information in
          questions.
        </p>
      </section>

      <section>
        <h2>How information is used and shared</h2>
        <p>
          We process information only to sign you in, retrieve your requested
          channel information, display analytics, generate the analysis and
          answers you request, maintain the service, protect it from misuse,
          and respond to support or legal requests. We do not sell Google user
          data, use it for advertising, or use it to train or improve
          generalized AI or machine-learning models.
        </p>
        <p>
          YouTube data is sent to Google Gemini only when needed to provide the
          user-facing analysis or answer you request. Google processes that
          information under its own applicable terms and privacy disclosures.
          YuKan does not control Google&apos;s handling of data after it is
          received. Data obtained through Google APIs is used in accordance
          with the{" "}
          <a href="https://developers.google.com/terms/api-services-user-data-policy">
            Google API Services User Data Policy, including its Limited Use
            requirements
          </a>
          .
        </p>
        <p>
          YuKan is hosted on Vercel. Google provides the YouTube APIs,
          sign-in, and Gemini service. These providers may process information
          as necessary to provide their services, under their own terms and
          privacy policies. Please review their current terms and privacy
          disclosures for details about their processing and retention.
        </p>
      </section>

      <section>
        <h2>Storage and retention</h2>
        <p>
          YuKan does not maintain an app database of your channel analytics,
          analysis results, or question history. Analytics and results are
          fetched or generated for your request and returned to your browser;
          conversation history is kept in page memory and is not saved by
          YuKan. The app does not intentionally retain this content after the
          request or page session.
        </p>
        <p>
          Google access and refresh tokens are held in HTTP-only cookies
          (marked Secure in production) so the server can access YouTube data
          for you. The access token is refreshed when needed. These cookies are
          cleared when you use YuKan&apos;s sign-out action; clearing your
          browser cookies also removes the local copies. Sign-out does not
          itself revoke YuKan&apos;s authorization in your Google Account. To
          revoke that authorization, visit{" "}
          <a href="https://myaccount.google.com/permissions">
            Google Account permissions
          </a>
          .
        </p>
        <p>
          Our hosting and service providers may create and retain technical
          logs or other operational records under their own retention
          practices. We do not control those provider retention periods.
        </p>
      </section>

      <section>
        <h2>Cookies and security</h2>
        <p>
          YuKan uses essential cookies for Google sign-in, authorization, and
          OAuth request security. The authentication cookies are HTTP-only and
          are not readable by client-side JavaScript. YuKan does not currently
          use advertising or analytics-tracking cookies. We use reasonable
          technical safeguards, but no online service or transmission can be
          guaranteed completely secure.
        </p>
      </section>

      <section>
        <h2>Your choices and requests</h2>
        <p>
          You can stop using YuKan, sign out to clear the local authentication
          cookies, or revoke its access from your Google Account permissions.
          You can contact us to ask about or request action concerning personal
          information that YuKan controls. Because YuKan does not keep an app
          database of analytics or chat history, those items generally cannot
          be retrieved or deleted by us after the request ends. Rights available
          to you depend on applicable law; we will respond to requests as
          required by that law.
        </p>
      </section>

      <section>
        <h2>Children and changes</h2>
        <p>
          YuKan is a creator analytics tool and is not directed to children.
          We do not knowingly seek personal information from children through
          this service. If you believe a child has provided personal
          information to us, contact us.
        </p>
        <p>
          We may update this policy as the service or applicable requirements
          change. The date at the top indicates when it was most recently
          updated. Material changes will be reflected on this page.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          YuKan is operated by Abhishal Kumar Sharma in India. For privacy
          questions or requests, email{" "}
          <a href="mailto:abhishalsharma2002@gmail.com">
            abhishalsharma2002@gmail.com
          </a>
          .
        </p>
      </section>
    </LegalPage>
  );
}
