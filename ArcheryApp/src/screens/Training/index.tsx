import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

function TrainingScreen({ navigation }) { // 确保 navigation prop 被接收
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('RingValueRecord')} // 更新 onPress
      >
        <Text style={styles.buttonText}>环值记录</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ShotLocationRecord')} // 更新 onPress
      >
        <Text style={styles.buttonText}>落点记录</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default TrainingScreen;