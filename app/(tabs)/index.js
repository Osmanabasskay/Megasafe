import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView, Animated, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/providers/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Users, User, Wallet as WalletIcon, CreditCard, FileText, Link as LinkIcon, Home, Building2, Banknote, Coins, RotateCcw, Zap, PiggyBank, HandCoins, GraduationCap, Bell, BarChart3 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const palette = {
  primary: '#0B5FFF',
  orange: '#FF7A00',
  blueDark: '#0A1B3E',
  bg: '#F6F8FF',
  text: '#0F172A',
  grayCard: '#EEF2FF',
};

function PressableScale({ onPress, children, style, testID }) {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, friction: 6 }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }).start();
  };
  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} activeOpacity={0.8} testID={testID}>
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

function FeatureTile({ label, Icon, colors }) {
  return (
    <PressableScale onPress={colors.onPress} testID={colors.testID} style={styles.featureWrap}>
      <View style={styles.featureInnerSquare}>
        <LinearGradient colors={colors.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.iconBgSquare}>
          <Icon color={colors.icon} size={24} />
        </LinearGradient>
        <Text style={styles.tileText}>{label}</Text>
      </View>
    </PressableScale>
  );
}

function SectionHeader({ title, Icon, gradient, testID }) {
  const theme = useTheme();
  return (
    <View style={styles.headerRow}>
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerBadge}>
        <Icon size={16} color="#fff" />
      </LinearGradient>
      <Text style={[styles.sectionHeader, { color: theme.colors.text }]} testID={testID}>{title}</Text>
    </View>
  );
}

