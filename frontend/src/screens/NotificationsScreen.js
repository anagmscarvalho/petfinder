import { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import NotificationItem from '../components/NotificationItem';
import { BellIcon } from '../components/Icons';
import { getNotifications, markNotificationAsRead, getPet } from '../services/api';
import { useAuth } from '../services/auth';

function formatNotificationTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  
  const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();

  let section = 'ANTERIORES';
  if (isToday) section = 'HOJE';
  else if (isYesterday) section = 'ONTEM';

  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return { section, time };
}

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useAuth();

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const data = await getNotifications(token);
      // Format data for the UI
      const formatted = data.map(n => {
        const { section, time } = formatNotificationTime(n.criado_em);
        return {
          id: n.id.toString(),
          type: n.tipo,
          title: n.titulo,
          message: n.mensagem,
          time,
          read: n.lida,
          section,
          dados_extras: n.dados_extras,
        };
      });
      setNotifications(formatted);
    } catch (err) {
      console.error('Erro ao buscar notificações:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      if (isActive) fetchNotifications();
      return () => { isActive = false; };
    }, [token])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleNotificationPress = async (notif) => {
    // Mark as read if it's unread
    if (!notif.read) {
      try {
        await markNotificationAsRead(token, notif.id);
        setNotifications(prev => 
          prev.map(n => n.id === notif.id ? { ...n, read: true } : n)
        );
      } catch (err) {
        console.error('Erro ao marcar como lida:', err);
      }
    }

    // Handle navigation based on type
    if (notif.type === 'match' && notif.dados_extras?.pet_id) {
      try {
        const pet = await getPet(notif.dados_extras.pet_id);
        navigation.navigate('PetDetails', { pet });
      } catch (err) {
        Alert.alert('Erro', 'Não foi possível carregar os detalhes deste pet.');
      }
    } else if (notif.type === 'message') {
      navigation.navigate('ChatList');
    }
  };

  // Group notifications by section
  const sections = notifications.reduce((acc, notif) => {
    const section = notif.section;
    if (!acc[section]) acc[section] = [];
    acc[section].push(notif);
    return acc;
  }, {});

  const sectionOrder = ['HOJE', 'ONTEM', 'ANTERIORES'];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView 
        style={styles.scroll} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notificações</Text>
          <BellIcon size={24} color={COLORS.textTitle} />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: SIZES.xl }} />
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Você não tem novas notificações.</Text>
          </View>
        ) : (
          /* Sections */
          sectionOrder.map((sectionKey) => {
            const items = sections[sectionKey];
            if (!items || items.length === 0) return null;

            return (
              <View key={sectionKey} style={styles.section}>
                <Text style={styles.sectionTitle}>{sectionKey}</Text>
                <View style={styles.sectionList}>
                  {items.map((notif) => (
                    <NotificationItem 
                      key={notif.id} 
                      notification={notif} 
                      onPress={handleNotificationPress}
                    />
                  ))}
                </View>
              </View>
            );
          })
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
  emptyContainer: {
    padding: SIZES.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: COLORS.textGray,
    fontSize: SIZES.fontMd,
    ...FONTS.medium,
  }
});
