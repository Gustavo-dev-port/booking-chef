import { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BackButton } from '../../../../src/components/BackButton';
import { FormField } from '../../../../src/components/FormField';
import { KeyboardAvoidingScreen } from '../../../../src/components/KeyboardAvoidingScreen';
import { PickerWithCreate } from '../../../../src/components/PickerWithCreate';
import { PrimaryButton } from '../../../../src/components/PrimaryButton';
import { UnitPicker } from '../../../../src/components/UnitPicker';
import {
  inventoryItemSchema,
  type InventoryItemFormValues,
  type InventoryItemInput,
} from '../../../../src/validators/inventory';
import {
  archiveInventoryItem,
  createCategory,
  createInventoryItem,
  createSupplier,
  getInventoryItem,
  listCategories,
  listInventoryItems,
  listSuppliers,
  updateInventoryItem,
  type NamedOption,
} from '../../../../src/features/inventory/api';
import { useAuthStore } from '../../../../src/features/auth/store';
import { canManageBusiness, resolveAppRole } from '../../../../src/features/team/permissions';
import { useRoleGuard } from '../../../../src/hooks/useRoleGuard';
import { useConfirmDiscardChanges } from '../../../../src/hooks/useConfirmDiscardChanges';
import { findSimilarExistingName } from '../../../../src/features/recipes/ingredientName';
import { ingredientUnitLabel } from '../../../../src/validators/recipe';

const EMPTY_VALUES: InventoryItemFormValues = {
  name: '',
  categoryId: '',
  // Sempre "Un" — compra-se sempre em unidades inteiras (garrafa, caixa,
  // pacote...); só o volume/peso dentro de cada unidade varia (pedido do
  // usuário: "quantidade sempre vai ser em Unidade, volume pode variar").
  purchaseUnit: 'un',
  usageUnit: 'un',
  packageContent: 1,
  packagePrice: 0,
  minimumQuantity: 0,
  supplierId: '',
  internalCode: '',
  barcode: '',
};

/**
 * Cadastro/edição de insumo (V2, Épico 06 — Estoque, história 06.1).
 * `current_quantity` nunca aparece aqui, de propósito: só muda via
 * lançamento de movimentação — ver app/(app)/inventory/[id]/movements.tsx
 * e a função register_inventory_movement() no banco.
 */
