import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function AnalysisScreen() {
  return (
    <View style={styles.container}>
      <Text>分析</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AnalysisScreen;