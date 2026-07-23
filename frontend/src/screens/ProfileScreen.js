import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useState, useCallback } from 'react';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import { PawIcon, HeartIcon, SettingsIcon, InfoIcon, EditIcon, DoorOutIcon } from '../components/Icons';
import { useAuth } from '../services/auth';
import { getMyPets } from '../services/api';

const MENU_ITEMS = [
  { key: 'pets', label: 'Meus Pets', Icon: PawIcon, description: 'Gerencie seus pets cadastrados' },
  { key: 'favorites', label: 'Favoritos', Icon: HeartIcon, description: 'Pets que você curtiu' },
  { key: 'settings', label: 'Configurações', Icon: SettingsIcon, description: 'Preferências do app' },
  { key: 'about', label: 'Sobre', Icon: InfoIcon, description: 'Sobre o PetFinder' },
];

export default function ProfileScreen({ navigation }) {
  const { user, token, signOut } = useAuth();

  const [petsCount, setPetsCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(true);

  // Gera iniciais a partir do nome completo
  const initials = user?.nome_completo
    ? user.nome_completo.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      if (token) {
        setLoadingCount(true);
        getMyPets(token)
          .then(data => {
            if (isActive && data) setPetsCount(data.length);
          })
          .catch(err => console.error(err))
          .finally(() => {
            if (isActive) setLoadingCount(false);
          });
      }
      return () => { isActive = false; };
    }, [token])
  );

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Tem certeza que deseja sair?');
      if (confirmed) {
        signOut().then(() => {
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        });
      }
      return;
    }

    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          },
        },
      ]
    );
  };



  const handleMenuPress = (key) => {
    if (key === 'pets') {
      navigation.navigate('MyPets');
    } else if (key === 'favorites') {
      navigation.navigate('MyFavorites');
    } else if (key === 'about') {
      navigation.navigate('About');
    } else if (key === 'settings') {
      navigation.navigate('Settings');
    } else {
      Alert.alert('Em breve', 'Essa funcionalidade será implementada em breve!');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Perfil</Text>
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.editBadge}>
              <EditIcon size={12} color={COLORS.textWhite} />
            </View>
          </View>
          <Text style={styles.userName}>{user?.nome_completo || 'Usuário'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
        </View>

        {/* Stats Card */}
        <View style={[styles.statsCard, SHADOWS.card]}>
          <View style={styles.statItem}>
            {loadingCount ? (
              <ActivityIndicator size="small" color={COLORS.primary} style={{ height: 35 }} />
            ) : (
              <Text style={styles.statNumber}>{petsCount}</Text>
            )}
            <Text style={styles.statLabel}>Pets Cadastrados</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {user?.email === 'miguelangelo.ss.pessoal@gmail.com' && (
            <TouchableOpacity
              style={[styles.menuItem, SHADOWS.cardLight, { borderColor: COLORS.primary, borderWidth: 1 }]}
              onPress={() => navigation.navigate('AdminAdoption')}
              activeOpacity={0.85}
            >
              <View style={[styles.menuIconCircle, { backgroundColor: '#FFECCC' }]}>
                <PawIcon size={20} color={'#D47500'} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuLabel}>   Admin: Cadastrar Adoção</Text>
                <Text style={styles.menuDesc}>    Adicionar novo pet para adoção</Text>
              </View>
            </TouchableOpacity>
          )}

          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.menuItem, SHADOWS.cardLight]}
              onPress={() => handleMenuPress(item.key)}
              activeOpacity={0.85}
            >
              <View style={styles.menuIconCircle}>
                <item.Icon size={20} color={COLORS.primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDesc}>{item.description}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <DoorOutIcon size={20} color={COLORS.primary} />
          <Text style={[styles.logoutText, { color: COLORS.primary }]}>Sair da Conta</Text>
        </TouchableOpacity>

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
  header: {
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.sm,
    paddingBottom: SIZES.md,
  },
  headerTitle: {
    fontSize: SIZES.font3xl,
    color: COLORS.textTitle,
    ...FONTS.bold,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: SIZES.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SIZES.base,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: SIZES.font3xl,
    color: COLORS.primary,
    ...FONTS.bold,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    fontSize: 12,
  },
  userName: {
    fontSize: SIZES.font2xl,
    color: COLORS.textDark,
    ...FONTS.bold,
  },
  userEmail: {
    fontSize: SIZES.fontLg,
    color: COLORS.textGray,
    marginTop: 4,
  },
  joinDate: {
    fontSize: SIZES.fontMd,
    color: COLORS.textGray,
    marginTop: 4,
  },
  statsCard: {
    backgroundColor: COLORS.cardWhite,
    borderRadius: SIZES.radiusLg,
    marginHorizontal: SIZES.base,
    padding: SIZES.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SIZES.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: SIZES.font4xl,
    color: COLORS.primary,
    ...FONTS.bold,
  },
  statLabel: {
    fontSize: SIZES.fontBase,
    color: COLORS.textGray,
    marginTop: 4,
    ...FONTS.medium,
  },
  menuSection: {
    paddingHorizontal: SIZES.base,
    marginTop: SIZES.lg,
    gap: SIZES.sm,
  },
  menuItem: {
    backgroundColor: COLORS.cardWhite,
    borderRadius: SIZES.radiusLg,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.base,
  },
  menuIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 18,
  },
  menuContent: {
    flex: 1,
    marginLeft: SIZES.md,
  },
  menuLabel: {
    fontSize: SIZES.fontXl,
    color: COLORS.textDark,
    ...FONTS.semiBold,
  },
  menuDesc: {
    fontSize: SIZES.fontMd,
    color: COLORS.textGray,
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 24,
    color: COLORS.textGray,
    marginLeft: SIZES.sm,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SIZES.base,
    marginTop: SIZES.xl,
    height: 50,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1.5,
    borderColor: COLORS.error,
    gap: SIZES.sm,
  },
  logoutIcon: {
    fontSize: 16,
  },
  logoutText: {
    fontSize: SIZES.fontXl,
    color: COLORS.error,
    ...FONTS.semiBold,
  },
});
