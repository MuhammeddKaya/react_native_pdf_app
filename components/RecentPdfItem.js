import React, { useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Share, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FileEditSheet from './FileEditSheet';

function formatPdfName(name) {
  if (!name) return '';
  const headMax = 12;
  const tailMax = 10;
  if (name.length <= headMax + tailMax + 3) return name;
  const words = name.split(' ');
  let head = '';
  for (const w of words) {
    const candidate = head ? head + ' ' + w : w;
    if (candidate.length <= headMax) head = candidate; else break;
  }
  let tail = '';
  for (let i = words.length - 1; i >= 0; i--) {
    const w = words[i];
    tail = tail ? w + ' ' + tail : w;
    if (tail.length >= tailMax) break;
  }
  if (!head) head = name.slice(0, headMax);
  if (!tail) tail = name.slice(-tailMax);
  return `${head.trim()}...${tail.trim()}`;
}

export default function RecentPdfItem({ item, onPress }) {
  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleShare = async () => {
    closeMenu();
    try {
      await Share.share({ url: item.uri, message: item.name });
    } catch (e) {
      Alert.alert('Paylaşma hatası', e.message || String(e));
    }
  };

  const handlePrint = async () => {
    closeMenu();
    try {
      // try to dynamically require expo-print if available
      const Print = require('expo-print');
      if (Print && Print.printAsync) {
        await Print.printAsync({ uri: item.uri });
      } else {
        Alert.alert('Yazdırma desteklenmiyor', 'Yazdırma için `expo-print` yüklü değil.');
      }
    } catch (e) {
      Alert.alert('Yazdırma hatası', e.message || 'Yazdırma işlemi gerçekleştirilemedi.');
    }
  };

  return (
    <>
      <TouchableOpacity onPress={() => onPress(item)} style={styles.container}>
        <View>
          <MaterialCommunityIcons name="file-pdf-box" size={50} color="#b63d3dff"/>
        </View>
        <View style={styles.inner}>
          <Text style={styles.title} numberOfLines={1}>{formatPdfName(item.name)}</Text>
          {/* <Text style={styles.uri} numberOfLines={1}>{item.uri}</Text> */}
        </View>
        <TouchableOpacity onPress={openMenu} style={styles.menuButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialCommunityIcons name="dots-vertical" size={22} color="#061322ff" />
        </TouchableOpacity>
      </TouchableOpacity>

      <FileEditSheet visible={menuVisible} onClose={closeMenu} onShare={handleShare} onPrint={handlePrint} />
    </>
  );
}

const styles = StyleSheet.create({
    container: {
    backgroundColor: '#f7f7f7',
    padding: 12,
    marginBottom: 4,
    marginHorizontal: 2,
    flexDirection: 'row',
    alignItems: 'center',

    // sadece alt çizgi
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
    
  },
  inner: {
    flex: 1,
  },
  title: {
    color: '#040f1bff',
    fontWeight: 'bold',
    fontSize:  18,
    marginLeft: 8
  },
  uri: {
    color: '#201e1eff',
    fontSize: 12,
    marginTop: 2,
    marginLeft: 8
  },
  openLabel: {
    color: '#061322ff',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 8,
  },
  
});
