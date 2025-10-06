import React from 'react';
import { View, Text } from 'react-native';

export default function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={{ padding: 8 }}>
      <Text style={{ fontWeight: 'bold' }}>{value}</Text>
      <Text>{label}</Text>
    </View>
  );
}
