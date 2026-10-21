-- Indeks na t: DELETE WHERE t < ? (dnevno ciscenje) in MIN(t) brez branja cele tabele
CREATE INDEX IF NOT EXISTS w_t ON w (t);
