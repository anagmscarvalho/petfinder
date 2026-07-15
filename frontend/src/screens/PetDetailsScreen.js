import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import InfoGrid from '../components/InfoGrid';
import { ArrowLeftIcon, HeartIcon, ChatListIcon } from '../components/Icons';

export default function PetDetailsScreen({ navigation, route }) {
  const { pet } = route.params;

  const statusLabels = {
    perdido: 'Perdido',
    encontrado: 'Encontrado',
    adocao: 'Adoção',
  };

  const statusColors = {
    perdido: { bg: COLORS.primaryLight, text: COLORS.primary },
    encontrado: { bg: 'rgba(33, 150, 243, 0.12)', text: '#2196F3' },
    adocao: { bg: 'rgba(76, 175, 80, 0.12)', text: COLORS.success },
  };

  const statusStyle = statusColors[pet.status] || statusColors.perdido;

  const handleContact = () => Alert.alert('Contatar', `Ligando para o tutor de ${pet.name}...`);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: pet.image }} style={styles.image} />
          <View style={styles.headerOverlay}>
            <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
              <ArrowLeftIcon size={20} color={COLORS.textTitle} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={() => setIsFavorite(!isFavorite)}>
              <HeartIcon size={20} color={isFavorite ? COLORS.primary : COLORS.textTitle} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Name + Status */}
        <View style={styles.nameRow}>
          <Text style={styles.petName}>{pet.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {statusLabels[pet.status]}
            </Text>
          </View>
        </View>

        <Text style={styles.breedText}>{pet.breed} • {pet.sex}</Text>

        {/* Info Grid */}
        <View style={styles.infoSection}>
          <InfoGrid pet={pet} />
        </View>

        {/* Additional Info */}
        {(pet.description || pet.missingDate) && (
          <View style={[styles.extraCard, SHADOWS.card]}>
            {pet.description && (
              <>
                <Text style={styles.extraLabel}>CARACTERÍSTICA</Text>
                <Text style={styles.extraValue}>{pet.description}</Text>
              </>
            )}
            {pet.missingDate && (
              <View style={styles.extraRow}>
                <Text style={styles.extraLabel}>DESAPARECIDO EM</Text>
                <Text style={styles.extraDate}>{pet.missingDate}</Text>
              </View>
            )}
            {pet.foundDate && (
              <View style={styles.extraRow}>
                <Text style={styles.extraLabel}>ENCONTRADO EM</Text>
                <Text style={styles.extraDate}>{pet.foundDate}</Text>
              </View>
            )}
          </View>
        )}

        {/* Bottom Action Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.chatButton} activeOpacity={0.85} onPress={handleContact}>
            <ChatListIcon size={20} color={COLORS.textWhite} />
            <Text style={styles.chatButtonText}>Entrar em contato</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  imageContainer: {
    height: 300,
    margin: SIZES.base,
    borderRadius: SIZES.radiusXl,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: SIZES.sm,
    left: SIZES.sm,
    right: SIZES.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cardWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    marginTop: SIZES.base,
    gap: SIZES.sm,
  },
  petName: {
    fontSize: SIZES.font3xl,
    color: COLORS.textDark,
    ...FONTS.bold,
  },
  statusBadge: {
    paddingHorizontal: SIZES.md,
    paddingVertical: 4,
    borderRadius: SIZES.radiusPill,
  },
  statusText: {
    fontSize: SIZES.fontMd,
    ...FONTS.semiBold,
  },
  breedText: {
    fontSize: SIZES.fontLg,
    color: COLORS.textGray,
    paddingHorizontal: SIZES.lg,
    marginTop: 4,
  },
  infoSection: {
    marginTop: SIZES.base,
  },
  extraCard: {
    backgroundColor: COLORS.cardWhite,
    borderRadius: SIZES.radiusLg,
    marginHorizontal: SIZES.base,
    padding: SIZES.base,
    marginTop: SIZES.md,
  },
  extraLabel: {
    fontSize: SIZES.fontSm,
    color: COLORS.textGray,
    letterSpacing: 0.5,
    ...FONTS.semiBold,
  },
  extraValue: {
    fontSize: SIZES.fontLg,
    color: COLORS.textDark,
    marginTop: 4,
    lineHeight: 20,
  },
  extraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.md,
    gap: SIZES.sm,
  },
  extraDate: {
    fontSize: SIZES.fontBase,
    color: COLORS.textDark,
  },
  bottomBar: {
    paddingHorizontal: SIZES.base,
    marginTop: SIZES.lg,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: SIZES.radiusLg,
    gap: SIZES.sm,
  },
  contactIcon: {
    fontSize: 16,
  },
  contactText: {
    fontSize: SIZES.fontXl,
    color: COLORS.textWhite,
    ...FONTS.semiBold,
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardWhite,
    height: 50,
    borderRadius: SIZES.radiusLg,
    borderWidth: 2,
    borderColor: COLORS.primary,
    gap: SIZES.sm,
  },
  chatIcon: {
    fontSize: 16,
  },
  chatText: {
    fontSize: SIZES.fontXl,
    color: COLORS.primary,
    ...FONTS.semiBold,
  },
});
