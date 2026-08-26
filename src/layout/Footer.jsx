import { Link } from "react-router-dom";
import { ArrowRight, BrainCircuit, Mail, MapPin, Phone } from "lucide-react";

const footerGroups = [
  {
    title: "Explore",
    links: [
      { name: "হোম", path: "/" },
      { name: "এমএল বই", path: "/ml" },
      { name: "বই পড়ুন", path: "/ml/dashboard" },
      { name: "বই কিনুন", path: "#", alertMessage: "শীঘ্রই আসছে, চোখ রাখুন ওয়েবসাইট ও Webmart Shop ফেসবুক পেইজে।" },
      { name: "এমএল শব্দ", path: "/ml/topics" },
      { name: "একাডেমিক হাব", path: "/academic" },
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

import { useSiteSettings } from "../hooks/useSiteSettings";

function smoothToTop() {
  window.setTimeout(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 0);
}

export default function Footer() {
  const { data: siteSettings } = useSiteSettings();
  const dev = siteSettings?.developer || {};
  const soc = siteSettings?.social || {};

  const socialLinks = [
    {
      label: `LinkedIn (${soc.linkedinUser || 'ramim-ahmed'})`,
      href: soc.linkedin || "https://www.linkedin.com/in/ramim-ahmed",
      icon: <LinkedInIcon className="h-4 w-4" />,
    },
    {
      label: `Facebook (${soc.facebookUser || 'ramim141'})`,
      href: soc.facebook || "https://www.facebook.com/ramim141",
      icon: <FacebookIcon className="h-4 w-4" />,
    },
    {
      label: `YouTube (${soc.youtubeUser || '@codewithramuu'})`,
      href: soc.youtube || "https://www.youtube.com/@codewithramuu",
      icon: <YouTubeIcon className="h-4 w-4" />,
    },
  ];

  return (
    <footer className="mt-auto border-t border-cyan-100/[0.08] bg-[#050b12] px-5 py-10 text-slate-300 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr_1fr_1.1fr]">
          <div className="max-w-md">
            <Link to="/" onClick={smoothToTop} className="inline-flex items-center transition hover:opacity-90 group">
              <img 
                src="/assets/images/logo.png" 
                alt="Learn with Ramim" 
                className="h-12 sm:h-14 w-auto object-contain transition-transform group-hover:scale-105" 
              />
            </Link>

            <p className="mt-4 text-sm leading-6 text-slate-400">
              বাংলায় AI/ML শেখার ইন্টারেক্টিভ বই এবং SSC, HSC ও ভর্তি পরীক্ষার একাডেমিক হাব — দুইটাই এক ঠিকানায়।
            </p>

            <div className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3.5 backdrop-blur-md space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">
                DEVELOPED BY
              </span>
              <p className="text-sm font-bold text-white">{dev.name || 'Ramim Ahmed'}</p>
              <p className="text-xs text-slate-300 font-medium">{dev.degree || 'BSc in CSE'}</p>
              <p className="text-xs text-slate-400">{dev.university || 'Metropolitan University'}</p>
            </div>
          </div>

          {footerGroups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h3 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-white">
                {group.title}
              </h3>
              <ul className="space-y-3 text-sm">
                {group.links.map((link) => (
                  <li key={link.name}>
                    {link.alertMessage ? (
                      <button
                        onClick={() => window.alert(link.alertMessage)}
                        className="group inline-flex items-center gap-2 font-semibold text-slate-400 transition-colors duration-200 hover:text-teal-300"
                      >
                        <span>{link.name}</span>
                        <ArrowRight
                          size={13}
                          className="opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100"
                        />
                      </button>
                    ) : (
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
                    )}
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
              <a
                href="tel:+8801768628911"
                className="flex items-center gap-3 transition-colors hover:text-teal-300"
              >
                <Phone size={16} className="text-emerald-300" />
                +8801768628911
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
            © 2026 <span className="font-bold text-slate-300">Learn with Ramim</span>. All rights reserved.
          </p>
          <p className="text-slate-400">
            Developed with ❤️ by <span className="font-bold text-teal-300">Ramim Ahmed</span> (BSc in CSE, Metropolitan University)
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

function YouTubeIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}
