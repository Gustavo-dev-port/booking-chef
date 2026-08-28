/**
 * Busca de dados públicos de CNPJ — BrasilAPI (brasilapi.com.br), gratuita,
 * sem chave de API, mantida pela comunidade. Só preenche o formulário;
 * nada disso é gravado sem o usuário revisar e confirmar o cadastro.
 */
export type CnpjLookupResult = {
  legalName: string;
  tradeName: string | null;
  city: string | null;
  state: string | null;
};

/** @returns null se não encontrado ou se a API falhar — nunca lança. */
export async function lookupCnpj(cnpjDigits: string): Promise<CnpjLookupResult | null> {
  try {
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjDigits}`);
    if (!response.ok) return null;

    const data = (await response.json()) as {
      razao_social?: string;
      nome_fantasia?: string;
      municipio?: string;
      uf?: string;
    };
    if (!data.razao_social) return null;

    return {
      legalName: data.razao_social,
      tradeName: data.nome_fantasia || null,
      city: data.municipio || null,
      state: data.uf || null,
    };
  } catch {
    return null;
  }
}
