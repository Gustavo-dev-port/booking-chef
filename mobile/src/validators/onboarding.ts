import { z } from 'zod';
import { isValidCnpj, normalizeCnpj } from './cnpj';

/**
 * Espelha exatamente os CHECK constraints reais de `public.companies`
 * (conferido no banco `barcontrol-dev` — ver migration `schema`/`rls` de
 * gustavo.developer.souza@gmail.com). Não são valores inventados aqui: se
 * o banco mudar essas listas, este arquivo precisa acompanhar.
 */
export const SEGMENTS = [
  { value: 'bar', label: 'Bar' },
  { value: 'restaurante', label: 'Restaurante' },
  { value: 'lanchonete', label: 'Lanchonete' },
  { value: 'hamburgueria', label: 'Hamburgueria' },
  { value: 'pizzaria', label: 'Pizzaria' },
  { value: 'adega', label: 'Adega' },
  { value: 'cafeteria', label: 'Cafeteria' },
  { value: 'food_truck', label: 'Food truck' },
  { value: 'casa_noturna', label: 'Casa noturna' },
  { value: 'outro', label: 'Outro' },
] as const;

export const EMPLOYEE_RANGES = [
  { value: 'somente_eu', label: 'Somente eu' },
  { value: '2_a_5', label: '2 a 5 pessoas' },
  { value: '6_a_10', label: '6 a 10 pessoas' },
  { value: '11_a_20', label: '11 a 20 pessoas' },
  { value: 'mais_de_20', label: 'Mais de 20 pessoas' },
] as const;

const segmentValues = SEGMENTS.map((s) => s.value) as [string, ...string[]];
const employeeRangeValues = EMPLOYEE_RANGES.map((e) => e.value) as [string, ...string[]];

/**
 * Onboarding completo (Fase 3): perfil do usuário + criação da empresa.
 * Sem campo de "função do usuário" — a função `create_company_with_owner()`
 * já existente no banco sempre grava role = 'proprietario' para quem cria a
 * empresa (é sempre o dono nesse fluxo); não adicionamos parâmetro novo
 * numa função SECURITY DEFINER já revisada em produção.
 */
export const onboardingSchema = z.object({
  name: z.string().trim().min(1, 'Informe seu nome'),
  phone: z.string().trim().optional(),
  cnpj: z
    .string()
    .trim()
    .min(1, 'Informe o CNPJ')
    .transform(normalizeCnpj)
    .refine((v) => isValidCnpj(v), 'CNPJ inválido'),
  legalName: z.string().trim().min(1, 'Informe a razão social'),
  tradeName: z.string().trim().optional(),
  segment: z.enum(segmentValues),
  employeeRange: z.enum(employeeRangeValues),
  city: z.string().trim().min(1, 'Informe a cidade'),
  state: z
    .string()
    .trim()
    .transform((v) => v.toUpperCase())
    .refine((v) => /^[A-Z]{2}$/.test(v), 'UF inválida (2 letras, ex.: SP)'),
  termsAccepted: z
    .boolean()
    .refine((v) => v === true, 'É preciso aceitar os Termos de Uso'),
  marketingOptIn: z.boolean(),
});
export type OnboardingInput = z.infer<typeof onboardingSchema>;
