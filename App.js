import React, { useState } from "react";
import { ScrollView, useWindowDimensions, Button, View, Text } from "react-native";
import Pdf from "react-native-pdf";
import * as DocumentPicker from "expo-document-picker";

export default function App() {
  const { width, height } = useWindowDimensions();
  const [pdfUri, setPdfUri] = useState(null);
  const [error, setError] = useState(null);

  const pickPdf = async () => {
    setError(null);
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: false,
      });
      console.log('DocumentPicker result:', res);
      if (res.assets && res.assets.length > 0) {
        setPdfUri(res.assets[0].uri);
        console.log('Seçilen PDF URI:', res.assets[0].uri);
      } else {
        console.log('Kullanıcı iptal etti veya dosya seçilmedi.');
      }
    } catch (err) {
      setError("PDF seçilirken hata oluştu");
      console.log('DocumentPicker hata:', err);
    }
  };

  return (
    <ScrollView style={{ flex: 1 }} contentInsetAdjustmentBehavior="automatic">
      <View style={{ margin: 16 }}>
        <Button title="PDF Seç" onPress={pickPdf} />
        {pdfUri && (
          <Text style={{ marginTop: 12, color: 'blue', fontWeight: 'bold' }} selectable numberOfLines={2}>
            Seçilen PDF URI: {pdfUri}
          </Text>
        )}
        {error && <Text style={{ color: 'red', marginTop: 8, fontWeight: 'bold' }}>{error}</Text>}
      </View>
      {pdfUri ? (
        <Pdf
          source={{ uri: pdfUri }}
          onLoadComplete={(numberOfPages, filePath) => {
            console.log(`Number of pages: ${numberOfPages}`);
          }}
          onPageChanged={(page, numberOfPages) => {
            console.log(`Current page: ${page}`);
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
      ) : null}
    </ScrollView>
  );
}
