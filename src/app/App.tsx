import { ThemeProvider } from "@figma/astraui";
import { motion } from "motion/react";
import {
  ArrowRight,
  ChevronDown,
  Github,
  Linkedin,
  Mail,
  Instagram,
  Code2,
  Palette,
  BrainCircuit,
  ShieldCheck,
  BriefcaseBusiness,
  Sparkles,
} from "lucide-react";
import { InteractiveCharacter } from "./components/InteractiveCharacter";
import "@figma/astraui/styles.css";

const skills = [
  "Python",
  "JavaScript",
  "PHP",
  "MySQL",
  "OpenCV",
  "AI Tools",
  "UI/UX",
  "Branding",
  "Automation",
  "Creative Direction",
];

const projects = [
  {
    title: "AI-Assisted Smart Security Gate",
    desc: "A computer vision based gate automation system using number plate recognition, OCR, and access control logic.",
    icon: ShieldCheck,
  },
  {
    title: "Creative Portfolio Systems",
    desc: "Modern animated website experiences with clean layouts, visual storytelling, responsive UI, and motion design.",
    icon: Code2,
  },
  {
    title: "Vestano Branding & Campaigns",
    desc: "Brand identity, marketing visuals, proposal designs, launch campaigns, and premium presentation systems.",
    icon: Palette,
  },
  {
    title: "Computer Vision Experiments",
    desc: "Face detection, object detection, number plate region detection, and AI-powered visual recognition systems.",
    icon: BrainCircuit,
  },
];

const experience = [
  {
    role: "Software Support Head",
    company: "Vestano International Pvt. Ltd.",
    period: "Present",
    desc: "Managing retail software support, POS troubleshooting, technical coordination, system stability, and operational software workflows.",
  },
  {
    role: "Creative Developer",
    company: "Portfolio & Web Projects",
    period: "Personal Work",
    desc: "Creating modern portfolio websites, visual layouts, animated interfaces, and creative digital experiences.",
  },
  {
    role: "AI & Automation Enthusiast",
    company: "Academic / Personal Projects",
    period: "Ongoing",
    desc: "Building practical AI, computer vision, and automation systems using Python, OpenCV, OCR, and modern web tools.",
  },
];

