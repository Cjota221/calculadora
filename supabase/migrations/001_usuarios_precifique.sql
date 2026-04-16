-- Tabela de usuários do Precifique (novo fluxo com Supabase Auth + MP)
CREATE TABLE IF NOT EXISTS usuarios_precifique (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id    UUID UNIQUE,
  nome            TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  telefone        TEXT,
  status          TEXT NOT NULL DEFAULT 'pendente'
                  CHECK (status IN ('pendente', 'ativo', 'cancelado')),
  mp_payment_id   TEXT,
  mp_external_ref TEXT UNIQUE,
  plano           TEXT NOT NULL DEFAULT 'vitalicio',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  ativado_em      TIMESTAMPTZ
);

-- RLS: usuária só vê seus próprios dados
ALTER TABLE usuarios_precifique ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuario_ve_proprio" ON usuarios_precifique
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "usuario_atualiza_proprio" ON usuarios_precifique
  FOR UPDATE USING (auth.uid() = auth_user_id);
