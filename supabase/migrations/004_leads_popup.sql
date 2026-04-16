-- Leads capturados pelo popup da landing page
CREATE TABLE IF NOT EXISTS leads_popup (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome       TEXT NOT NULL,
  telefone   TEXT NOT NULL,
  origem     TEXT DEFAULT 'popup',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS leads_popup_created_idx ON leads_popup(created_at DESC);
