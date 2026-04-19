-- Adicionar campo de rastreamento de afiliado em usuários
ALTER TABLE usuarios_precifique ADD COLUMN IF NOT EXISTS afiliado_ref TEXT;

-- Tabela de afiliados
CREATE TABLE IF NOT EXISTS afiliados (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome            TEXT NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  senha_hash      TEXT NOT NULL,
  whatsapp        TEXT NOT NULL,
  chave_pix       TEXT NOT NULL,
  tipo_pix        TEXT NOT NULL DEFAULT 'cpf',
  codigo_afiliado TEXT UNIQUE NOT NULL,
  total_vendas    INTEGER DEFAULT 0,
  total_ganho     NUMERIC(10,2) DEFAULT 0,
  ativo           BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de comissões
CREATE TABLE IF NOT EXISTS comissoes (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  afiliado_id     UUID REFERENCES afiliados(id) NOT NULL,
  comprador_email TEXT,
  valor_venda     NUMERIC(10,2) DEFAULT 37.90,
  valor_comissao  NUMERIC(10,2) DEFAULT 12.90,
  mp_payment_id   TEXT,
  status          TEXT DEFAULT 'pendente',
  pago_em         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_afiliados_codigo ON afiliados(codigo_afiliado);
CREATE INDEX IF NOT EXISTS idx_comissoes_afiliado ON comissoes(afiliado_id);
CREATE INDEX IF NOT EXISTS idx_comissoes_status ON comissoes(status);

ALTER TABLE afiliados ENABLE ROW LEVEL SECURITY;
ALTER TABLE comissoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_afiliados" ON afiliados FOR ALL USING (true);
CREATE POLICY "service_role_all_comissoes" ON comissoes FOR ALL USING (true);

-- Função para incrementar totais do afiliado atomicamente
CREATE OR REPLACE FUNCTION incrementar_totais_afiliado(
  p_afiliado_id UUID,
  p_valor NUMERIC
) RETURNS void AS $$
BEGIN
  UPDATE afiliados
  SET total_vendas = total_vendas + 1,
      total_ganho  = total_ganho  + p_valor
  WHERE id = p_afiliado_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
