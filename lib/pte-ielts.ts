export type EnglishTestSlug = "pte" | "ielts";
export type CourseModeSlug = "demo-course" | "interactive-learning";
export type SkillTrackSlug = "reading" | "writing" | "speaking" | "listening";

export type SkillTrack = {
  slug: SkillTrackSlug;
  title: string;
  summary: string;
  demo: string;
  interactive: string;
  tasks: string[];
  practicePrompt: string;
  feedback: string;
  progress: number;
};

export type EnglishTestCourse = {
  slug: EnglishTestSlug;
  title: string;
  shortTitle: string;
  label: string;
  image: string;
  imageAlt: string;
  intro: string;
  points: string[];
  modules: SkillTrack[];
};

export const courseOptions = [
  {
    slug: "demo-course",
    title: "Demo course",
    pageTitle: "Demo Course",
    text: "Preview the lesson style, score focus and practice workflow.",
    heroText:
      "Walk through a sample lesson before committing to a study rhythm. Each demo shows what to practise, how feedback works and where students usually lose marks.",
  },
  {
    slug: "interactive-learning",
    title: "Interactive learning",
    pageTitle: "Interactive Learning",
    text: "Practice with AI-assisted tasks, feedback loops and tutor guidance.",
    heroText:
      "Move through skill-based activities with AI-assisted feedback, timed tasks and clear next steps for your tutor or counsellor session.",
  },
] satisfies {
  slug: CourseModeSlug;
  title: string;
  pageTitle: string;
  text: string;
  heroText: string;
}[];

