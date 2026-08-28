import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { supabase } from '../../lib/supabase';

/**
 * Bucket privado (não público), criado direto no banco — ver migration
 * `product_photos_storage_bucket`. Acesso via RLS por company_id: o caminho
 * do objeto começa com `{company_id}/...`, e as policies do bucket
 * verificam se o usuário pertence a essa empresa. Por ser privado, exibir a
 * foto exige uma signed URL (createSignedUrl) — nunca uma URL pública direta.
 */
const BUCKET = 'product-photos';

export type PickedPhoto = { uri: string; mimeType: string };

/** Pede permissão e abre o seletor de imagens. Retorna null se cancelado/negado. */
export async function pickPhoto(): Promise<PickedPhoto | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Permissão necessária', 'Autorize o acesso às fotos para adicionar uma imagem.');
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.7,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) return null;

  const asset = result.assets[0];
  return { uri: asset.uri, mimeType: asset.mimeType ?? 'image/jpeg' };
}

/** @returns o `photo_path` gravado em `products.photo_path`. */
export async function uploadRecipePhoto(
  companyId: string,
  productId: string,
  photo: PickedPhoto
): Promise<string> {
  const arrayBuffer = await fetch(photo.uri).then((res) => res.arrayBuffer());
  const extension = photo.mimeType.split('/')[1] ?? 'jpg';
  const path = `${companyId}/${productId}/${Date.now()}.${extension}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, arrayBuffer, {
    contentType: photo.mimeType,
    upsert: true,
  });
  if (error) throw new Error(error.message);
  return path;
}

export async function getRecipePhotoUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
  if (error || !data) return null;
  return data.signedUrl;
}
