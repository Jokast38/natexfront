import React from 'react';
import { View, Text } from 'react-native';
import { typography } from "../../src/theme/typography";
import { colors } from "../../src/theme/color";


export default function Profile() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{fontFamily: typography.fontFamily.bold, color: colors.primary}}>Profile (placeholder)</Text>
      <Text style={{fontFamily: typography.fontFamily.medium}}>Profile (placeholder)</Text>
    </View>
  );
}
