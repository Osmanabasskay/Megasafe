import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { BarChart3, TrendingUp, PieChart, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AnalyticsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const horizontal = Math.max(16, Math.min(24, Math.round(width * 0.04)));

  return (
    <SafeAreaView style={styles.container} edges={['top','left','right','bottom']}>
      <View style={[styles.headerBar, { paddingTop: insets.top + 8, paddingHorizontal: horizontal }]}> 
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          testID="analyticsBackButton"
          style={styles.backButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft color="#111" size={22} />
        </TouchableOpacity>
        <View style={styles.headerTitleRow}>
          <BarChart3 color="#FFA500" size={22} />
          <Text style={styles.title}>Analytics</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: horizontal, paddingBottom: Math.max(24, insets.bottom + 16) }]} keyboardShouldPersistTaps="handled">
        <Text style={styles.subtitle}>Overview of your finances</Text>

        <View style={styles.card}>
          <View style={styles.row}><TrendingUp color="#5CCEF4" /><Text style={styles.metric}>Monthly Contributions: NLe 5,200</Text></View>
          <View style={styles.row}><PieChart color="#62DDBD" /><Text style={styles.metric}>Savings vs Loans: 60% / 40%</Text></View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Top Groups</Text>
          <Text style={styles.item}>• Family Osusu – NLe 2,100</Text>
          <Text style={styles.item}>• Friends Pot – NLe 1,500</Text>
          <Text style={styles.item}>• Workmates – NLe 1,000</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  headerBar: { backgroundColor: '#ffffff' },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  backButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.04)', marginBottom: 8 },
  content: { paddingTop: 8 },
  title: { fontSize: 22, fontWeight: '800', color: '#111', marginLeft: 8 },
  subtitle: { color: '#666', marginTop: 6 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginTop: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardTitle: { fontWeight: '800', color: '#111', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  metric: { color: '#111', fontWeight: '700', marginLeft: 8 },
  item: { color: '#111', marginTop: 4 },
});
