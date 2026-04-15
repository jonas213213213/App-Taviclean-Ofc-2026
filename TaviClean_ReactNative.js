import React, { useState, useMemo } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  FlatList, 
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');

// --- Mock Data ---

const MOCK_APPOINTMENTS = [
  {
    id: '1',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '12:00',
    customerName: 'Maria Silva',
    customerPhoto: 'https://picsum.photos/seed/maria/100/100',
    serviceType: 'Limpeza Padrão',
    address: 'Rua de Santo António, 45',
    city: 'Faro',
    status: 'Confirmado',
    price: 45.00,
    checklist: [
      { task: 'Limpar superfícies da cozinha', completed: true },
      { task: 'Aspirar e lavar o chão', completed: true },
      { task: 'Limpar casas de banho', completed: false },
      { task: 'Mudar lençóis', completed: false },
    ]
  },
  {
    id: '2',
    date: new Date().toISOString().split('T')[0],
    startTime: '13:30',
    endTime: '15:30',
    customerName: 'João Pereira',
    customerPhoto: 'https://picsum.photos/seed/joao/100/100',
    serviceType: 'Limpeza Profunda',
    address: 'Avenida da República, 12',
    city: 'Faro',
    status: 'A Caminho',
    price: 65.00,
    checklist: []
  },
  {
    id: '3',
    date: new Date().toISOString().split('T')[0],
    startTime: '16:00',
    endTime: '18:00',
    customerName: 'Ana Costa',
    customerPhoto: 'https://picsum.photos/seed/ana/100/100',
    serviceType: 'Limpeza de Escritório',
    address: 'Rua do Prior, 8',
    city: 'Faro',
    status: 'Concluído',
    price: 35.00,
    checklist: []
  },
];

const MOCK_EARNINGS = [
  { id: 'e1', date: '2024-04-12', amount: 36.00, method: 'PayPal', status: 'Em Trânsito' },
  { id: 'e2', date: '2024-04-10', amount: 18.00, method: 'PayPal', status: 'Concluído' },
  { id: 'e3', date: '2024-04-09', amount: 63.00, method: 'PayPal', status: 'Concluído' },
  { id: 'e4', date: '2024-04-08', amount: 21.00, method: 'PayPal', status: 'Concluído' },
];

// --- Components ---

const StatusBadge = ({ status }) => {
  const stylesMap = {
    Confirmado: { bg: '#00BCD4', text: '#FFFFFF' },
    'A Caminho': { bg: '#FF9800', text: '#FFFFFF' },
    Pendente: { bg: '#FFC107', text: '#FFFFFF' },
    Concluído: { bg: '#E0E0E0', text: '#424242' },
  };
  const style = stylesMap[status] || stylesMap.Pendente;

  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text style={[styles.badgeText, { color: style.text }]}>{status.toUpperCase()}</Text>
    </View>
  );
};

