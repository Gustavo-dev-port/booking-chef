import { resolveAppRole, canManageBusiness, canSeeFinancials, canAccessRecipeType, canWriteRecipes } from './permissions';

describe('resolveAppRole', () => {
  it('null sem membership', () => {
    expect(resolveAppRole(null)).toBeNull();
  });

  it('dono vira proprietario, mesmo que role bruto seja outro', () => {
    expect(resolveAppRole({ company_id: 'c1', role: 'qualquer_coisa', is_owner: true })).toBe('proprietario');
  });

  it('funcionário ativo usa o role de employees diretamente', () => {
    expect(resolveAppRole({ company_id: 'c1', role: 'bartender', is_owner: false })).toBe('bartender');
    expect(resolveAppRole({ company_id: 'c1', role: 'visualizador', is_owner: false })).toBe('visualizador');
  });

  it('role desconhecido e não-dono cai pra gerente (acesso amplo, não trava)', () => {
    expect(resolveAppRole({ company_id: 'c1', role: 'administrativo_financeiro', is_owner: false })).toBe('gerente');
  });
});

describe('canManageBusiness / canSeeFinancials', () => {
  it('só proprietario e gerente', () => {
    expect(canManageBusiness('proprietario')).toBe(true);
    expect(canManageBusiness('gerente')).toBe(true);
    expect(canManageBusiness('bartender')).toBe(false);
    expect(canManageBusiness('cozinheiro')).toBe(false);
    expect(canManageBusiness('visualizador')).toBe(false);
    expect(canManageBusiness(null)).toBe(false);
    expect(canSeeFinancials('bartender')).toBe(false);
  });
});

describe('canAccessRecipeType', () => {
  it('bartender só bar, cozinheiro só cozinha', () => {
    expect(canAccessRecipeType('bartender', 'bar')).toBe(true);
    expect(canAccessRecipeType('bartender', 'cozinha')).toBe(false);
    expect(canAccessRecipeType('cozinheiro', 'cozinha')).toBe(true);
    expect(canAccessRecipeType('cozinheiro', 'bar')).toBe(false);
  });

  it('proprietario, gerente e visualizador acessam os dois módulos', () => {
    for (const role of ['proprietario', 'gerente', 'visualizador'] as const) {
      expect(canAccessRecipeType(role, 'bar')).toBe(true);
      expect(canAccessRecipeType(role, 'cozinha')).toBe(true);
    }
  });

  it('sem role (não autenticado/sem membership) não acessa nada', () => {
    expect(canAccessRecipeType(null, 'bar')).toBe(false);
  });
});

describe('canWriteRecipes', () => {
  it('todo mundo escreve, exceto visualizador e sem role', () => {
    expect(canWriteRecipes('proprietario')).toBe(true);
    expect(canWriteRecipes('bartender')).toBe(true);
    expect(canWriteRecipes('visualizador')).toBe(false);
    expect(canWriteRecipes(null)).toBe(false);
  });
});
