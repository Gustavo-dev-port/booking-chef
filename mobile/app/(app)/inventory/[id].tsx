import { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BackButton } from '../../../src/components/BackButton';
import { FormField } from '../../../src/components/FormField';
import { KeyboardAvoidingScreen } from '../../../src/components/KeyboardAvoidingScreen';
import { PickerWithCreate } from '../../../src/components/PickerWithCreate';
import { PrimaryButton } from '../../../src/components/PrimaryButton';
import { UnitPicker } from '../../../src/components/UnitPicker';
import {
  inventoryItemSchema,
  type InventoryItemFormValues,
  type InventoryItemInput,
} from '../../../src/validators/inventory';
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
} from '../../../src/features/inventory/api';
import { useAuthStore } from '../../../src/features/auth/store';

const EMPTY_VALUES: InventoryItemFormValues = {
  name: '',
  categoryId: '',
  unit: 'un',
  pricePerUnit: 0,
  minimumQuantity: 0,
  supplierId: '',
  internalCode: '',
  barcode: '',
};

/**
 * Cadastro/edição de insumo (V2, Épico 06 — Estoque, história 06.1).
 * `current_quantity` nunca aparece aqui, de propósito: só é alterado via
 * lançamento de movimentação (Sprint 2, ainda não construído) — ver
 * comentário na coluna, docs/07_DATABASE.md.
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
        unit: item.usage_unit as InventoryItemFormValues['unit'],
        pricePerUnit: item.package_price,
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

      <PickerWithCreate
        control={control}
        name="categoryId"
        label="Categoria (opcional)"
        options={categories}
        onCreate={(name) => createCategory(companyId!, name)}
        onCreated={(option) => setCategories((prev) => [...prev, option])}
      />

      <View className="flex-row gap-3">
        <View className="flex-1">
          <UnitPicker control={control} name="unit" label="Unidade" />
        </View>
        <View className="flex-1">
          <FormField control={control} name="pricePerUnit" label="Preço por unidade" keyboardType="decimal-pad" />
        </View>
      </View>

      <FormField control={control} name="minimumQuantity" label="Quantidade mínima" keyboardType="decimal-pad" />

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