const JobCard = ({ job, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={() => onPress(job)}>
    <View style={styles.cardTop}>
      <View style={styles.customerInfo}>
        <Image source={{ uri: job.customerPhoto }} style={styles.customerPhoto} />
        <View>
          <Text style={styles.customerName}>{job.customerName}</Text>
          <Text style={styles.serviceType}>{job.serviceType.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.priceInfo}>
        <Text style={styles.priceText}>€{job.price.toFixed(2)}</Text>
        <StatusBadge status={job.status} />
      </View>
    </View>

    <View style={styles.cardDetails}>
      <View style={styles.detailRow}>
        <Text style={styles.detailIcon}>🕒</Text>
        <Text style={styles.detailText}>{job.startTime} - {job.endTime}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailIcon}>📍</Text>
        <Text style={styles.detailText}>{job.address}, {job.city}</Text>
      </View>
    </View>

    <View style={styles.cardActions}>
      <TouchableOpacity style={styles.secondaryAction}>
        <Text style={styles.secondaryActionText}>FOTOS ANTES</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.primaryAction}>
        <Text style={styles.primaryActionText}>INICIAR TRABALHO</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedJob, setSelectedJob] = useState(null);

  if (selectedJob) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.executionHeader}>
          <TouchableOpacity onPress={() => setSelectedJob(null)}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.executionTitle}>INICIAR TRABALHO</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.executionContent}>
          <View style={styles.timerBanner}>
            <Text style={styles.timerText}>📅 29 AGO 2024</Text>
            <Text style={[styles.timerText, { color: '#4CAF50' }]}>▶ 1H 20MIN RESTANTES</Text>
          </View>

          <View style={styles.executionProfile}>
            <View style={styles.customerInfoLarge}>
              <Image source={{ uri: selectedJob.customerPhoto }} style={styles.customerPhotoLarge} />
              <View>
                <Text style={styles.customerNameLarge}>{selectedJob.customerName}</Text>
                <Text style={styles.customerSub}>Proprietário</Text>
              </View>
            </View>
            <Text style={styles.priceLarge}>€{selectedJob.price.toFixed(2)}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>ENDEREÇO</Text>
            <Text style={styles.infoValue}>{selectedJob.address}, {selectedJob.city}</Text>
            <TouchableOpacity>
              <Text style={styles.mapLink}>ABRIR NO MAPA</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.checklistCard}>
            <Text style={styles.checklistTitle}>Checklist de Tarefas</Text>
            <Text style={styles.checklistProgress}>50%</Text>
          </View>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Informação da Propriedade</Text>
            <Text style={styles.chevron}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Fotos Antes</Text>
            <Text style={styles.cameraIcon}>📷</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Fotos Depois</Text>
            <Text style={styles.cameraIcon}>📷</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.executionFooter}>
          <TouchableOpacity style={styles.pauseButton}>
            <Text style={styles.pauseButtonText}>PAUSAR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.completeButton}>
            <Text style={styles.completeButtonText}>CONCLUIR TRABALHO</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView style={styles.content}>
        {activeTab === 'dashboard' && (
          <View style={styles.tabContent}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <View style={styles.logoIcon}><Text style={{color: 'white'}}>✨</Text></View>
                <View>
                  <Text style={styles.logoText}>TaviClean</Text>
                  <Text style={styles.logoSub}>SERVIÇOS FARO</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.notificationBtn}>
                <Text>🔔</Text>
                <View style={styles.notifBadge} />
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>TRABALHOS DE HOJE</Text>
            {MOCK_APPOINTMENTS.map(job => (
              <JobCard key={job.id} job={job} onPress={setSelectedJob} />
            ))}
          </View>
        )}

        {activeTab === 'earnings' && (
          <View style={styles.tabContent}>
            <Text style={styles.viewTitle}>Ganhos</Text>
            <View style={styles.earningsSummary}>
              <Text style={styles.earningsPeriod}>31 AGO - 07 SET</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Em trânsito</Text>
                <Text style={styles.summaryValue}>€73.65</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total</Text>
                <Text style={styles.summaryTotal}>€73.65</Text>
              </View>
              <TouchableOpacity style={styles.expressPayBtn}>
                <Text style={styles.expressPayText}>PAGAMENTO EXPRESSO</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>HISTÓRICO</Text>
            {MOCK_EARNINGS.map(record => (
              <View key={record.id} style={styles.historyItem}>
                <View style={styles.historyIcon}><Text>💰</Text></View>
                <View style={{flex: 1}}>
                  <Text style={styles.historyAmount}>€{record.amount.toFixed(2)}</Text>
                  <Text style={styles.historyDate}>{record.date}</Text>
                  <Text style={[styles.historyStatus, {color: record.status === 'Concluído' ? '#4CAF50' : '#FF9800'}]}>
                    {record.status}
                  </Text>
                </View>
                <Text style={styles.chevron}>→</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'schedule' && (
          <View style={[styles.tabContent, {alignItems: 'center', justifyContent: 'center', height: 500}]}>
            <Text style={styles.emptyTitle}>Sem Trabalhos Abertos</Text>
            <Text style={styles.emptySub}>A sua agenda está livre por agora.</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <NavBtn active={activeTab === 'dashboard'} label="Dashboard" icon="📊" onPress={() => setActiveTab('dashboard')} />
        <NavBtn active={activeTab === 'schedule'} label="Agenda" icon="📅" onPress={() => setActiveTab('schedule')} />
        <NavBtn active={activeTab === 'earnings'} label="Ganhos" icon="💰" onPress={() => setActiveTab('earnings')} />
        <NavBtn active={activeTab === 'profile'} label="Perfil" icon="👤" onPress={() => setActiveTab('profile')} />
      </View>
    </SafeAreaView>
  );
}

const NavBtn = ({ active, label, icon, onPress }) => (
  <TouchableOpacity style={styles.navBtn} onPress={onPress}>
    <Text style={[styles.navIcon, { opacity: active ? 1 : 0.3 }]}>{icon}</Text>
    <Text style={[styles.navLabel, { color: active ? '#00BCD4' : '#BBBBBB' }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { flex: 1 },
  tabContent: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logoIcon: { width: 40, height: 40, backgroundColor: '#00BCD4', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  logoText: { fontSize: 20, fontWeight: 'bold', color: '#00BCD4' },
  logoSub: { fontSize: 8, fontWeight: 'bold', color: '#BBBBBB', letterSpacing: 1 },
  notificationBtn: { width: 40, height: 40, backgroundColor: 'white', borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F0F0F0' },
  notifBadge: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, backgroundColor: 'red', borderRadius: 4, borderWidth: 1, borderColor: 'white' },
  sectionTitle: { fontSize: 10, fontWeight: 'bold', color: '#BBBBBB', letterSpacing: 1.5, marginBottom: 15 },
  card: { backgroundColor: 'white', borderRadius: 24, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#F0F0F0' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  customerInfo: { flexDirection: 'row', alignItems: 'center' },
  customerPhoto: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  customerName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  serviceType: { fontSize: 9, fontWeight: 'bold', color: '#00BCD4' },
  priceInfo: { alignItems: 'flex-end' },
  priceText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  cardDetails: { marginBottom: 20 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  detailIcon: { fontSize: 12, marginRight: 5 },
  detailText: { fontSize: 12, color: '#777', fontWeight: '500' },
  cardActions: { flexDirection: 'row', gap: 10 },
  primaryAction: { flex: 1, backgroundColor: '#00BCD4', padding: 12, borderRadius: 12, alignItems: 'center' },
  primaryActionText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  secondaryAction: { flex: 1, backgroundColor: '#F8F9FA', padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#F0F0F0' },
  secondaryActionText: { color: '#999', fontSize: 10, fontWeight: 'bold' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, marginTop: 4 },
  badgeText: { fontSize: 8, fontWeight: 'bold' },
  bottomNav: { height: 70, backgroundColor: 'white', flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  navBtn: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navIcon: { fontSize: 20, marginBottom: 4 },
  navLabel: { fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase' },
  viewTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  earningsSummary: { backgroundColor: 'white', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#F0F0F0', marginBottom: 30 },
  earningsPeriod: { fontSize: 10, fontWeight: 'bold', color: '#BBBBBB', marginBottom: 15 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 12, color: '#777' },
  summaryValue: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  summaryTotal: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  expressPayBtn: { backgroundColor: '#00BCD4', padding: 15, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  expressPayText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  historyItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: 20, marginBottom: 10, borderWidth: 1, borderColor: '#F0F0F0' },
  historyIcon: { width: 40, height: 40, backgroundColor: '#F8F9FA', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  historyAmount: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  historyDate: { fontSize: 10, color: '#999' },
  historyStatus: { fontSize: 9, fontWeight: 'bold', marginTop: 2 },
  chevron: { color: '#DDD', fontSize: 18 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  emptySub: { fontSize: 12, color: '#999', marginTop: 5 },
  executionHeader: { height: 60, backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backIcon: { fontSize: 24, color: '#BBB' },
  executionTitle: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: 'bold', color: '#BBB' },
  executionContent: { flex: 1, padding: 20 },
  timerBanner: { backgroundColor: '#F8F9FA', padding: 15, borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  timerText: { fontSize: 10, fontWeight: 'bold', color: '#999' },
  executionProfile: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  customerInfoLarge: { flexDirection: 'row', alignItems: 'center' },
  customerPhotoLarge: { width: 60, height: 60, borderRadius: 20, marginRight: 15 },
  customerNameLarge: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  customerSub: { fontSize: 12, color: '#999' },
  priceLarge: { fontSize: 24, fontWeight: 'bold', color: '#00BCD4' },
  infoSection: { marginBottom: 30 },
  infoLabel: { fontSize: 10, fontWeight: 'bold', color: '#DDD', marginBottom: 5 },
  infoValue: { fontSize: 14, fontWeight: 'bold', color: '#555' },
  mapLink: { fontSize: 10, fontWeight: 'bold', color: '#00BCD4', marginTop: 5 },
  checklistCard: { backgroundColor: 'white', padding: 20, borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#F0F0F0', marginBottom: 15 },
  checklistTitle: { fontSize: 14, fontWeight: 'bold', color: '#555' },
  checklistProgress: { fontSize: 14, fontWeight: 'bold', color: '#00BCD4' },
  menuItem: { backgroundColor: 'white', padding: 15, borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#F0F0F0', marginBottom: 10 },
  menuItemText: { fontSize: 12, fontWeight: 'bold', color: '#555' },
  cameraIcon: { fontSize: 16 },
  executionFooter: { padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  pauseButton: { padding: 15, borderRadius: 15, borderWidth: 2, borderColor: '#F0F0F0', alignItems: 'center', marginBottom: 10 },
  pauseButtonText: { fontSize: 12, fontWeight: 'bold', color: '#BBB' },
  completeButton: { padding: 15, borderRadius: 15, backgroundColor: '#00BCD4', alignItems: 'center' },
  completeButtonText: { fontSize: 12, fontWeight: 'bold', color: 'white' },
});
