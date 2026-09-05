import { inventoryItemSchema } from './inventory';

const base = {
  name: 'Limão',
  categoryId: '',
  unit: 'un',
  pricePerUnit: '1.5',
  minimumQuantity: '10',
  supplierId: '',
  internalCode: '',
  barcode: '',
};

describe('inventoryItemSchema', () => {
  it('aceita um insumo válido, convertendo preço e quantidade mínima pra number', () => {
    const result = inventoryItemSchema.parse(base);
    expect(result.pricePerUnit).toBe(1.5);
    expect(result.minimumQuantity).toBe(10);
    expect(typeof result.pricePerUnit).toBe('number');
  });

  it('exige nome', () => {
    expect(inventoryItemSchema.safeParse({ ...base, name: '' }).success).toBe(false);
  });

  it('exige unidade dentre as 5 padronizadas', () => {
    expect(inventoryItemSchema.safeParse({ ...base, unit: 'litro' }).success).toBe(false);
    expect(inventoryItemSchema.safeParse({ ...base, unit: 'kg' }).success).toBe(true);
  });

  it('rejeita preço e quantidade mínima negativos', () => {
    expect(inventoryItemSchema.safeParse({ ...base, pricePerUnit: -1 }).success).toBe(false);
    expect(inventoryItemSchema.safeParse({ ...base, minimumQuantity: -1 }).success).toBe(false);
  });

  it('categoria, fornecedor, código interno e código de barras são opcionais', () => {
    const minimal = { name: 'Água', unit: 'l', pricePerUnit: 0, minimumQuantity: 0 };
    expect(inventoryItemSchema.safeParse(minimal).success).toBe(true);
  });
});