export default function InventoryItemEditorScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const isNew = params.id === 'new';
  const membership = useAuthStore((s) => s.membership);
  const companyId = membership?.company_id;
  useRoleGuard(canManageBusiness(resolveAppRole(membership)));

  const [loading, setLoading] = useState(!isNew);
  const [formError, setFormError] = useState<string | null>(null);
  const [categories, setCategories] = useState<NamedOption[]>([]);
  const [suppliers, setSuppliers] = useState<NamedOption[]>([]);
  const [existingNames, setExistingNames] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { isSubmitting, isDirty },
  } = useForm<InventoryItemFormValues, unknown, InventoryItemInput>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: EMPTY_VALUES,
  });

  const usageUnit = useWatch({ control, name: 'usageUnit' });
  const packageContent = useWatch({ control, name: 'packageContent' });
  const packagePrice = useWatch({ control, name: 'packagePrice' });
  const usageUnitLabel = ingredientUnitLabel(usageUnit || 'un');
  const parsedPackageContent = Number(packageContent);
  const parsedPackagePrice = Number(packagePrice);
  const unitCostPreview =
    parsedPackageContent > 0 && !Number.isNaN(parsedPackagePrice)
      ? parsedPackagePrice / parsedPackageContent
      : null;

  useEffect(() => {
    if (!companyId) return;
    Promise.all([listCategories(companyId), listSuppliers(companyId), listInventoryItems(companyId)]).then(
      ([cats, sups, items]) => {
        setCategories(cats);
        setSuppliers(sups);
        // Pra avisar de nome parecido/duplicado ao criar (ver onSubmit) —
        // exclui o próprio item quando editando, senão ele "colide" com
        // o próprio nome.
        setExistingNames(items.filter((i) => i.id !== params.id).map((i) => i.name));
      }
    );
  }, [companyId, params.id]);

  useEffect(() => {
    if (isNew) return;
    getInventoryItem(params.id).then((item) => {
      if (!item) {
        setFormError('Insumo não encontrado.');
        setLoading(false);
        return;
      }
      reset({
        name: item.name,
        categoryId: item.category_id ?? '',
        // Sempre "Un", mesmo que um insumo cadastrado antes desta mudança
        // tenha outro valor salvo — ver comentário em EMPTY_VALUES.
        purchaseUnit: 'un',
        usageUnit: item.usage_unit as InventoryItemFormValues['usageUnit'],
        packageContent: item.package_content,
        packagePrice: item.package_price,
        minimumQuantity: item.minimum_quantity,
        supplierId: item.supplier_id ?? '',
        internalCode: item.internal_code ?? '',
        barcode: item.barcode ?? '',
      });
      setLoading(false);
    });
  }, [isNew, params.id, reset]);

  const saveItem = async (data: InventoryItemInput) => {
    if (!companyId) return;
    setFormError(null);
    try {
      if (isNew) {
        await createInventoryItem(companyId, data);
      } else {
        await updateInventoryItem(params.id, data);
      }
      // Zera isDirty antes de voltar, pra esse mesmo router.back() não
      // reabrir o aviso de "sair sem salvar" — ver useConfirmDiscardChanges.
      reset(getValues());
      router.back();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível salvar o insumo.');
    }
  };

  /**
   * Aviso de possível duplicata (ex.: "Vermute" vs "Vermuth", "Água" vs
   * "agua") só ao CRIAR — editar um insumo existente não compara contra
   * si mesmo de novo a cada salvamento. Não bloqueia, só confirma —
   * às vezes são produtos de verdade diferentes com nome parecido.
   */
  const onSubmit = async (data: InventoryItemInput) => {
    const similar = isNew ? findSimilarExistingName(data.name, existingNames) : null;
    if (similar) {
      Alert.alert(
        'Já existe um insumo parecido',
        `Você já tem "${similar}" cadastrado. Criar "${data.name}" mesmo assim?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Criar mesmo assim', onPress: () => saveItem(data) },
        ]
      );
      return;
    }
    await saveItem(data);
  };

  useConfirmDiscardChanges(isDirty, handleSubmit(onSubmit));

  const handleArchive = () => {
    if (isNew) return;
    Alert.alert('Arquivar insumo', 'Esse insumo some da lista, mas fica preservado no histórico. Continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Arquivar',
        style: 'destructive',
        onPress: async () => {
          await archiveInventoryItem(params.id);
          router.back();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Text className="text-base text-gray-500 dark:text-gray-400">Carregando…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingScreen className="flex-1 bg-white dark:bg-gray-900" contentContainerClassName="px-6 py-16">
      <BackButton />
      <Text className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-50">
        {isNew ? 'Novo insumo' : 'Editar insumo'}
      </Text>

      <FormField control={control} name="name" label="Nome" />

      {!isNew ? (
        <Link href={`/inventory/${params.id}/movements`} asChild>
          <PrimaryButton label="Lançar movimentação / ver histórico" variant="outline" />
        </Link>
      ) : null}
      {!isNew ? <View className="mb-4" /> : null}

      <PickerWithCreate
        control={control}
        name="categoryId"
        label="Categoria (opcional)"
        options={categories}
        onCreate={(name) => createCategory(companyId!, name)}
        onCreated={(option) => setCategories((prev) => [...prev, option])}
      />

      <UnitPicker control={control} name="usageUnit" label="Unidade de uso (nas receitas)" />

      <View className="flex-row gap-3">
        <View className="flex-1">
          <FormField
            control={control}
            name="packageContent"
            label={`${usageUnitLabel} por unidade`}
            keyboardType="decimal-pad"
            placeholder="Ex.: 750"
          />
        </View>
        <View className="flex-1">
          <FormField
            control={control}
            name="packagePrice"
            label="Preço por unidade"
            keyboardType="decimal-pad"
            placeholder="Ex.: 25,00"
          />
        </View>
      </View>

      {unitCostPreview !== null ? (
        <Text className="mb-4 -mt-2 text-sm text-gray-500 dark:text-gray-400">
          Custo por {usageUnitLabel}: R$ {unitCostPreview.toFixed(4)}
        </Text>
      ) : null}

      <FormField
        control={control}
        name="minimumQuantity"
        label={`Quantidade mínima (${usageUnitLabel})`}
        keyboardType="decimal-pad"
      />

      <PickerWithCreate
        control={control}
        name="supplierId"
        label="Fornecedor (opcional)"
        options={suppliers}
        onCreate={(name) => createSupplier(companyId!, name)}
        onCreated={(option) => setSuppliers((prev) => [...prev, option])}
      />

      <FormField control={control} name="internalCode" label="Código interno (opcional)" />
      <FormField control={control} name="barcode" label="Código de barras (opcional)" />

      {formError ? <Text className="mb-4 text-sm text-red-600">{formError}</Text> : null}

      <View className="mb-3">
        <PrimaryButton label="Salvar insumo" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
      </View>

      {!isNew ? <PrimaryButton label="Arquivar insumo" variant="outline" onPress={handleArchive} /> : null}
    </KeyboardAvoidingScreen>
  );
}
