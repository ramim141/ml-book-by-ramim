import { Link } from "react-router-dom";
import { ArrowRight, BrainCircuit, Mail, MapPin } from "lucide-react";

const footerGroups = [
  {
    title: "Explore",
    links: [
      { name: "হোম", path: "/" },
      { name: "বই পড়ুন", path: "/dashboard" },
      { name: "বই কিনুন", path: "/books" },
      { name: "এমএল শব্দ", path: "/ml-topics" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "আমাদের সম্পর্কে", path: "/about" },
      { name: "যোগাযোগ", path: "/contact" },
      { name: "প্রাইভেসি পলিসি", path: "/privacy" },
      { name: "টার্মস", path: "/terms" },
    ],
  },
];

const socialLinks = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/ramim-ahmed/",
    icon: <LinkedInIcon className="h-4 w-4" />,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=100069728434533",
    icon: <FacebookIcon className="h-4 w-4" />,
  },
];

function smoothToTop() {
  window.setTimeout(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 0);
}

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-cyan-100/[0.08] bg-[#050b12] px-5 py-10 text-slate-300 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr_1fr_1.1fr]">
          <div className="max-w-md">
            <Link to="/" onClick={smoothToTop} className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-md bg-teal-300 text-[#06111d] shadow-[0_0_24px_rgba(45,212,191,0.18)]">
                <BrainCircuit size={23} />
              </span>
              <span>
                <span className="block text-lg font-black leading-tight text-white">
                  শব্দে শব্দে মেশিন লার্নিং
                </span>
                <span className="mt-1 block text-xs font-semibold text-slate-500">
                  রামীম আহমেদের বাংলা AI learning book
                </span>
              </span>
            </Link>

            <p className="mt-5 text-sm leading-7 text-slate-400">
              কঠিন AI/ML ধারণাকে সহজ বাংলা ব্যাখ্যা, গল্প এবং ইন্টারেক্টিভ ল্যাবের মাধ্যমে শেখার একটি বন্ধুসুলভ প্ল্যাটফর্ম।
            </p>
          </div>

          {footerGroups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h3 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-white">
                {group.title}
              </h3>
              <ul className="space-y-3 text-sm">
                {group.links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      onClick={smoothToTop}
                      className="group inline-flex items-center gap-2 font-semibold text-slate-400 transition-colors duration-200 hover:text-teal-300"
                    >
                      <span>{link.name}</span>
                      <ArrowRight
                        size={13}
                        className="opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h3 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-white">
              Contact
            </h3>
            <div className="space-y-3 text-sm font-semibold text-slate-400">
              <a
                href="mailto:ahramu584@gmail.com"
                className="flex items-center gap-3 transition-colors hover:text-teal-300"
              >
                <Mail size={16} className="text-teal-300" />
                ahramu584@gmail.com
              </a>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-cyan-300" />
                Bangladesh
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.label}
                  title={link.label}
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-cyan-100/[0.08] bg-[#071521] text-slate-400 transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-300/40 hover:text-teal-200"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-cyan-100/[0.06] pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © 2026 <span className="font-bold text-slate-300">ML Book by Ramim</span>. All rights reserved.
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-600">
            Powered by React & Vite
          </p>
        </div>
      </div>
    </footer>
  );
}

function LinkedInIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9h4v12H3V9Zm7 0h3.83v1.64h.05c.53-1 1.82-2.06 3.74-2.06 4 0 4.74 2.63 4.74 6.05V21h-4v-5.72c0-1.36-.03-3.1-1.89-3.1-1.89 0-2.18 1.48-2.18 3V21h-4V9Z" />
    </svg>
  );
}

function FacebookIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M13.5 22v-8.2h2.76l.41-3.2H13.5V8.55c0-.93.26-1.56 1.6-1.56h1.7V4.13c-.83-.09-1.66-.13-2.5-.13-2.5 0-4.22 1.52-4.22 4.3v2.38H7.07v3.2h2.99V22h3.44Z" />
    </svg>
  );
}
