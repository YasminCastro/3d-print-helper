export type JournalAttempt = {
  id?: number;
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
  filename: string;
  mime_type: string;
  created_at: string;
};

export type JournalEntryWithAttempts = JournalEntry & {
  attempts: JournalAttempt[];
  photos: JournalPhoto[];
};

export type JournalEntryWithDetails = JournalEntryWithAttempts & {
  filament_name: string | null;
  filament_color: string | null;
};
