export interface HtoColumn {
  id: string;
  label: string;
}

export interface HtoRow {
  id: string;
  code: string; // The value that goes into the generated model code (e.g. "B", "40", "J", or "" for Nil)
  label: string; // Main display title
  values?: Record<string, string>; // Additional column values mapped by column id
}

export interface HtoBlock {
  id: string;
  title: string; // e.g. "① Series Action", "③ Mounting Style", "⑥ Bellows"
  slotIndex: number; // 1 to 12 or more, maps to the slot number in the model code
  displayType: 'table' | 'chips' | 'stroke_matrix';
  columns?: HtoColumn[]; // Used when displayType === 'table'
  rows: HtoRow[];
  chipValues?: (string | number)[]; // Used when displayType === 'chips' (e.g. Bore sizes)
  maxStroke?: number; // Used when displayType === 'stroke_matrix'
  standardStrokes?: number[]; // Used when displayType === 'stroke_matrix'
}

export interface HtoConfig {
  codePrefix?: string; // e.g. "MPC1"
  separator?: string; // Default separator e.g. "-"
  slotDelimiters?: Record<number, string>; // Delimiter AFTER slot #index, e.g. { 1: '', 2: '', 3: '', 4: '-', 5: '', 6: '', 7: '/' }
  totalSlots: number;
  blocks: HtoBlock[];
  defaultSlotValues?: Record<number, string>;
}
