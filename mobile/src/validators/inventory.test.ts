import { inventoryItemSchema } from './inventory';

const base = {
  name: 'Limão',
  categoryId: '',
  purchaseUnit: 'un',
  usageUnit: 'un',
  packageContent: '1',
  packagePrice: '1.5',
  minimumQuantity: '10',
  supplierId: '',
  internalCode: '',
  barcode: '',
};

describe('inventoryItemSchema', () => {
  it('aceita um insumo válido, convertendo preço e quantidade mínima pra number', () => {
    const result = inventoryItemSchema.parse(base);
    expect(result.packagePrice).toBe(1.5);
    expect(result.minimumQuantity).toBe(10);
    expect(typeof result.packagePrice).toBe('number');
  });

  it('aceita compra e uso em unidades diferentes, com conversão (garrafa de 750 mL)', () => {
    const result = inventoryItemSchema.parse({
      ...base,
      purchaseUnit: 'un',
      usageUnit: 'ml',
      packageContent: '750',
      packagePrice: '25',
    });
    expect(result.packageContent).toBe(750);
    expect(typeof result.packageContent).toBe('number');
  });

  it('exige nome', () => {
    expect(inventoryItemSchema.safeParse({ ...base, name: '' }).success).toBe(false);
  });

  it('exige unidade de compra e de uso dentre as 5 padronizadas', () => {
    expect(inventoryItemSchema.safeParse({ ...base, purchaseUnit: 'litro' }).success).toBe(false);
    expect(inventoryItemSchema.safeParse({ ...base, usageUnit: 'litro' }).success).toBe(false);
    expect(inventoryItemSchema.safeParse({ ...base, purchaseUnit: 'kg' }).success).toBe(true);
  });

  it('rejeita conteúdo do pacote zero ou negativo (evita divisão por zero no custo)', () => {
    expect(inventoryItemSchema.safeParse({ ...base, packageContent: 0 }).success).toBe(false);
    expect(inventoryItemSchema.safeParse({ ...base, packageContent: -1 }).success).toBe(false);
  });

  it('rejeita preço e quantidade mínima negativos', () => {
    expect(inventoryItemSchema.safeParse({ ...base, packagePrice: -1 }).success).toBe(false);
    expect(inventoryItemSchema.safeParse({ ...base, minimumQuantity: -1 }).success).toBe(false);
  });

  it('categoria, fornecedor, código interno e código de barras são opcionais', () => {
    const minimal = {
      name: 'Água',
      purchaseUnit: 'l',
      usageUnit: 'l',
      packageContent: 1,
      packagePrice: 0,
      minimumQuantity: 0,
    };
    expect(inventoryItemSchema.safeParse(minimal).success).toBe(true);
  });
});
