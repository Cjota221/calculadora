-- Adiciona campo nicho à tabela usuarios_precifique
ALTER TABLE usuarios_precifique
  ADD COLUMN IF NOT EXISTS nicho TEXT;
