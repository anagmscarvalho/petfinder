import { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { SPECIES_OPTIONS, SIZE_OPTIONS, SEX_OPTIONS } from '../constants/mockData';
import { ArrowLeftIcon, CameraIcon, SearchIcon } from '../components/Icons';

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

export default function ReportLostScreen({ navigation }) {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [sex, setSex] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    Alert.alert('Sucesso!', 'Pet cadastrado com sucesso. A IA está processando os embeddings.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeftIcon size={20} color={COLORS.textTitle} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Perdi meu Pet</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Photo Upload */}
        <TouchableOpacity style={styles.photoUpload} activeOpacity={0.85}>
          <CameraIcon size={40} color={COLORS.primary} />
          <Text style={styles.photoLabel}>Toque para enviar foto</Text>
          <Text style={styles.photoSub}>A foto ajuda a IA a encontrar seu pet</Text>
        </TouchableOpacity>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nome do pet</Text>
            <TextInput style={styles.input} placeholder="Ex: Rex" placeholderTextColor={COLORS.textGray} value={name} onChangeText={setName} />
          </View>

          <OptionSelector label="Espécie" options={SPECIES_OPTIONS} selected={species} onSelect={setSpecies} />

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Raça</Text>
            <TextInput style={styles.input} placeholder="Ex: Golden Retriever" placeholderTextColor={COLORS.textGray} value={breed} onChangeText={setBreed} />
          </View>

          <OptionSelector label="Porte" options={SIZE_OPTIONS} selected={size} onSelect={setSize} />
          <OptionSelector label="Sexo" options={SEX_OPTIONS} selected={sex} onSelect={setSex} />

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Cor predominante</Text>
            <TextInput style={styles.input} placeholder="Ex: Dourado" placeholderTextColor={COLORS.textGray} value={color} onChangeText={setColor} />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Onde desapareceu</Text>
            <TextInput style={styles.input} placeholder="Ex: Marco, Belém - PA" placeholderTextColor={COLORS.textGray} value={location} onChangeText={setLocation} />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Características únicas</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ex: Mancha branca no olho, coleira azul..."
              placeholderTextColor={COLORS.textGray}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.85}>
            <SearchIcon size={20} color={COLORS.textWhite} />
            <Text style={styles.submitText}>Cadastrar Pet Perdido</Text>
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
    backgroundColor: COLORS.primaryFaint, borderWidth: 2, borderColor: COLORS.primary,
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
  optionChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  optionText: { fontSize: SIZES.fontBase, color: COLORS.textTitle, ...FONTS.medium },
  optionTextActive: { color: COLORS.textWhite, ...FONTS.semiBold },
  submitButton: {
    backgroundColor: COLORS.primary, height: 54, borderRadius: SIZES.radiusLg,
    alignItems: 'center', justifyContent: 'center', marginTop: SIZES.sm,
  },
  submitText: { fontSize: SIZES.fontXxl, color: COLORS.textWhite, ...FONTS.semiBold },
});
