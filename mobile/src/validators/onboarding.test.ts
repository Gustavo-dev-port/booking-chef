import { onboardingSchema } from './onboarding';

const validInput = {
  name: 'Maria Silva',
  phone: '',
  cnpj: '11.014.400/0001-72',
  legalName: 'Bar da Maria LTDA',
  tradeName: '',
  segment: 'bar',
  employeeRange: 'somente_eu',
  city: 'São Paulo',
  state: 'sp',
  termsAccepted: true,
  marketingOptIn: false,
};

describe('onboardingSchema', () => {
  it('aceita um cadastro completo válido', () => {
    const result = onboardingSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('normaliza o CNPJ (só dígitos) e a UF (maiúscula) na saída', () => {
    const result = onboardingSchema.parse(validInput);
    expect(result.cnpj).toBe('11014400000172');
    expect(result.state).toBe('SP');
  });

  it('rejeita CNPJ com dígito verificador inválido', () => {
    const result = onboardingSchema.safeParse({ ...validInput, cnpj: '11.014.400/0001-73' });
    expect(result.success).toBe(false);
  });

  it('rejeita UF que não são 2 letras', () => {
    expect(onboardingSchema.safeParse({ ...validInput, state: 'São Paulo' }).success).toBe(false);
    expect(onboardingSchema.safeParse({ ...validInput, state: 'S' }).success).toBe(false);
  });

  it('rejeita segmento fora da lista permitida pelo banco', () => {
    expect(onboardingSchema.safeParse({ ...validInput, segment: 'academia' }).success).toBe(false);
  });

  it('exige aceitar os termos', () => {
    expect(onboardingSchema.safeParse({ ...validInput, termsAccepted: false }).success).toBe(false);
  });

  it('não exige nome fantasia nem telefone (opcionais)', () => {
    const { tradeName, phone, ...rest } = validInput;
    expect(onboardingSchema.safeParse(rest).success).toBe(true);
  });
});
