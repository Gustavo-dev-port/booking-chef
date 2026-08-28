import { buildBookingHtml, type BookingSection } from './pdf';
import type { BookingRecipe } from './api';

function makeRecipe(overrides: Partial<BookingRecipe>): BookingRecipe {
  return {
    id: '1',
    name: 'Caipirinha',
    category: 'Clássicos',
    type: 'bar',
    photo_path: null,
    yield_amount: '1 dose',
    glass_type: 'Copo baixo',
    garnish: 'Limão',
    final_weight: null,
    instructions: 'Bata tudo.',
    notes: null,
    ingredients: [{ ingredient_name: 'Limão', quantity: 1, unit: 'unidade' }],
    ...overrides,
  };
}

describe('buildBookingHtml', () => {
  it('escapa HTML no conteúdo do usuário (nunca injeta markup)', () => {
    const recipe = makeRecipe({ name: '<script>alert(1)</script> & "Especial"' });
    const html = buildBookingHtml({
      companyName: 'Bar Teste',
      typeLabel: 'Bar',
      generatedAtLabel: '28 de agosto de 2026',
      sections: [{ type: 'bar', title: 'Bar', recipes: [recipe] }],
      photoUrls: new Map(),
    });

    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&amp;');
  });

  it('numera as páginas de forma consistente entre o sumário e o rodapé de cada ficha', () => {
    const recipes = [
      makeRecipe({ id: '1', name: 'Caipirinha' }),
      makeRecipe({ id: '2', name: 'Negroni' }),
    ];
    const cozinha = makeRecipe({
      id: '3',
      name: 'Feijoada',
      type: 'cozinha',
      glass_type: null,
      garnish: null,
      final_weight: '1kg',
    });
    const sections: BookingSection[] = [
      { type: 'bar', title: 'Bar', recipes },
      { type: 'cozinha', title: 'Cozinha', recipes: [cozinha] },
    ];

    const html = buildBookingHtml({
      companyName: 'Bar Teste',
      typeLabel: 'Bar e Cozinha',
      generatedAtLabel: '28 de agosto de 2026',
      sections,
      photoUrls: new Map(),
    });

    // Capa = página 1, sumário = página 2, fichas a partir da 3, na ordem das sections.
    expect(html).toContain('Página 1');
    expect(html).toContain('Página 2');

    const summaryStart = html.indexOf('Sumário');
    const firstRecipePageStart = html.indexOf('class="page recipe"');
    const summarySection = html.slice(summaryStart, firstRecipePageStart);
    expect(summarySection).toContain('<span>3</span>'); // Caipirinha
    expect(summarySection).toContain('<span>4</span>'); // Negroni
    expect(summarySection).toContain('<span>5</span>'); // Feijoada

    // Cada ficha aparece antes do próprio "Página N" no documento (footer
    // vem depois do conteúdo) — busca a partir da primeira página de
    // ficha, pra não confundir com a menção ao mesmo nome no sumário.
    const caipirinhaIndex = html.indexOf('Caipirinha', firstRecipePageStart);
    const caipirinhaFooterIndex = html.indexOf('Página 3');
    const negroniIndex = html.indexOf('Negroni', caipirinhaFooterIndex);
    const negroniFooterIndex = html.indexOf('Página 4');
    const feijoadaIndex = html.indexOf('Feijoada', negroniFooterIndex);
    const feijoadaFooterIndex = html.indexOf('Página 5');

    expect(caipirinhaIndex).toBeLessThan(caipirinhaFooterIndex);
    expect(caipirinhaFooterIndex).toBeLessThan(negroniIndex);
    expect(negroniIndex).toBeLessThan(negroniFooterIndex);
    expect(negroniFooterIndex).toBeLessThan(feijoadaIndex);
    expect(feijoadaIndex).toBeLessThan(feijoadaFooterIndex);
  });

  it('mostra copo/decoração só pra Bar e peso final só pra Cozinha', () => {
    const barRecipe = makeRecipe({ type: 'bar', glass_type: 'Taça', garnish: 'Azeitona' });
    const cozinhaRecipe = makeRecipe({ type: 'cozinha', final_weight: '300g', glass_type: null, garnish: null });

    const html = buildBookingHtml({
      companyName: 'Bar Teste',
      typeLabel: 'Bar e Cozinha',
      generatedAtLabel: '28 de agosto de 2026',
      sections: [
        { type: 'bar', title: 'Bar', recipes: [barRecipe] },
        { type: 'cozinha', title: 'Cozinha', recipes: [cozinhaRecipe] },
      ],
      photoUrls: new Map(),
    });

    expect(html).toContain('Copo: Taça');
    expect(html).toContain('Decoração: Azeitona');
    expect(html).toContain('Peso final: 300g');
  });

  it('usa a signed URL do mapa de fotos quando o produto tem photo_path', () => {
    const recipe = makeRecipe({ photo_path: 'empresa/produto/foto.jpg' });
    const photoUrls = new Map([['empresa/produto/foto.jpg', 'https://exemplo.com/assinada.jpg']]);

    const html = buildBookingHtml({
      companyName: 'Bar Teste',
      typeLabel: 'Bar',
      generatedAtLabel: '28 de agosto de 2026',
      sections: [{ type: 'bar', title: 'Bar', recipes: [recipe] }],
      photoUrls,
    });

    expect(html).toContain('src="https://exemplo.com/assinada.jpg"');
  });
});
