import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import { HeartIcon, PawIcon, TrashIcon } from './Icons';
import { API_BASE_URL } from '../services/api';

export default function PetCard({ pet: rawPet, variant = 'vertical', onPress, onFavorite, onDelete, style }) {
  // Normaliza campos: backend retorna pt-BR, mock retorna inglês
  const pet = {
    ...rawPet,
    name: rawPet.name || rawPet.nome || 'Sem nome',
    breed: rawPet.breed || rawPet.raca || '',
    location: rawPet.location || rawPet.bairro || '',
    sex: rawPet.sex || rawPet.especie || '',
  };

  const statusColors = {
    perdido: { bg: COLORS.primary, text: COLORS.textWhite },
    encontrado: { bg: '#2196F3', text: COLORS.textWhite },
    adocao: { bg: COLORS.success, text: COLORS.textWhite },
  };

  const statusLabels = {
    perdido: 'Perdido',
    encontrado: 'Encontrado',
    adocao: 'Adoção',
  };

  const statusStyle = statusColors[pet.status] || statusColors.perdido;

  const photoUrl = pet.photo || (pet.fotos && pet.fotos.length > 0 ? `${API_BASE_URL}${pet.fotos[0].url}` : null);

  if (variant === 'horizontal') {
    return (
      <TouchableOpacity style={[styles.hCard, SHADOWS.card, style]} onPress={onPress} activeOpacity={0.85}>
        {/* Photo placeholder or Image */}
        <View style={styles.hPhoto}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.hImage} resizeMode="cover" />
          ) : (
            <View style={{ flexShrink: 0 }}>
              <PawIcon size={24} color={COLORS.primary} style={{ opacity: 0.25 }} />
            </View>
          )}
          <View style={[styles.badge, { backgroundColor: statusStyle.bg, position: 'absolute', bottom: 6, right: 6, flexShrink: 0 }]}>
            <Text style={[styles.badgeText, { color: statusStyle.text }]} numberOfLines={1}>{statusLabels[pet.status]}</Text>
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
    <TouchableOpacity style={[styles.vCard, SHADOWS.card, style]} onPress={onPress} activeOpacity={0.85}>
      {/* Photo placeholder or Image */}
      <View style={styles.vPhoto}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.vImage} resizeMode="cover" />
        ) : (
          <View style={{ flexShrink: 0 }}>
            <PawIcon size={30} color={COLORS.primary} style={{ opacity: 0.25 }} />
          </View>
        )}
        <View style={[styles.badge, styles.vBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.badgeText, { color: statusStyle.text }]} numberOfLines={1}>{statusLabels[pet.status]}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.vInfo}>
        <View style={styles.vNameRow}>
          <Text style={styles.petName} numberOfLines={1}>{pet.name}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {onDelete && (
              <TouchableOpacity onPress={() => onDelete(pet.id)}>
                <TrashIcon size={20} color={COLORS.error} />
              </TouchableOpacity>
            )}
            {onFavorite && (
              <TouchableOpacity onPress={() => onFavorite(pet.id)}>
                <HeartIcon size={20} color={pet.favorited ? COLORS.primary : COLORS.textGray} filled={pet.favorited} />
              </TouchableOpacity>
            )}
          </View>
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
    aspectRatio: 1, // Isso faz a foto ser quadrada
    backgroundColor: COLORS.primaryFaint,
    borderRadius: SIZES.radiusMd,
    margin: SIZES.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // Importante para a imagem respeitar o border radius
  },
  vImage: {
    width: '100%',
    height: '100%',
  },
  vBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexShrink: 0,
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
    aspectRatio: 1,
    backgroundColor: COLORS.primaryFaint,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  hImage: {
    width: '100%',
    height: '100%',
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
