import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../constants/theme';

export default function FilterTabs({ options, activeId, onSelect }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {options.map((option) => {
        const isActive = option.id === activeId;
        return (
          <TouchableOpacity
            key={option.id}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onSelect(option.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{option.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SIZES.base,
    gap: SIZES.sm,
    paddingVertical: SIZES.sm,
  },
  tab: {
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusPill,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: SIZES.fontMd,
    color: COLORS.textTitle,
    ...FONTS.medium,
  },
  tabTextActive: {
    color: COLORS.textWhite,
    ...FONTS.semiBold,
  },
});
