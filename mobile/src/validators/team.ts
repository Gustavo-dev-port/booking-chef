import { z } from 'zod';
import { EMPLOYEE_ROLES } from '../features/team/role';

const roleValues = EMPLOYEE_ROLES.map((r) => r.value) as [string, ...string[]];

/** Convite de funcionário (V2, Épico 08, história 08.1). */
export const employeeInviteSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome'),
  email: z.string().trim().min(1, 'Informe o email').email('Email inválido'),
  role: z.enum(roleValues, { error: 'Escolha um cargo' }),
});
export type EmployeeInviteInput = z.infer<typeof employeeInviteSchema>;

/** Ativação de conta convidada (V2, Épico 08, história 08.2) — mesmo formato de senha da reset-password/signup. */
export const acceptInviteSchema = z
  .object({
    password: z.string().min(8, 'Mínimo de 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a senha'),
    termsAccepted: z.boolean().refine((v) => v === true, 'É preciso aceitar os Termos de Uso'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
