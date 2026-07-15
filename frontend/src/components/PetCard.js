import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import { HeartIcon, PawIcon } from './Icons';

export default function PetCard({ pet, variant = 'vertical', onPress, onFavorite }) {
  const statusColors = {
    perdido: { bg: 'rgba(238, 121, 28, 0.12)', text: COLORS.primary },
    encontrado: { bg: 'rgba(33, 150, 243, 0.12)', text: '#2196F3' },
    adocao: { bg: COLORS.success, text: COLORS.textWhite },
  };

  const statusLabels = {
    perdido: 'Perdido',
    encontrado: 'Encontrado',
    adocao: 'Adoção',
  };

  const statusStyle = statusColors[pet.status] || statusColors.perdido;

  if (variant === 'horizontal') {
    return (
      <TouchableOpacity style={[styles.hCard, SHADOWS.card]} onPress={onPress} activeOpacity={0.85}>
        {/* Photo placeholder */}
        <View style={styles.hPhoto}>
          <PawIcon size={24} color={COLORS.primary} style={{ opacity: 0.25 }} />
          <View style={[styles.badge, { backgroundColor: statusStyle.bg, position: 'absolute', bottom: 6, right: 6 }]}>
            <Text style={[styles.badgeText, { color: statusStyle.text }]}>{statusLabels[pet.status]}</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.hInfo}>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petBreed}>{pet.breed} • {pet.sex}</Text>
          <Text style={styles.petLocation}>📍 {pet.location}</Text>
          <View style={styles.tagsRow}>
            {pet.age && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{pet.age}</Text>
              </View>
            )}
            {pet.tags?.map((tag, idx) => (
              <View key={idx} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action */}
        {pet.status === 'adocao' && (
          <TouchableOpacity style={styles.adoptButton} onPress={onPress}>
            <Text style={styles.adoptButtonText}>Adotar</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }

  // Vertical card (grid style)
  return (
    <TouchableOpacity style={[styles.vCard, SHADOWS.card]} onPress={onPress} activeOpacity={0.85}>
      {/* Photo placeholder */}
      <View style={styles.vPhoto}>
        <PawIcon size={30} color={COLORS.primary} style={{ opacity: 0.25 }} />
        <View style={[styles.badge, styles.vBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.badgeText, { color: statusStyle.text }]}>{statusLabels[pet.status]}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.vInfo}>
        <View style={styles.vNameRow}>
          <Text style={styles.petName} numberOfLines={1}>{pet.name}</Text>
          {onFavorite && (
            <TouchableOpacity onPress={() => onFavorite(pet.id)}>
              <HeartIcon size={20} color={pet.favorited ? COLORS.primary : COLORS.textGray} />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.petBreed} numberOfLines={1}>{pet.breed} • {pet.sex}</Text>
        <Text style={styles.petLocation} numberOfLines={1}>📍 {pet.location}</Text>
        <View style={styles.tagsRow}>
          {pet.age && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{pet.age}</Text>
            </View>
          )}
          {pet.tags?.slice(0, 2).map((tag, idx) => (
            <View key={idx} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Vertical card
  vCard: {
    backgroundColor: COLORS.cardWhite,
    borderRadius: SIZES.radiusXl,
    width: '48%',
    marginBottom: SIZES.base,
    overflow: 'hidden',
  },
  vPhoto: {
    height: 120,
    backgroundColor: COLORS.primaryFaint,
    borderRadius: SIZES.radiusMd,
    margin: SIZES.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  vInfo: {
    paddingHorizontal: SIZES.sm,
    paddingBottom: SIZES.md,
  },
  vNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Horizontal card
  hCard: {
    backgroundColor: COLORS.cardWhite,
    borderRadius: SIZES.radiusXl,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.sm,
    marginBottom: SIZES.md,
  },
  hPhoto: {
    width: 88,
    height: 88,
    backgroundColor: COLORS.primaryFaint,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hInfo: {
    flex: 1,
    paddingHorizontal: SIZES.md,
  },

  // Common
  pawContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: 3,
    borderRadius: SIZES.radiusPill,
  },
  badgeText: {
    fontSize: SIZES.fontXs,
    ...FONTS.semiBold,
  },
  petName: {
    fontSize: SIZES.fontXxl,
    color: COLORS.textDark,
    ...FONTS.bold,
  },
  petBreed: {
    fontSize: SIZES.fontMd,
    color: COLORS.textGray,
    marginTop: 2,
  },
  petLocation: {
    fontSize: SIZES.fontSm,
    color: COLORS.textGray,
    marginTop: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    marginTop: 6,
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    backgroundColor: COLORS.tagBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: SIZES.fontXs,
    color: COLORS.textTitle,
  },
  adoptButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusSm,
    alignSelf: 'center',
  },
  adoptButtonText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textWhite,
    ...FONTS.semiBold,
  },
});
