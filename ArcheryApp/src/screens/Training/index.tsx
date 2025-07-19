import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function TrainingScreen() {
  return (
    <View style={styles.container}>
      <Text>训练</Text>
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

export default TrainingScreen;