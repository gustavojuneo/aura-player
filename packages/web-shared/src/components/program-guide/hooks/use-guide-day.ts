import { useState } from "react";
import type { GuideDay } from "../types";

export function useGuideDay() {
  const [selectedDay, setSelectedDay] = useState<GuideDay>("today");
  return { selectedDay, setSelectedDay };
}
