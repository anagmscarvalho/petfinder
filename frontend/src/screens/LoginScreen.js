import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { PawIcon } from '../components/Icons';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Navegação simulada — sem autenticação real
    navigation.replace('MainTabs');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Area */}
          <View style={styles.logoArea}>
            <View style={{ marginBottom: SIZES.md }}>
              <PawIcon size={48} color={COLORS.primary} />
            </View>
            <Text style={styles.appName}>Fazer Login</Text>
            <Text style={styles.subtitle}>
              Insira seu e-mail para aplicativo de nestamento ativo
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="email@mail.com"
                placeholderTextColor={COLORS.textGray}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor={COLORS.textGray}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.forgotLink}>
              <Text style={styles.forgotText}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.85}>
              <Text style={styles.loginButtonText}>Fazer Login</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login Buttons */}
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.85}>
              <Text style={styles.socialIcon}>G</Text>
              <Text style={styles.socialText}>Continuar com Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton} activeOpacity={0.85}>
              <Text style={styles.socialIcon}></Text>
              <Text style={styles.socialText}>Continuar com Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Não tem uma conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.footerLink}>Criar conta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SIZES.xl,
    justifyContent: 'center',
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: SIZES.xxl,
  },
  appName: {
    fontSize: SIZES.font3xl,
    color: COLORS.primary,
    ...FONTS.bold,
  },
  subtitle: {
    fontSize: SIZES.fontBase,
    color: COLORS.textGray,
    textAlign: 'center',
    marginTop: SIZES.sm,
    lineHeight: 20,
    paddingHorizontal: SIZES.xl,
  },
  form: {
    gap: SIZES.md,
  },
  inputContainer: {
    backgroundColor: COLORS.cardWhite,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  input: {
    height: 48,
    paddingHorizontal: SIZES.base,
    fontSize: SIZES.fontXl,
    color: COLORS.textDark,
    ...FONTS.regular,
  },
  forgotLink: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    fontSize: SIZES.fontBase,
    color: COLORS.primary,
    ...FONTS.medium,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: SIZES.radiusSm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.sm,
  },
  loginButtonText: {
    fontSize: SIZES.fontXxl,
    color: COLORS.textWhite,
    ...FONTS.semiBold,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.divider,
  },
  dividerText: {
    fontSize: SIZES.fontBase,
    color: COLORS.textGray,
    marginHorizontal: SIZES.base,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
    borderColor: COLORS.divider,
    backgroundColor: COLORS.cardWhite,
    gap: SIZES.sm,
  },
  socialIcon: {
    fontSize: 18,
    ...FONTS.bold,
    color: COLORS.textDark,
  },
  socialText: {
    fontSize: SIZES.fontLg,
    color: COLORS.textDark,
    ...FONTS.medium,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SIZES.xxl,
    paddingBottom: SIZES.lg,
  },
  footerText: {
    fontSize: SIZES.fontLg,
    color: COLORS.textGray,
  },
  footerLink: {
    fontSize: SIZES.fontLg,
    color: COLORS.primary,
    ...FONTS.semiBold,
  },
});
