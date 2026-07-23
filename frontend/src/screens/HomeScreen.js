import { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import { BAIRROS_OPTIONS } from '../constants/mockData';
import SearchBar from '../components/SearchBar';
import PetCard from '../components/PetCard';
import { BellIcon, SearchIcon, CameraIcon, PawIcon, ChatListIcon } from '../components/Icons';
import { listPets } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [selectedBairro, setSelectedBairro] = useState('');
  const [lostPets, setLostPets] = useState([]);

  const [foundPets, setFoundPets] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPets = async () => {
    try {
      const lost = await listPets({ status: 'perdido', bairro: selectedBairro || undefined });
      setLostPets(lost);
      const found = await listPets({ status: 'encontrado', bairro: selectedBairro || undefined });
      setFoundPets(found);
    } catch (err) {
      console.error('Erro ao buscar pets:', err);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPets();
    setRefreshing(false);
  }, [selectedBairro]);

  useFocusEffect(
    useCallback(() => {
      fetchPets();
    }, [selectedBairro])
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView 
        style={styles.scroll} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>PetFinder</Text>
          </View>
          <TouchableOpacity
            style={styles.notifButton}
            onPress={() => navigation.navigate('ChatList')}
          >
            <ChatListIcon size={20} color={COLORS.textTitle} />
            <View style={styles.notifBadge} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <SearchBar
          placeholder="Buscar pets perdidos..."
          value={searchText}
          onChangeText={setSearchText}
        />
        
        {/* Filtro de Bairros */}
        <View style={styles.bairroFilterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bairroFilterScroll}>
            <TouchableOpacity 
              style={[styles.bairroChip, selectedBairro === '' && styles.bairroChipActive]}
              onPress={() => setSelectedBairro('')}
            >
              <Text style={[styles.bairroChipText, selectedBairro === '' && styles.bairroChipTextActive]}>Todos</Text>
            </TouchableOpacity>
            {BAIRROS_OPTIONS.map(bairro => (
              <TouchableOpacity 
                key={bairro}
                style={[styles.bairroChip, selectedBairro === bairro && styles.bairroChipActive]}
                onPress={() => setSelectedBairro(bairro)}
              >
                <Text style={[styles.bairroChipText, selectedBairro === bairro && styles.bairroChipTextActive]}>{bairro}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quick actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('ReportLost')}
            activeOpacity={0.85}
          >
            <View style={[styles.quickIcon, { backgroundColor: COLORS.primaryLight }]}>
              <SearchIcon size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.quickLabel}>Perdi meu pet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('ReportFound')}
            activeOpacity={0.85}
          >
            <View style={[styles.quickIcon, { backgroundColor: 'rgba(76, 175, 80, 0.12)' }]}>
              <CameraIcon size={24} color={COLORS.success} />
            </View>
            <Text style={styles.quickLabel}>Achei um animal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Adoption')}
            activeOpacity={0.85}
          >
            <View style={[styles.quickIcon, { backgroundColor: 'rgba(238, 121, 28, 0.08)' }]}>
              <PawIcon size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.quickLabel}>Adotar</Text>
          </TouchableOpacity>
        </View>

        {/* Pets Perdidos */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pets perdidos na região</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SeeAll', { status: 'perdido', title: 'Pets perdidos na região' })}>
            <Text style={styles.seeAll}>Ver todos →</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={lostPets}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => (
            <View style={styles.horizontalCardWrapper}>
              <PetCard
                pet={item}
                variant="vertical"
                style={{ width: '100%' }}
                onPress={() => navigation.navigate('PetDetails', { pet: item })}
              />
            </View>
          )}
        />

        {/* Encontrados Recentemente */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Encontrados recentemente</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SeeAll', { status: 'encontrado', title: 'Encontrados recentemente' })}>
            <Text style={styles.seeAll}>Ver todos →</Text>
          </TouchableOpacity>
        </View>

        {foundPets.map((pet) => (
          <View key={pet.id} style={styles.listCardWrapper}>
            <PetCard
              pet={pet}
              variant="horizontal"
              onPress={() => navigation.navigate('PetDetails', { pet })}
            />
          </View>
        ))}

        <View style={{ height: 20 }} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.sm,
    paddingBottom: SIZES.base,
  },
  greeting: {
    fontSize: SIZES.fontLg,
    color: COLORS.textGray,
    ...FONTS.regular,
  },
  headerTitle: {
    fontSize: SIZES.font3xl,
    color: COLORS.textTitle,
    ...FONTS.bold,
    marginTop: 2,
  },
  notifButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.cardWhite,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.cardLight,
  },
  notifBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SIZES.base,
    marginTop: SIZES.lg,
    marginBottom: SIZES.sm,
  },
  quickAction: {
    alignItems: 'center',
    width: '30%',
  },
  quickIcon: {
    width: 56,
    height: 56,
    aspectRatio: 1,
    flexShrink: 0,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickLabel: {
    fontSize: SIZES.fontSm,
    color: COLORS.textTitle,
    textAlign: 'center',
    ...FONTS.medium,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    marginTop: SIZES.lg,
    marginBottom: SIZES.md,
  },
  sectionTitle: {
    fontSize: SIZES.fontXxl,
    color: COLORS.textTitle,
    ...FONTS.bold,
  },
  seeAll: {
    fontSize: SIZES.fontBase,
    color: COLORS.primary,
    ...FONTS.medium,
  },
  horizontalList: {
    paddingLeft: SIZES.base,
    paddingRight: SIZES.sm,
  },
  horizontalCardWrapper: {
    width: 170,
    marginRight: SIZES.md,
  },
  listCardWrapper: {
    paddingHorizontal: SIZES.base,
  },
  bairroFilterContainer: {
    marginTop: SIZES.md,
  },
  bairroFilterScroll: {
    paddingHorizontal: SIZES.lg,
    paddingRight: SIZES.xxl,
    gap: SIZES.sm,
  },
  bairroChip: {
    backgroundColor: COLORS.cardWhite,
    paddingHorizontal: SIZES.md,
    paddingVertical: 8,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  bairroChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  bairroChipText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textGray,
    ...FONTS.medium,
  },
  bairroChipTextActive: {
    color: COLORS.textWhite,
    ...FONTS.semiBold,
  },
});
