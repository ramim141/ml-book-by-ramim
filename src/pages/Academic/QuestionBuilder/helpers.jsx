import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";

export const enToBn = (n) => {
  if (n === undefined || n === null) return n;

  const bn = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];

  return String(n).replace(/[0-9]/g, d => bn[d]);
};

/**
 * সৃজনশীল প্রশ্নের অংশে লেখকভেদে ক/খ/গ/ঘ চিহ্নটা নানা রকমে বসানো থাকে —
 * `**ক.**`, `(গ)`, `**(গ)**`, `খ)`, `ঘ।` ইত্যাদি। রেন্ডার করার সময় আমরা
 * নিজেরাই লেবেলটা আলাদা কলামে ছাপি, তাই মূল লেখা থেকে ওটা সরানো দরকার।
 *
 * আগের রেগেক্সটা বন্ধনী-যুক্ত রূপ (`(গ) ...`) ধরতে পারত না, ফলে প্রিন্ট
 * কপিতে "গ.  (গ) ..." — দুবার নম্বর ছাপা হতো।
 */
const PREFIX_RE = /^(?:[*\s\u00A0\u200B]*(?:\(\s*[কখগঘa-dA-D0-9০-৯]+\s*\)|[কখগঘa-dA-D0-9০-৯]+\s*[.)।:-])[*\s\u00A0\u200B]*)+/;

export const cleanPrefix = (text) => {
  if (!text) return "";
  return String(text)
    .replace(PREFIX_RE, "")
    .replace(/^[\s\u00A0\u200B\t]+/, "")
    .trim();
};

export const MarkdownRenderer = ({ content, className = "prose-p:leading-relaxed prose-p:my-2 text-slate-300 text-[13px] sm:text-sm" }) => (
  <div className={`prose prose-invert max-w-none ${className}`}>
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