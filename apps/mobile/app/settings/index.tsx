import { ScrollView, StyleSheet, View, Pressable, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsScreen() {
  const router = useRouter();
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');
  const background = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const { themeMode, setThemeMode } = useTheme();
  const { isAuthenticated, logout } = useAuth();

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { borderBottomColor: border }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <IconSymbol name="chevron.left" size={24} color={primary} />
        </Pressable>
        <ThemedText type="subtitle">Settings</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Appearance</ThemedText>
          <View style={[styles.card, { backgroundColor: background, borderColor: border }]}>
            <Pressable
              onPress={() => setThemeMode('light')}
              style={[
                styles.option,
                { borderBottomWidth: 1, borderBottomColor: border },
              ]}
            >
              <View style={styles.optionLeft}>
                <IconSymbol name="sun.max.fill" size={22} color={textColor} />
                <ThemedText style={styles.optionText}>Light</ThemedText>
              </View>
              {themeMode === 'light' && (
                <IconSymbol name="checkmark" size={20} color={primary} />
              )}
            </Pressable>

            <Pressable
              onPress={() => setThemeMode('dark')}
              style={[
                styles.option,
                { borderBottomWidth: 1, borderBottomColor: border },
              ]}
            >
              <View style={styles.optionLeft}>
                <IconSymbol name="moon.fill" size={22} color={textColor} />
                <ThemedText style={styles.optionText}>Dark</ThemedText>
              </View>
              {themeMode === 'dark' && (
                <IconSymbol name="checkmark" size={20} color={primary} />
              )}
            </Pressable>

            <Pressable
              onPress={() => setThemeMode('system')}
              style={styles.option}
            >
              <View style={styles.optionLeft}>
                <IconSymbol name="sparkles" size={22} color={textColor} />
                <ThemedText style={styles.optionText}>System</ThemedText>
              </View>
              {themeMode === 'system' && (
                <IconSymbol name="checkmark" size={20} color={primary} />
              )}
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Notifications</ThemedText>
          <View style={[styles.card, { backgroundColor: background, borderColor: border }]}>
            <View
              style={[
                styles.option,
                { borderBottomWidth: 1, borderBottomColor: border },
              ]}
            >
              <View style={styles.optionLeft}>
                <IconSymbol name="bell.fill" size={22} color={textColor} />
                <ThemedText style={styles.optionText}>Match Alerts</ThemedText>
              </View>
              <Switch
                value={true}
                onValueChange={() => {}}
                trackColor={{ false: '#e5e7eb', true: primary }}
                thumbColor="#ffffff"
              />
            </View>

            <View
              style={[
                styles.option,
                { borderBottomWidth: 1, borderBottomColor: border },
              ]}
            >
              <View style={styles.optionLeft}>
                <IconSymbol name="star.fill" size={22} color={textColor} />
                <ThemedText style={styles.optionText}>Goal Notifications</ThemedText>
              </View>
              <Switch
                value={true}
                onValueChange={() => {}}
                trackColor={{ false: '#e5e7eb', true: primary }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={styles.option}>
              <View style={styles.optionLeft}>
                <IconSymbol name="flame.fill" size={22} color={textColor} />
                <ThemedText style={styles.optionText}>Live Match Updates</ThemedText>
              </View>
              <Switch
                value={false}
                onValueChange={() => {}}
                trackColor={{ false: '#e5e7eb', true: primary }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Account</ThemedText>
          <View style={[styles.card, { backgroundColor: background, borderColor: border }]}>
            {isAuthenticated ? (
              <>
                <Pressable
                  style={[
                    styles.option,
                    { borderBottomWidth: 1, borderBottomColor: border },
                  ]}
                >
                  <View style={styles.optionLeft}>
                    <IconSymbol name="person.fill" size={22} color={textColor} />
                    <ThemedText style={styles.optionText}>Profile</ThemedText>
                  </View>
                  <IconSymbol name="chevron.right" size={18} color={`${textColor}40`} />
                </Pressable>

                <Pressable onPress={logout} style={styles.option}>
                  <View style={styles.optionLeft}>
                    <IconSymbol name="rectangle.portrait.and.arrow.right" size={22} color="#ef4444" />
                    <ThemedText style={[styles.optionText, { color: '#ef4444' }]}>
                      Sign Out
                    </ThemedText>
                  </View>
                </Pressable>
              </>
            ) : (
              <Pressable
                onPress={() => router.push('/modal')}
                style={styles.option}
              >
                <View style={styles.optionLeft}>
                  <IconSymbol name="person.fill" size={22} color={primary} />
                  <ThemedText style={[styles.optionText, { color: primary }]}>
                    Sign In
                  </ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={18} color={primary} />
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>About</ThemedText>
          <View style={[styles.card, { backgroundColor: background, borderColor: border }]}>
            <View
              style={[
                styles.option,
                { borderBottomWidth: 1, borderBottomColor: border },
              ]}
            >
              <ThemedText style={styles.optionText}>Version</ThemedText>
              <ThemedText style={styles.optionValue}>1.0.0</ThemedText>
            </View>

            <Pressable style={styles.option}>
              <View style={styles.optionLeft}>
                <IconSymbol name="info.circle" size={22} color={textColor} />
                <ThemedText style={styles.optionText}>Terms & Privacy</ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={18} color={`${textColor}40`} />
            </Pressable>
          </View>
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            Made with love in Tanzania
          </ThemedText>
          <ThemedText style={styles.copyright}>
            © 2026 Football Intel
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 60,
  },

  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.6,
    marginBottom: 12,
    paddingHorizontal: 4,
  },

  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  optionValue: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.6,
  },

  footer: {
    paddingTop: 24,
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.5,
  },
  copyright: {
    fontSize: 12,
    opacity: 0.4,
  },
});