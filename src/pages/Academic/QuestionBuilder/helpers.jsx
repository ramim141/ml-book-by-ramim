import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";

export const enToBn = (n) => {
  if (n === undefined || n === null) return n;

  const bn = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];

  return String(n).replace(/[0-9]/g, d => bn[d]);
};

export const cleanPrefix = (text) => {
  if (!text) return "";

  return text.replace(
    /^[\s\n]*(?:\*\*)?\(?[কখগঘa-dA-D]\)?[\.\)\]।](?:\*\*)?\s*/i,
    ""
  );
};

export const MarkdownRenderer = ({ content }) => (
  <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:my-0 text-slate-300 text-[13px] sm:text-sm">
    <ReactMarkdown
      remarkPlugins={[remarkMath, remarkGfm]}
      rehypePlugins={[rehypeKatex]}
    >
      {content || ""}
    </ReactMarkdown>
  </div>
);

export const PrintMarkdownRenderer = ({ content }) => (
  <div
    className="prose text-justify max-w-none prose-p:leading-relaxed prose-p:my-0"
    style={{
      color: "#000",
      fontSize: "14px",
      textAlign: "justify",
    }}
  >
    <ReactMarkdown
      remarkPlugins={[remarkMath, remarkGfm]}
      rehypePlugins={[rehypeKatex]}
    >
      {content || ""}
    </ReactMarkdown>
  </div>
);