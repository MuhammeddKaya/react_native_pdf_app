import React, { useState, useEffect } from "react";
import { Button, View, Text, FlatList, TouchableOpacity, useWindowDimensions, StyleSheet } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import Pdf from "react-native-pdf";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator();

function HomeScreen({ navigation }) {
  const [recentPdfs, setRecentPdfs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // AsyncStorage'dan geçmişi yükle
    const loadPdfs = async () => {
      try {
        const data = await AsyncStorage.getItem('recentPdfs');
        if (data) setRecentPdfs(JSON.parse(data));
      } catch (e) { /* ignore */ }
    };
    loadPdfs();
  }, []);

  const savePdfs = async (list) => {
    try {
      await AsyncStorage.setItem('recentPdfs', JSON.stringify(list));
    } catch (e) { /* ignore */ }
  };

  const pickPdf = async () => {
    setError(null);
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (res.assets && res.assets.length > 0) {
        const pdf = res.assets[0];
        const updated = [{ name: pdf.name, uri: pdf.uri }, ...recentPdfs.filter(item => item.uri !== pdf.uri)];
        setRecentPdfs(updated);
        savePdfs(updated);
        navigation.navigate('PDFViewer', { uri: pdf.uri, name: pdf.name });
      }
    } catch (err) {
      setError("PDF seçilirken hata oluştu");
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#f7f7f7' }}>
      <Button title="PDF Seç" onPress={pickPdf} />
      {error && <Text style={{ color: 'red', marginTop: 8 }}>{error}</Text>}
      <Text style={{ marginTop: 24, fontWeight: 'bold', fontSize: 18, color: '#222' }}>Son Görüntülenen PDF'ler</Text>
      <FlatList
        data={recentPdfs}
        keyExtractor={item => item.uri}
        contentContainerStyle={{ paddingVertical: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('PDFViewer', { uri: item.uri, name: item.name })}
            style={{
              backgroundColor: '#fff',
              borderRadius: 10,
              padding: 16,
              marginBottom: 12,
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#1565c0', fontWeight: 'bold', fontSize: 16 }} numberOfLines={1}>{item.name}</Text>
              <Text style={{ color: '#888', fontSize: 12, marginTop: 2 }} numberOfLines={1}>{item.uri}</Text>
            </View>
            <Text style={{ color: '#1565c0', fontWeight: 'bold', fontSize: 18, marginLeft: 8 }}>Aç</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ color: '#888', marginTop: 20, textAlign: 'center' }}>Henüz PDF seçilmedi.</Text>}
      />
    </View>
  );
}

function PDFViewerScreen({ route, navigation }) {
  const { uri, name } = route.params;
  const [scale, setScale] = useState(1.0);
  const { width, height } = useWindowDimensions();
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // react-native-pdf pinch-to-zoom varsayılan olarak açıktır
  return (
    <View style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
      <View style={styles.pdfHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pdfTitle} numberOfLines={1}>{name}</Text>
        </View>
        <View style={styles.zoomButtonsContainer}>
          <TouchableOpacity style={styles.zoomButton} onPress={() => setScale(s => Math.max(0.5, s - 0.2))}>
            <Text style={styles.zoomButtonText}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.zoomButton} onPress={() => setScale(s => Math.min(3, s + 0.2))}>
            <Text style={styles.zoomButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <Pdf
          source={{ uri }}
          scale={scale}
          minScale={0.5}
          maxScale={3}
          enablePinch={true}
          enableDoubleTapZoom={true}
          onLoadComplete={(numberOfPages, filePath) => {
            setTotalPages(numberOfPages);
            setPage(1);
            console.log('onLoadComplete - numberOfPages:', numberOfPages, 'filePath:', filePath);
          }}
          onPageChanged={(pageNum) => {
            setPage(pageNum);
            console.log('onPageChanged - pageNum:', pageNum, 'totalPages:', totalPages);
          }}
          onError={(error) => {
            setError("PDF yüklenirken hata oluştu: " + error.message);
            console.log(error);
          }}
          onPressLink={(uri) => {
            console.log(`Link pressed: ${uri}`);
          }}
          style={{ flex: 1, width, height }}
        />
        {/* Sağ alt köşede transparan sayfa göstergesi */}
        <View style={styles.pageIndicator} pointerEvents="none">
          <Text style={styles.pageIndicatorText}>Pg. {page}</Text>
        </View>
      </View>
      {error && <Text style={{ color: 'red', margin: 8 }}>{error}</Text>}
    </View>
  );

}
const styles = StyleSheet.create({
  pdfHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f5f5f5',
    gap: 8,
  },
  pageIndicator: {
    position: 'absolute',
    right: 16,
    bottom: 54,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    zIndex: 10,
    alignSelf: 'flex-end',
  },
  pageIndicatorText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 1,
  },
  pdfTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
    marginRight: 8,
    color: '#222',
  },
  zoomButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  zoomButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginHorizontal: 2,
  },
  zoomButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'PDF Uygulaması' }} />
        <Stack.Screen name="PDFViewer" component={PDFViewerScreen} options={{ title: 'PDF Görüntüle' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
