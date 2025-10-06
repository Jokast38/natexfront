import React from 'react';
import { View, Text, Image } from 'react-native';

export default function PhotoCard({ uri, notes }: { uri?: string; notes?: string }) {
  return (
    <View style={{ padding: 8 }}>
      {uri ? <Image source={{ uri }} style={{ width: 120, height: 80 }} /> : null}
      <Text>{notes}</Text>
    </View>
  );
}
