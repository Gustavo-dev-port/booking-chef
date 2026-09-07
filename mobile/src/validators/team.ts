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
