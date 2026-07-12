import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { MOCK_SEARCH_RESULTS } from '../constants/mockData';
import ResultCard from '../components/ResultCard';
import { ArrowLeftIcon } from '../components/Icons';

export default function ResultsScreen({ navigation }) {
  const handleContact = (result) => {
    Alert.alert(
      'Contatar',
      `Deseja entrar em contato sobre ${result.name}?\nSimilaridade: ${result.similarity}%`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Enviar Mensagem', onPress: () => {} },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeftIcon size={20} color={COLORS.textTitle} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Resultados</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Pets com maior similaridade</Text>
          <Text style={styles.infoSub}>
            Encontramos {MOCK_SEARCH_RESULTS.length} pets que podem ser compatíveis com a foto enviada.
          </Text>
        </View>

        {/* Results List */}
        <View style={styles.list}>
          {MOCK_SEARCH_RESULTS.map((result) => (
            <ResultCard
              key={result.id}
              result={result}
              onContact={handleContact}
            />
          ))}
        </View>

        {/* Footer CTA */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Não encontrou o pet?</Text>
          <TouchableOpacity
            style={styles.footerButton}
            onPress={() => navigation.navigate('ReportLost')}
            activeOpacity={0.85}
          >
            <Text style={styles.footerButtonText}>Cadastrar como perdido</Text>
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
  infoSection: {
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.base,
  },
  infoTitle: {
    fontSize: SIZES.fontXxl,
    color: COLORS.textTitle,
    ...FONTS.bold,
  },
  infoSub: {
    fontSize: SIZES.fontBase,
    color: COLORS.textGray,
    marginTop: SIZES.xs,
    lineHeight: 20,
  },
  list: {
    paddingHorizontal: SIZES.base,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: SIZES.base,
    marginTop: SIZES.lg,
    gap: SIZES.md,
  },
  footerText: {
    fontSize: SIZES.fontLg,
    color: COLORS.textGray,
    ...FONTS.medium,
  },
  footerButton: {
    backgroundColor: COLORS.cardWhite,
    borderWidth: 2,
    borderColor: COLORS.primary,
    height: 48,
    borderRadius: SIZES.radiusLg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.xl,
  },
  footerButtonText: {
    fontSize: SIZES.fontXl,
    color: COLORS.primary,
    ...FONTS.semiBold,
  },
});
