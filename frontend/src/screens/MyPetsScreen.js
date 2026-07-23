import { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import PetCard from '../components/PetCard';
import { ArrowLeftIcon } from '../components/Icons';
import { getMyPets, deletePet } from '../services/api';
import { useAuth } from '../services/auth';

export default function MyPetsScreen({ navigation }) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useFocusEffect(
    useCallback(() => {
      let active = true;
      async function fetchPets() {
        if (!token) return;
        setLoading(true);
        try {
          const data = await getMyPets(token);
          if (active && data) setPets(data);
        } catch (err) {
          console.error('Erro ao buscar meus pets:', err);
        } finally {
          if (active) setLoading(false);
        }
      }
      fetchPets();
      return () => { active = false; };
    }, [token])
  );

  const handleDelete = (petId) => {
    const confirmDelete = async () => {
      try {
        await deletePet(token, petId);
        setPets(current => current.filter(p => p.id !== petId));
        Alert.alert('Sucesso', 'Pet excluído com sucesso.');
      } catch (err) {
        Alert.alert('Erro', err.message || 'Não foi possível excluir o pet.');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Tem certeza que deseja excluir este pet?')) {
        confirmDelete();
      }
      return;
    }

    Alert.alert(
      'Excluir Pet',
      'Tem certeza que deseja excluir este pet? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: confirmDelete }
      ]
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
          <Text style={styles.headerTitle}>Meus Pets</Text>
          <View style={{ width: 36 }} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : pets.length > 0 ? (
          <View style={styles.grid}>
            {pets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                variant="vertical"
                onDelete={handleDelete}
                onPress={() => navigation.navigate('PetDetails', { pet })}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Você ainda não cadastrou nenhum pet.</Text>
          </View>
        )}

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
  loadingContainer: {
    marginTop: SIZES.xxl,
    alignItems: 'center',
  },
  emptyContainer: {
    marginTop: SIZES.xxl,
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
  },
  emptyText: {
    fontSize: SIZES.fontLg,
    color: COLORS.textGray,
    textAlign: 'center',
    ...FONTS.medium,
  },
});
