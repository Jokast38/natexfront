import React from 'react';
import { View, Text } from 'react-native';
import { typography } from "../../src/theme/typography";
import { colors } from "../../src/theme/color";
import { SafeAreaView } from 'react-native-safe-area-context';


export default function Profile() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{fontFamily: typography.fontFamily.bold, color: colors.primary}}>Profile (placeholder)</Text>
        <Text style={{fontFamily: typography.fontFamily.medium}}>Profile (placeholder)</Text>
      </View>
    </SafeAreaView>
  );
}
