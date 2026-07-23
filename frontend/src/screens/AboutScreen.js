import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import { ArrowLeftIcon } from '../components/Icons';

const DEVELOPER_PETS = [
  {
    id: '1',
    devName: 'Anna Talyta',
    petName: 'Greta',
    image: require('../../assets/greta.jpeg'),
  },
  {
    id: '2',
    devName: 'Ana Carolina',
    petName: 'Susie',
    image: require('../../assets/susie.jpeg'),
  },
  {
    id: '3',
    devName: 'Marianna Ferreira',
    petName: 'Docinho',
    image: require('../../assets/docinho.jpeg'),
  },
  {
    id: '4',
    devName: 'Miguel Santos',
    petName: 'Zara',
    image: require('../../assets/zara.jpeg'),
  }
];

export default function AboutScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeftIcon size={20} color={COLORS.textTitle} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sobre o PetFinder</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* Purpose Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nosso Propósito</Text>
          <Text style={styles.bodyText}>
            O <Text style={styles.highlight}>PetFinder</Text> nasceu de um amor em comum: o cuidado com os animais. 
            Sabemos a dor e o desespero que é perder um companheiro, e a dificuldade de encontrar o lar certo para um pet resgatado.
            {"\n\n"}
            Nosso objetivo é utilizar tecnologia de ponta, incluindo <Text style={styles.highlight}>Inteligência Artificial</Text>, para conectar pets perdidos aos seus donos de forma rápida e precisa, além de facilitar a adoção responsável para cães que buscam um novo lar cheio de amor.
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Dev Pets Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Os Chefes do Projeto</Text>
          <Text style={styles.bodyText}>
            Nós escrevemos o código, mas quem aprova (ou não) são eles. Conheça os pets dos nossos desenvolvedores:
          </Text>

          <View style={styles.petsGrid}>
            {DEVELOPER_PETS.map((devPet) => (
              <View key={devPet.id} style={[styles.petCard, SHADOWS.cardLight]}>
                <Image source={devPet.image} style={styles.petImage} />
                <View style={styles.petInfo}>
                  <Text style={styles.petName}>{devPet.petName}</Text>
                  <Text style={styles.devName}>{devPet.devName}</Text>
                  <Text style={styles.petDesc}>{devPet.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SIZES.base, paddingVertical: SIZES.sm,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
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
  scroll: { flex: 1 },
  content: {
    padding: SIZES.base,
    paddingBottom: SIZES.xxl,
  },
  section: {
    marginVertical: SIZES.md,
  },
  sectionTitle: {
    fontSize: SIZES.font2xl,
    color: COLORS.textTitle,
    ...FONTS.bold,
    marginBottom: SIZES.sm,
  },
  bodyText: {
    fontSize: SIZES.fontLg,
    color: COLORS.textDark,
    ...FONTS.regular,
    lineHeight: 24,
  },
  highlight: {
    color: COLORS.primary,
    ...FONTS.bold,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SIZES.lg,
  },
  petsGrid: {
    marginTop: SIZES.md,
    gap: SIZES.md,
  },
  petCard: {
    backgroundColor: COLORS.cardWhite,
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  petImage: {
    width: '100%',
    height: 180,
  },
  petInfo: {
    padding: SIZES.base,
  },
  petName: {
    fontSize: SIZES.fontXl,
    color: COLORS.textTitle,
    ...FONTS.bold,
  },
  devName: {
    fontSize: SIZES.fontSm,
    color: COLORS.primary,
    ...FONTS.semiBold,
    marginBottom: SIZES.xs,
  },
  petDesc: {
    fontSize: SIZES.fontBase,
    color: COLORS.textGray,
    ...FONTS.regular,
  }
});
