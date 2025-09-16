import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, useWindowDimensions, StyleSheet } from "react-native";
import { ApplicationProvider, Button as KittenButton } from '@ui-kitten/components';
import * as eva from '@eva-design/eva';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from "expo-document-picker";
import Pdf from "react-native-pdf";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

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
      {error && <Text style={{ color: 'red', marginTop: 8 }}>{error}</Text>}
      <Text style={{ marginTop: 24, fontWeight: 'bold', fontSize: 18, color: '#222' }}>Son Görüntülenen PDF'ler</Text>
      <FlatList
        data={recentPdfs}
        keyExtractor={item => item.uri}
        contentContainerStyle={{ paddingVertical: 12, paddingBottom: 120 }}
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

      {/* Floating Action Button bottom-right using UI Kitten */}
  <KittenButton style={styles.fab} onPress={pickPdf} accessoryLeft={()=>(<MaterialCommunityIcons name="plus" size={20} color="#fff"/>)} status="primary"/>
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

  // Navigasyon başlığını PDF ismi yap
  useEffect(() => {
    navigation.setOptions({ title: name });
  }, [name]);

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
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
          onPageChanged={(pageNum, numberOfPages) => {
            setPage(pageNum);
            setTotalPages(numberOfPages);
            console.log('onPageChanged - pageNum:', pageNum, 'totalPages:', numberOfPages);
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
        {/* Sağ üst köşede zoom butonları */}
        <View style={styles.zoomButtonsTopRight} pointerEvents="box-none">
          <TouchableOpacity style={[styles.zoomButton, { borderTopLeftRadius: 16, borderBottomLeftRadius: 16, borderTopRightRadius: 0, borderBottomRightRadius: 0, marginRight: 4 }]} onPress={() => setScale(s => Math.max(0.5, s - 0.2))}>
            <Text style={styles.zoomButtonText}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.zoomButton, { borderTopRightRadius: 16, borderBottomRightRadius: 16, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, marginLeft: 4 }]} onPress={() => setScale(s => Math.min(3, s + 0.2))}>
            <Text style={styles.zoomButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        {/* Sağ alt köşede transparan sayfa göstergesi */}
        <View style={styles.pageIndicator} pointerEvents="none">
          <Text style={styles.pageIndicatorText}>{page} / {totalPages}</Text>
        </View>

      </View>
      {error && <Text style={{ color: 'red', margin: 8 }}>{error}</Text>}
    </View>
  );
}
const styles = StyleSheet.create({
  // pdfHeader kaldırıldı
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
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  zoomButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
    zoomButtonsTopRight: {
    position: 'absolute',
    top: 24,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 20,
  backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 2,
  gap: 1
  },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 54,
    width: 48,
    height: 48,
    borderRadius: 28,
    backgroundColor: '#1565c0',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    lineHeight: 24,
    fontWeight: '600',
  },
});

export default function App() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const t = await AsyncStorage.getItem('uiTheme');
        if (t) setTheme(t);
      } catch (e) { /* ignore */ }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try { await AsyncStorage.setItem('uiTheme', next); } catch (e) { /* ignore */ }
  };

  const MainStack = ({ navigation }) => (
    <Stack.Navigator
      screenOptions={({ navigation: nav }) => ({
        headerStyle: {
          minHeight: 36,
          height: 44,
          backgroundColor: '#f7f7f7',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
        headerBackTitleVisible: false,
        headerLeft: () => (
          <MaterialCommunityIcons
            name="menu"
            size={24}
            style={{ marginLeft: 12 }}
            onPress={() => navigation.toggleDrawer()}
          />
        ),
        headerRight: () => (
          <KittenButton appearance="ghost" status="basic" onPress={toggleTheme} style={{ marginRight: 8 }}>
            <MaterialCommunityIcons name="theme-light-dark" size={18} />
          </KittenButton>
        ),
      })}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'PDF Uygulaması' }} />
      <Stack.Screen name="PDFViewer" component={PDFViewerScreen} options={{ title: 'PDF Görüntüle' }} />
    </Stack.Navigator>
  );

  return (
    <>
      <ApplicationProvider {...eva} theme={theme === 'light' ? eva.light : eva.dark}>
        <NavigationContainer>
          <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
            <Drawer.Navigator screenOptions={{ headerShown: false }}>
              <Drawer.Screen name="Main">
                {props => (
                  <MainStack {...props} />
                )}
              </Drawer.Screen>
            </Drawer.Navigator>
          </SafeAreaView>
        </NavigationContainer>
      </ApplicationProvider>
    </>
  );
}
