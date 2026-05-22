import { useRef, useState } from 'react';
import {
  Bot,
  BrainCircuit,
  Camera,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Mic,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import './index.css';

const skills = [
  'Python',
  'OpenCV',
  'YOLO',
  'OCR',
  'SQL',
  'Linux',
  'Java',
  'C',
  'Robotics',
  'AI/ML',
];

const projects = [
  {
    title: 'Smart Vehicle Entry System',
    type: 'Computer vision',
    description:
      'A number-plate recognition workflow using OpenCV and OCR to support faster campus gate access and reduce manual vehicle checks.',
    tags: ['Python', 'OpenCV', 'OCR'],
  },
  {
    title: 'Vision Detection Lab',
    type: 'AI experiments',
    description:
      'Object-detection experiments focused on YOLO, image processing, and practical computer-vision workflows that can move from demo to utility.',
    tags: ['YOLO', 'Python', 'AI/ML'],
  },
  {
    title: 'Interactive Portfolio System',
    type: 'Web experience',
    description:
      'A responsive React and Vite portfolio with motion details, structured sections, and a voice-ready assistant layer.',
    tags: ['React', 'Three.js', 'Vite'],
  },
];

const systems = [
  {
    title: 'Abhiram K. Portfolio',
    label: 'Public profile',
    icon: UserRound,
    description:
      'A focused profile for my work, skills, projects, and contact paths, built to show both the engineer and the systems thinking behind the work.',
    points: ['AI/software profile', 'Project showcase', 'Contact hub'],
  },
  {
    title: 'Jarvis AI Assistant',
    label: 'Local AI system',
    icon: Bot,
    description:
      'A local-first assistant exploring voice control, camera awareness, memory, Malayalam-learning flows, and provider fallbacks.',
    points: ['Voice commands', 'Face recognition', 'Self-diagnostics'],
  },
];

const jarvisCapabilities = [
  {
    title: 'Voice-first control',
    description: 'Wake, listen, respond, and execute local commands through a conversational voice loop.',
    icon: Mic,
  },
  {
    title: 'Camera awareness',
    description: 'DeepFace-powered recognition and visual context so Jarvis can identify familiar people.',
    icon: Camera,
  },
  {
    title: 'Memory and learning',
    description: 'Local memory, Malayalam-learning flows, emotional context, and provider fallbacks.',
    icon: BrainCircuit,
  },
  {
    title: 'Self diagnostics',
    description: 'Checks services, cameras, models, and runtime state so the assistant can recover faster.',
    icon: ShieldCheck,
  },
];

const assistantReplies = {
  projects:
    'Abhiram builds practical computer-vision workflows, OCR automation, AI experiments, and this responsive React portfolio.',
  skills:
    'Core skills include Python, OpenCV, YOLO, OCR, SQL, Linux, Java, C, robotics, and AI/ML fundamentals.',
  jarvis:
    'Jarvis is a local-first assistant project with voice control, camera awareness, memory, Malayalam learning, and runtime diagnostics.',
  contact:
    'You can reach Abhiram at hello@abhiramk.in, or use the GitHub and LinkedIn links in the contact section.',
};

const quickPrompts = [
  { label: 'Projects', value: 'show projects' },
  { label: 'Skills', value: 'show skills' },
  { label: 'Jarvis', value: 'explain jarvis' },
  { label: 'Contact', value: 'open contact' },
];

const initialAssistantHistory = [
  {
    role: 'assistant',
    text: 'Jarvis portfolio console online. Ask about Abhiram, projects, skills, contact, or say "open work".',
  },
];

const assistantHints = ['open work', 'show skills', 'explain Jarvis', 'contact Abhiram'];

const getSpeechRecognition = () => {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

function App() {
  const year = new Date().getFullYear();
  const heroRef = useRef(null);
  const recognitionRef = useRef(null);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantHistory, setAssistantHistory] = useState(initialAssistantHistory);
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantTranscript, setAssistantTranscript] = useState('');
  const [assistantListening, setAssistantListening] = useState(false);
  const [assistantBusy, setAssistantBusy] = useState(false);
  const [assistantMode, setAssistantMode] = useState('portfolio');

  const speakReply = (message) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const getLocalAssistantReply = (rawCommand) => {
    const command = rawCommand.toLowerCase();
    let key = 'jarvis';
    let target = null;
    let message = assistantReplies.jarvis;

    if (command.includes('project') || command.includes('work') || command.includes('portfolio')) {
      key = 'projects';
      target = '#work';
    } else if (command.includes('skill') || command.includes('technology') || command.includes('tech')) {
      key = 'skills';
    } else if (command.includes('contact') || command.includes('email') || command.includes('hire')) {
      key = 'contact';
      target = '#contact';
    } else if (command.includes('about') || command.includes('who is abhiram') || command.includes('profile')) {
      message =
        'Abhiram K. is a Computer Science graduate and Software Support Head focused on practical AI tools, computer vision, OCR automation, and support workflows.';
      target = '#about';
      return { message, target, mode: 'profile' };
    } else if (command.includes('github')) {
      message = 'Opening Abhiram\'s GitHub profile.';
      return { message, target: 'https://github.com/abhiramk-10', mode: 'external' };
    } else if (command.includes('linkedin')) {
      message = 'Opening Abhiram\'s LinkedIn profile.';
      return { message, target: 'https://linkedin.com/in/abhiramkofficial', mode: 'external' };
    } else if (command.includes('jarvis') || command.includes('assistant') || command.includes('voice')) {
      key = 'jarvis';
      target = '#jarvis';
    }

    message = assistantReplies[key];
    return { message, target, mode: key };
  };

  const queryLocalJarvis = async (message) => {
    if (window.location.protocol === 'https:') {
      return null;
    }

    const response = await fetch('http://localhost:8006/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_name: 'portfolio visitor',
        message,
        enable_voice: false,
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.response || null;
  };

  const applyAssistantTarget = (target) => {
    if (!target) return;

    if (target.startsWith('http')) {
      window.open(target, '_blank', 'noopener,noreferrer');
      return;
    }

    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const runAssistantCommand = async (rawCommand, options = {}) => {
    const command = rawCommand.trim();
    if (!command) return;

    setAssistantBusy(true);
    setAssistantHistory((history) => [...history, { role: 'user', text: command }]);

    let reply = null;
    let localResult = getLocalAssistantReply(command);

    if (command.toLowerCase().startsWith('ask jarvis')) {
      try {
        reply = await queryLocalJarvis(command.replace(/^ask jarvis\s*:?\s*/i, ''));
        if (reply) {
          setAssistantMode('jarvis bridge');
          localResult = { message: reply, target: null, mode: 'jarvis bridge' };
        }
      } catch {
        reply = null;
      }
    }

    const message = reply || localResult.message;
    setAssistantMode(localResult.mode || 'portfolio');
    setAssistantHistory((history) => [...history, { role: 'assistant', text: message }]);
    setAssistantBusy(false);

    if (options.speak !== false) {
      speakReply(message);
    }

    applyAssistantTarget(localResult.target);
  };

  const handleAssistantPrompt = (value) => {
    runAssistantCommand(value);
  };

  const handleAssistantSubmit = (event) => {
    event.preventDefault();
    const command = assistantInput.trim();
    setAssistantInput('');
    runAssistantCommand(command);
  };

  const clearAssistantHistory = () => {
    setAssistantHistory(initialAssistantHistory);
    setAssistantTranscript('');
    setAssistantMode('portfolio');
  };

  const toggleVoiceAssistant = () => {
    const Recognition = getSpeechRecognition();

    if (!Recognition) {
      const message = 'Voice recognition is not supported in this browser. You can still use the quick prompt buttons.';
      setAssistantHistory((history) => [...history, { role: 'assistant', text: message }]);
      speakReply(message);
      return;
    }

    if (assistantListening) {
      recognitionRef.current?.stop();
      setAssistantListening(false);
      return;
    }

    const recognition = new Recognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-IN';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setAssistantListening(true);
      setAssistantTranscript('Listening...');
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(' ')
        .trim();

      setAssistantTranscript(transcript);

      if (event.results[event.results.length - 1].isFinal) {
        runAssistantCommand(transcript);
      }
    };

    recognition.onerror = () => {
      setAssistantListening(false);
      setAssistantTranscript('Voice command failed. Try again or use a quick prompt.');
    };

    recognition.onend = () => {
      setAssistantListening(false);
    };

    recognition.start();
  };

  const handleHeroPointerMove = (event) => {
    if (event.pointerType === 'touch') return;

    const hero = heroRef.current;
    if (!hero) return;

    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    hero.style.setProperty('--cursor-x', x.toFixed(3));
    hero.style.setProperty('--cursor-y', y.toFixed(3));
    hero.style.setProperty('--wash-x', `${(x * 24).toFixed(2)}px`);
    hero.style.setProperty('--portrait-x', `${(x * 42).toFixed(2)}px`);
    hero.style.setProperty('--portrait-y', `${(y * 14).toFixed(2)}px`);
    hero.style.setProperty('--tilt-y', `${(x * -22).toFixed(2)}deg`);
    hero.style.setProperty('--tilt-x', `${(y * 10).toFixed(2)}deg`);
    hero.style.setProperty('--image-x', `${(x * -28).toFixed(2)}px`);
    hero.style.setProperty('--image-y', `${(y * -8).toFixed(2)}px`);
    hero.style.setProperty('--shadow-x', `${(x * -34).toFixed(2)}px`);
    hero.style.setProperty('--active-copy-x', `${(x * 12).toFixed(2)}px`);
    hero.style.setProperty('--muted-copy-x', `${(x * -14).toFixed(2)}px`);
    hero.dataset.focus = x < 0 ? 'left' : 'right';
  };

  const resetHeroPointer = () => {
    const hero = heroRef.current;
    if (!hero) return;

    hero.style.setProperty('--cursor-x', '0');
    hero.style.setProperty('--cursor-y', '0');
    hero.style.setProperty('--wash-x', '0px');
    hero.style.setProperty('--portrait-x', '0px');
    hero.style.setProperty('--portrait-y', '0px');
    hero.style.setProperty('--tilt-y', '0deg');
    hero.style.setProperty('--tilt-x', '0deg');
    hero.style.setProperty('--image-x', '0px');
    hero.style.setProperty('--image-y', '0px');
    hero.style.setProperty('--shadow-x', '0px');
    hero.style.setProperty('--active-copy-x', '0px');
    hero.style.setProperty('--muted-copy-x', '0px');
    hero.dataset.focus = 'center';
  };

  return (
    <main className="site-shell">
      <header className="topbar" aria-label="Primary navigation">
        <a className="brand" href="#home" aria-label="Abhiram K home">
          Abhiram K.
        </a>
        <nav className="nav-links">
          <a href="#about">about</a>
          <a href="#jarvis">jarvis</a>
          <a href="#work">work</a>
          <a href="#contact">contact</a>
        </nav>
      </header>

      <section
        id="home"
        className="hero-section"
        ref={heroRef}
        data-focus="center"
        onPointerMove={handleHeroPointerMove}
        onPointerLeave={resetHeroPointer}
      >
        <Motion.div
          className="hero-copy hero-copy-left"
        >
          <p className="role-label">ai builder</p>
          <h1>Computer science graduate building practical AI tools.</h1>
          <p>
            I work across computer vision, automation, support engineering,
            and software that makes repeated work easier.
          </p>
          <a className="text-link" href="#work">
            See latest work <ExternalLink size={17} aria-hidden="true" />
          </a>
          <div className="hero-facts" aria-label="Portfolio highlights">
            <span>OpenCV + OCR</span>
            <span>AI/ML learner</span>
            <span>Support lead</span>
          </div>
        </Motion.div>

        <Motion.div
          className="hero-portrait-shell"
          aria-label="Interactive portrait of Abhiram K"
        >
          <div className="hero-portrait">
            <div className="portrait-frame">
              <img
                src="/profile.jpg"
                alt="Abhiram K."
                onError={(event) => {
                  event.currentTarget.hidden = true;
                }}
              />
              <div className="portrait-fallback" aria-hidden="true">
                AK
              </div>
            </div>
            <span className="portrait-shadow" aria-hidden="true" />
          </div>
        </Motion.div>

        <Motion.div
          className="hero-copy hero-copy-right"
        >
          <p className="role-label">&lt; coder &gt;</p>
          <h2>Calm support, clean systems, fast learning.</h2>
          <p>
            Currently Software Support Head at Vestano International Pvt. Ltd.,
            with hands-on roots in Python, Linux, SQL, DSA, and automation.
          </p>
          <a className="text-link" href="#contact">
            Start a conversation <Mail size={17} aria-hidden="true" />
          </a>
          <div className="availability-note" aria-label="Availability">
            <span>Available for AI, support engineering, and computer vision work</span>
          </div>
        </Motion.div>
      </section>

      <section id="about" className="about-band">
        <Motion.div
          className="about-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
        >
          <Motion.div variants={fadeUp}>
            <p className="section-kicker">about</p>
            <h2>Software, AI, and the patience to debug real workflows.</h2>
          </Motion.div>
          <Motion.div className="about-text" variants={fadeUp}>
            <p>
              I am Abhiram K., a Computer Science graduate from the University
              of Calicut. I like building systems that make practical jobs
              easier, especially where AI, vision, and automation can reduce
              repeated manual effort.
            </p>
            <p>
              At work, I support software operations and users. Outside work,
              I keep learning AI/ML tools and stay active in volunteering
              communities including NSS and IRCS.
            </p>
            <div className="location">
              <MapPin size={18} aria-hidden="true" />
              India
            </div>
          </Motion.div>
        </Motion.div>
      </section>

      <section className="skills-strip" aria-label="Technical skills">
        {skills.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </section>

      <section id="jarvis" className="jarvis-section">
        <Motion.div
          className="jarvis-hero"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={stagger}
        >
          <Motion.div className="jarvis-copy" variants={fadeUp}>
            <p className="section-kicker">jarvis assistant</p>
            <h2>A local AI assistant built around voice, vision, and memory.</h2>
            <p>
              Jarvis is my personal assistant system: voice commands, camera
              recognition, memory, Malayalam learning, diagnostics, and LLM
              provider fallbacks running from a local-first setup.
            </p>
            <div className="jarvis-status" aria-label="Jarvis feature status">
              <span>Local runtime</span>
              <span>Voice loop</span>
              <span>Vision enabled</span>
            </div>
          </Motion.div>

          <Motion.div className="jarvis-console" variants={fadeUp} aria-label="Jarvis assistant preview">
            <div className="console-topbar">
              <span />
              <span />
              <span />
              <strong>JARVIS_CORE</strong>
            </div>
            <div className="assistant-orb" aria-hidden="true">
              <Bot size={58} />
            </div>
            <div className="console-lines">
              <p><span>user</span> Jarvis, scan the room.</p>
              <p><span>vision</span> Camera online. Face recognition ready.</p>
              <p><span>jarvis</span> Ready for commands, memory, and diagnostics.</p>
            </div>
            <div className="voice-meter" aria-hidden="true">
              {Array.from({ length: 18 }).map((_, index) => (
                <i key={index} style={{ '--bar': (index % 6) + 1 }} />
              ))}
            </div>
          </Motion.div>
        </Motion.div>

        <Motion.div
          className="jarvis-capabilities"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={stagger}
        >
          {jarvisCapabilities.map((capability) => {
            const Icon = capability.icon;
            return (
              <Motion.article className="jarvis-capability" key={capability.title} variants={fadeUp}>
                <Icon size={24} aria-hidden="true" />
                <h3>{capability.title}</h3>
                <p>{capability.description}</p>
              </Motion.article>
            );
          })}
        </Motion.div>
      </section>

      <section id="systems" className="systems-section">
        <Motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={stagger}
        >
          <Motion.div className="section-heading systems-heading" variants={fadeUp}>
            <div>
              <p className="section-kicker">separate sections</p>
              <h2>Portfolio profile and assistant system, clearly separated.</h2>
            </div>
            <p>
              One surface explains me and my work. The other is the assistant
              system I am building, testing, and improving.
            </p>
          </Motion.div>

          <div className="systems-grid">
            {systems.map((system) => {
              const Icon = system.icon;
              return (
                <Motion.article className="system-card" key={system.title} variants={fadeUp}>
                  <div className="system-card-top">
                    <Icon size={28} aria-hidden="true" />
                    <span>{system.label}</span>
                  </div>
                  <h3>{system.title}</h3>
                  <p>{system.description}</p>
                  <div className="system-points">
                    {system.points.map((point) => (
                      <span key={point}>{point}</span>
                    ))}
                  </div>
                </Motion.article>
              );
            })}
          </div>
        </Motion.div>
      </section>

      <section id="work" className="work-section">
        <Motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <Motion.div className="section-heading" variants={fadeUp}>
            <p className="section-kicker">portfolio</p>
            <h2>Selected work and experiments</h2>
          </Motion.div>

          <div className="project-list">
            {projects.map((project, index) => (
              <Motion.article className="project-card" key={project.title} variants={fadeUp}>
                <span className="project-index">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <p className="project-type">{project.type}</p>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                </div>
                <div className="project-tags">
                  {project.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </Motion.article>
            ))}
          </div>
        </Motion.div>
      </section>

      <section id="contact" className="contact-section">
        <Motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
        >
          <p className="section-kicker">contact</p>
          <h2>Let us build something useful.</h2>
          <p>
            I am open to software support, AI, computer vision, automation,
            and assistant-system opportunities.
          </p>
          <div className="contact-actions">
            <a className="primary-button" href="mailto:hello@abhiramk.in">
              <Mail size={18} aria-hidden="true" />
              hello@abhiramk.in
            </a>
            <a href="https://github.com/abhiramk-10" target="_blank" rel="noreferrer">
              <Github size={18} aria-hidden="true" />
              GitHub
            </a>
            <a href="https://linkedin.com/in/abhiramkofficial" target="_blank" rel="noreferrer">
              <Linkedin size={18} aria-hidden="true" />
              LinkedIn
            </a>
          </div>
        </Motion.div>
      </section>

      <footer className="site-footer">
        <span>© {year} Abhiram K.</span>
        <a href="#home">Back to top</a>
      </footer>

      <div className={`assistant-widget ${assistantOpen ? 'is-open' : ''}`}>
        {assistantOpen && (
          <div className="assistant-panel" role="dialog" aria-label="Jarvis portfolio assistant">
            <div className="assistant-panel-head">
              <div>
                <p>Jarvis</p>
                <span>{assistantMode} console online</span>
              </div>
              <button type="button" onClick={() => setAssistantOpen(false)} aria-label="Close Jarvis assistant">
                ×
              </button>
            </div>

            <div className="assistant-status-grid" aria-label="Assistant status">
              <span><Sparkles size={14} aria-hidden="true" /> Smart routing</span>
              <span>Voice ready</span>
              <span>Local bridge optional</span>
            </div>

            <div className="assistant-feed" aria-live="polite">
              {assistantHistory.slice(-6).map((entry, index) => (
                <div className={`assistant-bubble ${entry.role}`} key={`${entry.role}-${index}-${entry.text}`}>
                  <span>{entry.role === 'assistant' ? 'jarvis' : 'you'}</span>
                  <p>{entry.text}</p>
                </div>
              ))}
              {assistantBusy && (
                <div className="assistant-bubble assistant">
                  <span>jarvis</span>
                  <p>Thinking...</p>
                </div>
              )}
            </div>

            <button
              type="button"
              className={`assistant-mic ${assistantListening ? 'is-listening' : ''}`}
              onClick={toggleVoiceAssistant}
              aria-pressed={assistantListening}
            >
              <Mic size={18} aria-hidden="true" />
              {assistantListening ? 'Listening...' : 'Start voice command'}
            </button>
            <p className="assistant-transcript" aria-live="polite">
              {assistantTranscript || `Try: ${assistantHints.join(', ')}.`}
            </p>

            <form className="assistant-command-form" onSubmit={handleAssistantSubmit}>
              <input
                type="text"
                value={assistantInput}
                onChange={(event) => setAssistantInput(event.target.value)}
                placeholder="Ask about projects, skills, Jarvis..."
                aria-label="Ask Jarvis portfolio assistant"
              />
              <button type="submit" aria-label="Send message to Jarvis" disabled={assistantBusy}>
                <Send size={17} aria-hidden="true" />
              </button>
            </form>

            <div className="assistant-prompts" aria-label="Jarvis quick prompts">
              {quickPrompts.map((prompt) => (
                <button
                  type="button"
                  key={prompt.label}
                  onClick={() => handleAssistantPrompt(prompt.value)}
                >
                  {prompt.label}
                </button>
              ))}
            </div>
            <button type="button" className="assistant-clear" onClick={clearAssistantHistory}>
              Reset console
            </button>
          </div>
        )}

        <button
          type="button"
          className="assistant-orb-button"
          onClick={() => setAssistantOpen((open) => !open)}
          aria-label="Open Jarvis portfolio assistant"
          aria-expanded={assistantOpen}
        >
          <Bot size={30} aria-hidden="true" />
          <span className="orb-pulse" aria-hidden="true" />
        </button>
      </div>
    </main>
  );
}

export default App;
