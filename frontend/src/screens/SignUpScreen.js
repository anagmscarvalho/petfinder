import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { FontAwesome } from '@expo/vector-icons';

import { COLORS, FONTS, SIZES } from '../constants/theme';
import { PawIcon } from '../components/Icons';
import { useAuth } from '../services/auth';

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen({ navigation }) {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { signUp, signInWithGoogle, signInWithApple } = useAuth();

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '749924169525-p80mrpgie5u21too81a3ki7dfujgblej.apps.googleusercontent.com', // TODO: Substituir
    iosClientId: 'SEU_IOS_CLIENT_ID.apps.googleusercontent.com', // TODO: Substituir
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) {
        setLoading(true);
        signInWithGoogle(id_token)
          .then(() => navigation.replace('MainTabs'))
          .catch((err) => Alert.alert('Erro', err.message || 'Falha ao logar com o Google.'))
          .finally(() => setLoading(false));
      }
    }
  }, [response]);

  const handleSignUp = async () => {
    setErrorMessage('');
    if (!name || !email || !password || !birthDate) {
      setErrorMessage('Preencha todos os campos.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    const uppercaseRegex = /[A-Z]/;
    const numberRegex = /[0-9]/;
    const specialCharRegex = /[^A-Za-z0-9]/;

    if (!uppercaseRegex.test(password) || !numberRegex.test(password) || !specialCharRegex.test(password)) {
      setErrorMessage('A senha deve conter pelo menos uma letra maiúscula, um número e um caractere especial.');
      return;
    }
    setLoading(true);
    try {
      await signUp({
        nome_completo: name,
        data_nascimento: birthDate.replace(/\//g, '-'), // formato YYYY-MM-DD
        email,
        senha: password,
      });
      navigation.replace('MainTabs');
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Erro ao criar conta. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    promptAsync();
  };

  const handleAppleLogin = async () => {
    try {
      setLoading(true);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const idToken = credential.identityToken;
      if (!idToken) throw new Error("A Apple não retornou o token de identidade.");

      await signInWithApple(idToken);
      navigation.replace('MainTabs');
    } catch (e) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Erro', e.message || 'Falha ao logar com a Apple.');
      }
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.appName}>Criar Conta</Text>
            <Text style={styles.subtitle}>
              Preencha seus dados para começar a usar o PetFinder
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Nome completo"
                placeholderTextColor={COLORS.textGray}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Data de nascimento (AAAA-MM-DD)"
                placeholderTextColor={COLORS.textGray}
                value={birthDate}
                onChangeText={setBirthDate}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

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
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <FontAwesome name={showPassword ? 'eye' : 'eye-slash'} size={20} color={COLORS.textGray} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Confirmar senha"
                placeholderTextColor={COLORS.textGray}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <FontAwesome name={showConfirmPassword ? 'eye' : 'eye-slash'} size={20} color={COLORS.textGray} />
              </TouchableOpacity>
            </View>

            {errorMessage ? (
              <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>{errorMessage}</Text>
            ) : null}

            <TouchableOpacity style={styles.signupButton} onPress={handleSignUp} activeOpacity={0.85} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={COLORS.textWhite} />
              ) : (
                <Text style={styles.signupButtonText}>Criar Conta</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login Buttons */}
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.85} onPress={handleGoogleLogin}>
              <FontAwesome name="google" size={20} color={COLORS.textDark} />
              <Text style={styles.socialText}>Continuar com Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton} activeOpacity={0.85} onPress={handleAppleLogin}>
              <FontAwesome name="apple" size={22} color={COLORS.textDark} />
              <Text style={styles.socialText}>Continuar com Apple</Text>
            </TouchableOpacity>

            {/* Terms */}
            <Text style={styles.terms}>
              Ao criar uma conta, você concorda com os{' '}
              <Text style={styles.termsLink}>Termos de Uso</Text> e a{' '}
              <Text style={styles.termsLink}>Política de Privacidade</Text>.
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Já tem uma conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Fazer Login</Text>
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
    paddingHorizontal: SIZES.lg,
  },
  form: {
    gap: SIZES.md,
  },
  inputContainer: {
    backgroundColor: COLORS.cardWhite,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.divider,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: SIZES.base,
    fontSize: SIZES.fontXl,
    color: COLORS.textDark,
    ...FONTS.regular,
  },
  eyeIcon: {
    padding: SIZES.base,
  },
  signupButton: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: SIZES.radiusSm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.sm,
  },
  signupButtonText: {
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
  terms: {
    fontSize: SIZES.fontMd,
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.primary,
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
