import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { MOCK_NOTIFICATIONS } from '../constants/mockData';
import NotificationItem from '../components/NotificationItem';
import { BellIcon } from '../components/Icons';

export default function NotificationsScreen() {
  // Agrupar notificações por seção
  const sections = MOCK_NOTIFICATIONS.reduce((acc, notif) => {
    const section = notif.section;
    if (!acc[section]) acc[section] = [];
    acc[section].push(notif);
    return acc;
  }, {});

  const sectionOrder = ['HOJE', 'ONTEM', 'ANTERIORES'];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notificações</Text>
          <BellIcon size={24} color={COLORS.textTitle} />
        </View>

        {/* Sections */}
        {sectionOrder.map((sectionKey) => {
          const items = sections[sectionKey];
          if (!items || items.length === 0) return null;

          return (
            <View key={sectionKey} style={styles.section}>
              <Text style={styles.sectionTitle}>{sectionKey}</Text>
              <View style={styles.sectionList}>
                {items.map((notif) => (
                  <NotificationItem key={notif.id} notification={notif} />
                ))}
              </View>
            </View>
          );
        })}

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
  section: {
    marginTop: SIZES.base,
  },
  sectionTitle: {
    fontSize: SIZES.fontSm,
    color: COLORS.textGray,
    letterSpacing: 1,
    paddingHorizontal: SIZES.lg,
    marginBottom: SIZES.sm,
    ...FONTS.semiBold,
  },
  sectionList: {
    paddingHorizontal: SIZES.base,
  },
});
