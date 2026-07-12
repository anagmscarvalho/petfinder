import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import { SearchIcon, ChatListIcon, BellIcon, HeartIcon } from './Icons';

const TYPE_CONFIG = {
  match: { Icon: SearchIcon, iconColor: COLORS.primary, iconBg: COLORS.primaryLight },
  message: { Icon: ChatListIcon, iconColor: COLORS.textTitle, iconBg: 'rgba(69, 90, 100, 0.08)' },
  success: { Icon: BellIcon, iconColor: COLORS.success, iconBg: 'rgba(76, 175, 80, 0.08)' },
  contact: { Icon: BellIcon, iconColor: COLORS.primary, iconBg: COLORS.primaryFaint },
  info: { Icon: BellIcon, iconColor: COLORS.textTitle, iconBg: 'rgba(69, 90, 100, 0.06)' },
  favorite: { Icon: HeartIcon, iconColor: COLORS.textTitle, iconBg: 'rgba(69, 90, 100, 0.06)' },
};

export default function NotificationItem({ notification, onPress }) {
  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.info;
  const isUnread = !notification.read;

  return (
    <TouchableOpacity
      style={[styles.card, SHADOWS.cardLight]}
      onPress={() => onPress?.(notification)}
      activeOpacity={0.85}
    >
      {/* Unread indicator */}
      {isUnread && <View style={styles.unreadBar} />}

      {/* Icon */}
      <View style={[styles.iconCircle, { backgroundColor: config.iconBg }]}>
        <config.Icon size={18} color={config.iconColor} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, isUnread && styles.titleBold]}>{notification.title}</Text>
        <Text style={styles.message} numberOfLines={2}>{notification.message}</Text>
      </View>

      {/* Time */}
      <Text style={styles.time}>{notification.time}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardWhite,
    borderRadius: SIZES.radiusLg,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.base,
    marginBottom: SIZES.sm,
    overflow: 'hidden',
  },
  unreadBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
  },
  content: {
    flex: 1,
    marginLeft: SIZES.md,
    marginRight: SIZES.sm,
  },
  title: {
    fontSize: SIZES.fontLg,
    color: COLORS.textDark,
    ...FONTS.medium,
  },
  titleBold: {
    ...FONTS.bold,
  },
  message: {
    fontSize: SIZES.fontMd,
    color: COLORS.textGray,
    marginTop: 2,
    lineHeight: 18,
  },
  time: {
    fontSize: SIZES.fontSm,
    color: COLORS.textGray,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
});
