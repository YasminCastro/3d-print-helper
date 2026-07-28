export type JournalAttempt = {
  id: number;
  entry_id: number;
  position: number;
  attempt: string | null;
  worked: number | null;
};

export type JournalEntry = {
  id: number;
  title: string;
  entry_date: string | null;
  filament_id: number | null;
  status: string | null;
  symptom: string | null;
  possible_causes: string | null;
  notes: string | null;
  created_at: string;
};

export type JournalPhoto = {
  id: number;
  entry_id: number;
  filename: string;
  created_at: string;
};

export type JournalEntryWithFilament = JournalEntry & {
  filament_name: string | null;
  filament_color: string | null;
};

export type JournalEntryWithDetails = JournalEntryWithFilament & {
  attempts: JournalAttempt[];
  photos: JournalPhoto[];
};
