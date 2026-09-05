import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { BackButton } from '../../src/components/BackButton';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { useAuthStore } from '../../src/features/auth/store';
import { canAccessRecipeType, resolveAppRole } from '../../src/features/team/permissions';
import { getCompanyName, listRecipesForBooking, type BookingRecipe } from '../../src/features/booking/api';
import { buildBookingHtml, type BookingSection } from '../../src/features/booking/pdf';
import { getRecipePhotoUrl } from '../../src/features/recipes/photos';
import { RECIPE_TYPE_LABELS, type RecipeType } from '../../src/validators/recipe';

type Selection = RecipeType | 'both';

const ALL_SELECTION_OPTIONS: Array<{ value: Selection; label: string }> = [
  { value: 'bar', label: 'Booking do Bar' },
  { value: 'cozinha', label: 'Booking da Cozinha' },
  { value: 'both', label: 'Os dois' },
];

/** A4 em pontos (72dpi) — 210mm × 297mm. */
const A4 = { width: 595, height: 842 };

function selectionTypes(selection: Selection): RecipeType[] {
  return selection === 'both' ? ['bar', 'cozinha'] : [selection];
}

function typeLabel(selection: Selection): string {
  return selection === 'both' ? 'Bar e Cozinha' : RECIPE_TYPE_LABELS[selection];
}

async function resolvePhotoUrls(recipes: BookingRecipe[]): Promise<Map<string, string>> {
  const paths = Array.from(new Set(recipes.map((r) => r.photo_path).filter((p): p is string => !!p)));
  const entries = await Promise.all(
    paths.map(async (path) => [path, await getRecipePhotoUrl(path)] as const)
  );
  const map = new Map<string, string>();
  for (const [path, url] of entries) {
    if (url) map.set(path, url);
  }
  return map;
}

export default function BookingScreen() {
  const membership = useAuthStore((s) => s.membership);
  const companyId = membership?.company_id;
  const role = useMemo(() => resolveAppRole(membership), [membership]);
  // V2, história 08.3 — bartender só gera booking do Bar, cozinheiro só
  // da Cozinha (a RLS de products bloquearia o outro tipo de qualquer
  // jeito; isso evita oferecer uma opção que sempre viria vazia).
  const SELECTION_OPTIONS = useMemo(
    () =>
      ALL_SELECTION_OPTIONS.filter(
        (option) => option.value === 'both' ? canAccessRecipeType(role, 'bar') && canAccessRecipeType(role, 'cozinha') : canAccessRecipeType(role, option.value)
      ),
    [role]
  );
  const [selection, setSelection] = useState<Selection>(
    SELECTION_OPTIONS.some((o) => o.value === 'both') ? 'both' : SELECTION_OPTIONS[0]?.value ?? 'both'
  );
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!companyId) return;
    setError(null);
    setGenerating(true);
    try {
      const types = selectionTypes(selection);
      const [companyName, recipes] = await Promise.all([
        getCompanyName(companyId),
        listRecipesForBooking(companyId, types),
      ]);

      if (recipes.length === 0) {
        setError('Nenhuma ficha técnica cadastrada ainda nesse módulo.');
        return;
      }

      const photoUrls = await resolvePhotoUrls(recipes);

      const sections: BookingSection[] = types
        .map((type) => ({
          type,
          title: RECIPE_TYPE_LABELS[type],
          recipes: recipes.filter((r) => r.type === type),
        }))
        .filter((section) => section.recipes.length > 0);

      const html = buildBookingHtml({
        companyName,
        typeLabel: typeLabel(selection),
        generatedAtLabel: new Date().toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
        sections,
        photoUrls,
      });

      const { uri } = await Print.printToFileAsync({ html, width: A4.width, height: A4.height });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Compartilhar booking' });
      } else {
        await Print.printAsync({ uri });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível gerar o booking.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-surface-card dark:bg-surface-card-dark" contentContainerClassName="flex-grow justify-center px-6 py-12">
      <BackButton />
      <Text className="mb-1 text-2xl font-archivo-bold text-ink dark:text-ink-dark">Gerar Booking</Text>
      <Text className="mb-8 text-base text-ink-secondary dark:text-ink-secondary-dark">
        Um PDF com capa, sumário e uma ficha por página — pronto pra imprimir.
      </Text>

      <View className="mb-8 gap-3">
        {SELECTION_OPTIONS.map((option) => {
          const selected = selection === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => setSelection(option.value)}
              className={
                'min-h-[44px] flex-row items-center gap-3 rounded-xl border px-4 py-3 ' +
                (selected ? 'border-brand dark:border-brand-dark bg-warning-bg dark:bg-surface-border-dark' : 'border-surface-input-border dark:border-surface-border-dark bg-surface-card dark:bg-surface-card-dark')
              }
            >
              <View
                className={
                  'h-5 w-5 items-center justify-center rounded-full border-2 ' +
                  (selected ? 'border-brand dark:border-brand-dark' : 'border-surface-input-border dark:border-surface-border-dark')
                }
              >
                {selected ? <View className="h-2.5 w-2.5 rounded-full bg-brand dark:bg-brand-dark" /> : null}
              </View>
              <Text className="text-base text-ink dark:text-ink-dark">{option.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {error ? <Text className="mb-4 text-sm text-danger dark:text-danger-dark">{error}</Text> : null}

      <PrimaryButton label="Gerar PDF" onPress={handleGenerate} loading={generating} />
    </ScrollView>
  );
}
