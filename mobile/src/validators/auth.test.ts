import { forgotPasswordSchema, loginSchema, resetPasswordSchema, signupSchema } from './auth';

describe('loginSchema', () => {
  it('aceita email e senha válidos', () => {
    const result = loginSchema.safeParse({ email: 'dono@bar.com', password: 'qualquer' });
    expect(result.success).toBe(true);
  });

  it('rejeita email inválido', () => {
    expect(loginSchema.safeParse({ email: 'não-é-email', password: 'x' }).success).toBe(false);
  });

  it('rejeita senha vazia', () => {
    expect(loginSchema.safeParse({ email: 'dono@bar.com', password: '' }).success).toBe(false);
  });
});

describe('signupSchema', () => {
  const base = { email: 'dono@bar.com', password: 'senha1234', confirmPassword: 'senha1234' };

  it('aceita quando as senhas coincidem e têm 8+ caracteres', () => {
    expect(signupSchema.safeParse(base).success).toBe(true);
  });

  it('rejeita senha curta', () => {
    const result = signupSchema.safeParse({ ...base, password: '123', confirmPassword: '123' });
    expect(result.success).toBe(false);
  });

  it('rejeita quando confirmação não bate — erro aponta pro campo certo', () => {
    const result = signupSchema.safeParse({ ...base, confirmPassword: 'outrasenha' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['confirmPassword']);
    }
  });
});

describe('forgotPasswordSchema', () => {
  it('exige email válido', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'dono@bar.com' }).success).toBe(true);
    expect(forgotPasswordSchema.safeParse({ email: '' }).success).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  it('exige as duas senhas iguais', () => {
    expect(
      resetPasswordSchema.safeParse({ password: 'senha1234', confirmPassword: 'senha1234' }).success
    ).toBe(true);
    expect(
      resetPasswordSchema.safeParse({ password: 'senha1234', confirmPassword: 'diferente' }).success
    ).toBe(false);
  });
});
