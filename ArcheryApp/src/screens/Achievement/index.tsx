import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function AchievementScreen() {
  return (
    <View style={styles.container}>
      <Text>成就</Text>
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

export default AchievementScreen;