function NotificationItem({ item, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.notifItem} testID={`notif-${item.id}`}>
      <View style={[styles.notifDot, { opacity: item.read ? 0 : 1 }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.notifTitle}>{item.title || 'Notification'}</Text>
        {!!item.body && <Text style={styles.notifBody}>{item.body}</Text>}
        {!!item.time && <Text style={styles.notifTime}>{item.time}</Text>}
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [user, setUser] = useState({ name: '', phone: '' });
  const [mm, setMm] = useState(null);
  const [banks, setBanks] = useState([]);
  const [payments, setPayments] = useState([]);
  const [walletTx, setWalletTx] = useState([]);
  const [groupsPreview, setGroupsPreview] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      try {
        const [ud, mmRaw, banksRaw, pays, wtx, groupsRaw, notifsRaw] = await Promise.all([
          AsyncStorage.getItem('userData'),
          AsyncStorage.getItem('mobileMoney'),
          AsyncStorage.getItem('linkedBanks'),
          AsyncStorage.getItem('payments'),
          AsyncStorage.getItem('walletTx'),
          AsyncStorage.getItem('availableGroups'),
          AsyncStorage.getItem('notifications'),
        ]);
        if (ud) setUser(JSON.parse(ud));
        if (mmRaw) setMm(JSON.parse(mmRaw));
        if (banksRaw) setBanks(JSON.parse(banksRaw));
        if (pays) setPayments(JSON.parse(pays));
        if (wtx) setWalletTx(JSON.parse(wtx));
        if (groupsRaw) {
          try {
            const gs = JSON.parse(groupsRaw);
            const normalized = Array.isArray(gs)
              ? gs
                  .filter((g) => String(g.name || '').toLowerCase() !== 'weekly investment group')
                  .map((g) => {
                    const name = String(g.name || '');
                    if (name.toLowerCase() === 'monthly savers circle') {
                      return { ...g, name: 'Osusu Groups' };
                    }
                    return g;
                  })
                  .slice(0, 5)
              : [];
            setGroupsPreview(normalized);
          } catch {}
        }
        if (notifsRaw) {
          try {
            const ns = JSON.parse(notifsRaw);
            const list = Array.isArray(ns) ? ns : [];
            setNotifications(list);
            const count = list.filter(n => !n.read).length;
            setUnreadCount(count);
          } catch {}
        }
      } catch (e) {
        console.log('[Home] load error', e);
        Alert.alert('Error', 'Failed to load data');
      }
    })();
  }, []);

  const userId = useMemo(() => (user.phone || 'guest'), [user]);

  const openNotifications = useCallback(() => {
    try {
      setNotifOpen(true);
      Animated.timing(notifAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    } catch (e) {
      console.log('[Home] openNotifications error', e);
    }
  }, [notifAnim]);

  const closeNotifications = useCallback(() => {
    try {
      Animated.timing(notifAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(({ finished }) => {
        if (finished) setNotifOpen(false);
      });
    } catch (e) {
      setNotifOpen(false);
      console.log('[Home] closeNotifications error', e);
    }
  }, [notifAnim]);

  const markAllRead = useCallback(async () => {
    try {
      const updated = (notifications || []).map(n => ({ ...n, read: true }));
      setNotifications(updated);
      setUnreadCount(0);
      await AsyncStorage.setItem('notifications', JSON.stringify(updated));
    } catch (e) {
      Alert.alert('Error', 'Failed to update notifications');
    }
  }, [notifications]);

  const onOpenItem = useCallback(async (id) => {
    try {
      const updated = (notifications || []).map(n => (n.id === id ? { ...n, read: true } : n));
      setNotifications(updated);
      const count = updated.filter(n => !n.read).length;
      setUnreadCount(count);
      await AsyncStorage.setItem('notifications', JSON.stringify(updated));
    } catch (e) {
      Alert.alert('Error', 'Failed to open notification');
    }
  }, [notifications]);

  const walletBalance = useMemo(() => {
    try {
      const top = (walletTx || []).filter(t => t.type === 'topup').reduce((s, t) => s + Number(t.amount || 0), 0);
      const out = (walletTx || []).filter(t => t.type === 'spend' || t.type === 'withdraw').reduce((s, t) => s + Number(t.amount || 0), 0);
      return Math.max(0, top - out);
    } catch {
      return 0;
    }
  }, [walletTx]);

  const groupContrib = useMemo(() => {
    try {
      return (payments || []).filter(p => p.groupId && (p.payerId ? p.payerId === userId : true)).reduce((s, p) => s + Number(p.amount || 0), 0);
    } catch { return 0; }
  }, [payments, userId]);

  const goalsContrib = useMemo(() => {
    try {
      return (payments || []).filter(p => String(p.note || '').startsWith('Savings Deposit - ')).reduce((s, p) => s + Number(p.amount || 0), 0);
    } catch { return 0; }
  }, [payments]);

  const totalAll = walletBalance + groupContrib + goalsContrib;

  const grid = [
    { key: 'link-om', label: 'Payment Method', icon: LinkIcon, color: '#ffffff', bg: ['#1E293B', '#0F172A'], onPress: () => router.push('/(tabs)/profile?to=payment'), testID: 'linkOM' },
    { key: 'osusu-groups', label: 'Osusu Groups', icon: Users, color: '#ffffff', bg: ['#34d399', '#059669'], onPress: () => router.push('/(tabs)/groups'), testID: 'osusuGroups' },
    { key: 'pay-bank', label: 'Make Payment', icon: Building2, color: '#0A1B3E', bg: ['#E0ECFF', '#CFE0FF'], onPress: () => router.push('/(tabs)/make-payment'), testID: 'pay-bank' },
    { key: 'reverse', label: 'Reverse Payment', icon: RotateCcw, color: '#ffffff', bg: [palette.orange, '#FF8F33'], onPress: () => router.push('/(tabs)/reverse-transaction'), testID: 'reverse' },
    { key: 'pay-receive', label: 'Wallet', icon: CreditCard, color: '#0A1B3E', bg: ['#FFE2CC', '#FFD0AD'], onPress: () => router.push('/(tabs)/wallet'), testID: 'pay-receive' },
    { key: 'goals', label: 'Savings Goals', icon: Home, color: '#ffffff', bg: ['#6366f1','#22d3ee'], onPress: () => router.push('/(tabs)/savings'), testID: 'goals' },
    { key: 'loan-org', label: 'Create Loan Account', icon: Building2, color:'#ffffff', bg:['#60a5fa','#2563eb'], onPress: ()=>router.push('/(tabs)/loans'), testID: 'loan-org' },
    { key: 'reports', label: 'Reports', icon: FileText, color:'#0A1B3E', bg:['#F2F7FF','#E6EEFF'], onPress: ()=>router.push('/(tabs)/reports'), testID: 'reports' },
    { key: 'analytics', label: 'Analytics', icon: BarChart3, color:'#ffffff', bg:['#10b981','#059669'], onPress: ()=>router.push('/(tabs)/analytics'), testID: 'analytics' },
  ];

  const currency = (n) => `NLe ${new Intl.NumberFormat('en-SL', { maximumFractionDigits: 2 }).format(n)}`;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.bgDecor} pointerEvents="none">
        <LinearGradient colors={["#e0ecff", "#f5f7ff"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.bgDecorGrad} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: Math.max(24, insets.bottom + 16) }}>
        <View style={styles.topBar}>
          <View style={{ flex: 1 }} />
          <PressableScale
            onPress={openNotifications}
            testID="btnNotifications"
            style={styles.bellWrap}
          >
            <View>
              <LinearGradient colors={["#ffffff", "#e5edff"]} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.bellBg}>
                <Bell color={palette.primary} size={20} />
              </LinearGradient>
              {unreadCount > 0 && (
                <View style={styles.badge} testID="notifBadge">
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : String(unreadCount)}</Text>
                </View>
              )}
            </View>
          </PressableScale>
        </View>
        <LinearGradient colors={[palette.primary, '#102B73']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.summaryCardNew}>
          <View style={{ padding: 16 }}>
            <Text style={styles.balanceLabelLight}>Balance</Text>
            <Text style={styles.balanceValueLight}>{currency(totalAll)}</Text>
            <View style={styles.activityRow}>
              <Text style={styles.activityLight}>Recent Activity</Text>
              <View style={styles.receivedBadge} testID="receivedBadge">
                <Text style={styles.receivedBadgeText}>Received</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.sectionBlock}>
          <SectionHeader title="Quick Links" Icon={Zap} gradient={[palette.primary, '#2E7CFB']} testID="header-quick-links" />
          <View style={styles.grid}>
            {grid.map((g) => (
              <FeatureTile key={g.key} label={g.label} Icon={g.icon} colors={{ icon: g.color, bg: g.bg, onPress: g.onPress, testID: g.testID }} />
            ))}
          </View>
        </View>
      </ScrollView>

      {notifOpen && (
        <View style={styles.notifOverlay} testID="notifOverlay">
          <Pressable style={styles.notifBackdrop} onPress={closeNotifications} testID="notifBackdrop" />
          <Animated.View
            style={[
              styles.notifSheet,
              {
                transform: [
                  {
                    translateY: notifAnim.interpolate({ inputRange: [0, 1], outputRange: [400, 0] }),
                  },
                ],
                opacity: notifAnim,
              },
            ]}
          >
            <View style={styles.notifHeader}>
              <Text style={styles.notifHeaderTitle}>Notifications</Text>
              <View style={styles.notifHeaderActions}>
                <TouchableOpacity onPress={markAllRead} testID="markAllRead">
                  <Text style={styles.notifActionText}>Mark all read</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={closeNotifications} testID="closeNotif">
                  <Text style={styles.notifActionText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 16 }}>
              {notifications.length === 0 ? (
                <View style={styles.notifEmpty}>
                  <Text style={styles.notifEmptyTitle}>You're all caught up</Text>
                  <Text style={styles.notifEmptySub}>No notifications yet</Text>
                </View>
              ) : (
                notifications.map((n) => (
                  <NotificationItem key={n.id} item={n} onPress={() => onOpenItem(n.id)} />
                ))
              )}
            </ScrollView>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  bgDecor: { position: 'absolute', top: 0, left: 0, right: 0, height: 260, zIndex: -1 },
  bgDecorGrad: { flex: 1, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  scroll: { flex: 1 },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginHorizontal: 16, marginBottom: 8 },
  bigTitle: { fontSize: 22, fontWeight: '800', color: palette.text },

  summaryCardNew: { marginHorizontal: 16, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  balanceLabelLight: { color: '#DCE7FF' },
  balanceValueLight: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', marginTop: 6 },
  activityRow: { marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  activityLight: { color: '#E6EEFF', fontWeight: '600' },
  receivedBadge: { backgroundColor: palette.orange, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  receivedBadgeText: { color: '#FFFFFF', fontWeight: '800' },

  sectionBlock: { marginTop: 18 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 10 },
  headerBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  sectionHeader: { fontSize: 18, fontWeight: '800', color: palette.text },

  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 },
  featureWrap: { width: '33.3333%', padding: 8 },
  featureInnerSquare: { backgroundColor: '#fff', borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3, padding: 10, borderWidth: 1, borderColor: '#E6ECFF', minHeight: 140 },
  iconBgSquare: { width: '100%', height: 72, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tileText: { marginTop: 8, fontWeight: '800', color: palette.text, fontSize: 12, textAlign: 'center' },
  gridCaption: { color: '#6b7280', marginLeft: 16, marginTop: -4 },

  goalCard: { width: 180, height: 120, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4 },
  goalTitle: { marginTop: 10, marginLeft: 6, color: palette.text, fontWeight: '800' },
  goalSub: { marginLeft: 6, color: '#6b7280', fontSize: 12 },

  groupCardMini: { width: 180, height: 120, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4 },
  groupLogoText: { fontSize: 24, fontWeight: '800', color: '#243b2f' },
  groupNameMini: { marginTop: 8, marginLeft: 4, color: palette.text, fontWeight: '700' },
  groupSubMini: { marginLeft: 4, color: '#6b7280', fontSize: 12 },

  bellWrap: { padding: 4 },
  bellBg: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E6ECFF' },
  badge: { position: 'absolute', right: -2, top: -2, backgroundColor: '#ef4444', borderRadius: 8, paddingHorizontal: 4, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  notifOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'flex-end' },
  notifBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  notifSheet: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '70%', paddingBottom: 12 },
  notifHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e5e7eb' },
  notifHeaderTitle: { fontSize: 16, fontWeight: '800', color: palette.text },
  notifHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  notifActionText: { color: palette.primary, fontWeight: '700' },
  notifItem: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eef2ff' },
  notifDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444', marginTop: 6, marginRight: 10 },
  notifTitle: { fontWeight: '800', color: palette.text },
  notifBody: { color: '#475569', marginTop: 2 },
  notifTime: { color: '#94a3b8', fontSize: 12, marginTop: 6 },
  notifEmpty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  notifEmptyTitle: { fontWeight: '800', color: palette.text },
  notifEmptySub: { color: '#6b7280', marginTop: 6 },
});