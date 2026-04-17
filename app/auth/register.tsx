import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("خطأ", "يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("خطأ", "كلمتا المرور غير متطابقتين");
      return;
    }
    if (password.length < 6) {
      Alert.alert("خطأ", "كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password, phone);
      router.replace("/(tabs)");
    } catch {
      Alert.alert("خطأ", "فشل إنشاء الحساب، يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = [styles.input, { color: colors.foreground }];
  const inputContainerStyle = (focused?: boolean) => [
    styles.inputContainer,
    {
      backgroundColor: colors.card,
      borderColor: focused ? colors.primary : colors.border,
      borderRadius: colors.radius,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#007A68", "#004D40"]}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-right" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إنشاء حساب جديد</Text>
        <Text style={styles.headerSubtitle}>انضم إلى مجتمع كليم</Text>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.form, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {[
            { label: "الاسم الكامل *", value: name, setter: setName, placeholder: "أحمد محمد", icon: "user" as const, keyboard: "default" as const },
            { label: "البريد الإلكتروني *", value: email, setter: setEmail, placeholder: "example@email.com", icon: "mail" as const, keyboard: "email-address" as const },
            { label: "رقم الجوال", value: phone, setter: setPhone, placeholder: "+966 5XXXXXXXX", icon: "phone" as const, keyboard: "phone-pad" as const },
          ].map((field) => (
            <View key={field.label} style={styles.inputWrapper}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>{field.label}</Text>
              <View style={inputContainerStyle()}>
                <Feather name={field.icon} size={18} color={colors.mutedForeground} style={styles.inputIcon} />
                <TextInput
                  style={inputStyle}
                  value={field.value}
                  onChangeText={field.setter}
                  placeholder={field.placeholder}
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType={field.keyboard}
                  autoCapitalize="none"
                  textAlign="right"
                />
              </View>
            </View>
          ))}

          <View style={styles.inputWrapper}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>كلمة المرور *</Text>
            <View style={inputContainerStyle()}>
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.inputIcon}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
              <TextInput
                style={inputStyle}
                value={password}
                onChangeText={setPassword}
                placeholder="6 أحرف على الأقل"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showPassword}
                textAlign="right"
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>تأكيد كلمة المرور *</Text>
            <View style={inputContainerStyle()}>
              <Feather name="lock" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
              <TextInput
                style={inputStyle}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="أعد إدخال كلمة المرور"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showPassword}
                textAlign="right"
              />
            </View>
          </View>

          <Text style={[styles.terms, { color: colors.mutedForeground }]}>
            بإنشاء حساب، أنت توافق على{" "}
            <Text style={{ color: colors.primary }}>شروط الاستخدام</Text>
            {" "}و{" "}
            <Text style={{ color: colors.primary }}>سياسة الخصوصية</Text>
          </Text>

          <Button title="إنشاء الحساب" onPress={handleRegister} loading={loading} style={{ marginTop: 8 }} />

          <TouchableOpacity style={styles.loginLink} onPress={() => router.push("/auth/login")}>
            <Text style={[styles.loginText, { color: colors.mutedForeground }]}>
              لديك حساب بالفعل؟{" "}
              <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>تسجيل الدخول</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backBtn: { position: "absolute", right: 24, top: 20 + 20 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold", marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.85)", fontFamily: "Inter_400Regular" },
  form: { paddingHorizontal: 24, paddingTop: 28 },
  inputWrapper: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "500", fontFamily: "Inter_500Medium", textAlign: "right", marginBottom: 8 },
  inputContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1.5 },
  inputIcon: { paddingHorizontal: 14 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", paddingVertical: 14, paddingEnd: 14, textAlign: "right" },
  terms: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", marginBottom: 20, lineHeight: 20 },
  loginLink: { alignItems: "center", marginTop: 16 },
  loginText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
