import { AnalyzedNote } from "../audio/analysis";

export type Passage = {
  notes: AnalyzedNote[];
};

export type PiecePractice = {
  passages: Passage[];
};
