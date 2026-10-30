import React, { useState } from 'react';
import {
  Github,
  Mail,
  Linkedin,
  Instagram,
  Phone,
  ChevronDown,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { portfolioContent } from '../../data/portfolioContent';

interface PortfolioOverlayProps {
  scrollProgress: number;
}

export const PortfolioOverlay: React.FC<PortfolioOverlayProps> = ({ scrollProgress }) => {
  const { identity, projects, skills, experience, education, certifications, contact } =
    portfolioContent;

  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  // Smooth Hermite smoothstep for cinematic transitions
  const smoothStep = (edge0: number, edge1: number, x: number): number => {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  };

  const smoothWindow = (
    val: number,
    inStart: number,
    inEnd: number,
    outStart: number,
    outEnd: number
  ): number => {
    if (val <= inStart || val >= outEnd) return 0;
    if (val >= inEnd && val <= outStart) return 1;
    if (val < inEnd) return smoothStep(inStart, inEnd, val);
    return 1 - smoothStep(outStart, outEnd, val);
  };

  // 1. HERO OPACITY: smoothly dissolves away as scroll begins [0.06 - 0.22]
  const heroOpacity = 1 - smoothStep(0.06, 0.22, scrollProgress);

  // 2. ABOUT OPACITY: reveals seamlessly on the right [0.16 - 0.39]
  const aboutOpacity = smoothWindow(scrollProgress, 0.16, 0.24, 0.32, 0.39);

  // 3. MANIFESTO OPACITY: "interstellar manifesting..." reveals on right [0.35 - 0.58]
  // while the particle spaceship forms majestically on the left side
  const manifestoOpacity = smoothWindow(scrollProgress, 0.35, 0.42, 0.51, 0.58);

  // 4. CRUISE / EDITORIAL FEED: active from [0.52 - 1.0]
  const editorialActive = scrollProgress >= 0.52;
  const editorialOpacity = smoothStep(0.52, 0.62, scrollProgress);

  return (
    <div className="relative w-full z-10 pointer-events-none text-slate-200 select-text">
      {/* ============================================================ */}
      {/* 1. HERO — THE PORTAL (0% - 22%): Positioned on the left      */}
      {/* ============================================================ */}
      <section
        className="fixed inset-0 flex flex-col justify-center items-start px-6 sm:px-16 md:px-24 transition-all duration-700 pointer-events-none"
        style={{
          opacity: heroOpacity,
          transform: `translateY(${(1 - heroOpacity) * -16}px)`,
          pointerEvents: heroOpacity > 0.08 ? 'auto' : 'none',
        }}
        aria-label="Hero Portal Introduction"
      >
        <div className="max-w-xl text-left space-y-3 sm:space-y-4">
          {/* Line 1: Hi, it's (small muted silver) */}
          <div className="font-mono-code text-xs sm:text-sm tracking-[0.35em] uppercase text-slate-400 kinetic-char" style={{ animationDelay: '0.1s' }}>
            Hi, it's
          </div>

          {/* "Aadesh" and "Kadam" right below each other */}
          <h1 className="font-display font-black tracking-tight uppercase leading-[0.88] silver-text-hero">
            <span className="block text-5xl sm:text-7xl md:text-8xl kinetic-char" style={{ animationDelay: '0.2s' }}>
              Aadesh
            </span>
            <span className="block text-5xl sm:text-7xl md:text-8xl text-slate-100 kinetic-char" style={{ animationDelay: '0.35s' }}>
              Kadam
            </span>
          </h1>

          {/* Subtitle: Generative AI Engineer */}
          <div className="font-display text-base sm:text-xl md:text-2xl font-semibold tracking-wider uppercase silver-text-sub kinetic-char pt-1" style={{ animationDelay: '0.5s' }}>
            Generative AI Engineer
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. ABOUT — TRAVERSING THE LUMINOUS THRESHOLD (Right-aligned) */}
      {/* ============================================================ */}
      <section
        className="fixed inset-0 flex items-center justify-end p-6 sm:p-12 md:pr-20 lg:pr-28 text-left transition-all duration-700 pointer-events-none"
        style={{
          opacity: aboutOpacity,
          transform: `translateY(${(1 - aboutOpacity) * 16}px)`,
          pointerEvents: aboutOpacity > 0.08 ? 'auto' : 'none',
        }}
        aria-hidden={aboutOpacity <= 0.05}
      >
        <div className="max-w-lg lg:max-w-md space-y-4">
          <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight uppercase silver-text-heading">
            Traversing the Luminous Threshold
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-slate-300 font-normal leading-relaxed tracking-wide">
            <p>
              I am a Generative AI Engineer focused on building agentic reasoning architectures,
              context-aware tool runtimes, and evidence-grounded knowledge systems.
            </p>
            <p className="text-slate-400">
              Standing at the boundary between deterministic software systems and probabilistic model
              intelligence, I engineer autonomous workflows where agents plan, retrieve, execute,
              and verify with strict reliability.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. MANIFESTO — "interstellar manifesting..." (Right-aligned) */}
      {/* Leaves entire left side dedicated for spaceship formation    */}
      {/* Manifestation starts directly with "I", small & precise      */}
      {/* ============================================================ */}
      <section
        className="fixed inset-0 flex items-center justify-end p-6 sm:p-12 md:pr-14 lg:pr-24 text-left transition-all duration-700 pointer-events-none"
        style={{
          opacity: manifestoOpacity,
          transform: `translateY(${(1 - manifestoOpacity) * 16}px)`,
          pointerEvents: manifestoOpacity > 0.08 ? 'auto' : 'none',
        }}
        aria-hidden={manifestoOpacity <= 0.05}
      >
        <div className="max-w-lg lg:max-w-md space-y-3">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight silver-text-heading normal-case lowercase">
            interstellar manifesting...
          </h2>
          <div className="space-y-3 text-xs sm:text-[13px] text-slate-300 font-normal leading-relaxed tracking-wide">
            <p className="text-slate-200">
              I engineer autonomous intelligence from first principles—grounding probabilistic neural reasoning within deterministic software harnesses, self-correcting agent loops, and verifiable tool execution.
            </p>
            <p className="text-slate-400">
              Navigating high-dimensional ambiguity into production-grade certainty is how true breakthroughs take shape.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. EDITORIAL STREAM: PROJECTS, EXPERTISE, JOURNEY, CONTACT   */}
      {/* Active [52% - 100%]: Right Column (Leaves left for starship) */}
      {/* ============================================================ */}
      <div
        className="fixed inset-0 flex justify-end p-4 sm:p-8 md:p-12 lg:p-16 overflow-y-auto transition-opacity duration-700"
        style={{
          opacity: editorialOpacity,
          pointerEvents: editorialActive ? 'auto' : 'none',
        }}
      >
        {/* Right column leaves left side open for Cruising Starship & Fluid Sphere */}
        <div className="w-full md:w-[54%] lg:w-[48%] py-12 space-y-28">
          {/* SECTION: PROJECTS */}
          <section id="projects" className="scroll-mt-24 space-y-8">
            <div>
              <div className="font-mono-code text-[11px] tracking-[0.25em] uppercase text-slate-400 mb-2">
                Selected Engineering
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase silver-text-heading">
                Autonomous Systems & Architectures
              </h2>
            </div>

            <div className="space-y-6">
              {projects.map((project) => {
                const isExpanded = expandedProjectId === project.id;
                return (
                  <article
                    key={project.id}
                    className="silver-border-card p-6 sm:p-7 rounded-xl space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="font-display text-lg sm:text-xl font-bold text-white tracking-wide">
                          {project.title}
                        </h3>
                        <p className="font-mono-code text-xs text-slate-400">
                          {project.tagline}
                        </p>
                      </div>

                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                          aria-label={`Source repository for ${project.title}`}
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {project.description}
                    </p>

                    {/* Expandable spec panel */}
                    {isExpanded && (
                      <div className="pt-4 border-t border-white/10 space-y-3 text-xs leading-relaxed text-slate-300">
                        <div className="bg-white/[0.02] p-3.5 rounded-lg border border-white/[0.05]">
                          <span className="font-mono-code text-[10px] text-slate-400 uppercase tracking-widest block mb-1">
                            Architecture Specifications
                          </span>
                          {project.detailedDescription}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                      <div className="flex flex-wrap gap-1.5">
                        {project.architectureThemes.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-0.5 rounded text-[10px] font-mono-code bg-white/[0.04] text-slate-300 border border-white/[0.06]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => setExpandedProjectId(isExpanded ? null : project.id)}
                        className="font-mono-code text-[11px] text-slate-300 hover:text-white flex items-center space-x-1 shrink-0 ml-3 transition-colors"
                        aria-expanded={isExpanded}
                      >
                        <span>{isExpanded ? 'LESS' : 'SPEC'}</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* SECTION: TECHNICAL EXPERTISE (8 DEDICATED GENAI & AGENTIC CARDS) */}
          <section id="expertise" className="scroll-mt-24 space-y-8">
            <div>
              <div className="font-mono-code text-[11px] tracking-[0.25em] uppercase text-slate-400 mb-2">
                Engineering Stack
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase silver-text-heading">
                Technical Expertise
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {skills.map((cat) => (
                <div
                  key={cat.category}
                  className="silver-border-card p-5 rounded-xl space-y-3"
                >
                  <h3 className="font-mono-code text-xs font-semibold tracking-wider uppercase text-slate-200 pb-2 border-b border-white/[0.08] flex items-center justify-between">
                    <span>{cat.category}</span>
                    <Sparkles className="w-3 h-3 text-slate-400" />
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.items.map((item) => (
                      <span
                        key={item}
                        className="px-2.5 py-1 rounded-md text-xs text-slate-300 bg-white/[0.03] border border-white/[0.06] hover:border-slate-400/40 transition-colors"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION: PROFESSIONAL JOURNEY */}
          <section id="journey" className="scroll-mt-24 space-y-8">
            <div>
              <div className="font-mono-code text-[11px] tracking-[0.25em] uppercase text-slate-400 mb-2">
                Trajectory & Credentials
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase silver-text-heading">
                Professional Journey
              </h2>
            </div>

            {/* Experience */}
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div
                  key={idx}
                  className="silver-border-card p-6 rounded-xl space-y-3"
                >
                  <div className="font-mono-code text-xs text-slate-400">{exp.period}</div>
                  <h3 className="font-display text-lg font-bold text-white">{exp.role}</h3>
                  <div className="font-mono-code text-xs text-slate-300">{exp.organization}</div>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-300 list-disc list-inside pt-2">
                    {exp.highlights.map((bullet, bIdx) => (
                      <li key={bIdx} className="leading-relaxed">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Education */}
            <div className="grid grid-cols-1 gap-4">
              {education.map((edu, idx) => (
                <div
                  key={idx}
                  className="silver-border-card p-5 rounded-xl space-y-1.5"
                >
                  <div className="font-mono-code text-xs text-slate-400">{edu.period}</div>
                  <h4 className="font-display text-base font-bold text-white">{edu.degree}</h4>
                  <div className="text-xs text-slate-300">
                    {edu.institution} · {edu.location}
                  </div>
                  <div className="font-mono-code text-xs text-slate-200 font-semibold pt-1">
                    {edu.score}
                  </div>
                </div>
              ))}
            </div>

            {/* Verified Certifications */}
            <div className="silver-border-card p-5 rounded-xl space-y-3">
              <div className="font-mono-code text-xs tracking-widest uppercase text-slate-300 pb-2 border-b border-white/[0.08]">
                Verified Certifications
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {certifications.map((cert, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-white/[0.05] bg-white/[0.02]"
                  >
                    <div className="text-xs font-medium text-white">{cert.title}</div>
                    <div className="font-mono-code text-[11px] text-slate-400">{cert.issuer}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION: CONTACT (RIGHT SIDE, NO ENCLOSING CARD, COMPLEMENTING FLUID SPHERE ON LEFT) */}
          <section id="contact" className="scroll-mt-24 pb-28 space-y-6">
            <div>
              <div className="font-mono-code text-[11px] tracking-[0.25em] uppercase text-slate-400 mb-2">
                Communication Frequencies
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase silver-text-heading">
                Initiate Contact
              </h2>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Open for engineering roles, autonomous agent architecture discussions, and generative
              AI initiatives. The interactive fluid particle sphere on the left responds directly
              to your pointer.
            </p>

            {/* Minimalist contact links - NO enclosing card */}
            <div className="pt-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-white/10">
                <div>
                  <div className="font-mono-code text-[10px] tracking-widest text-slate-400 uppercase mb-1">
                    Direct Email
                  </div>
                  <a
                    href={`mailto:${contact.email}`}
                    className="font-mono-code text-xs sm:text-sm text-slate-200 hover:text-white flex items-center space-x-2 transition-colors"
                  >
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{contact.email}</span>
                  </a>
                </div>

                <div>
                  <div className="font-mono-code text-[10px] tracking-widest text-slate-400 uppercase mb-1">
                    Telephone
                  </div>
                  <a
                    href={`tel:${contact.phone}`}
                    className="font-mono-code text-xs sm:text-sm text-slate-200 hover:text-white flex items-center space-x-2 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{contact.phoneDisplay}</span>
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={contact.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-lg border border-white/10 hover:border-slate-300 hover:bg-white/5 font-mono-code text-xs text-slate-300 hover:text-white transition-colors flex items-center space-x-2"
                  aria-label="GitHub Profile"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub (@{contact.githubUsername})</span>
                </a>

                <a
                  href={contact.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-lg border border-white/10 hover:border-slate-300 hover:bg-white/5 font-mono-code text-xs text-slate-300 hover:text-white transition-colors flex items-center space-x-2"
                  aria-label="LinkedIn Profile"
                >
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn</span>
                </a>

                <a
                  href={contact.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-lg border border-white/10 hover:border-slate-300 hover:bg-white/5 font-mono-code text-xs text-slate-300 hover:text-white transition-colors flex items-center space-x-2"
                  aria-label="Instagram Profile"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Instagram (@{contact.instagramHandle})</span>
                </a>
              </div>

              <div className="pt-6 font-mono-code text-[10px] tracking-widest text-slate-500 uppercase flex items-center justify-between">
                <span>AADESH KADAM 2026</span>
                <span>{identity.status}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