export default function App() {
  return (
    <ThemeProvider>
      <main className="relative min-h-screen overflow-hidden bg-[#f8f9ff] text-slate-950 selection:bg-indigo-600 selection:text-white">
        {/* Premium soft background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.12),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(168,85,247,0.12),transparent_35%),linear-gradient(180deg,#ffffff_0%,#f8f9ff_45%,#eef1ff_100%)]" />

          <motion.div
            className="absolute right-[-12%] top-[12%] h-[560px] w-[560px] rounded-full bg-indigo-300/20 blur-[110px]"
            animate={{ scale: [1, 1.08, 1], opacity: [0.45, 0.75, 0.45] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            className="absolute bottom-[-18%] left-[-12%] h-[520px] w-[520px] rounded-full bg-purple-300/20 blur-[120px]"
            animate={{ scale: [1.05, 1, 1.05], opacity: [0.35, 0.65, 0.35] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Navbar */}
        <motion.nav
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200/70 bg-white/70 backdrop-blur-2xl"
        >
          <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-5 lg:px-10">
            <a href="#home" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white shadow-lg shadow-slate-900/10">
                AK
              </div>
              <span className="hidden text-sm font-semibold tracking-tight text-slate-900 sm:block">
                abhiramk.in
              </span>
            </a>

            <div className="hidden items-center gap-8 md:flex">
              <a href="#about" className="text-sm font-medium text-slate-600 transition hover:text-slate-950">
                About
              </a>
              <a href="#projects" className="text-sm font-medium text-slate-600 transition hover:text-slate-950">
                Projects
              </a>
              <a href="#experience" className="text-sm font-medium text-slate-600 transition hover:text-slate-950">
                Experience
              </a>
              <a href="#contact" className="text-sm font-medium text-slate-600 transition hover:text-slate-950">
                Contact
              </a>
            </div>

            <a
              href="mailto:abhiramkwork@gmail.com"
              className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/10"
            >
              Hire Me
            </a>
          </div>
        </motion.nav>

        {/* Hero */}
        <section
          id="home"
          className="relative z-10 mx-auto flex min-h-screen max-w-[1440px] flex-col items-center justify-center px-6 pt-32 pb-16 lg:px-10 text-center"
        >
          <div className="relative z-10 flex w-full flex-col items-center justify-center flex-1">
            {/* 3-Column Hero Layout */}
            <div className="grid w-full grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-8 pointer-events-none px-2 lg:px-4 max-w-[1440px] mx-auto">
              
              {/* Left Text */}
              <div className="flex justify-center lg:justify-start w-full z-10">
                <motion.h1
                  initial={{ opacity: 0, x: -36 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="text-[clamp(2.5rem,4vw,4rem)] xl:text-[5rem] font-black leading-[0.9] tracking-[-0.05em] text-slate-950 lg:text-right mix-blend-multiply mt-2 lg:mt-0 whitespace-nowrap text-left"
                >
                  <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent text-[32px] font-bold text-right px-[20px] py-[0px]">Hello! I'm</span>
                   Abhiram K
                </motion.h1>
              </div>

              {/* Center Character */}
              <div className="relative w-[min(78vw,300px)] sm:w-[350px] lg:w-[400px] xl:w-[480px] h-[min(78vw,300px)] sm:h-[350px] lg:h-[400px] xl:h-[480px] flex items-center justify-center z-0 pointer-events-auto mx-auto">
                <div className="absolute w-[250px] lg:w-[350px] h-[250px] lg:h-[350px] bg-indigo-500/20 rounded-full blur-[80px]" />
                <div className="absolute inset-0 flex items-center justify-center scale-110 sm:scale-[1.15] lg:scale-125 pointer-events-auto">
                  <InteractiveCharacter />
                </div>
              </div>

              {/* Right Text */}
              <div className="flex justify-center lg:justify-end w-full z-10">
                <motion.h2
                  initial={{ opacity: 0, x: 36 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="text-[clamp(2.5rem,4vw,4rem)] xl:text-[5rem] font-black leading-[0.9] tracking-[-0.05em] text-slate-950 lg:text-right mix-blend-multiply mt-2 lg:mt-0 whitespace-nowrap text-left"
                >
                  Creative
                  <span className="block text-slate-500">
                    Developer
                  </span>
                </motion.h2>
              </div>
            </div>

            <div className="mt-12 md:mt-20 flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mb-8 inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-xl"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_18px_rgba(16,185,129,0.8)]" />
                <span className="text-sm font-medium text-slate-600">
                  Available for creative and software projects
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.6 }}
                className="flex flex-wrap items-center justify-center gap-4 pointer-events-auto"
              >
              <a
                href="#projects"
                className="group inline-flex items-center gap-3 rounded-full bg-slate-950 px-7 py-4 text-sm font-bold text-white shadow-2xl shadow-slate-950/20 transition hover:-translate-y-1 hover:bg-indigo-600 hover:shadow-indigo-600/25"
              >
                View Projects
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </a>

              <a
                href="mailto:abhiramkwork@gmail.com"
                className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/90 px-7 py-4 text-sm font-bold text-slate-900 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10 backdrop-blur-md"
              >
                Contact Me
                <Mail className="h-4 w-4" />
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.78 }}
              className="mt-8 flex items-center justify-center gap-3"
            >
              {[
                { icon: Github, href: "https://github.com/abhiramk-10", label: "GitHub" },
                { icon: Linkedin, href: "https://linkedin.com/in/abhiramkofficial", label: "LinkedIn" },
                { icon: Instagram, href: "https://www.instagram.com/abhiramk_", label: "Instagram" },
                { icon: Mail, href: "mailto:abhiramkwork@gmail.com", label: "Email" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith("mailto") ? undefined : "_blank"}
                  rel="noreferrer"
                  aria-label={social.label}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white/80 text-slate-600 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:border-indigo-200 hover:text-indigo-600 hover:shadow-xl hover:shadow-indigo-500/10"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </motion.div>
          </div>
        </div>
        </section>

        {/* About */}
        <section id="about" className="relative z-10 mx-auto max-w-[1440px] px-6 py-24 lg:px-10">
          <div className="grid gap-8 rounded-[2.5rem] border border-slate-200 bg-white/70 p-6 shadow-2xl shadow-indigo-500/5 backdrop-blur-xl lg:grid-cols-12 lg:p-10">
            <div className="lg:col-span-5">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-600">
                <Sparkles className="h-4 w-4" />
                About Me
              </div>

              <h2 className="text-[clamp(2.4rem,5vw,4.5rem)] font-black leading-none tracking-[-0.05em] text-slate-950">
                Practical tech with creative execution.
              </h2>
            </div>

            <div className="lg:col-span-7">
              <p className="text-xl leading-8 text-slate-600">
                I’m a B.Sc Computer Science graduate and Software Support Head
                at Vestano International Pvt. Ltd. My work connects software
                troubleshooting, retail systems, automation, AI experiments,
                branding, and clean digital design.
              </p>

              <p className="mt-6 text-lg leading-8 text-slate-500">
                I like building things that look premium but also solve real
                problems — from AI-assisted security systems to portfolio
                websites, proposals, and brand experiences.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Projects */}
        <section id="projects" className="relative z-10 mx-auto max-w-[1440px] px-6 py-24 lg:px-10">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.28em] text-indigo-600">
                Selected Work
              </p>
              <h2 className="text-[clamp(2.7rem,6vw,5.2rem)] font-black leading-none tracking-[-0.06em] text-slate-950">
                Projects that show my direction.
              </h2>
            </div>

            <p className="max-w-md text-lg leading-7 text-slate-500">
              A mix of software, AI, automation, branding, and visual systems.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {projects.map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.75, delay: index * 0.08 }}
                className="group rounded-[2rem] border border-slate-200 bg-white/75 p-7 shadow-xl shadow-indigo-500/5 backdrop-blur-xl transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/10"
              >
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15 transition group-hover:bg-indigo-600">
                  <project.icon className="h-6 w-6" />
                </div>

                <h3 className="text-2xl font-black tracking-[-0.03em] text-slate-950">
                  {project.title}
                </h3>

                <p className="mt-4 text-base leading-7 text-slate-500">
                  {project.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Experience */}
        <section id="experience" className="relative z-10 mx-auto max-w-[1440px] px-6 py-24 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.28em] text-indigo-600">
                Experience
              </p>
              <h2 className="text-[clamp(2.7rem,5vw,4.8rem)] font-black leading-none tracking-[-0.06em] text-slate-950">
                Real work, real systems.
              </h2>
            </div>

            <div className="space-y-5 lg:col-span-8">
              {experience.map((item, index) => (
                <motion.div
                  key={item.role}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.75, delay: index * 0.08 }}
                  className="rounded-[2rem] border border-slate-200 bg-white/75 p-7 shadow-xl shadow-indigo-500/5 backdrop-blur-xl"
                >
                  <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                        <BriefcaseBusiness className="h-5 w-5" />
                      </div>

                      <div>
                        <h3 className="text-2xl font-black tracking-[-0.03em] text-slate-950">
                          {item.role}
                        </h3>
                        <p className="font-semibold text-slate-500">
                          {item.company}
                        </p>
                      </div>
                    </div>

                    <span className="w-fit rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">
                      {item.period}
                    </span>
                  </div>

                  <p className="text-base leading-7 text-slate-500">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <footer id="contact" className="relative z-10 mt-20 border-t border-slate-200 bg-white/70 backdrop-blur-xl">
          <div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-10">
            <div className="grid gap-10 md:grid-cols-2 md:items-end">
              <div>
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.28em] text-indigo-600">
                  Contact
                </p>
                <h2 className="text-[clamp(2.8rem,6vw,5.5rem)] font-black leading-none tracking-[-0.06em] text-slate-950">
                  Let’s build something useful.
                </h2>
              </div>

              <div className="md:text-right">
                <a
                  href="mailto:abhiramkwork@gmail.com"
                  className="inline-flex items-center gap-3 rounded-full bg-slate-950 px-7 py-4 text-sm font-bold text-white shadow-2xl shadow-slate-950/20 transition hover:-translate-y-1 hover:bg-indigo-600"
                >
                  Message me..!
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="mt-14 flex flex-col justify-between gap-5 border-t border-slate-200 pt-8 text-sm font-medium text-slate-500 md:flex-row md:items-center">
              <p>© {new Date().getFullYear()} Abhiram K. All rights reserved.</p>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Based in Kerala, building for the web.</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </ThemeProvider>
  );
}
