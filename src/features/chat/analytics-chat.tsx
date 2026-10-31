"use client";

import { useEffect, useRef, useState } from "react";

type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

const suggestedQuestions = [
  "Which recent videos kept viewers watching the longest?",
  "Which uploads gained the most subscribers?",
  "What should I improve in my next video based on my recent analytics?",
];

export default function AnalyticsChat() {
  const [question, setQuestion] = useState("");
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);
  const threadRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const thread = threadRef.current;
    if (thread) {
      thread.scrollTop = thread.scrollHeight;
    }
  }, [conversation, asking]);

  async function askAboutAnalytics() {
    const currentQuestion = question.trim();
    if (!currentQuestion || asking) return;

    setAsking(true);
    setAskError(null);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion,
          history: conversation.slice(-8).map((message) => ({
            ...message,
            content:
              message.content.length > 3000
                ? `${message.content.slice(0, 2997)}...`
                : message.content,
          })),
        }),
      });
      const body: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof body === "object" &&
            body !== null &&
            "error" in body &&
            typeof body.error === "string"
            ? body.error
            : "We couldn't answer your question. Please try again.";
        throw new Error(message);
      }

      if (
        typeof body !== "object" ||
        body === null ||
        !("answer" in body) ||
        typeof body.answer !== "string" ||
        body.answer.trim().length === 0
      ) {
        throw new Error("The answer response was invalid. Please try again.");
      }

      const answer = body.answer;
      setConversation((messages) => {
        const nextConversation: ConversationMessage[] = [
          ...messages,
          { role: "user", content: currentQuestion },
          { role: "assistant", content: answer },
        ];
        return nextConversation.slice(-10);
      });
      setQuestion("");
    } catch (caughtError) {
      setAskError(
        caughtError instanceof Error
          ? caughtError.message
          : "An unexpected error occurred. Please try again.",
      );
    } finally {
      setAsking(false);
    }
  }

  return (
    <section
      aria-labelledby="analytics-questions-heading"
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <header className="border-b border-slate-100 p-5 sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-red-600">
          Ask about your channel
        </p>
        <h2
          id="analytics-questions-heading"
          className="mt-1 text-xl font-semibold text-slate-950"
        >
          Explore this analysis
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Answers use your 10 most recent uploads and available metrics from the
          last 90 days. Your question, recent conversation, and analytics are
          sent to Gemini. Conversation history stays in this page and is not
          saved by this app.
        </p>
      </header>

      <ol
        ref={threadRef}
        aria-live="polite"
        aria-label="Analytics conversation"
        className="max-h-[28rem] min-h-48 space-y-4 overflow-y-auto p-5 sm:p-6"
      >
        {conversation.length === 0 && !asking && (
          <li className="flex min-h-36 flex-col justify-center">
            <p className="text-sm font-medium text-slate-700">
              Ask a question about the report or start with one of these:
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {suggestedQuestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setQuestion(suggestion)}
                  disabled={asking}
                  className="rounded-full border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </li>
        )}
        {conversation.map((message, index) => (
          <li
            key={`${index}-${message.role}`}
            className={
              message.role === "user"
                ? "ml-auto max-w-2xl rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-800"
                : "max-w-3xl rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700"
            }
          >
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {message.role === "user" ? "You" : "ViewPulse"}
            </p>
            <p className="whitespace-pre-wrap">{message.content}</p>
          </li>
        ))}
        {asking && (
          <>
            <li className="ml-auto max-w-2xl rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-800">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                You
              </p>
              <p className="whitespace-pre-wrap">{question}</p>
            </li>
            <li
              role="status"
              className="max-w-3xl rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600"
            >
              ViewPulse is reviewing your analytics…
            </li>
          </>
        )}
      </ol>

      <div className="border-t border-slate-100 bg-slate-50/70 p-4 sm:p-5">
        {askError && (
          <p
            role="alert"
            className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {askError}
            {askError.toLowerCase().includes("sign in") && (
              <>
                {" "}
                <a
                  className="font-semibold underline underline-offset-2"
                  href="/api/auth/login"
                >
                  Reconnect Google
                </a>
              </>
            )}
          </p>
        )}
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            void askAboutAnalytics();
          }}
        >
          <label className="sr-only" htmlFor="analytics-question">
            Ask a question about your YouTube analytics
          </label>
          <input
            id="analytics-question"
            type="text"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            maxLength={1000}
            placeholder="Ask a question about your recent videos…"
            disabled={asking}
            className="min-h-12 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-slate-50"
          />
          <button
            type="submit"
            disabled={asking || !question.trim()}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {asking && <Spinner />}
            {asking ? "Thinking…" : "Ask"}
          </button>
        </form>
      </div>
    </section>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
    />
  );
}
