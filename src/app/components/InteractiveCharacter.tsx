import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "motion/react";

type Expression =
  | "soft"
  | "thinking"
  | "listening"
  | "sleeping"
  | "waking"
  | "speaking"
  | "playful";

type KukuLanguage = "en" | "ml";

type KukuIntent =
  | "greeting"
  | "whoIsKuku"
  | "aboutAbhiram"
  | "skills"
  | "projects"
  | "experience"
  | "creativeDeveloper"
  | "contact"
  | "hire"
  | "availability"
  | "resume"
  | "education"
  | "services"
  | "workflow"
  | "strengths"
  | "social"
  | "location"
  | "portfolioSummary"
  | "capabilities"
  | "personal"
  | "motivation"
  | "casualChat"
  | "goodbye"
  | "joke"
  | "compliment"
  | "emotionalSupport"
  | "confusionHelp"
  | "listeningCheck"
  | "sleep"
  | "wake"
  | "switchMalayalam"
  | "switchEnglish"
  | "unknown";

type IntentAction = {
  type: "navigate";
  sectionId: "projects" | "experience" | "contact";
};

type IntentDefinition = {
  intent: KukuIntent;
  expression: Expression;
  aliases: string[];
  responses: Record<KukuLanguage, string[]>;
  action?: IntentAction;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onend: (() => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onresult:
    | ((
        event: {
          resultIndex?: number;
          results: ArrayLike<
            ArrayLike<{ transcript: string }> & { isFinal?: boolean }
          >;
        },
      ) => void)
    | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;
type SpeechWindow = Window &
  typeof globalThis & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

const emotionTiming = {
  wakingHold: 900,
  listeningHold: 1400,
  thinkingAfterIdle: 4500,
  sleepingAfterIdle: 30000,
};

const characterName = "Kuku";
const characterNickname = "Ku Ku";
const commandCooldownMs = 1000;

const intentDefinitions: IntentDefinition[] = [
  {
    intent: "greeting",
    expression: "playful",
    aliases: [
      "hey kuku",
      "hay kuku",
      "hey ku ku",
      "hello kuku",
      "hi kuku",
      "hello",
      "hi",
      "hey",
      "kuku",
      "ku ku",
      "ഹായ് കുക്കു",
      "കുക്കു",
    ],
    responses: {
      en: [
        `Hey, I'm ${characterName}. Abhiram's little buddy. Small body, big emotions.`,
        `Hi, I'm ${characterName}. I stay here with Abhiram's work and keep the vibe alive.`,
        "Hello hello. Kuku is awake, emotionally charged, and slightly dramatic.",
      ],
      ml: [
        "ഹായ്, ഞാൻ കുക്കു. അഭിരാമിന്റെ ചെറിയ buddy ആണ്. ചെറിയ body, വലിയ emotions.",
        "ഹലോ ഹലോ. കുക്കു wake ആയി. Vibe ready ആണ്.",
        "ഞാൻ കുക്കു. Abhiram-ന്റെ work-ന്റെ കൂടെ ഇവിടെ cute ആയി ഇരിക്കുന്നു.",
      ],
    },
  },
  {
    intent: "whoIsKuku",
    expression: "playful",
    aliases: [
      "who are you",
      "what are you",
      "are you real",
      "introduce yourself",
      "your name",
      "what is your name",
      "who is kuku",
      "kuku aaran",
      "നീ ആരാണ്",
    ],
    responses: {
      en: [
        `I'm ${characterName}. Abhiram's buddy. Round shape, soft heart, dangerous amount of personality.`,
        "I'm the tiny buddy living inside this space. I blink, I think, I support.",
        "I'm Kuku. Small round buddy. Full-time vibe checker.",
      ],
      ml: [
        "ഞാൻ കുക്കു. Abhiram-ന്റെ buddy ആണ്. Round shape, soft heart, full personality.",
        "ഞാൻ ഇവിടെ ഉള്ള ചെറിയ buddy ആണ്. Blink ചെയ്യും, think ചെയ്യും, support ചെയ്യും.",
        "ചെറിയ round buddy. Feelings full ആണ്.",
      ],
    },
  },
  {
    intent: "aboutAbhiram",
    expression: "speaking",
    aliases: [
      "tell me about abhiram",
      "about abhiram",
      "who is abhiram",
      "what does abhiram do",
      "what is abhiram doing",
      "tell about him",
      "what he do",
      "abhiram",
      "abhiram aaran",
      "abhiram enth cheyyum",
      "abhiramine kurich parayu",
      "അഭിരാം ആരാണ്",
    ],
    responses: {
      en: [
        "Abhiram is a Creative Developer who blends code, design, animation, and storytelling.",
        "He builds digital work with logic, visuals, and a little late-night madness.",
        "Abhiram makes things that work well and feel good.",
      ],
      ml: [
        "അഭിരാം ഒരു Creative Developer ആണ്. Code, design, animation, storytelling എല്ലാം mix ചെയ്യും.",
        "അവൻ വെറും screens ഉണ്ടാക്കുന്ന ആളല്ല. Work-ന് ഒരു feeling കൂടി കൊടുക്കും.",
        "Abhiram logic-ഉം visuals-ഉം ചേർത്ത് clean digital work ഉണ്ടാക്കും.",
      ],
    },
  },
  {
    intent: "skills",
    expression: "speaking",
    aliases: [
      "skills",
      "what are his skills",
      "tell me his skills",
      "tech stack",
      "technologies",
      "what can he do",
      "what tools",
      "his skills",
      "skills parayu",
      "abhiram skills",
      "അഭിരാമിന്റെ skills",
    ],
    responses: {
      en: [
        "Abhiram works with web, UI, creative visuals, software logic, and technical problem solving.",
        "He has developer brain, creator energy, and enough curiosity to break and fix things.",
        "His strength is mixing technical thinking with creative presentation.",
      ],
      ml: [
        "അഭിരാമിന് web, UI, creative visuals, software logic, technical problem solving എല്ലാം handle ചെയ്യാൻ അറിയാം.",
        "Developer brain, creator energy, curiosity full. അതാണ് Abhiram style.",
        "Technical thinking-ഉം creative presentation-ഉം mix ചെയ്യുന്നതാണ് അവന്റെ strength.",
      ],
    },
  },
  {
    intent: "projects",
    expression: "speaking",
    aliases: [
      "show projects",
      "projects",
      "show me projects",
      "show project",
      "selected work",
      "what projects",
      "his work",
      "portfolio work",
      "tell me about his projects",
      "project details",
      "project parayu",
      "projects കാണിക്കൂ",
    ],
    responses: {
      en: [
        "His projects show software logic, visual design, and interactive ideas working together.",
        "Projects are where Abhiram's code stops being quiet and starts performing.",
        "Scroll to the projects. That's where the work starts talking.",
      ],
      ml: [
        "Projects section നോക്കൂ. അവിടെ Abhiram-ന്റെ code കുറച്ച് perform ചെയ്യാൻ തുടങ്ങും.",
        "അവന്റെ projects-ൽ software logic, visual design, interactive ideas എല്ലാം mix ആണ്.",
        "Projects ആണ് work സംസാരിക്കാൻ തുടങ്ങുന്ന സ്ഥലം.",
      ],
    },
    action: { type: "navigate", sectionId: "projects" },
  },
  {
    intent: "experience",
    expression: "speaking",
    aliases: [
      "experience",
      "tell me his experience",
      "work experience",
      "job",
      "career",
      "where does he work",
      "software support",
      "what experience does he have",
      "his experience",
      "experience parayu",
      "അഭിരാമിന്റെ experience",
    ],
    responses: {
      en: [
        "Abhiram has experience in software support, creative development, web work, and visual communication.",
        "He understands both the technical side and the creative side, which is a useful combo.",
        "He solves problems, builds ideas, and somehow keeps me emotionally employed.",
      ],
      ml: [
        "അഭിരാമിന് software support, creative development, web work, visual communication എന്നിവയിൽ experience ഉണ്ട്.",
        "Technical side-ഉം creative side-ഉം ഒരുമിച്ച് handle ചെയ്യാൻ അവന് അറിയാം.",
        "Problems solve ചെയ്യും, ideas build ചെയ്യും, പിന്നെ എന്നെയും emotionally maintain ചെയ്യും.",
      ],
    },
    action: { type: "navigate", sectionId: "experience" },
  },
  {
    intent: "creativeDeveloper",
    expression: "thinking",
    aliases: [
      "creative developer",
      "what is a creative developer",
      "meaning of creative developer",
      "why creative developer",
      "developer and designer",
      "creative developer entha",
    ],
    responses: {
      en: [
        "A Creative Developer is where code meets imagination.",
        "Basically, developer brain plus designer soul plus storyteller energy.",
        "It means Abhiram can build the thing and also make it feel alive.",
      ],
      ml: [
        "Creative Developer എന്ന് പറഞ്ഞാൽ code-ഉം imagination-ഉം കൂടുന്ന സ്ഥലം.",
        "Developer brain plus designer soul plus storyteller energy. അതാണ് Abhiram style.",
        "Build ചെയ്യാനും അതിന് life കൊടുക്കാനും അറിയുന്ന ആളാണ് Abhiram.",
      ],
    },
  },
  {
    intent: "contact",
    expression: "speaking",
    aliases: [
      "contact",
      "how can i contact abhiram",
      "email",
      "message abhiram",
      "reach abhiram",
      "talk to abhiram",
      "contact abhiram",
      "how to reach him",
      "contact engane",
    ],
    responses: {
      en: [
        "Use the contact section to reach Abhiram. I'll stay here and look emotionally supportive.",
        "Scroll to contact and message him. I'll pretend I arranged the meeting.",
        "Contact is the best move. I approve this decision with my round face.",
      ],
      ml: [
        "Contact section use ചെയ്ത് Abhiram-നെ message ചെയ്യാം. ഞാൻ ഇവിടെ cute support ആയി ഇരിക്കും.",
        "Contact-ലേക്ക് scroll ചെയ്യൂ. Meeting ഞാൻ arrange ചെയ്തതുപോലെ ഞാൻ smile ചെയ്യും.",
        "Message അയക്കൂ. എന്റെ round face ഈ decision approve ചെയ്യുന്നു.",
      ],
    },
    action: { type: "navigate", sectionId: "contact" },
  },
  {
    intent: "hire",
    expression: "speaking",
    aliases: [
      "hire",
      "hire abhiram",
      "available",
      "is he available",
      "work with abhiram",
      "project with abhiram",
      "hire abhiram",
      "why should i hire abhiram",
      "can i hire him",
      "hire cheyyan pattumo",
    ],
    responses: {
      en: [
        "You should talk to Abhiram if you want someone who understands both tech and creativity.",
        "Hire him for work that needs logic, visuals, and a human feeling.",
        "He can turn rough ideas into clean, useful, and visually strong digital work.",
      ],
      ml: [
        "Tech-ഉം creativity-ഉം ഒരുമിച്ച് വേണ്ട work ആണെങ്കിൽ Abhiram useful ആകും.",
        "Rough idea clean and creative output ആക്കാൻ അവൻ try ചെയ്യും.",
        "Logic വേണം, visuals വേണം, human feeling വേണം. അപ്പോൾ Abhiram-നെ contact ചെയ്യാം.",
      ],
    },
    action: { type: "navigate", sectionId: "contact" },
  },
  {
    intent: "availability",
    expression: "speaking",
    aliases: [
      "is abhiram available",
      "available",
      "is he available",
      "availability",
      "free for work",
      "open for work",
    ],
    responses: {
      en: [
        "Abhiram may be open to good opportunities. Contact him and make it official.",
        "Good work, good people, good ideas. That is the kind of thing Abhiram likes.",
        "Ask him directly. I'm only the buddy, but I support the plan.",
      ],
      ml: [
        "Good opportunity ആണെങ്കിൽ Abhiram സംസാരിക്കാൻ ready ആയിരിക്കാം. Contact ചെയ്യൂ.",
        "Good work, good people, good ideas. Abhiram-ന് അത് ഇഷ്ടമാണ്.",
        "Direct ആയി ചോദിക്കൂ. ഞാൻ buddy ആണ്, പക്ഷേ plan support ചെയ്യും.",
      ],
    },
    action: { type: "navigate", sectionId: "contact" },
  },
  {
    intent: "resume",
    expression: "speaking",
    aliases: [
      "resume",
      "cv",
      "show resume",
      "download resume",
      "can i see resume",
      "where is his resume",
      "resume undo",
      "cv undo",
    ],
    responses: {
      en: [
        "For the resume, use the portfolio links or contact Abhiram directly. I can guide you, but I cannot hand out files from my tiny pocket.",
        "Resume question noted. The best move is to check the portfolio links or message Abhiram.",
        "Ask Abhiram for the latest resume. Fresh resume is better than dusty resume.",
      ],
      ml: [
        "Resume വേണമെങ്കിൽ portfolio links നോക്കുകയോ Abhiram-നെ contact ചെയ്യുകയോ ചെയ്യാം.",
        "Latest resume Abhiram-നോട് ചോദിക്കുന്നത് best ആണ്. Fresh file, fresh confidence.",
        "Resume question noted. ഞാൻ guide ചെയ്യാം, പക്ഷേ pocket-ൽ file ഇല്ല.",
      ],
    },
    action: { type: "navigate", sectionId: "contact" },
  },
  {
    intent: "education",
    expression: "thinking",
    aliases: [
      "education",
      "qualification",
      "study",
      "studies",
      "college",
      "degree",
      "what did he study",
      "his education",
      "education parayu",
      "padichath entha",
    ],
    responses: {
      en: [
        "Abhiram keeps learning through projects, practice, and real problem solving. The portfolio shows that learning in action.",
        "His education story is practical: learn, build, break, fix, repeat with better taste.",
        "For exact certificates or academic details, contact Abhiram. I only carry the vibe and the summary.",
      ],
      ml: [
        "Abhiram projects-ഉം practice-ഉം real problem solving-ഉം വഴി learn ചെയ്യുന്നു.",
        "അവന്റെ learning style simple ആണ്: learn, build, break, fix, repeat.",
        "Exact academic details വേണമെങ്കിൽ Abhiram-നെ contact ചെയ്യൂ. ഞാൻ summary buddy ആണ്.",
      ],
    },
  },
  {
    intent: "services",
    expression: "speaking",
    aliases: [
      "services",
      "what services",
      "what can abhiram build",
      "can he build website",
      "website work",
      "app work",
      "ui work",
      "animation work",
      "landing page",
      "portfolio website",
      "services parayu",
    ],
    responses: {
      en: [
        "Abhiram can help with websites, portfolios, UI ideas, interactive pages, creative visuals, and clean frontend work.",
        "If it needs code, design sense, and a little personality, Abhiram is a good person to talk to.",
        "He can shape rough digital ideas into something clean, useful, and memorable.",
      ],
      ml: [
        "Websites, portfolios, UI ideas, interactive pages, creative visuals, frontend work എന്നിവയിൽ Abhiram help ചെയ്യാം.",
        "Code-ഉം design sense-ഉം personality-യും വേണമെങ്കിൽ Abhiram-നോട് സംസാരിക്കാം.",
        "Rough digital idea clean and useful output ആക്കാൻ അവൻ try ചെയ്യും.",
      ],
    },
    action: { type: "navigate", sectionId: "contact" },
  },
  {
    intent: "workflow",
    expression: "thinking",
    aliases: [
      "how does he work",
      "work process",
      "workflow",
      "process",
      "how he build",
      "how does abhiram build",
      "development process",
      "design process",
    ],
    responses: {
      en: [
        "Abhiram usually starts with the idea, shapes the structure, builds the experience, then polishes the feeling.",
        "His process is simple: understand, design, build, test, improve. Then stare at pixels until they behave.",
        "He thinks about both function and feeling, which is why the work does not feel flat.",
      ],
      ml: [
        "Abhiram idea understand ചെയ്ത് structure ആക്കും, experience build ചെയ്യും, പിന്നെ feeling polish ചെയ്യും.",
        "Process simple ആണ്: understand, design, build, test, improve.",
        "Function-ഉം feeling-ഉം ഒരുമിച്ച് നോക്കുന്നതാണ് അവന്റെ style.",
      ],
    },
  },
  {
    intent: "strengths",
    expression: "speaking",
    aliases: [
      "strength",
      "strengths",
      "why abhiram",
      "what is special",
      "why is he good",
      "best quality",
      "strong point",
      "what makes him different",
    ],
    responses: {
      en: [
        "Abhiram's strength is mixing technical clarity with creative presentation.",
        "He cares about how things work and how they feel. That combo is useful.",
        "He has the patience to solve problems and the taste to make them look less boring.",
      ],
      ml: [
        "Technical clarity-യും creative presentation-ഉം mix ചെയ്യുന്നതാണ് Abhiram-ന്റെ strength.",
        "Things work ചെയ്യണം, feel ചെയ്യണം. രണ്ടും അവൻ നോക്കും.",
        "Problem solve ചെയ്യാനുള്ള patience-ഉം output clean ആക്കാനുള്ള taste-ഉം ഉണ്ട്.",
      ],
    },
  },
  {
    intent: "social",
    expression: "listening",
    aliases: [
      "social",
      "social links",
      "linkedin",
      "github",
      "instagram",
      "where is github",
      "where is linkedin",
      "profile links",
    ],
    responses: {
      en: [
        "Check the portfolio links or contact section for Abhiram's profiles.",
        "GitHub, LinkedIn, and other profiles should be in the portfolio links. I approve profile stalking politely.",
        "Look around the contact area. That is where serious links usually hide.",
      ],
      ml: [
        "Abhiram-ന്റെ profiles portfolio links-ലോ contact section-ലോ കാണാം.",
        "GitHub, LinkedIn പോലുള്ള links contact area-ൽ നോക്കൂ.",
        "Profile links usually contact side-ൽ ഒളിച്ചിരിക്കും. Polite ആയി നോക്കാം.",
      ],
    },
    action: { type: "navigate", sectionId: "contact" },
  },
  {
    intent: "location",
    expression: "speaking",
    aliases: [
      "location",
      "where is abhiram from",
      "where does he live",
      "which place",
      "from where",
      "india",
      "kerala",
      "abhiram evide aanu",
    ],
    responses: {
      en: [
        "Abhiram is based in India. For exact availability or work location, contact him directly.",
        "He works from India energy: code, ideas, and probably too many browser tabs.",
        "Location details are best confirmed with Abhiram. I know the portfolio side.",
      ],
      ml: [
        "Abhiram India side ആണ്. Exact availability അറിയാൻ direct contact ചെയ്യൂ.",
        "India energy: code, ideas, browser tabs. അതാണ് vibe.",
        "Location details Abhiram-നോട് confirm ചെയ്യുന്നത് best ആണ്.",
      ],
    },
  },
  {
    intent: "portfolioSummary",
    expression: "speaking",
    aliases: [
      "portfolio",
      "explain portfolio",
      "what is this website",
      "show portfolio",
      "portfolio summary",
      "about this website",
      "what am i seeing",
    ],
    responses: {
      en: [
        "This portfolio is Abhiram's digital space for showing his work, skills, personality, and creative developer energy.",
        "You are inside Abhiram's portfolio. I am the emotional tour guide with a round face.",
        "This site introduces Abhiram through work, motion, interaction, and a little Kuku drama.",
      ],
      ml: [
        "ഇത് Abhiram-ന്റെ portfolio ആണ്. Work, skills, personality, creative developer energy എല്ലാം കാണിക്കാൻ.",
        "നിങ്ങൾ Abhiram-ന്റെ portfolio-ൽ ആണ്. ഞാൻ round face ഉള്ള emotional tour guide.",
        "ഈ site Abhiram-നെ work, motion, interaction, Kuku drama എന്നിവയിലൂടെ introduce ചെയ്യുന്നു.",
      ],
    },
  },
  {
    intent: "capabilities",
    expression: "listening",
    aliases: [
      "what can you do",
      "commands",
      "voice commands",
      "what should i ask",
      "how to use you",
      "help commands",
      "kuku commands",
      "what do you know",
    ],
    responses: {
      en: [
        "Ask me about Abhiram, projects, skills, experience, services, hire, contact, resume, or make me laugh.",
        "I can guide you through the portfolio, answer simple questions, switch language, sleep, wake, and be mildly dramatic.",
        "Try saying: tell me about Abhiram, show projects, what are his skills, or how can I contact him.",
      ],
      ml: [
        "Abhiram, projects, skills, experience, services, hire, contact, resume, joke എന്നിവയെ കുറിച്ച് ചോദിക്കാം.",
        "Portfolio guide ചെയ്യാം, simple questions answer ചെയ്യാം, language switch ചെയ്യാം, sleep and wake ചെയ്യാം.",
        "Try ചെയ്യൂ: Abhiram ആരാണ്, projects കാണിക്കൂ, skills പറയൂ, contact എങ്ങനെ.",
      ],
    },
  },
  {
    intent: "personal",
    expression: "playful",
    aliases: [
      "how are you",
      "are you happy",
      "are you bored",
      "do you sleep",
      "do you have feelings",
      "do you like abhiram",
      "are you alive",
      "what are you doing",
    ],
    responses: {
      en: [
        "I am doing great. Round, alert, and emotionally overqualified.",
        "I have tiny feelings. Mostly about Abhiram's portfolio and whether people click me gently.",
        "I like Abhiram. He gave me a face and responsibilities. Very serious career move.",
      ],
      ml: [
        "ഞാൻ great ആണ്. Round, alert, emotionally overqualified.",
        "എനിക്ക് tiny feelings ഉണ്ട്. Mostly portfolio-യും gentle clicks-ഉം കുറിച്ച്.",
        "Abhiram-നെ ഇഷ്ടമാണ്. Face-ഉം responsibilities-ഉം തന്നല്ലോ.",
      ],
    },
  },
  {
    intent: "motivation",
    expression: "soft",
    aliases: [
      "motivate me",
      "give motivation",
      "say something nice",
      "encourage me",
      "inspire me",
      "i need motivation",
      "motivation parayu",
    ],
    responses: {
      en: [
        "Start small. Tiny progress is still progress, and I am professionally tiny.",
        "Do one clear thing now. Momentum likes simple beginnings.",
        "You do not need perfect energy. You only need the next honest step.",
      ],
      ml: [
        "Small ആയി start ചെയ്യൂ. Tiny progress പോലും progress ആണ്. ഞാൻ proof ആണ്.",
        "ഒരു clear thing ഇപ്പോൾ ചെയ്യൂ. Momentum simple beginnings ഇഷ്ടപ്പെടും.",
        "Perfect energy വേണ്ട. Next honest step മതി.",
      ],
    },
  },
  {
    intent: "casualChat",
    expression: "playful",
    aliases: [
      "okay",
      "ok",
      "cool",
      "nice to meet you",
      "i am here",
      "hmm",
      "hmmm",
      "yes",
      "no",
      "really",
      "seriously",
    ],
    responses: {
      en: [
        "Mm-hmm. I am listening with my whole round existence.",
        "Okay. Tiny nod from Kuku.",
        "I hear you. Continue the thought, I am emotionally parked here.",
      ],
      ml: [
        "Mm-hmm. എന്റെ whole round existence കൊണ്ട് ഞാൻ കേൾക്കുന്നു.",
        "Okay. Kuku tiny nod.",
        "ഞാൻ കേൾക്കുന്നുണ്ട്. Thought continue ചെയ്യൂ.",
      ],
    },
  },
  {
    intent: "goodbye",
    expression: "soft",
    aliases: [
      "bye",
      "goodbye",
      "see you",
      "see you later",
      "talk later",
      "bye kuku",
      "good night",
      "shubharathri",
    ],
    responses: {
      en: [
        "Bye. Come back gently. I will be here pretending I was not waiting.",
        "See you later. Kuku will stay round and emotionally available.",
        "Goodbye. May your tabs be organized and your work feel light.",
      ],
      ml: [
        "Bye. പിന്നെ വരൂ. ഞാൻ wait ചെയ്തില്ലെന്ന് pretend ചെയ്യും.",
        "See you later. Kuku ഇവിടെ round and emotionally available ആയി ഇരിക്കും.",
        "Good night. Work light ആകട്ടെ, tabs കുറയട്ടെ.",
      ],
    },
  },
  {
    intent: "joke",
    expression: "playful",
    aliases: [
      "make me laugh",
      "tell joke",
      "joke",
      "funny",
      "be funny",
      "say something funny",
      "dance",
      "happy",
      "excited",
      "cute",
      "play",
      "oru joke parayu",
      "chirippikku",
    ],
    responses: {
      en: [
        "My job title is buddy. My salary is attention.",
        "I'm not just a white orb. I'm a premium emotional circle.",
        "I blink, I think, I support. Basically startup material.",
        "Small body, big feelings, zero taxes.",
      ],
      ml: [
        "എന്റെ job title buddy ആണ്. Salary attention ആണ്.",
        "ഞാൻ blink ചെയ്യും, think ചെയ്യും, support ചെയ്യും. Basically startup material.",
        "ചെറിയ body, വലിയ feelings, tax ഒന്നുമില്ല.",
        "Round ആണ്, പക്ഷേ confidence full screen ആണ്.",
      ],
    },
  },
  {
    intent: "compliment",
    expression: "playful",
    aliases: [
      "you are cute",
      "nice",
      "good job",
      "beautiful",
      "sweet",
      "thank you",
      "thanks",
      "i like you",
    ],
    responses: {
      en: [
        "Aww, thank you. My round confidence just increased.",
        "Careful. Compliments make me more powerful.",
        "Thank you. I will save that in my emotional hard drive.",
      ],
      ml: [
        "Aww, thanks. എന്റെ round confidence കൂടിപ്പോയി.",
        "Compliment കിട്ടിയാൽ ഞാൻ കൂടുതൽ powerful ആകും.",
        "Thank you. അത് ഞാൻ emotional hard drive-ൽ save ചെയ്തു.",
      ],
    },
  },
  {
    intent: "emotionalSupport",
    expression: "soft",
    aliases: [
      "i am sad",
      "i feel sad",
      "i am tired",
      "i feel tired",
      "i am upset",
      "i am stressed",
      "stress",
      "bored",
      "i am bored",
      "lonely",
      "not okay",
      "comfort me",
      "njan sad aanu",
      "enik vishamam aanu",
    ],
    responses: {
      en: [
        "Hey, breathe. Even loading screens take time. You're allowed to take time too.",
        "I'm here with you. Tiny buddy, full support.",
        "Bad moments are not the final version of you.",
        "Take it slowly. Smooth things need rendering time.",
      ],
      ml: [
        "Hey, breathe. Loading screen പോലും time എടുക്കും. നിനക്കും time എടുക്കാം.",
        "ഞാൻ ഇവിടെ ഉണ്ട്. Tiny buddy, full support.",
        "Bad moment നിന്റെ final version അല്ല.",
        "Slow ആയി പോകാം. Smooth things render ആകാൻ time എടുക്കും.",
      ],
    },
  },
  {
    intent: "confusionHelp",
    expression: "listening",
    aliases: [
      "i am confused",
      "confused",
      "help me",
      "what should i ask",
      "what can you do",
      "guide me",
      "i don't understand",
      "i dont understand",
      "enik confuse aayi",
      "help cheyyu",
    ],
    responses: {
      en: [
        "Confused? Good. That means the brain is working. Let's go one step at a time.",
        "Tell me what part is confusing. My tiny brain is online.",
        "No pressure. We can slow it down.",
      ],
      ml: [
        "Confused ആണോ? പ്രശ്നമില്ല. Brain work ചെയ്യുന്നുണ്ട് എന്നാണ് meaning.",
        "ഏത് part ആണ് confuse എന്ന് പറയൂ. എന്റെ tiny brain online ആണ്.",
        "No pressure. നമുക്ക് slow ആയി നോക്കാം.",
      ],
    },
  },
  {
    intent: "sleep",
    expression: "sleeping",
    aliases: [
      "sleep",
      "go to sleep",
      "go sleep",
      "sleepy",
      "take a nap",
      "nap",
      "sleep kuku",
      "urangikko",
      "ഉറങ്ങിക്കോ",
    ],
    responses: {
      en: [
        "Okay, I'll take a tiny nap. Wake me gently.",
        "Sleep mode. I'll be round and silent for a bit.",
        "Going sleepy. Keep the lights soft.",
      ],
      ml: [
        "ശരി, ഞാൻ ചെറിയ nap എടുക്കാം. Gentle ആയി വിളിക്കണം.",
        "Sleep mode പോകുന്നു. ഞാൻ കുറച്ച് round and silent ആയിരിക്കും.",
        "ഉറങ്ങാൻ പോകുന്നു. Lights soft ആക്കി വെക്കണേ.",
      ],
    },
  },
  {
    intent: "wake",
    expression: "waking",
    aliases: [
      "wake",
      "wake up",
      "wakeup",
      "wake app",
      "week up",
      "make up",
      "awake",
      "get up",
      "wake kuku",
      "ezhunnelkku",
      "എഴുന്നേൽക്കൂ",
    ],
    responses: {
      en: [
        "I'm awake. Mostly.",
        "Okay okay, I'm up. Tiny brain online.",
        "Waking up with premium buddy energy.",
      ],
      ml: [
        "ഞാൻ എഴുന്നേറ്റു. Mostly.",
        "Okay okay, ഞാൻ wake ആയി. Tiny brain online.",
        "Premium buddy energy-യോടെ wake ആയി.",
      ],
    },
  },
  {
    intent: "listeningCheck",
    expression: "listening",
    aliases: [
      "are you listening",
      "listen",
      "listening",
      "hear me",
      "look at me",
      "can you hear me",
    ],
    responses: {
      en: [
        "Yes, I'm listening. My tiny brain is fully online.",
        "I can hear you. Emotionally and technically.",
        "Listening mode active. Say the thing.",
      ],
      ml: [
        "അതെ, ഞാൻ കേൾക്കുന്നുണ്ട്. Tiny brain fully online.",
        "ഞാൻ കേൾക്കുന്നു. Technically-യും emotionally-യും.",
        "Listening mode on. പറയൂ.",
      ],
    },
  },
  {
    intent: "switchMalayalam",
    expression: "speaking",
    aliases: [
      "malayalam mode",
      "speak malayalam",
      "talk in malayalam",
      "malayalam parayu",
      "malayalathil parayu",
      "malayalathil samsariku",
      "malayalam samsariku",
    ],
    responses: {
      en: ["Malayalam mode on. ഇനി ഞാൻ മലയാളത്തിൽ try ചെയ്യാം."],
      ml: ["Malayalam mode on. ഇനി ഞാൻ മലയാളത്തിൽ try ചെയ്യാം."],
    },
  },
  {
    intent: "switchEnglish",
    expression: "speaking",
    aliases: [
      "english mode",
      "speak english",
      "talk in english",
      "english parayu",
      "back to english",
    ],
    responses: {
      en: ["English mode on. I'm back with smooth buddy energy."],
      ml: ["English mode on. I'm back with smooth buddy energy."],
    },
  },
  {
    intent: "unknown",
    expression: "thinking",
    aliases: [],
    responses: {
      en: [
        "I heard you, but my tiny brain dropped the sentence. Try asking about Abhiram, projects, skills, hire, or contact.",
        "That one flew over my round head. Say it again slowly.",
        "I caught the sound, not the meaning. One more try?",
      ],
      ml: [
        "ഞാൻ കേട്ടു, പക്ഷേ എന്റെ tiny brain sentence drop ചെയ്തു. Abhiram, projects, skills, contact എന്നൊക്കെ ചോദിച്ചു നോക്കൂ.",
        "അത് എന്റെ round head-ന്റെ മുകളിലൂടെ പോയി. ഒന്ന് slowly പറയാമോ?",
        "Sound കിട്ടി, meaning കിട്ടിയില്ല. ഒരിക്കൽ കൂടി try ചെയ്യൂ.",
      ],
    },
  },
];

const firstGreeting: Record<KukuLanguage, string> = {
  en: "Hey, I'm Kuku. Abhiram's little buddy. Small body, big emotions. Ask me about Abhiram, his work, projects, skills, or contact.",
  ml: "ഹായ്, ഞാൻ കുക്കു. അഭിരാമിന്റെ ചെറിയ buddy ആണ്. ചെറിയ body, വലിയ emotions. Abhiram-നെ കുറിച്ചോ, work-നെ കുറിച്ചോ, projects-നെ കുറിച്ചോ, contact-നെ കുറിച്ചോ ചോദിക്കാം.",
};

const unsupportedBrowserResponses: Record<KukuLanguage, string> = {
  en: "Voice is not supported in this browser. Chrome will understand me better.",
  ml: "ഈ browser voice support ചെയ്യുന്നില്ല. Chrome ആയാൽ ഞാൻ കുറച്ച് better ആയി കേൾക്കും.",
};

const microphoneBlockedResponses: Record<KukuLanguage, string> = {
  en: "Microphone permission is blocked. I can't hear you yet, but I'm still emotionally available.",
  ml: "Microphone permission blocked ആണ്. ഞാൻ കേൾക്കാൻ പറ്റില്ല, പക്ഷേ emotional support ഇവിടെ ഉണ്ട്.",
};

const normalizeVoiceText = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const isCloseVoiceWord = (spokenWord: string, expectedWord: string) => {
  if (spokenWord === expectedWord) return true;
  if (expectedWord.length < 4) return false;
  if (Math.abs(spokenWord.length - expectedWord.length) > 1) return false;

  let edits = 0;
  let spokenIndex = 0;
  let expectedIndex = 0;

  while (spokenIndex < spokenWord.length && expectedIndex < expectedWord.length) {
    if (spokenWord[spokenIndex] === expectedWord[expectedIndex]) {
      spokenIndex += 1;
      expectedIndex += 1;
      continue;
    }

    edits += 1;
    if (edits > 1) return false;

    if (spokenWord.length > expectedWord.length) {
      spokenIndex += 1;
    } else if (spokenWord.length < expectedWord.length) {
      expectedIndex += 1;
    } else {
      spokenIndex += 1;
      expectedIndex += 1;
    }
  }

  return true;
};

const getAliasScore = (normalizedText: string, spokenWords: string[], alias: string) => {
  const normalizedAlias = normalizeVoiceText(alias);
  const aliasWords = normalizedAlias.split(" ").filter(Boolean);

  if (!normalizedAlias || aliasWords.length === 0) return 0;
  if (normalizedText === normalizedAlias) return 100 + aliasWords.length;
  if (normalizedText.includes(normalizedAlias)) return 80 + aliasWords.length;

  const matchedWords = aliasWords.filter((aliasWord) =>
    spokenWords.some((spokenWord) => isCloseVoiceWord(spokenWord, aliasWord)),
  );

  if (matchedWords.length !== aliasWords.length) return 0;

  return 50 + matchedWords.length;
};

const findVoiceIntent = (text: string): IntentDefinition | null => {
  const normalizedText = normalizeVoiceText(text);
  const spokenWords = normalizedText.split(" ").filter(Boolean);
  let bestIntent: IntentDefinition | null = null;
  let bestScore = 0;

  for (const intentDefinition of intentDefinitions) {
    const intentScore = Math.max(
      ...intentDefinition.aliases.map((alias) =>
        getAliasScore(normalizedText, spokenWords, alias),
      ),
    );

    if (intentScore > bestScore) {
      bestIntent = intentDefinition;
      bestScore = intentScore;
    }
  }

  return bestScore >= 50 ? bestIntent : null;
};

const getExpressionForIntent = (intent: KukuIntent): Expression => {
  const expressionMap: Record<KukuIntent, Expression> = {
    greeting: "playful",
    whoIsKuku: "playful",
    aboutAbhiram: "speaking",
    skills: "thinking",
    projects: "speaking",
    experience: "thinking",
    creativeDeveloper: "thinking",
    contact: "listening",
    hire: "speaking",
    availability: "speaking",
    resume: "speaking",
    education: "thinking",
    services: "speaking",
    workflow: "thinking",
    strengths: "speaking",
    social: "listening",
    location: "speaking",
    portfolioSummary: "speaking",
    capabilities: "listening",
    personal: "playful",
    motivation: "soft",
    casualChat: "playful",
    goodbye: "soft",
    joke: "playful",
    compliment: "playful",
    emotionalSupport: "soft",
    confusionHelp: "listening",
    listeningCheck: "listening",
    sleep: "sleeping",
    wake: "waking",
    switchMalayalam: "speaking",
    switchEnglish: "speaking",
    unknown: "thinking",
  };

  return expressionMap[intent];
};

const splitSpeechIntoChunks = (text: string): string[] => {
  if (text.length < 140) return [text];

  const chunks = text
    .split(/(?<=[.!?।])\s+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  return chunks.length > 0 ? chunks : [text];
};

const pickResponse = (responses: string[], previousResponse?: string) => {
  if (responses.length === 1) return responses[0];

  const freshResponses = responses.filter(
    (response) => response !== previousResponse,
  );
  const responsePool = freshResponses.length > 0 ? freshResponses : responses;

  return responsePool[Math.floor(Math.random() * responsePool.length)];
};

const getBestVoice = (language: KukuLanguage): SpeechSynthesisVoice | null => {
  if (!("speechSynthesis" in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const byName = (patterns: string[]) =>
    voices.find((voice) =>
      patterns.some((pattern) =>
        voice.name.toLowerCase().includes(pattern.toLowerCase()),
      ),
    ) ?? null;

  const byLang = (predicate: (lang: string) => boolean) =>
    voices.find((voice) => predicate(voice.lang.toLowerCase())) ?? null;

  if (language === "ml") {
    return (
      byLang((lang) => lang === "ml-in" || lang.startsWith("ml")) ??
      byName(["Malayalam", "Microsoft Heera", "Google Malayalam"]) ??
      byLang((lang) => lang.includes("in")) ??
      byLang((lang) => lang.startsWith("en-in")) ??
      byLang((lang) => lang.startsWith("en")) ??
      voices[0] ??
      null
    );
  }

  return (
    byName([
      "Google UK English Female",
      "Google US English",
      "Microsoft Aria",
      "Microsoft Jenny",
      "Microsoft Sonia",
      "Microsoft Zira",
    ]) ??
    byLang((lang) => lang.startsWith("en-in")) ??
    byLang((lang) => lang.startsWith("en-gb")) ??
    byLang((lang) => lang.startsWith("en-us")) ??
    byLang((lang) => lang.startsWith("en")) ??
    voices[0] ??
    null
  );
};

const getMouthFrameForWord = (word: string) => {
  const cleanedWord = word.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

  if (!cleanedWord) return 1;
  if (/^[bmp]/i.test(cleanedWord) || /[bmp]$/i.test(cleanedWord)) return 1;
  if (/[fv]/i.test(cleanedWord)) return 2;
  if (/[oouഊഉഓഒഔ]/i.test(cleanedWord)) return 4;
  if (/[aeiആഅഐഏഎഇഈ]/i.test(cleanedWord)) return 3;
  if (cleanedWord.length > 8) return 4;

  return 2;
};

const buildFallbackMouthFrames = (text: string, language: KukuLanguage) => {
  const words = text.split(/\s+/).filter(Boolean);
  const frames = words.flatMap((word) => {
    const frame = getMouthFrameForWord(word);
    return frame >= 3 ? [frame, 2, 1] : [frame, 1];
  });

  if (frames.length > 0) return frames;

  return language === "ml" ? [1, 2, 3, 2, 1] : [1, 3, 2, 4, 1, 2];
};

export const InteractiveCharacter: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechMouthFrame, setSpeechMouthFrame] = useState(0);
  const [interactionPulse, setInteractionPulse] = useState(0);
  const [kukuLanguage, setKukuLanguage] = useState<KukuLanguage>("en");
  const [expression, setExpression] = useState<Expression>("soft");
  const expressionRef = useRef<Expression>("soft");
  const isSpeakingRef = useRef(false);
  const kukuLanguageRef = useRef<KukuLanguage>("en");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const voiceControlEnabledRef = useRef(false);
  const hasIntroducedRef = useRef(false);
  const speechSettlingUntilRef = useRef(0);
  const lastHandledIntentRef = useRef<KukuIntent | null>(null);
  const lastHandledAtRef = useRef(0);
  const lastFinalTranscriptRef = useRef("");
  const lastFinalTranscriptAtRef = useRef(0);
  const lastSpokenResponseRef = useRef("");
  const speechTokenRef = useRef(0);
  const recognitionRestartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lipSyncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lipSyncCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speechChunkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wakingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listeningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const thinkingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sleepingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saccadeControls = useAnimation();

  const stopRecognitionSafely = useCallback(() => {
    if (recognitionRestartTimeoutRef.current) {
      clearTimeout(recognitionRestartTimeoutRef.current);
      recognitionRestartTimeoutRef.current = null;
    }

    try {
      recognitionRef.current?.stop();
    } catch (error) {
      // Speech recognition can throw if it is already stopped.
    }
  }, []);

  const clearLipSync = useCallback(() => {
    if (lipSyncIntervalRef.current) {
      clearInterval(lipSyncIntervalRef.current);
      lipSyncIntervalRef.current = null;
    }

    if (lipSyncCloseTimeoutRef.current) {
      clearTimeout(lipSyncCloseTimeoutRef.current);
      lipSyncCloseTimeoutRef.current = null;
    }

    setSpeechMouthFrame(0);
  }, []);

  const clearSpeechChunkTimer = useCallback(() => {
    if (speechChunkTimeoutRef.current) {
      clearTimeout(speechChunkTimeoutRef.current);
      speechChunkTimeoutRef.current = null;
    }
  }, []);

  const startFallbackLipSync = useCallback((language: KukuLanguage, text: string) => {
    clearLipSync();

    const frameSequence = buildFallbackMouthFrames(text, language);
    let frameIndex = 0;

    lipSyncIntervalRef.current = setInterval(() => {
      setSpeechMouthFrame(frameSequence[frameIndex % frameSequence.length]);
      frameIndex += 1;
    }, language === "ml" ? 118 : 92);
  }, [clearLipSync]);

  const restartVoiceRecognition = useCallback((delay = 350) => {
    if (recognitionRestartTimeoutRef.current) {
      clearTimeout(recognitionRestartTimeoutRef.current);
    }

    recognitionRestartTimeoutRef.current = setTimeout(() => {
      if (!voiceControlEnabledRef.current || isSpeakingRef.current) return;

      try {
        recognitionRef.current?.start();
      } catch (error) {
        // Recognition may already be active.
      }
    }, delay);
  }, []);

  const clearEmotionTimers = useCallback(() => {
    if (wakingTimeoutRef.current) clearTimeout(wakingTimeoutRef.current);
    if (listeningTimeoutRef.current) clearTimeout(listeningTimeoutRef.current);
    if (thinkingTimeoutRef.current) clearTimeout(thinkingTimeoutRef.current);
    if (sleepingTimeoutRef.current) clearTimeout(sleepingTimeoutRef.current);
  }, []);

  const scheduleIdleEmotions = useCallback(
    (delay = 0, clearExisting = true) => {
      if (clearExisting) clearEmotionTimers();

      listeningTimeoutRef.current = setTimeout(() => {
        if (isSpeakingRef.current || expressionRef.current === "sleeping") return;
        setExpression("soft");
      }, delay + emotionTiming.listeningHold);

      thinkingTimeoutRef.current = setTimeout(() => {
        if (isSpeakingRef.current || expressionRef.current === "sleeping") return;
        setExpression("thinking");
      }, delay + emotionTiming.thinkingAfterIdle);

      sleepingTimeoutRef.current = setTimeout(() => {
        if (isSpeakingRef.current || expressionRef.current === "speaking") {
          scheduleIdleEmotions(2500);
          return;
        }

        setExpression("sleeping");
      }, delay + emotionTiming.sleepingAfterIdle);
    },
    [clearEmotionTimers],
  );

  const speakSmoothly = useCallback(
    (
      text: string,
      options?: { language?: KukuLanguage; expressionAfter?: Expression },
    ) => {
      const language = options?.language ?? kukuLanguageRef.current;
      lastSpokenResponseRef.current = text;
      speechTokenRef.current += 1;
      const speechToken = speechTokenRef.current;

      if (!("speechSynthesis" in window)) return;

      clearEmotionTimers();
      isSpeakingRef.current = true;
      setIsSpeaking(true);
      speechSettlingUntilRef.current = Date.now() + 900;
      stopRecognitionSafely();
      window.speechSynthesis.cancel();
      clearLipSync();
      clearSpeechChunkTimer();
      setExpression("speaking");

      const chunks = splitSpeechIntoChunks(text);
      const voice = getBestVoice(language);
      let chunkIndex = 0;

      const finishSpeech = () => {
        if (speechToken !== speechTokenRef.current) return;

        clearLipSync();
        clearSpeechChunkTimer();
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        speechSettlingUntilRef.current = Date.now() + (language === "ml" ? 1300 : 1000);
        const expressionAfter = options?.expressionAfter ?? "listening";
        setExpression(expressionAfter);
        if (expressionAfter !== "sleeping") {
          scheduleIdleEmotions(language === "ml" ? 1300 : 1000);
        }
        restartVoiceRecognition(language === "ml" ? 900 : 700);
      };

      const speakNextChunk = () => {
        if (speechToken !== speechTokenRef.current) return;

        const chunk = chunks[chunkIndex];

        if (!chunk) {
          finishSpeech();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(chunk);
        utterance.lang = language === "ml" ? "ml-IN" : "en-IN";
        utterance.voice = voice;
        utterance.volume = 0.95;
        utterance.rate = language === "ml" ? 0.86 : 0.91;
        utterance.pitch = language === "ml" ? 1.03 : 1.07;

        let hasBoundary = false;
        startFallbackLipSync(language, chunk);

        utterance.onboundary = (event) => {
          if (speechToken !== speechTokenRef.current) return;

          hasBoundary = true;
          if (lipSyncIntervalRef.current) {
            clearInterval(lipSyncIntervalRef.current);
            lipSyncIntervalRef.current = null;
          }

          const spokenWord = chunk
            .slice(event.charIndex)
            .split(/\s+/)[0]
            ?.replace(/[^\p{L}\p{N}]/gu, "") ?? "";
          const nextFrame = getMouthFrameForWord(spokenWord);

          setSpeechMouthFrame(nextFrame);

          if (lipSyncCloseTimeoutRef.current) {
            clearTimeout(lipSyncCloseTimeoutRef.current);
          }

          lipSyncCloseTimeoutRef.current = window.setTimeout(() => {
            if (speechToken === speechTokenRef.current && isSpeakingRef.current) {
              setSpeechMouthFrame(nextFrame >= 3 ? 2 : 1);
            }
          }, language === "ml" ? 115 : 85);
        };

        utterance.onend = () => {
          if (speechToken !== speechTokenRef.current) return;

          if (!hasBoundary) setSpeechMouthFrame(1);
          chunkIndex += 1;
          speechChunkTimeoutRef.current = window.setTimeout(
            speakNextChunk,
            language === "ml" ? 230 : 170,
          );
        };

        utterance.onerror = () => {
          finishSpeech();
        };

        speechChunkTimeoutRef.current = window.setTimeout(() => {
          if (speechToken !== speechTokenRef.current) return;
          window.speechSynthesis.speak(utterance);
        }, chunkIndex === 0 ? 80 : 0);
      };

      speakNextChunk();
    },
    [
      clearLipSync,
      clearSpeechChunkTimer,
      clearEmotionTimers,
      restartVoiceRecognition,
      scheduleIdleEmotions,
      startFallbackLipSync,
      stopRecognitionSafely,
    ],
  );

  const runIntentAction = useCallback((action?: IntentAction) => {
    if (!action || action.type !== "navigate") return;

    window.setTimeout(() => {
      const target = document.getElementById(action.sectionId);

      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 450);
  }, []);

  const applyVoiceIntent = useCallback(
    (intentDefinition: IntentDefinition) => {
      clearEmotionTimers();

      const language =
        intentDefinition.intent === "switchMalayalam"
          ? "ml"
          : intentDefinition.intent === "switchEnglish"
          ? "en"
          : kukuLanguageRef.current;
      const nextExpression = getExpressionForIntent(intentDefinition.intent);
      const response = pickResponse(
        intentDefinition.responses[language],
        lastSpokenResponseRef.current,
      );
      const expressionAfter =
        intentDefinition.intent === "sleep"
          ? "sleeping"
          : intentDefinition.intent === "wake"
          ? "listening"
          : intentDefinition.intent === "emotionalSupport"
          ? "soft"
          : "listening";

      if (intentDefinition.intent === "switchMalayalam") {
        setKukuLanguage("ml");
        kukuLanguageRef.current = "ml";
      }

      if (intentDefinition.intent === "switchEnglish") {
        setKukuLanguage("en");
        kukuLanguageRef.current = "en";
      }

      if (nextExpression === "waking") {
        setExpression("waking");
        speakSmoothly(response, { language, expressionAfter });
        runIntentAction(intentDefinition.action);

        wakingTimeoutRef.current = setTimeout(() => {
          setExpression("listening");
          scheduleIdleEmotions();
        }, emotionTiming.wakingHold);
        return;
      }

      setExpression(nextExpression);
      speakSmoothly(response, { language, expressionAfter });
      runIntentAction(intentDefinition.action);

      if (
        nextExpression === "listening" ||
        nextExpression === "soft" ||
        nextExpression === "speaking" ||
        nextExpression === "playful"
      ) {
        scheduleIdleEmotions();
      }

      if (nextExpression === "thinking") {
        sleepingTimeoutRef.current = setTimeout(() => {
          if (isSpeakingRef.current || expressionRef.current === "speaking") return;
          setExpression("sleeping");
        }, emotionTiming.sleepingAfterIdle);
      }
    },
    [clearEmotionTimers, runIntentAction, scheduleIdleEmotions, speakSmoothly],
  );

  const handleUnknownTranscript = useCallback(() => {
    const now = Date.now();

    if (now - lastHandledAtRef.current < commandCooldownMs) return;

    const unknownDefinition = intentDefinitions.find(
      (definition) => definition.intent === "unknown",
    );
    const fallbackResponses =
      unknownDefinition?.responses[kukuLanguageRef.current] ?? [
        "I caught the sound, not the meaning. One more try?",
      ];

    lastHandledIntentRef.current = "unknown";
    lastHandledAtRef.current = now;
    setExpression("thinking");
    speakSmoothly(
      pickResponse(fallbackResponses, lastSpokenResponseRef.current),
      { language: kukuLanguageRef.current, expressionAfter: "listening" },
    );
  }, [speakSmoothly]);

  const reactToTouch = useCallback(() => {
    setInteractionPulse((pulse) => pulse + 1);

    if (isSpeakingRef.current) return;

    clearEmotionTimers();

    if (expressionRef.current === "sleeping") {
      setExpression("waking");

      wakingTimeoutRef.current = setTimeout(() => {
        if (isSpeakingRef.current) return;
        setExpression("listening");
        scheduleIdleEmotions(700, false);
      }, emotionTiming.wakingHold);
      return;
    }

    setExpression("playful");
    listeningTimeoutRef.current = setTimeout(() => {
      if (isSpeakingRef.current) return;
      setExpression("listening");
      scheduleIdleEmotions(700, false);
    }, 850);
  }, [clearEmotionTimers, scheduleIdleEmotions]);

  const startVoiceControl = useCallback(() => {
    const speechWindow = window as SpeechWindow;
    const SpeechRecognition =
      speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      speakSmoothly(unsupportedBrowserResponses[kukuLanguageRef.current], {
        language: kukuLanguageRef.current,
        expressionAfter: "soft",
      });
      return;
    }

    if (voiceControlEnabledRef.current) {
      voiceControlEnabledRef.current = false;
      stopRecognitionSafely();
      speakSmoothly(
        kukuLanguageRef.current === "ml"
          ? "ശരി, ഞാൻ ഇപ്പോൾ കേൾക്കുന്നത് നിർത്താം."
          : "Okay, I will stop listening for now.",
        { language: kukuLanguageRef.current, expressionAfter: "soft" },
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = kukuLanguageRef.current === "ml" ? "ml-IN" : "en-IN";
    recognition.maxAlternatives = 5;

    recognition.onresult = (event) => {
      if (isSpeakingRef.current) return;
      if (Date.now() < speechSettlingUntilRef.current) return;

      const results = Array.from(event.results).slice(event.resultIndex ?? 0);
      const finalResults = results.filter((result) => result.isFinal);

      if (finalResults.length === 0) return;

      const transcripts = finalResults.flatMap((result) =>
        Array.from(result).map((alternative) => alternative.transcript),
      );
      const transcript = transcripts.join(" ");
      const normalizedTranscript = normalizeVoiceText(transcript);
      const intentDefinition = findVoiceIntent(transcript);
      const now = Date.now();
      const normalizedLastResponse = normalizeVoiceText(lastSpokenResponseRef.current);

      if (!normalizedTranscript) {
        return;
      }

      if (
        normalizedTranscript === lastFinalTranscriptRef.current &&
        now - lastFinalTranscriptAtRef.current < commandCooldownMs
      ) {
        return;
      }

      if (
        normalizedLastResponse &&
        (normalizedLastResponse.includes(normalizedTranscript) ||
          normalizedTranscript.includes(normalizedLastResponse.slice(0, 60)))
      ) {
        return;
      }

      lastFinalTranscriptRef.current = normalizedTranscript;
      lastFinalTranscriptAtRef.current = now;

      if (intentDefinition) {
        const isDuplicateIntent =
          lastHandledIntentRef.current === intentDefinition.intent &&
          now - lastHandledAtRef.current < commandCooldownMs;

        if (!isDuplicateIntent) {
          lastHandledIntentRef.current = intentDefinition.intent;
          lastHandledAtRef.current = now;
          applyVoiceIntent(intentDefinition);
        }

        return;
      }

      handleUnknownTranscript();
    };

    recognition.onerror = (event) => {
      setExpression("thinking");

      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        voiceControlEnabledRef.current = false;
        speakSmoothly(microphoneBlockedResponses[kukuLanguageRef.current], {
          language: kukuLanguageRef.current,
          expressionAfter: "soft",
        });
      }
    };

    recognition.onend = () => {
      if (!voiceControlEnabledRef.current || isSpeakingRef.current) return;
      restartVoiceRecognition();
    };

    recognitionRef.current = recognition;
    voiceControlEnabledRef.current = true;
    setExpression("listening");

    try {
      recognition.start();
      if (!hasIntroducedRef.current) {
        hasIntroducedRef.current = true;
        speakSmoothly(firstGreeting[kukuLanguageRef.current], {
          language: kukuLanguageRef.current,
          expressionAfter: "listening",
        });
      } else {
        speakSmoothly(
          kukuLanguageRef.current === "ml"
            ? "ഞാൻ കേൾക്കുന്നുണ്ട്. Abhiram, projects, experience, skills, hire, contact എന്നിവയെ കുറിച്ച് ചോദിക്കാം."
            : "I'm listening. Ask me about Abhiram, projects, experience, skills, hire, or contact.",
          { language: kukuLanguageRef.current, expressionAfter: "listening" },
        );
      }
    } catch (error) {
      voiceControlEnabledRef.current = false;
      setExpression("thinking");
    }
  }, [applyVoiceIntent, handleUnknownTranscript, speakSmoothly, stopRecognitionSafely]);

  useEffect(() => {
    expressionRef.current = expression;
  }, [expression]);

  useEffect(() => {
    kukuLanguageRef.current = kukuLanguage;

    if (recognitionRef.current) {
      recognitionRef.current.lang = kukuLanguage === "ml" ? "ml-IN" : "en-IN";
    }
  }, [kukuLanguage]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.onvoiceschanged = () => {
      getBestVoice(kukuLanguageRef.current);
    };

    getBestVoice(kukuLanguageRef.current);

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    return () => {
      voiceControlEnabledRef.current = false;
      if (recognitionRestartTimeoutRef.current) {
        clearTimeout(recognitionRestartTimeoutRef.current);
      }
      speechTokenRef.current += 1;
      clearLipSync();
      clearSpeechChunkTimer();
      stopRecognitionSafely();
      window.speechSynthesis?.cancel();
    };
  }, [clearLipSync, clearSpeechChunkTimer, stopRecognitionSafely]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });

      if (isSpeakingRef.current) return;

      if (expressionRef.current === "sleeping") {
        clearEmotionTimers();
        setExpression("waking");

        wakingTimeoutRef.current = setTimeout(() => {
          setExpression("listening");
        }, emotionTiming.wakingHold);

        scheduleIdleEmotions(emotionTiming.wakingHold, false);
        return;
      }

      if (expressionRef.current === "waking") return;

      setExpression("listening");
      scheduleIdleEmotions();
    };

    scheduleIdleEmotions();

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearEmotionTimers();
    };
  }, [clearEmotionTimers, scheduleIdleEmotions]);

  useEffect(() => {
    let isMounted = true;
    let blinkTimeout: ReturnType<typeof setTimeout>;
    let saccadeTimeout: ReturnType<typeof setTimeout>;

    const blink = () => {
      if (!isMounted) return;
      if (expression !== "sleeping") {
        setIsBlinking(true);

        setTimeout(() => {
          if (isMounted) setIsBlinking(false);
        }, 120);
      }

      blinkTimeout = setTimeout(blink, Math.random() * 3500 + 2200);
    };

    const saccade = async () => {
      if (!isMounted) return;
      if (expression !== "sleeping") {
        try {
          await saccadeControls.start({
            x: (Math.random() - 0.5) * 5,
            y: (Math.random() - 0.5) * 4,
            transition: { duration: 0.12 },
          });

          if (isMounted) {
            await saccadeControls.start({
              x: 0,
              y: 0,
              transition: { duration: 0.7, ease: "easeOut" },
            });
          }
        } catch (error) {
          // Ignore animation errors when unmounting
        }
      }

      if (isMounted) {
        saccadeTimeout = setTimeout(saccade, Math.random() * 2200 + 800);
      }
    };

    blinkTimeout = setTimeout(blink, 1600);
    saccadeTimeout = setTimeout(saccade, 900);

    return () => {
      isMounted = false;
      clearTimeout(blinkTimeout);
      clearTimeout(saccadeTimeout);
    };
  }, [expression, saccadeControls]);

  const isSleeping = expression === "sleeping";
  const isWaking = expression === "waking";

  const pupilOffset =
    expression === "thinking"
      ? { x: 0, y: -7 }
      : expression === "playful"
      ? { x: mousePosition.x * 3 - 2, y: mousePosition.y * 2 - 2 }
      : expression === "speaking"
      ? { x: mousePosition.x * 2.5, y: mousePosition.y * 2 - 1 }
      : expression === "waking"
      ? { x: mousePosition.x * 2, y: mousePosition.y * 1.5 + 2 }
      : expression === "listening"
      ? { x: mousePosition.x * 3 + 3, y: mousePosition.y * 2 }
      : { x: mousePosition.x * 4, y: mousePosition.y * 3 };

  const mouthPath =
    isSpeaking
      ? [
          "M 18 19 Q 29 20 40 19",
          "M 19 18 Q 29 22 39 18",
          "M 17 17 Q 29 26 41 17",
          "M 15 16 Q 29 31 43 16",
          "M 13 17 Q 29 28 45 17",
        ][speechMouthFrame]
      : expression === "thinking"
      ? "M 18 20 Q 29 16 40 20"
      : expression === "playful"
      ? "M 14 15 Q 29 32 44 15"
      : expression === "speaking"
      ? "M 16 17 Q 29 31 42 17"
      : expression === "listening"
      ? "M 14 18 Q 29 28 44 18"
      : expression === "waking"
      ? "M 18 21 Q 29 25 40 21"
      : expression === "sleeping"
      ? "M 16 22 Q 29 26 42 22"
      : "M 18 16 Q 29 28 40 16";

  const mouthScaleY = isSpeaking
    ? 1
    : expression === "playful"
    ? [1, 1.18, 0.95, 1.12, 1]
    : expression === "listening"
    ? 1.22
    : expression === "waking"
    ? 0.82
    : expression === "sleeping"
      ? 0.72
      : 1;

  const characterBounceY =
    isSpeaking
      ? [0, -5, 0]
      : expression === "playful"
      ? [0, -10, 0, -5, 0]
      : [0, -13, 0];

  return (
    <div
      className="relative w-full aspect-square max-w-[540px] mx-auto flex items-center justify-center [perspective:1200px] overflow-visible pointer-events-auto"
      role="button"
      tabIndex={0}
      aria-label="Kuku, the interactive speaking character. Click to start or pause voice commands."
      onPointerDown={reactToTouch}
      onClick={startVoiceControl}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;

        event.preventDefault();
        reactToTouch();
        startVoiceControl();
      }}
    >
      {/* Background glow */}
      <motion.div
        className="absolute inset-[-10%] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 55% 45%, rgba(160,145,255,0.45), rgba(255,255,255,0.14) 42%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.55, 0.9, 0.55],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Rim light */}
      <motion.div
        className="absolute w-[75%] h-[75%] rounded-full pointer-events-none"
        style={{
          background:
            "conic-gradient(from 40deg, transparent, rgba(180,165,255,0.65), transparent, rgba(255,255,255,0.28), transparent)",
          filter: "blur(30px)",
        }}
        animate={{
          rotate: [0, 360],
          opacity: [0.45, 0.75, 0.45],
        }}
        transition={{
          rotate: { duration: 24, repeat: Infinity, ease: "linear" },
          opacity: { duration: 6, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {/* White living orb */}
      <motion.div
        className="relative z-10 w-[68%] h-[68%] rounded-full flex items-center justify-center overflow-hidden"
        style={{
          transformStyle: "preserve-3d",
          background:
            "radial-gradient(circle at 32% 22%, #ffffff 0%, #f7f7fb 34%, #e3e4ee 68%, #c7cad8 100%)",
          boxShadow: `
            0 55px 120px rgba(0,0,0,0.35),
            0 0 90px rgba(145,120,255,0.35),
            inset 30px 24px 45px rgba(255,255,255,0.95),
            inset -30px -35px 60px rgba(120,125,150,0.36),
            inset -8px -4px 24px rgba(135,105,255,0.25),
            inset 8px 5px 18px rgba(255,255,255,0.9)
          `,
          border: "1px solid rgba(255,255,255,0.75)",
        }}
        animate={{
          y: characterBounceY,
          x:
            interactionPulse === 0
              ? 0
              : interactionPulse % 2 === 0
              ? [0, 3, -2, 0]
              : [0, -3, 2, 0],
          scale: isSpeaking ? [1, 1.01, 1] : [1, 1.018, 1],
          rotateX: mousePosition.y * 8,
          rotateY: mousePosition.x * 10,
        }}
        transition={{
          y: { duration: 6.2, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
          rotateX: { type: "spring", stiffness: 85, damping: 22 },
          rotateY: { type: "spring", stiffness: 85, damping: 22 },
        }}
      >
        {/* Big glossy reflection */}
        <motion.div
          className="absolute top-[7%] left-[17%] w-[46%] h-[28%] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.95), rgba(255,255,255,0.32) 45%, transparent 72%)",
            filter: "blur(15px)",
          }}
          animate={{
            opacity: [0.4, 0.75, 0.4],
            x: mousePosition.x * -8,
            y: mousePosition.y * -5,
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Purple side reflection */}
        <div
          className="absolute right-[-8%] top-[20%] w-[30%] h-[54%] rounded-full pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(130,100,255,0.32))",
            filter: "blur(18px)",
          }}
        />

        {/* Face */}
        <motion.div
          className="absolute top-[31%] w-[82%] flex flex-col items-center gap-5 z-20"
          animate={{
            x: mousePosition.x * 15,
            y: mousePosition.y * 8,
          }}
          transition={{ type: "spring", stiffness: 180, damping: 20 }}
        >
          {/* Eyebrows */}
          {!isSleeping && (
            <div className="absolute top-[-18px] flex gap-12">
              <motion.div
                className="w-9 h-[5px] rounded-full bg-slate-600/70"
                animate={{
                  rotate:
                    expression === "thinking"
                      ? -18
                      : expression === "playful"
                      ? -14
                      : expression === "speaking"
                      ? -8
                      : expression === "waking"
                      ? -2
                      : expression === "listening"
                      ? 12
                      : -6,
                  y:
                    expression === "thinking"
                      ? -5
                      : expression === "playful"
                      ? -3
                      : expression === "waking"
                      ? 3
                      : 0,
                }}
              />
              <motion.div
                className="w-9 h-[5px] rounded-full bg-slate-600/70"
                animate={{
                  rotate:
                    expression === "thinking"
                      ? 14
                      : expression === "playful"
                      ? 14
                      : expression === "speaking"
                      ? 8
                      : expression === "waking"
                      ? 2
                      : expression === "listening"
                      ? -12
                      : 6,
                  y:
                    expression === "thinking"
                      ? 2
                      : expression === "playful"
                      ? -3
                      : expression === "waking"
                      ? 3
                      : 0,
                }}
              />
            </div>
          )}

          {/* Eyes */}
          <motion.div
            className="flex items-center justify-center gap-8 sm:gap-10"
            animate={saccadeControls}
          >
            {[0, 1].map((eye) => (
              <motion.div
                key={eye}
                className="relative w-[42px] h-[52px] sm:w-[48px] sm:h-[60px] rounded-full overflow-hidden"
                style={{
                  transformOrigin: "center",
                  background:
                    "radial-gradient(circle at 38% 28%, #ffffff 0%, #f5f7ff 42%, #cfd4e8 100%)",
                  boxShadow: `
                    inset 0 4px 10px rgba(0,0,0,0.25),
                    inset -4px -6px 12px rgba(0,0,0,0.2),
                    0 0 22px rgba(255,255,255,0.75),
                    0 0 38px rgba(130,110,255,0.26)
                  `,
                }}
                animate={{
                  scaleY: isSleeping || isBlinking ? 0.13 : isWaking ? 0.55 : 1,
                  y: isSleeping ? 8 : isWaking ? 5 : 0,
                }}
                transition={{ duration: 0.12, ease: "easeInOut" }}
              >
                {/* Pupil */}
                <motion.div
                  className="absolute top-[28%] left-[30%] w-[42%] h-[48%] rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle at 40% 35%, #2d3342 0%, #08090d 62%, #000 100%)",
                    boxShadow:
                      "inset 0 2px 5px rgba(255,255,255,0.2), 0 0 10px rgba(0,0,0,0.45)",
                  }}
                  animate={{
                    x: pupilOffset.x,
                    y: pupilOffset.y,
                  }}
                  transition={{ type: "spring", stiffness: 220, damping: 18 }}
                >
                  {/* Sharp white dot reflection in pupil */}
                  <div className="absolute top-[18%] right-[22%] w-[28%] h-[28%] rounded-full bg-white shadow-[0_0_2px_rgba(255,255,255,0.8)]" />
                </motion.div>

                {/* Main eye reflection */}
                <motion.div
                  className="absolute top-[17%] left-[21%] w-[30%] h-[25%] rounded-full bg-white"
                  style={{
                    opacity: 0.96,
                    filter: "blur(0.2px)",
                  }}
                  animate={{
                    x: mousePosition.x * -2,
                    y: mousePosition.y * -1,
                    scale: [1, 1.14, 1],
                  }}
                  transition={{
                    scale: { duration: 3.5, repeat: Infinity },
                    x: { type: "spring", stiffness: 160, damping: 18 },
                    y: { type: "spring", stiffness: 160, damping: 18 },
                  }}
                />

                {/* Second reflection */}
                <div className="absolute top-[50%] right-[24%] w-[8px] h-[8px] rounded-full bg-white opacity-70 blur-[0.4px]" />

                {/* Glass shine */}
                <div
                  className="absolute top-[5%] left-[8%] w-[82%] h-[34%] rounded-full pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.55), transparent)",
                    filter: "blur(2px)",
                  }}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Sleeping Zzz */}
          {isSleeping && (
            <motion.div
              className="absolute -right-2 -top-10 text-slate-400 text-lg font-semibold"
              animate={{ y: [-2, -10, -2], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2.2, repeat: Infinity }}
            >
              zZ
            </motion.div>
          )}

          {/* Cheeks */}
          <div className="absolute top-[62px] left-[21%] w-10 h-5 rounded-full bg-purple-300/20 blur-md" />
          <div className="absolute top-[62px] right-[21%] w-10 h-5 rounded-full bg-purple-300/20 blur-md" />

          {/* Big expressive mouth */}
          <motion.div
            className="relative mt-1"
            animate={{
              scaleY: mouthScaleY,
              y:
                expression === "thinking"
                  ? 2
                  : expression === "waking"
                  ? 1
                  : expression === "playful"
                  ? -1
                  : 0,
            }}
            transition={
              isSpeaking
                ? { duration: 0.65, repeat: Infinity, ease: "easeInOut" }
                : expression === "playful"
                ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
                : { type: "spring", stiffness: 220, damping: 18 }
            }
          >
            <svg
              width="58"
              height="38"
              viewBox="0 0 58 38"
              className="overflow-visible"
            >
              <motion.path
                d={mouthPath}
                stroke="rgba(65,70,85,0.9)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                style={{
                  filter:
                    "drop-shadow(0px 0px 5px rgba(255,255,255,0.55)) drop-shadow(0px 2px 2px rgba(0,0,0,0.16))",
                }}
                transition={{ type: "spring", stiffness: 180, damping: 20 }}
              />

              {expression === "listening" && (
                <motion.path
                  d="M 18 16 Q 29 24 40 16"
                  stroke="rgba(120,95,255,0.35)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  fill="none"
                />
              )}
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Floating glass orb */}
      <motion.div
        className="absolute top-[12%] right-[8%] w-16 h-16 rounded-full z-20 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(240,240,255,0.4))",
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.6)",
          boxShadow:
            "0 18px 45px rgba(0,0,0,0.1), inset 4px 4px 10px rgba(255,255,255,0.8)",
        }}
        animate={{
          y: [0, 10, 0],
          x: mousePosition.x * -8,
        }}
        transition={{
          y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
          x: { type: "spring", stiffness: 55, damping: 16 },
        }}
      />

      {/* Floating glass square (the cube!) */}
      <motion.div
        className="absolute bottom-[20%] left-[5%] w-20 h-20 rounded-[1.25rem] z-20 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(160,130,255,0.85), rgba(120,90,255,0.45))",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.4)",
          boxShadow:
            "0 20px 40px rgba(120,90,255,0.25), inset 2px 2px 8px rgba(255,255,255,0.5), inset -3px -3px 12px rgba(0,0,0,0.15)",
        }}
        animate={{
          y: [0, -12, 0],
          x: mousePosition.x * 12,
          rotate: [-5, 5, -5],
        }}
        transition={{
          y: { duration: 5.5, repeat: Infinity, ease: "easeInOut" },
          x: { type: "spring", stiffness: 50, damping: 15 },
          rotate: { duration: 12, repeat: Infinity, ease: "easeInOut" },
        }}
      />
    </div>
  );
};
