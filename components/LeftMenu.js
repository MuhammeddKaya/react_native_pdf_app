import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, Linking } from 'react-native';
import { Text, Toggle, Divider, ListItem } from '@ui-kitten/components';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Small helper row using UI Kitten's ListItem and expo icon
const Row = ({ icon, children, onPress, rightElement }) => (
  <ListItem
    title={() => <Text category='s1'>{children}</Text>}
    accessoryLeft={() => (
      <MaterialCommunityIcons name={icon} size={22} color={'#0f61ff'} />
    )}
    accessoryRight={rightElement}
    onPress={onPress}
    style={styles.row}
  />
);

const LeftMenu = ({ navigation, onToggleTheme, keepScreenOn = false, onToggleKeepScreenOn }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [keepOn, setKeepOn] = useState(!!keepScreenOn);

  const toggleDark = (val) => {
    setDarkMode(val);
    if (onToggleTheme) onToggleTheme(val ? 'dark' : 'light');
  };

  const toggleKeep = (val) => {
    setKeepOn(val);
    if (onToggleKeepScreenOn) onToggleKeepScreenOn(val);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text category='h5' style={styles.headerText}>PDF Okuyucu</Text>
          <Text appearance='hint' category='c1'>Versiyon: 1.0.0</Text>
        </View>

        <View style={styles.section}>
          <Row icon='help-circle-outline' onPress={() => navigation?.navigate?.('FAQ')}> <Text >Sıkça Sorulan Sorular</Text></Row>
          <Row icon='calendar-plus' onPress={() => navigation?.navigate?.('FeatureRequest')}><Text>Yeni özellik iste</Text></Row>
        </View>

        <Divider style={styles.divider} />


        <Divider style={styles.divider} />

        <Text appearance='hint' category='s2' style={styles.sectionTitle}>Uygulama hakkında</Text>
        <View style={styles.section}>
          <Row icon='message-text-outline' onPress={() => Linking.openURL('mailto:feedback@example.com')}>Geri bildirim</Row>
          <Row icon='share-variant' >Uygulamayı Paylaş</Row>
          <Row icon='shield-outline' >Gizlilik Politikası</Row>
        </View>

        <View style={styles.versionRow}>
          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  headerText: { fontWeight: '700' },
  section: { marginTop: 8, marginBottom: 12 },
  row: { paddingVertical: 8 },
  divider: { marginVertical: 8 },
  sectionTitle: { marginTop: 6, marginBottom: 6, marginLeft: 2 },
  versionRow: { marginTop: 12, alignItems: 'flex-start' },
});

export default LeftMenu;
