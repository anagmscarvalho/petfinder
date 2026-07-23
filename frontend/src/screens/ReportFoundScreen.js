import { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert,
  ActivityIndicator, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { SIZE_OPTIONS, BAIRROS_OPTIONS } from '../constants/mockData';
import { ArrowLeftIcon, CameraIcon, SendIcon } from '../components/Icons';
import { createPet, uploadPhoto } from '../services/api';
import { useAuth } from '../services/auth';
import * as ImagePicker from 'expo-image-picker';

function OptionSelector({ label, options, selected, onSelect }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.optionsRow}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.optionChip, selected === opt && styles.optionChipActive]}
            onPress={() => onSelect(opt)}
          >
            <Text style={[styles.optionText, selected === opt && styles.optionTextActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function ReportFoundScreen({ navigation }) {
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [bairro, setBairro] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!size || !bairro) {
      Alert.alert('Atenção', 'Preencha os campos obrigatórios (porte, bairro).');
      return;
    }
    setLoading(true);
    try {
      const pet = await createPet(token, {
        nome: 'Desconhecido',
        especie: 'cachorro',
        raca: 'Desconhecida',
        porte: size.toLowerCase(),
        pelagem: color || 'não informada',
        bairro: bairro,
        categoria: 'encontrado', // Registra como encontrado (StatusPet.encontrado) - requer suporte no backend ou será 'adocao' ou 'perdido'. O backend só suporta 'perdido' e 'adocao' no enum CategoriaCadastro.
      });
      // Como o backend atualmente suporta apenas `perdido` e `adocao` em CategoriaCadastro,
      // usaremos uma abordagem de mockup para a IA ou precisaremos corrigir o backend.
      let fotosArray = [];
      if (imageUri) {
        const uploadedFoto = await uploadPhoto(token, pet.id, imageUri);
        if (uploadedFoto && uploadedFoto.url) {
          fotosArray = [{ url: uploadedFoto.url }];
        }
      }
      if (Platform.OS === 'web') {
        window.alert('Enviado! A foto está sendo processada.');
      } else {
        Alert.alert('Enviado!', 'A foto está sendo processada.');
      }
      navigation.replace('PetDetails', {
        pet: { ...pet, fotos: fotosArray }
      });
    } catch (err) {
      Alert.alert('Erro', err.message || 'Não foi possível cadastrar o pet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeftIcon size={20} color={COLORS.textTitle} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Achei um Animal</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Photo Upload */}
        <TouchableOpacity style={styles.photoUpload} activeOpacity={0.85} onPress={pickImage}>
          <CameraIcon size={40} color={COLORS.success} />
          <Text style={styles.photoLabel}>
            {imageUri ? 'Foto selecionada' : 'Toque para enviar foto'}
          </Text>
          <Text style={styles.photoSub}>A IA vai comparar com pets perdidos</Text>
        </TouchableOpacity>

        {/* Form */}
        <View style={styles.form}>
          <OptionSelector label="Porte" options={SIZE_OPTIONS} selected={size} onSelect={setSize} />

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Cor predominante</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Caramelo"
              placeholderTextColor={COLORS.textGray}
              value={color}
              onChangeText={setColor}
            />
          </View>

          <OptionSelector label="Onde foi encontrado (Bairro)" options={BAIRROS_OPTIONS} selected={bairro} onSelect={setBairro} />

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Observações</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ex: Animal dócil, sem coleira, parece bem cuidado..."
              placeholderTextColor={COLORS.textGray}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity style={[styles.submitButton, loading && { opacity: 0.7 }]} onPress={handleSubmit} activeOpacity={0.85} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={COLORS.textWhite} size="small" />
            ) : (
              <>
                <SendIcon size={20} color={COLORS.textWhite} />
                <Text style={styles.submitText}>Enviar para Comparação</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SIZES.base, paddingVertical: SIZES.sm,
  },
  backButton: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.cardWhite, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    flex: 1, fontSize: SIZES.font2xl, color: COLORS.textTitle,
    textAlign: 'center', ...FONTS.bold,
  },
  photoUpload: {
    height: 160, marginHorizontal: SIZES.base, borderRadius: SIZES.radiusXl,
    backgroundColor: 'rgba(76, 175, 80, 0.06)', borderWidth: 2, borderColor: COLORS.success,
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginTop: SIZES.sm,
    gap: SIZES.sm,
  },
  photoLabel: { fontSize: SIZES.fontXl, color: COLORS.textTitle, ...FONTS.semiBold },
  photoSub: { fontSize: SIZES.fontMd, color: COLORS.textGray, marginTop: 4 },
  form: { paddingHorizontal: SIZES.base, marginTop: SIZES.lg, gap: SIZES.base },
  fieldGroup: { gap: 6 },
  label: { fontSize: SIZES.fontBase, color: COLORS.textTitle, ...FONTS.semiBold },
  input: {
    backgroundColor: COLORS.cardWhite, borderRadius: SIZES.radiusSm,
    borderWidth: 1, borderColor: COLORS.divider, height: 48,
    paddingHorizontal: SIZES.base, fontSize: SIZES.fontXl,
    color: COLORS.textDark, ...FONTS.regular,
  },
  textArea: { height: 100, paddingTop: SIZES.md },
  optionsRow: { flexDirection: 'row', gap: SIZES.sm, flexWrap: 'wrap' },
  optionChip: {
    paddingHorizontal: SIZES.base, paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusPill, borderWidth: 1, borderColor: COLORS.border,
  },
  optionChipActive: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  optionText: { fontSize: SIZES.fontBase, color: COLORS.textTitle, ...FONTS.medium },
  optionTextActive: { color: COLORS.textWhite, ...FONTS.semiBold },
  submitButton: {
    backgroundColor: COLORS.success, height: 54, borderRadius: SIZES.radiusLg,
    alignItems: 'center', justifyContent: 'center', marginTop: SIZES.sm,
    flexDirection: 'row', gap: SIZES.sm,
  },
  submitText: { fontSize: SIZES.fontXxl, color: COLORS.textWhite, ...FONTS.semiBold },
});
