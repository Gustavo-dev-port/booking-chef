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
  listSuppliers,
  updateInventoryItem,
  type NamedOption,
} from '../../../../src/features/inventory/api';
import { useAuthStore } from '../../../../src/features/auth/store';
import { ingredientUnitLabel } from '../../../../src/validators/recipe';

const EMPTY_VALUES: InventoryItemFormValues = {
  name: '',
  categoryId: '',
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
  const companyId = useAuthStore((s) => s.membership?.company_id);

  const [loading, setLoading] = useState(!isNew);
  const [formError, setFormError] = useState<string | null>(null);
  const [categories, setCategories] = useState<NamedOption[]>([]);
  const [suppliers, setSuppliers] = useState<NamedOption[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<InventoryItemFormValues, unknown, InventoryItemInput>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: EMPTY_VALUES,
  });

  const purchaseUnit = useWatch({ control, name: 'purchaseUnit' });
  const usageUnit = useWatch({ control, name: 'usageUnit' });
  const packageContent = useWatch({ control, name: 'packageContent' });
  const packagePrice = useWatch({ control, name: 'packagePrice' });
  const purchaseUnitLabel = ingredientUnitLabel(purchaseUnit || 'un');
  const usageUnitLabel = ingredientUnitLabel(usageUnit || 'un');
  const parsedPackageContent = Number(packageContent);
  const parsedPackagePrice = Number(packagePrice);
  const unitCostPreview =
    parsedPackageContent > 0 && !Number.isNaN(parsedPackagePrice)
      ? parsedPackagePrice / parsedPackageContent
      : null;

  useEffect(() => {
    if (!companyId) return;
    Promise.all([listCategories(companyId), listSuppliers(companyId)]).then(([cats, sups]) => {
      setCategories(cats);
      setSuppliers(sups);
    });
  }, [companyId]);

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
        purchaseUnit: item.purchase_unit as InventoryItemFormValues['purchaseUnit'],
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

  const onSubmit = async (data: InventoryItemInput) => {
    if (!companyId) return;
    setFormError(null);
    try {
      if (isNew) {
        await createInventoryItem(companyId, data);
      } else {
        await updateInventoryItem(params.id, data);
      }
      router.back();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível salvar o insumo.');
    }
  };

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

      <Text className="mb-1 mt-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Compra × uso
      </Text>
      <Text className="mb-3 text-sm text-gray-500 dark:text-gray-400">
        Quantidade (quanto você compra) e volume (quanto tem em cada compra) são coisas diferentes — ex.: 1
        garrafa (unidade de compra) tem 750 mL (unidade de uso).
      </Text>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <UnitPicker control={control} name="purchaseUnit" label="Unidade de compra" />
        </View>
        <View className="flex-1">
          <UnitPicker control={control} name="usageUnit" label="Unidade de uso (receitas)" />
        </View>
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <FormField
            control={control}
            name="packageContent"
            label={`${usageUnitLabel} por ${purchaseUnitLabel}`}
            keyboardType="decimal-pad"
            hint={`Ex.: 750 se 1 ${purchaseUnitLabel} tem 750 ${usageUnitLabel}`}
          />
        </View>
        <View className="flex-1">
          <FormField
            control={control}
            name="packagePrice"
            label={`Preço por ${purchaseUnitLabel}`}
            keyboardType="decimal-pad"
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
