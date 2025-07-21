import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TrainingScreen from '../screens/Training';
import RingValueRecordScreen from '../screens/Training/RingValueRecordScreen';
import ShotLocationRecordScreen from '../screens/Training/ShotLocationRecordScreen';

const Stack = createStackNavigator();

function TrainingStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="TrainingHome" component={TrainingScreen} options={{ title: '训练' }} />
      <Stack.Screen name="RingValueRecord" component={RingValueRecordScreen} options={{ title: '环值记录' }} />
      <Stack.Screen name="ShotLocationRecord" component={ShotLocationRecordScreen} options={{ title: '落点记录' }} />
    </Stack.Navigator>
  );
}

export default TrainingStackNavigator;