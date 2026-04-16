-- Tabela de cálculos salvos por usuária
CREATE TABLE IF NOT EXISTS calculos_salvos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id  UUID NOT NULL REFERENCES usuarios_precifique(id) ON DELETE CASCADE,
  nome        TEXT,
  custo       NUMERIC NOT NULL,
  frete       NUMERIC NOT NULL DEFAULT 0,
  despesas    JSONB NOT NULL DEFAULT '[]',
  taxas       JSONB NOT NULL DEFAULT '[]',
  margem      NUMERIC NOT NULL,
  preco_venda NUMERIC NOT NULL,
  lucro       NUMERIC NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS calculos_salvos_usuario_idx ON calculos_salvos(usuario_id);
