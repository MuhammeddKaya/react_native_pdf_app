import React from 'react';
import { Modal, Pressable, View, Text, Pressable as RNPressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

export default function FileEditSheet({ visible, onClose, onShare, onPrint }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.bottomSheet} onPress={() => {}}>
          <View style={styles.sheetHandle} />
          <Pressable onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={22} color="#444" />
          </Pressable>

          <View style={styles.rowButtons}>
            <RNPressable onPress={() => { onShare(); }} style={[styles.actionButton, styles.actionLeft]} android_ripple={{color:'#eee'}}>
              <MaterialCommunityIcons name="share-variant" size={28} color="#1565c0" />
              <Text style={styles.actionText}>Paylaş</Text>
            </RNPressable>
            <RNPressable onPress={() => { onPrint(); }} style={[styles.actionButton, styles.actionRight]} android_ripple={{color:'#eee'}}>
              <MaterialCommunityIcons name="printer" size={28} color="#1565c0" />
              <Text style={styles.actionText}>Yazdır</Text>
            </RNPressable>
          </View>

        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    minHeight: 300,
  },
  sheetHandle: {
    width: 48,
    height: 5,
    backgroundColor: '#ddd',
    borderRadius: 3,
    alignSelf: 'center',
    marginVertical: 8,
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
  closeButton: {
    position: 'absolute',
    left: 10,
    top: 6,
    padding: 6,
    zIndex: 10,
  },
});
