export const JOURNEY_VERSION = 1;
export type StudyLevel = import("./courses").CourseLevel;
export type BudgetBand = "low" | "medium" | "high";
export type EnglishStatus = "not-started" | "booked" | "completed" | "exempt";
export type SavedCourse = { title: string; university: string; destination: string };
export type BudgetEstimate = { destination: string; currency: string; annualTotal: number; updatedAt: string };
export type JourneyState = {
  version: number; destination?: string; level?: StudyLevel; field?: string; budget?: BudgetBand;
  englishStatus?: EnglishStatus; budgetEstimate?: BudgetEstimate;
  priorities: string[]; savedCourses: SavedCourse[]; checklistDone: string[]; stamps: string[];
  consultationRequested: boolean;
};
export const emptyJourney: JourneyState = {
  version: JOURNEY_VERSION, priorities: [], savedCourses: [], checklistDone: [], stamps: [], consultationRequested: false,
};
export type JourneyPatch = Partial<Pick<JourneyState, "destination" | "level" | "field" | "budget" | "englishStatus" | "budgetEstimate">>;
export type JourneyCommand =
  | { type: "patch"; patch: JourneyPatch }
  | { type: "priority" | "checklist" | "stamp"; id: string }
  | { type: "save-course"; course: SavedCourse }
  | { type: "remove-course"; title: string }
  | { type: "reset" };

export function applyJourneyCommand(journey: JourneyState, command: JourneyCommand): JourneyState {
  const toggle = (items: string[], id: string) => items.includes(id) ? items.filter(item => item !== id) : [...items, id];
  switch (command.type) {
    case "patch": return { ...journey, ...command.patch };
    case "priority": return { ...journey, priorities: toggle(journey.priorities, command.id) };
    case "checklist": return { ...journey, checklistDone: toggle(journey.checklistDone, command.id) };
    case "stamp": return journey.stamps.includes(command.id) ? journey : { ...journey, stamps: [...journey.stamps, command.id] };
    case "save-course": return journey.savedCourses.some(c => c.title === command.course.title && c.university === command.course.university)
      ? journey : { ...journey, savedCourses: [...journey.savedCourses, command.course] };
    case "remove-course": return { ...journey, savedCourses: journey.savedCourses.filter(c => c.title !== command.title) };
    case "reset": return { ...emptyJourney, consultationRequested: journey.consultationRequested };
  }
}
