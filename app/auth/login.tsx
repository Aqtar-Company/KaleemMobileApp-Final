import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { Button } from "@/components/UI";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("خطأ", "يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      router.replace("/(tabs)");
    } catch {
      Alert.alert("خطأ", "فشل تسجيل الدخول، يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#007A68", "#004D40"]}
        style={[styles.header, { paddingTop: insets.top + 36 }]}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/logo_square.jpg")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.headerTitle}>مرحباً بك في كليم</Text>
        <Text style={styles.headerSubtitle}>مرشدك النفسي المتوافق مع قيمك</Text>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView
          contentContainerStyle={[styles.form, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.formTitle, { color: colors.foreground }]}>تسجيل الدخول</Text>

          <View style={styles.inputWrapper}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>البريد الإلكتروني</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
              <Feather name="mail" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                value={email}
                onChangeText={setEmail}
                placeholder="example@email.com"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="email-address"
                autoCapitalize="none"
                textAlign="right"
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>كلمة المرور</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.inputIcon}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                value={password}
                onChangeText={setPassword}
                placeholder="كلمة المرور"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showPassword}
                textAlign="right"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={[styles.forgotText, { color: colors.primary }]}>نسيت كلمة المرور؟</Text>
          </TouchableOpacity>

          <Button
            title="تسجيل الدخول"
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: 8 }}
          />

          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>أو</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <Button
            title="إنشاء حساب جديد"
            onPress={() => router.push("/auth/register")}
            variant="ghost"
          />

          <TouchableOpacity
            style={styles.guestButton}
            onPress={() => router.push("/auth/register")}
          >
            <Text style={[styles.guestText, { color: colors.mutedForeground }]}>
              جرّب كليم مجاناً بدون حساب
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logoContainer: { marginBottom: 16, alignItems: "center" },
  logoImage: {
    width: 90,
    height: 90,
    borderRadius: 18,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    fontFamily: "Inter_700Bold",
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  form: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    textAlign: "right",
    marginBottom: 24,
  },
  inputWrapper: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: "500",
    fontFamily: "Inter_500Medium",
    textAlign: "right",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
  },
  inputIcon: { paddingHorizontal: 14 },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    paddingVertical: 14,
    paddingEnd: 14,
    textAlign: "right",
  },
  forgotPassword: { alignSelf: "flex-start", marginBottom: 20 },
  forgotText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  dividerRow: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 12, fontSize: 13, fontFamily: "Inter_400Regular" },
  guestButton: { alignItems: "center", marginTop: 16 },
  guestText: { fontSize: 13, fontFamily: "Inter_400Regular", textDecorationLine: "underline" },
});
