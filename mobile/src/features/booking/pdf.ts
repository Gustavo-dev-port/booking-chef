import type { RecipeType } from '../../validators/recipe';
import type { BookingRecipe } from './api';

export type BookingSection = { type: RecipeType; title: string; recipes: BookingRecipe[] };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatQuantity(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

function nl2p(text: string): string {
  return escapeHtml(text).replace(/\n/g, '<br/>');
}

const STYLE = `
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  /* FASE1-ARQUITETURA-MOBILE.md pede "A4/preto-e-branco" — fundo sempre
     branco (nunca herdar dark mode do dispositivo) e fotos em escala de
     cinza, sem depender de o usuário configurar isso na impressora. */
  body { margin: 0; background: #ffffff; font-family: -apple-system, Helvetica, Arial, sans-serif; color: #111827; }
  .page { position: relative; min-height: 297mm; padding: 18mm 16mm 22mm; page-break-after: always; }
  .page:last-child { page-break-after: auto; }
  .footer {
    position: absolute; bottom: 8mm; left: 16mm; right: 16mm;
    display: flex; justify-content: space-between; font-size: 9pt; color: #6b7280;
    border-top: 0.5pt solid #d1d5db; padding-top: 3mm;
  }
  .cover { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; }
  .cover .eyebrow { font-size: 11pt; letter-spacing: 2pt; text-transform: uppercase; color: #6b7280; margin-bottom: 6mm; }
  .cover h1 { font-size: 30pt; margin: 0 0 4mm; }
  .cover .subtitle { font-size: 13pt; color: #4b5563; margin: 1mm 0; }
  .summary h2, .recipe-title { font-size: 18pt; margin: 0 0 8mm; }
  .summary-section-title { font-size: 12pt; font-weight: bold; margin: 6mm 0 3mm; color: #1f2937; }
  .summary-item { display: flex; justify-content: space-between; font-size: 11pt; padding: 2mm 0; border-bottom: 0.5pt dotted #d1d5db; }
  .summary-item .name { padding-right: 4mm; }
  .recipe-photo { width: 100%; max-height: 68mm; object-fit: cover; border-radius: 3mm; margin-bottom: 6mm; background: #f3f4f6; filter: grayscale(100%); }
  .recipe-meta { font-size: 10pt; color: #4b5563; margin-bottom: 5mm; }
  table.ingredients { width: 100%; border-collapse: collapse; margin-bottom: 6mm; font-size: 10pt; }
  table.ingredients th, table.ingredients td { border: 0.5pt solid #d1d5db; padding: 2mm 3mm; text-align: left; }
  table.ingredients th { background: #f9fafb; }
  .section-title { font-size: 11pt; font-weight: bold; margin: 5mm 0 2mm; color: #1f2937; }
  .recipe-text { font-size: 10.5pt; line-height: 1.5; }
`;

function footer(companyName: string, pageNumber: number): string {
  return `<div class="footer"><span>${escapeHtml(companyName)}</span><span>Página ${pageNumber}</span></div>`;
}

function coverPage(companyName: string, typeLabel: string, generatedAtLabel: string): string {
  return `
    <div class="page">
      <div class="cover">
        <div class="eyebrow">Booking técnico</div>
        <h1>${escapeHtml(companyName)}</h1>
        <p class="subtitle">${escapeHtml(typeLabel)}</p>
        <p class="subtitle">${escapeHtml(generatedAtLabel)}</p>
      </div>
      ${footer(companyName, 1)}
    </div>`;
}

function summaryPage(companyName: string, sections: BookingSection[]): string {
  let pageNumber = 3; // 1 = capa, 2 = sumário
  const items = sections
    .map((section) => {
      const rows = section.recipes
        .map((recipe) => {
          const row = `<div class="summary-item"><span class="name">${escapeHtml(recipe.name)}</span><span>${pageNumber}</span></div>`;
          pageNumber += 1;
          return row;
        })
        .join('');
      return `<div class="summary-section-title">${escapeHtml(section.title)}</div>${rows}`;
    })
    .join('');

  return `
    <div class="page summary">
      <h2>Sumário</h2>
      ${items}
      ${footer(companyName, 2)}
    </div>`;
}

function recipePage(
  companyName: string,
  type: RecipeType,
  recipe: BookingRecipe,
  photoUrl: string | undefined,
  pageNumber: number
): string {
  const metaParts: string[] = [];
  if (recipe.category) metaParts.push(escapeHtml(recipe.category));
  if (recipe.yield_amount) metaParts.push(`Rendimento: ${escapeHtml(recipe.yield_amount)}`);
  if (type === 'bar') {
    if (recipe.glass_type) metaParts.push(`Copo: ${escapeHtml(recipe.glass_type)}`);
    if (recipe.garnish) metaParts.push(`Decoração: ${escapeHtml(recipe.garnish)}`);
  } else if (recipe.final_weight) {
    metaParts.push(`Peso final: ${escapeHtml(recipe.final_weight)}`);
  }

  const ingredientsTable = recipe.ingredients.length
    ? `<table class="ingredients">
        <thead><tr><th>Ingrediente</th><th>Quantidade</th><th>Unidade</th></tr></thead>
        <tbody>
          ${recipe.ingredients
            .map(
              (i) =>
                `<tr><td>${escapeHtml(i.ingredient_name)}</td><td>${formatQuantity(i.quantity)}</td><td>${escapeHtml(i.unit)}</td></tr>`
            )
            .join('')}
        </tbody>
      </table>`
    : '';

  const instructions = recipe.instructions
    ? `<div class="section-title">Modo de preparo</div><div class="recipe-text">${nl2p(recipe.instructions)}</div>`
    : '';
  const notes = recipe.notes
    ? `<div class="section-title">Observações</div><div class="recipe-text">${nl2p(recipe.notes)}</div>`
    : '';

  return `
    <div class="page recipe">
      <div>
        ${photoUrl ? `<img class="recipe-photo" src="${escapeHtml(photoUrl)}" />` : ''}
        <h2 class="recipe-title">${escapeHtml(recipe.name)}</h2>
        ${metaParts.length ? `<div class="recipe-meta">${metaParts.join(' · ')}</div>` : ''}
        ${ingredientsTable}
        ${instructions}
        ${notes}
      </div>
      ${footer(companyName, pageNumber)}
    </div>`;
}

/**
 * Monta o HTML completo do booking: capa → sumário → 1 ficha por página →
 * rodapé (nome da empresa + nº de página), como pedido em
 * FASE1-ARQUITETURA-MOBILE.md, seção 5. Números de página são calculados
 * na mão (capa=1, sumário=2, cada ficha = 1 página sequencial a partir da
 * 3) — funciona porque cada ficha ocupa exatamente um `.page` com
 * `page-break-after: always`; uma ficha com conteúdo excepcionalmente
 * longo pode transbordar pra página seguinte e desalinhar a numeração a
 * partir dali (limitação aceita, não é comum no volume de uma ficha
 * técnica normal).
 */
export function buildBookingHtml(params: {
  companyName: string;
  typeLabel: string;
  generatedAtLabel: string;
  sections: BookingSection[];
  photoUrls: Map<string, string>;
}): string {
  const { companyName, typeLabel, generatedAtLabel, sections, photoUrls } = params;

  let pageNumber = 3;
  const recipePages = sections
    .flatMap((section) =>
      section.recipes.map((recipe) => {
        const photoUrl = recipe.photo_path ? photoUrls.get(recipe.photo_path) : undefined;
        const html = recipePage(companyName, section.type, recipe, photoUrl, pageNumber);
        pageNumber += 1;
        return html;
      })
    )
    .join('');

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>${STYLE}</style>
  </head>
  <body>
    ${coverPage(companyName, typeLabel, generatedAtLabel)}
    ${summaryPage(companyName, sections)}
    ${recipePages}
  </body>
</html>`;
}
