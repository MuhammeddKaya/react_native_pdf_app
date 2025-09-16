import React, { useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Modal, Pressable, Share, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
          <Text style={styles.uri} numberOfLines={1}>{item.uri}</Text>
        </View>
        <TouchableOpacity onPress={openMenu} style={styles.menuButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialCommunityIcons name="dots-vertical" size={22} color="#061322ff" />
        </TouchableOpacity>
      </TouchableOpacity>

      <Modal visible={menuVisible} transparent animationType="slide" onRequestClose={closeMenu}>
        <Pressable style={styles.modalOverlay} onPress={closeMenu}>
          <Pressable style={styles.bottomSheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
              <TouchableOpacity onPress={closeMenu} style={styles.closeButton} hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}>
                <MaterialCommunityIcons name="close" size={22} color="#444" />
              </TouchableOpacity>

                <View style={styles.rowButtons}>
                  <Pressable onPress={handleShare} style={[styles.actionButton, styles.actionLeft]} android_ripple={{color:'#eee'}}>
                    <MaterialCommunityIcons name="share-variant" size={28} color="#1565c0" />
                    <Text style={styles.actionText}>Paylaş</Text>
                  </Pressable>
                  <Pressable onPress={handlePrint} style={[styles.actionButton, styles.actionRight]} android_ripple={{color:'#eee'}}>
                    <MaterialCommunityIcons name="printer" size={28} color="#1565c0" />
                    <Text style={styles.actionText}>Yazdır</Text>
                  </Pressable>
                </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
    container: {
    backgroundColor: '#f7f7f7',
    padding: 12,
    marginBottom: 4,
    marginHorizontal: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 28,
    minHeight: 240,
  },
  sheetHandle: {
    width: 48,
    height: 5,
    backgroundColor: '#ddd',
    borderRadius: 3,
    alignSelf: 'center',
    marginVertical: 8,
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalText: {
    fontSize: 16,
    color: '#111',
  },
  closeButton: {
    position: 'absolute',
    left: 10,
    top: 6,
    padding: 6,
    zIndex: 10,
  },
  modalItemIcon: {
    marginRight: 6,
  },
  rowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingHorizontal: 6,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f1f8ff',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  actionLeft: {
    marginRight: 6,
  },
  actionRight: {
    marginLeft: 6,
  },
  actionText: {
    marginTop: 6,
    color: '#1565c0',
    fontWeight: '600',
  },
});
