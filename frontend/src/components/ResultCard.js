import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import { PawIcon } from './Icons';

function getSimilarityColor(similarity) {
  if (similarity >= 70) return COLORS.success;
  if (similarity >= 40) return COLORS.warning;
  return COLORS.primary;
}

function getSimilarityBg(similarity) {
  if (similarity >= 70) return 'rgba(76, 175, 80, 0.15)';
  if (similarity >= 40) return 'rgba(255, 152, 0, 0.15)';
  return 'rgba(238, 121, 28, 0.15)';
}

export default function ResultCard({ result, onContact }) {
  const simColor = getSimilarityColor(result.similarity);
  const simBg = getSimilarityBg(result.similarity);
  const isLow = result.similarity < 40;

  return (
    <View style={[styles.card, SHADOWS.card]}>
      {/* Photo placeholder */}
      <View style={styles.photo}>
        <PawIcon size={28} color={COLORS.primary} style={{ opacity: 0.25 }} />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{result.name}</Text>
          <View style={[styles.badge, { backgroundColor: simBg }]}>
            <Text style={[styles.badgeText, { color: simColor }]}>{result.similarity}%</Text>
          </View>
        </View>
        <Text style={styles.detail}>{result.breed} • {result.size}</Text>
        <Text style={styles.detail}>{result.location}</Text>
        <Text style={styles.dateText}>Desaparecido: {result.missingDate}</Text>
      </View>

      {/* Contact button */}
      <TouchableOpacity
        style={[
          styles.contactBtn,
          isLow && styles.contactBtnOutline,
        ]}
        onPress={() => onContact?.(result)}
        activeOpacity={0.7}
      >
        <Text style={[styles.contactBtnText, isLow && styles.contactBtnTextOutline]}>Contatar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardWhite,
    borderRadius: SIZES.radiusLg,
    flexDirection: 'row',
    padding: SIZES.sm,
    marginBottom: SIZES.md,
    alignItems: 'center',
  },
  photo: {
    width: 85,
    height: 94,
    backgroundColor: COLORS.primaryFaint,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    paddingHorizontal: SIZES.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontSize: SIZES.fontXxl,
    color: COLORS.textDark,
    ...FONTS.bold,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: SIZES.radiusPill,
  },
  badgeText: {
    fontSize: SIZES.fontSm,
    ...FONTS.bold,
  },
  detail: {
    fontSize: SIZES.fontMd,
    color: COLORS.textGray,
    marginTop: 2,
  },
  dateText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textGray,
    marginTop: 2,
  },
  contactBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.sm,
    borderRadius: 10,
    alignSelf: 'flex-end',
  },
  contactBtnOutline: {
    backgroundColor: COLORS.cardWhite,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  contactBtnText: {
    fontSize: SIZES.fontMd,
    color: COLORS.textWhite,
    ...FONTS.semiBold,
  },
  contactBtnTextOutline: {
    color: COLORS.primary,
  },
});
