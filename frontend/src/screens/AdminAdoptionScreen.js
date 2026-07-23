import { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert,
  ActivityIndicator, Platform, Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { SIZE_OPTIONS, SEX_OPTIONS, BAIRROS_OPTIONS } from '../constants/mockData';
import { ArrowLeftIcon, CameraIcon, HeartIcon } from '../components/Icons';
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

export default function AdminAdoptionScreen({ navigation }) {
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [sex, setSex] = useState('');
  const [bairro, setBairro] = useState('');
  const [description, setDescription] = useState('');
  
  // Adoption specifics
  const [ageMonths, setAgeMonths] = useState('');
  const [castrado, setCastrado] = useState(false);
  const [vacinado, setVacinado] = useState(false);

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
    if (!name || !breed || !size || !bairro) {
      Alert.alert('Atenção', 'Preencha os campos obrigatórios (nome, raça, porte, bairro).');
      return;
    }
    setLoading(true);
    try {
      const pet = await createPet(token, {
        nome: name,
        especie: 'cachorro',
        raca: breed,
        porte: size.toLowerCase(),
        pelagem: color || 'não informada',
        categoria: 'adocao',
        bairro: bairro,
        detalhes: description || '',
        dados_adocao: {
          idade_meses: ageMonths ? parseInt(ageMonths, 10) : 0,
          castrado: castrado,
          vermifugado: vacinado, 
          historia: description
        }
      });
      let fotosArray = [];
      if (imageUri) {
        const uploadedFoto = await uploadPhoto(token, pet.id, imageUri);
        if (uploadedFoto && uploadedFoto.url) {
          fotosArray = [{ url: uploadedFoto.url }];
        }
      }
      if (Platform.OS === 'web') {
        window.alert('Pet cadastrado para adoção com sucesso!');
      } else {
        Alert.alert('Sucesso!', 'Pet cadastrado para adoção com sucesso.');
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
          <Text style={styles.headerTitle}>Cadastrar Adoção</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.adminBanner}>
          <Text style={styles.adminBannerText}>Acesso de Administrador</Text>
        </View>

        {/* Photo Upload */}
        <TouchableOpacity style={styles.photoUpload} activeOpacity={0.85} onPress={pickImage}>
          <CameraIcon size={40} color={COLORS.primary} />
          <Text style={styles.photoLabel}>
            {imageUri ? 'Foto selecionada' : 'Adicionar foto bonita!'}
          </Text>
          <Text style={styles.photoSub}>A foto é essencial para a adoção</Text>
        </TouchableOpacity>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nome do pet</Text>
            <TextInput style={styles.input} placeholder="Ex: Bob" placeholderTextColor={COLORS.textGray} value={name} onChangeText={setName} />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Raça</Text>
            <TextInput style={styles.input} placeholder="Ex: Vira-lata (SRD)" placeholderTextColor={COLORS.textGray} value={breed} onChangeText={setBreed} />
          </View>

          <OptionSelector label="Porte" options={SIZE_OPTIONS} selected={size} onSelect={setSize} />
          <OptionSelector label="Sexo" options={SEX_OPTIONS} selected={sex} onSelect={setSex} />
          
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Cor predominante</Text>
            <TextInput style={styles.input} placeholder="Ex: Preto e Branco" placeholderTextColor={COLORS.textGray} value={color} onChangeText={setColor} />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Idade (em meses)</Text>
            <TextInput style={styles.input} placeholder="Ex: 24 (para 2 anos)" placeholderTextColor={COLORS.textGray} value={ageMonths} onChangeText={setAgeMonths} keyboardType="numeric" />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.label}>Já é castrado?</Text>
            <Switch value={castrado} onValueChange={setCastrado} trackColor={{ true: COLORS.primary }} />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.label}>Vacinado/Vermifugado?</Text>
            <Switch value={vacinado} onValueChange={setVacinado} trackColor={{ true: COLORS.primary }} />
          </View>

          <OptionSelector label="Onde se encontra (Bairro)" options={BAIRROS_OPTIONS} selected={bairro} onSelect={setBairro} />

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>História / Observações</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ex: Resgatado das ruas, super dócil e adora crianças..."
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
                <HeartIcon size={20} color={COLORS.textWhite} filled={true} />
                <Text style={styles.submitText}>Publicar para Adoção</Text>
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
  adminBanner: {
    backgroundColor: '#FFECCC',
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminBannerText: {
    color: '#D47500',
    ...FONTS.bold,
    fontSize: SIZES.fontMd
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
    backgroundColor: COLORS.primaryFaint, borderWidth: 2, borderColor: COLORS.primary,
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginTop: SIZES.sm,
    gap: SIZES.sm,
  },
  photoLabel: { fontSize: SIZES.fontXl, color: COLORS.textTitle, ...FONTS.semiBold },
  photoSub: { fontSize: SIZES.fontMd, color: COLORS.textGray, marginTop: 4 },
  form: { paddingHorizontal: SIZES.base, marginTop: SIZES.lg, gap: SIZES.base },
  fieldGroup: { gap: 6 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
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
  optionChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  optionText: { fontSize: SIZES.fontBase, color: COLORS.textTitle, ...FONTS.medium },
  optionTextActive: { color: COLORS.textWhite, ...FONTS.semiBold },
  submitButton: {
    flexDirection: 'row', backgroundColor: COLORS.primary, height: 54, borderRadius: SIZES.radiusLg,
    alignItems: 'center', justifyContent: 'center', marginTop: SIZES.sm, gap: 8
  },
  submitText: { fontSize: SIZES.fontXxl, color: COLORS.textWhite, ...FONTS.semiBold },
});
