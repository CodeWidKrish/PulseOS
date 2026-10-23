/**
 * Single source of truth for all marketing copy, clinical sample data,
 * and accessibility labels in PulseOS.
 */

export interface NavLink {
  label: string;
  href: string;
}

export interface StoryPanel {
  id: string;
  title: string;
  description: string;
}

export interface LabValueSample {
  name: string;
  value: string;
  status: string;
  variant: "teal" | "amber" | "pulse";
}

export interface DoctorSample {
  id: string;
  name: string;
  specialty: string;
  slots: string[];
}

export interface MedicineSample {
  id: string;
  name: string;
  time: string;
  defaultChecked: boolean;
}

export interface SecurityFeature {
  title: string;
  description: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export const MARKETING_CONTENT = {
  meta: {
    title: "PulseOS — Your health, in plain language.",
    description:
      "PulseOS explains lab reports in calm, plain language, tracks your vital trends, and books doctor care without clinical diagnostic confusion.",
    ogImage: "/og-image.png",
  },

  nav: {
    brand: "PulseOS",
    links: [
      { label: "How it works", href: "#story" },
      { label: "Demo", href: "#demo" },
      { label: "Dashboard", href: "#app" },
      { label: "Security", href: "#security" },
      { label: "FAQ", href: "#faq" },
      { label: "Design System", href: "/design" },
    ] as NavLink[],
    commandKeyLabel: "Ctrl K",
    commandKeyMac: "⌘K",
    cta: {
      label: "Try the demo",
      href: "#demo",
    },
  },

  hero: {
    headlineWords: ["Your", "health,", "in", "plain", "language."],
    subcopy:
      "Upload a lab report, ask about a symptom, track your vitals, and book a doctor. All in one calm place.",
    ctaPrimary: {
      label: "Explain a sample report",
      href: "#demo",
    },
    ctaSecondary: {
      label: "See the dashboard",
      href: "#app",
    },
    cursorHint: "Move your cursor through the heart",
  },

  story: {
    sectionAriaLabel: "How PulseOS works",
    panels: [
      {
        id: "panel-1",
        title: "Upload a report. Get the meaning.",
        description:
          "Hemoglobin, TSH, HbA1c: every value explained in plain words, with questions to ask your doctor.",
      },
      {
        id: "panel-2",
        title: "Watch your vitals move.",
        description:
          "Log heart rate, blood pressure, and glucose. See the trend, not just today’s number.",
      },
      {
        id: "panel-3",
        title: "Book care when it matters.",
        description:
          "Pick a doctor, choose a free slot, and get a confirmation without leaving the page.",
      },
    ] as StoryPanel[],
  },

  demo: {
    heading: "Try it. It takes seconds.",
    subcopy:
      "Run a sample blood report through PulseOS and watch it explain every value in plain language.",
    buttonLabel: "Analyze sample report",
    analyzingLabel: "Analyzing biomarkers…",
    labValues: [
      {
        name: "Hemoglobin",
        value: "13.8 g/dL",
        status: "Normal",
        variant: "teal",
      },
      {
        name: "Fasting glucose",
        value: "108 mg/dL",
        status: "Slightly high",
        variant: "amber",
      },
      {
        name: "TSH",
        value: "2.1 mIU/L",
        status: "Normal",
        variant: "teal",
      },
    ] as LabValueSample[],
    explanationMarkdown:
      "**Your results look mostly normal.** Hemoglobin and thyroid levels are in range. Your fasting glucose is slightly above the usual range, which is worth mentioning to your doctor. A repeat test and a short chat about diet and activity are common next steps. Ask: “Should I retest in three months?”",
  },

  dashboard: {
    heading: "Your week, at a glance.",
    subcopy: "One dashboard for every reading, report, and appointment.",
    healthScore: {
      value: 86,
      max: 100,
      label: "Health score",
      caption: "Based on sample vitals",
    },
    heartRate: {
      label: "Resting heart rate",
      sevenDayAvg: 64,
      thirtyDayAvg: 61,
      path7Day:
        "M0,110 C60,90 90,120 150,85 S250,50 310,78 S420,110 480,62 S560,44 600,40",
      path30Day:
        "M0,60 C50,95 100,40 160,80 S260,110 320,70 S430,45 490,92 S560,100 600,84",
    },
    doctors: [
      {
        id: "doc-1",
        name: "Dr. A. Mehta",
        specialty: "General",
        slots: ["Thu 10:30", "Thu 11:15", "Fri 4:00"],
      },
      {
        id: "doc-2",
        name: "Dr. R. Shah",
        specialty: "Endocrine",
        slots: ["Wed 2:00", "Thu 3:30", "Fri 11:00"],
      },
    ] as DoctorSample[],
    medicines: [
      {
        id: "med-1",
        name: "Vitamin D3, 8:00 AM",
        time: "8:00 AM",
        defaultChecked: true,
      },
      {
        id: "med-2",
        name: "Metformin, 1:30 PM",
        time: "1:30 PM",
        defaultChecked: false,
      },
      {
        id: "med-3",
        name: "Omega-3, 9:00 PM",
        time: "9:00 PM",
        defaultChecked: false,
      },
    ] as MedicineSample[],
    beforeAfter: {
      title: "Before and after",
      caption: "Drag to compare a raw report line with PulseOS",
      beforeSnippet:
        "HBA1C (NGSP) 5.4 %   REF 4.0-5.6\nEAG 108 mg/dL   METHOD: HPLC\nINTERP: NON-DIABETIC RANGE",
      afterSnippet:
        "Your HbA1c is 5.4%.\nThat is in the normal range. It reflects your average blood sugar over the last three months. Ask your doctor how often to retest.",
    },
  },

  security: {
    heading: "Built around your trust.",
    features: [
      {
        title: "Private by design",
        description:
          "Reports are encrypted in transit and at rest, and only you can open them.",
      },
      {
        title: "You stay in control",
        description:
          "Export or delete everything, anytime, from one settings page.",
      },
      {
        title: "Clear about limits",
        description:
          "PulseOS explains results and never diagnoses. Urgent symptoms point you to care.",
      },
    ] as SecurityFeature[],
  },

  faq: {
    heading: "Questions, answered.",
    items: [
      {
        question: "Is PulseOS a replacement for my doctor?",
        answer:
          "No. It helps you understand your reports and prepare better questions. Your doctor makes all clinical decisions.",
      },
      {
        question: "What files can I upload?",
        answer:
          "PDFs and high-contrast photos of medical lab reports. Text is parsed securely, then explained biomarker by biomarker.",
      },
      {
        question: "Is the data on this page real?",
        answer:
          "No. This is a design demo, and every biomarker, physician, and appointment is synthetic sample data.",
      },
      {
        question: "Can I delete my data?",
        answer:
          "Yes. You can export or permanently remove your reports and vitals at any time from your account settings.",
      },
    ] as FAQItem[],
  },

  closingCta: {
    heading: "Start with one report.",
    subcopy: "Upload it and see what it says in under a minute.",
    ctaPrimary: {
      label: "Try the demo",
      href: "#demo",
    },
    ctaSecondary: {
      label: "View on GitHub",
      href: "https://github.com/CodeWidKrish/PulseOS",
    },
  },

  footer: {
    disclaimer:
      "PulseOS is a demonstration and educational companion that does not provide medical diagnoses or advice. All data shown is synthetic sample data. Consult a licensed physician for diagnosis and medical treatment.",
    copyright: "© 2026 PulseOS. Engineered for clarity.",
  },

  commandPalette: {
    placeholder: "Jump to section or action…",
    emptyMessage: "No matching commands found.",
    commands: [
      { title: "Try the demo", href: "#demo", group: "Navigation" },
      { title: "Open the dashboard", href: "#app", group: "Navigation" },
      { title: "Book a doctor", href: "#book", group: "Actions" },
      { title: "Security & Privacy", href: "#security", group: "About" },
      { title: "Read the FAQ", href: "#faq", group: "About" },
      { title: "Design System Showcase", href: "/design", group: "Developer" },
    ],
  },
};
