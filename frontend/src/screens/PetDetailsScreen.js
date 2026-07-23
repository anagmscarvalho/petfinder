import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import InfoGrid from '../components/InfoGrid';
import { ArrowLeftIcon, HeartIcon, ChatListIcon } from '../components/Icons';
import { useAuth } from '../services/auth';
import { getFavorites, addFavorite, removeFavorite, startConversation, API_BASE_URL } from '../services/api';

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

  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const { user, token } = useAuth();
  
  const isMyPet = pet.dono_id === user?.id;

  useEffect(() => {
    async function checkFavorite() {
      if (!token) return;
      try {
        const favs = await getFavorites(token);
        if (favs.some(f => f.id === pet.id)) {
          setIsFavorite(true);
        }
      } catch {
        // ignore
      }
    }
    checkFavorite();
  }, [pet.id, token]);

  const toggleFavorite = async () => {
    if (!token) {
      Alert.alert('Atenção', 'Faça login para favoritar.');
      return;
    }
    const previous = isFavorite;
    setIsFavorite(!previous);

    // Se for um pet do mock (id como string), não chama a API
    if (typeof pet.id === 'string') return;

    try {
      if (previous) {
        await removeFavorite(token, pet.id);
      } else {
        await addFavorite(token, pet.id);
      }
    } catch (err) {
      console.error('Erro ao favoritar:', err);
      Alert.alert('Erro', err.message || 'Não foi possível favoritar o pet.');
      setIsFavorite(previous); // rollback
    }
  };

  const handleContact = async () => {
    if (!token) {
      Alert.alert('Atenção', 'Faça login para entrar em contato.');
      return;
    }
    if (loadingChat) return;
    setLoadingChat(true);

    try {
      const conversa = await startConversation(token, pet.id);
      navigation.navigate('Chat', { 
        conversaId: conversa.id, 
        chatName: conversa.outro_usuario?.nome_completo || 'Chat' 
      });
    } catch (err) {
      console.error('Erro ao iniciar chat:', err);
      Alert.alert('Erro', 'Não foi possível iniciar a conversa.');
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: pet.fotos?.[0]?.url ? `${API_BASE_URL}${pet.fotos[0].url}` : pet.image }} 
            style={styles.image} 
          />
          <View style={styles.headerOverlay}>
            <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
              <ArrowLeftIcon size={20} color={COLORS.textTitle} />
            </TouchableOpacity>
            {pet.status === 'adocao' && (
              <TouchableOpacity style={styles.headerButton} onPress={toggleFavorite}>
                <HeartIcon size={20} color={isFavorite ? COLORS.primary : COLORS.textTitle} filled={isFavorite} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Name + Status */}
        <View style={styles.nameRow}>
          <Text style={styles.petName}>{pet.nome || pet.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {statusLabels[pet.status]}
            </Text>
          </View>
        </View>

        <Text style={styles.breedText}>{pet.raca || pet.breed} • {pet.sexo || pet.sex}</Text>

        {/* Info Grid */}
        <View style={styles.infoSection}>
          <InfoGrid pet={pet} />
        </View>

        {/* Additional Info */}
        {(pet.descricao || pet.description || pet.detalhes || pet.missingDate) && (
          <View style={[styles.extraCard, SHADOWS.card]}>
            {(pet.descricao || pet.description || pet.detalhes) && (
              <>
                <Text style={styles.extraLabel}>CARACTERÍSTICAS ÚNICAS</Text>
                <Text style={styles.extraValue}>{pet.detalhes || pet.descricao || pet.description}</Text>
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
        {!isMyPet && (
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.chatButton} activeOpacity={0.85} onPress={handleContact}>
              <ChatListIcon size={20} color={COLORS.primary} />
              <Text style={styles.chatText}>Entrar em contato</Text>
            </TouchableOpacity>
          </View>
        )}

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
