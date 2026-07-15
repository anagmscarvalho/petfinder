import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import { MOCK_LOST_PETS, MOCK_FOUND_PETS } from '../constants/mockData';
import SearchBar from '../components/SearchBar';
import PetCard from '../components/PetCard';
import { BellIcon, SearchIcon, CameraIcon, PawIcon, ChatListIcon } from '../components/Icons';

export default function HomeScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>PetFinder</Text>
          </View>
          <TouchableOpacity
            style={styles.notifButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <BellIcon size={20} color={COLORS.textTitle} />
            <View style={styles.notifBadge} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <SearchBar
          placeholder="Buscar pets perdidos..."
          value={searchText}
          onChangeText={setSearchText}
        />

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

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('ChatList')}
            activeOpacity={0.85}
          >
            <View style={[styles.quickIcon, { backgroundColor: 'rgba(69, 90, 100, 0.08)' }]}>
              <ChatListIcon size={24} color={COLORS.textTitle} />
            </View>
            <Text style={styles.quickLabel}>Mensagens</Text>
          </TouchableOpacity>
        </View>

        {/* Pets Perdidos */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pets perdidos na região</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Ver todos →</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={MOCK_LOST_PETS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => (
            <View style={styles.horizontalCardWrapper}>
              <PetCard
                pet={item}
                variant="vertical"
                onPress={() => navigation.navigate('PetDetails', { pet: item })}
              />
            </View>
          )}
        />

        {/* Encontrados Recentemente */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Encontrados recentemente</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Ver todos →</Text>
          </TouchableOpacity>
        </View>

        {MOCK_FOUND_PETS.map((pet) => (
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
    paddingHorizontal: SIZES.base,
    marginTop: SIZES.lg,
    marginBottom: SIZES.sm,
  },
  quickAction: {
    alignItems: 'center',
    width: '23%',
  },
  quickIcon: {
    width: 56,
    height: 56,
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
});
