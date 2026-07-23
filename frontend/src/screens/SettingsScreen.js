import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import { ArrowLeftIcon, DoorOutIcon } from '../components/Icons';
import { useAuth } from '../services/auth';

export default function SettingsScreen({ navigation }) {
  const { user, deleteAccount } = useAuth();
  
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleDeleteAccount = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Tem certeza que deseja excluir sua conta DEFINITIVAMENTE? Todos os seus dados serão apagados.');
      if (confirmed) {
        deleteAccount()
          .then(() => {
            window.alert('Sua conta foi excluída com sucesso.');
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          })
          .catch((err) => {
            window.alert(err.message || 'Falha ao excluir a conta.');
          });
      }
      return;
    }

    Alert.alert(
      'Atenção MÁXIMA',
      'Tem certeza que deseja excluir sua conta DEFINITIVAMENTE? Todos os seus dados serão apagados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              Alert.alert('Sucesso', 'Sua conta foi excluída com sucesso.');
              navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            } catch (err) {
              Alert.alert('Erro', err.message || 'Falha ao excluir a conta.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeftIcon size={20} color={COLORS.textTitle} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificações</Text>
          
          <View style={[styles.settingRow, SHADOWS.cardLight]}>
            <View>
              <Text style={styles.settingLabel}>Notificações Push</Text>
              <Text style={styles.settingDesc}>Receber alertas no celular</Text>
            </View>
            <Switch value={pushEnabled} onValueChange={setPushEnabled} trackColor={{ true: COLORS.primary }} />
          </View>
          
          <View style={[styles.settingRow, SHADOWS.cardLight]}>
            <View>
              <Text style={styles.settingLabel}>Atualizações por E-mail</Text>
              <Text style={styles.settingDesc}>Receber novidades e alertas</Text>
            </View>
            <Switch value={emailEnabled} onValueChange={setEmailEnabled} trackColor={{ true: COLORS.primary }} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aparência</Text>
          
          <View style={[styles.settingRow, SHADOWS.cardLight]}>
            <View>
              <Text style={styles.settingLabel}>Modo Escuro</Text>
              <Text style={styles.settingDesc}>Em breve</Text>
            </View>
            <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: COLORS.primary }} disabled />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacidade e Segurança</Text>
          
          <TouchableOpacity style={[styles.settingRow, SHADOWS.cardLight]} activeOpacity={0.8} onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')}>
            <Text style={styles.settingLabel}>Alterar Senha</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { marginTop: SIZES.xl, marginBottom: SIZES.xxl }]}>
           <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
            activeOpacity={0.85}
          >
            <DoorOutIcon size={20} color={COLORS.error} />
            <Text style={styles.deleteText}>Excluir Minha Conta</Text>
          </TouchableOpacity>
          <Text style={styles.dangerText}>Esta ação é irreversível.</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SIZES.base, paddingVertical: SIZES.sm,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.cardWhite, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    flex: 1, fontSize: SIZES.font2xl, color: COLORS.textTitle,
    textAlign: 'center', ...FONTS.bold,
  },
  scroll: { flex: 1, padding: SIZES.base },
  section: {
    marginBottom: SIZES.lg,
  },
  sectionTitle: {
    fontSize: SIZES.fontLg,
    color: COLORS.textTitle,
    ...FONTS.bold,
    marginBottom: SIZES.sm,
    marginLeft: 4,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.cardWhite,
    padding: SIZES.base,
    borderRadius: SIZES.radiusLg,
    marginBottom: SIZES.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  settingLabel: {
    fontSize: SIZES.fontLg,
    color: COLORS.textTitle,
    ...FONTS.semiBold,
  },
  settingDesc: {
    fontSize: SIZES.fontSm,
    color: COLORS.textGray,
    ...FONTS.regular,
    marginTop: 2,
  },
  menuArrow: {
    fontSize: SIZES.font2xl,
    color: COLORS.textGray,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.error,
    gap: SIZES.sm,
  },
  deleteText: {
    fontSize: SIZES.fontLg,
    color: COLORS.error,
    ...FONTS.semiBold,
  },
  dangerText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textGray,
    textAlign: 'center',
    marginTop: SIZES.xs,
  }
});
