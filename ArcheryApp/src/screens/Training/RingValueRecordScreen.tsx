import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, FlatList, SafeAreaView } from 'react-native';

const RingValueRecordScreen = () => {
  const [scores, setScores] = useState<string[]>(Array(6).fill(''));
  const [total, setTotal] = useState(0);

  const handleScoreChange = (text: string, index: number) => {
    const newScores = [...scores];
    newScores[index] = text;
    setScores(newScores);
    calculateTotal(newScores);
  };

  const calculateTotal = (currentScores: string[]) => {
    const sum = currentScores.reduce((acc, score) => {
      const value = parseInt(score, 10);
      return isNaN(value) ? acc : acc + value;
    }, 0);
    setTotal(sum);
  };

  const renderScoreInput = ({ item, index }: { item: string, index: number }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>第 {index + 1} 箭:</Text>
      <TextInput
        style={styles.input}
        onChangeText={(text) => handleScoreChange(text, index)}
        value={item}
        keyboardType="numeric"
        maxLength={2}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>环值记录</Text>
      <FlatList
        data={scores}
        renderItem={renderScoreInput}
        keyExtractor={(_, index) => index.toString()}
        numColumns={3}
      />
      <Text style={styles.total}>总分: {total}</Text>
      <Button title="完成提交" onPress={() => alert('分数已提交!')} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    width: '33%',
  },
  label: {
    fontSize: 16,
    marginRight: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    width: 50,
    textAlign: 'center',
  },
  total: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default RingValueRecordScreen;