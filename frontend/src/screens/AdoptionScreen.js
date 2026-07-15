import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { MOCK_ADOPTION_PETS, FILTER_OPTIONS } from '../constants/mockData';
import SearchBar from '../components/SearchBar';
import FilterTabs from '../components/FilterTabs';
import PetCard from '../components/PetCard';
import { HeartIcon } from '../components/Icons';

export default function AdoptionScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [pets, setPets] = useState(MOCK_ADOPTION_PETS);

  const handleFavorite = (id) => {
    setPets(prev =>
      prev.map(p => p.id === id ? { ...p, favorited: !p.favorited } : p)
    );
  };

  const filteredPets = pets.filter(pet => {
    if (activeFilter === 'dogs') return pet.species === 'Cachorro';
    if (activeFilter === 'cats') return pet.species === 'Gato';
    return true;
  });

  const gridPets = filteredPets.slice(0, 2);
  const listPets = filteredPets.slice(2);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Adoção</Text>
          <HeartIcon size={24} color={COLORS.primary} />
        </View>

        {/* Search */}
        <SearchBar
          placeholder="Buscar pets para adoção..."
          value={searchText}
          onChangeText={setSearchText}
        />

        {/* Filter Tabs */}
        <FilterTabs
          options={FILTER_OPTIONS}
          activeId={activeFilter}
          onSelect={setActiveFilter}
        />

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Peludinhos disponíveis</Text>
          <Text style={styles.seeAll}>Ver todos →</Text>
        </View>

        {/* Grid Cards */}
        <View style={styles.grid}>
          {gridPets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              variant="vertical"
              onFavorite={handleFavorite}
              onPress={() => navigation.navigate('PetDetails', { pet })}
            />
          ))}
        </View>

        {/* List Cards */}
        {listPets.map((pet) => (
          <View key={pet.id} style={styles.listCard}>
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
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.sm,
    paddingBottom: SIZES.md,
    gap: SIZES.sm,
  },
  headerTitle: {
    fontSize: SIZES.font3xl,
    color: COLORS.textTitle,
    ...FONTS.bold,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    marginTop: SIZES.sm,
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
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.base,
    flexWrap: 'wrap',
  },
  listCard: {
    paddingHorizontal: SIZES.base,
  },
});