export const supportCourses: EnglishTestCourse[] = [
  {
    slug: "pte",
    title: "PTE Academic AI Practice Course",
    shortTitle: "PTE Academic",
    label: "PTE support",
    image: "/images/pte-ai-course-card.png",
    imageAlt:
      "Student practicing a computer-based English speaking test with AI-assisted study tools",
    intro:
      "Build confidence for computer-based speaking, writing, reading and listening tasks with guided practice and fast feedback.",
    points: [
      "AI-assisted speaking fluency and pronunciation drills",
      "Timed practice for repeat sentence, describe image and essay tasks",
      "Score-focused review sessions before your test date",
    ],
    modules: [
      {
        slug: "reading",
        title: "Reading",
        summary: "Build speed and accuracy for fill-in-the-blanks, re-order paragraphs and multiple-choice items.",
        demo: "Preview a model reading task with answer logic, timing advice and common trap patterns.",
        interactive:
          "Answer adaptive reading items, then review why each option works or fails before moving on.",
        tasks: ["Fill in the blanks", "Re-order paragraphs", "Multiple choice"],
        practicePrompt: "Choose the sentence that best completes the paragraph.",
        feedback: "AI highlights clue words, grammar links and distractors.",
        progress: 72,
      },
      {
        slug: "writing",
        title: "Writing",
        summary: "Practise summarize written text and essay responses with structure, grammar and vocabulary checks.",
        demo: "See a sample response broken into structure, word choice and score-impact notes.",
        interactive:
          "Draft a timed answer and receive focused suggestions on grammar, clarity and task fulfilment.",
        tasks: ["Summarize written text", "Essay planning", "Grammar review"],
        practicePrompt: "Write a one-sentence summary using the key idea and supporting detail.",
        feedback: "AI checks length, sentence control and missing meaning.",
        progress: 68,
      },
      {
        slug: "speaking",
        title: "Speaking",
        summary: "Train fluency, pronunciation and confidence for read aloud, repeat sentence and describe image.",
        demo: "Listen to a model speaking flow and see what strong delivery sounds like.",
        interactive:
          "Record practice responses, compare pacing and receive pronunciation and fluency feedback.",
        tasks: ["Read aloud", "Repeat sentence", "Describe image"],
        practicePrompt: "Describe the visual in 40 seconds with a clear opening and key trend.",
        feedback: "AI scores pace, clarity, pauses and pronunciation risk areas.",
        progress: 81,
      },
      {
        slug: "listening",
        title: "Listening",
        summary: "Improve note-taking and accuracy for summarize spoken text, dictation and highlight tasks.",
        demo: "Preview a listening task with a note-taking framework and answer review.",
        interactive:
          "Complete short audio-style drills and review missed keywords, spelling and grammar patterns.",
        tasks: ["Summarize spoken text", "Write from dictation", "Highlight incorrect words"],
        practicePrompt: "Capture the main idea, names, numbers and signal words.",
        feedback: "AI marks missing keywords and suggests a cleaner note pattern.",
        progress: 75,
      },
    ],
  },
  {
    slug: "ielts",
    title: "IELTS AI Support Course",
    shortTitle: "IELTS",
    label: "IELTS support",
    image: "/images/ielts-ai-course-card.png",
    imageAlt: "Student preparing for IELTS with AI-assisted writing and listening feedback",
    intro:
      "Prepare for Academic or General IELTS with structured coaching across writing, speaking, reading and listening.",
    points: [
      "Writing Task 1 and Task 2 feedback with band-descriptor guidance",
      "Reading and listening strategy practice with targeted improvement notes",
      "Speaking mock interviews with clear next-step coaching",
    ],
    modules: [
      {
        slug: "reading",
        title: "Reading",
        summary: "Practise scanning, skimming and evidence matching for Academic or General reading passages.",
        demo: "Preview a passage strategy with keyword mapping and answer-location examples.",
        interactive:
          "Work through question sets and receive feedback on evidence, timing and distractors.",
        tasks: ["True/False/Not Given", "Matching headings", "Short answers"],
        practicePrompt: "Find the sentence that proves the answer, then choose the option.",
        feedback: "AI explains evidence location and why distractors are tempting.",
        progress: 70,
      },
      {
        slug: "writing",
        title: "Writing",
        summary: "Improve Task 1 and Task 2 with band-focused feedback on structure, grammar and vocabulary.",
        demo: "Review a sample answer against task response, coherence, vocabulary and grammar.",
        interactive:
          "Write a timed response and receive band-descriptor feedback with a rewrite plan.",
        tasks: ["Task 1 reports", "Task 2 essays", "Coherence review"],
        practicePrompt: "Plan a clear position, two main ideas and one strong example.",
        feedback: "AI flags weak thesis statements, repetition and sentence control.",
        progress: 66,
      },
      {
        slug: "speaking",
        title: "Speaking",
        summary: "Build natural answers for Parts 1, 2 and 3 with fluency, vocabulary and idea development.",
        demo: "Hear model answer structures and learn how to extend without memorising scripts.",
        interactive:
          "Respond to mock prompts and review fluency, pronunciation and answer depth.",
        tasks: ["Part 1 warm-up", "Part 2 cue card", "Part 3 discussion"],
        practicePrompt: "Answer with a direct idea, short reason and natural example.",
        feedback: "AI notes hesitations, repeated words and missed development chances.",
        progress: 78,
      },
      {
        slug: "listening",
        title: "Listening",
        summary: "Train prediction, spelling accuracy and focus across conversations, maps and lectures.",
        demo: "Preview a listening section with prediction notes and answer-checking habits.",
        interactive:
          "Try focused drills and review missed signals, spelling mistakes and distractor moments.",
        tasks: ["Form completion", "Map labelling", "Multiple choice"],
        practicePrompt: "Predict the answer type before the speaker gives the detail.",
        feedback: "AI identifies missed signposts and high-risk spelling errors.",
        progress: 74,
      },
    ],
  },
];

export function getSupportCourse(slug: string | undefined) {
  return supportCourses.find((course) => course.slug === slug);
}

export function getCourseOption(slug: string | undefined) {
  return courseOptions.find((option) => option.slug === slug);
}
