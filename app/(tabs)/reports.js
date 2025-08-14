import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { FileText, Download, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ReportsScreen() {
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
          testID="reportsBackButton"
          style={styles.backButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft color="#111" size={22} />
        </TouchableOpacity>
        <View style={styles.headerTitleRow}>
          <FileText color="#FFA500" size={22} />
          <Text style={styles.title}>Reports</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingHorizontal: horizontal, paddingBottom: Math.max(24, insets.bottom + 16) }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.subtitle}>Export receipts and statements</Text>

        <TouchableOpacity style={styles.card} testID="reportOsusu" activeOpacity={0.8}>
          <Text style={styles.cardTitle}>Osusu Contributions</Text>
          <Text style={styles.cardDesc}>Generate PDF receipts for group payments</Text>
          <View style={styles.download}>
            <Download color="#FFA500" size={18} />
            <Text style={styles.downloadText}>Generate PDF</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} testID="reportLoans" activeOpacity={0.8}>
          <Text style={styles.cardTitle}>Loans</Text>
          <Text style={styles.cardDesc}>Payment history and outstanding balance</Text>
          <View style={styles.download}>
            <Download color="#FFA500" size={18} />
            <Text style={styles.downloadText}>Generate PDF</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} testID="reportTransfers" activeOpacity={0.8}>
          <Text style={styles.cardTitle}>Transfers</Text>
          <Text style={styles.cardDesc}>Mobile money and bank transactions</Text>
          <View style={styles.download}>
            <Download color="#FFA500" size={18} />
            <Text style={styles.downloadText}>Generate PDF</Text>
          </View>
        </TouchableOpacity>
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
  cardTitle: { fontWeight: '800', color: '#111' },
  cardDesc: { color: '#666', marginTop: 4 },
  download: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  downloadText: { color: '#FFA500', fontWeight: '700', marginLeft: 8 },
});
