import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TrainingScreen from '../screens/Training';
import AnalysisScreen from '../screens/Analysis';
import AchievementScreen from '../screens/Achievement';
import ProfileScreen from '../screens/Profile';

const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="训练" component={TrainingScreen} />
      <Tab.Screen name="分析" component={AnalysisScreen} />
      <Tab.Screen name="成就" component={AchievementScreen} />
      <Tab.Screen name="我的" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default TabNavigator;