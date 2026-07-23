import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import PetCard from '../components/PetCard';
import { ArrowLeftIcon } from '../components/Icons';
import { listPets } from '../services/api';

export default function SeeAllScreen({ route, navigation }) {
  const { title, status } = route.params || {};
  const [pets, setPets] = useState([]);

  useEffect(() => {
    async function fetchPets() {
      try {
        const data = await listPets({ status });
        if (data && data.length > 0) setPets(data);
      } catch (err) {
        console.error('Erro ao buscar pets em SeeAll:', err);
      }
    }
    fetchPets();
  }, [status]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeftIcon size={20} color={COLORS.textTitle} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title || 'Todos os Pets'}</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Grid Cards */}
        <View style={styles.grid}>
          {pets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              variant="vertical"
              onPress={() => navigation.navigate('PetDetails', { pet })}
            />
          ))}
        </View>

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
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.cardWhite,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: SIZES.font2xl,
    color: COLORS.textTitle,
    textAlign: 'center',
    ...FONTS.bold,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.base,
    flexWrap: 'wrap',
    marginTop: SIZES.md,
  },
});
