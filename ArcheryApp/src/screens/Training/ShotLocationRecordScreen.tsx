import React, { useState, useRef } from 'react';
import { View, StyleSheet, useWindowDimensions, Text, Button } from 'react-native';
import {
  Canvas,
  Circle,
  Paint,
  Path,
  Skia,
  TouchInfo,
  useTouchHandler,
  Matrix,
  Group,
} from '@shopify/react-native-skia';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';

// 定义靶面颜色
const COLORS = {
  BACKGROUND: '#FFFFFF',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  BLUE: '#00BFFF',
  RED: '#FF4136',
  YELLOW: '#FFDC00',
};

// 定义环值和对应的颜色与半径
// 半径是相对于靶面总大小的比例
const RINGS = [
  { score: 10, color: COLORS.YELLOW, radius: 0.1 },
  { score: 9, color: COLORS.YELLOW, radius: 0.2 },
  { score: 8, color: COLORS.RED, radius: 0.3 },
  { score: 7, color: COLORS.RED, radius: 0.4 },
  { score: 6, color: COLORS.BLUE, radius: 0.5 },
  { score: 5, color: COLORS.BLUE, radius: 0.6 },
  { score: 4, color: COLORS.BLACK, radius: 0.7 },
  { score: 3, color: COLORS.BLACK, radius: 0.8 },
  { score: 2, color: COLORS.WHITE, radius: 0.9 },
  { score: 1, color: COLORS.WHITE, radius: 1.0 },
];

// 落点类型
interface Shot {
  x: number;
  y: number;
  score: number;
}

const ShotLocationRecordScreen = () => {
  const { width } = useWindowDimensions();
  const canvasSize = width * 0.9;
  const center = { x: canvasSize / 2, y: canvasSize / 2 };

  const [shots, setShots] = useState<Shot[]>([]);
  const [selectedShotIndex, setSelectedShotIndex] = useState<number | null>(null);

  const matrix = useSharedValue(Skia.Matrix());
  const savedMatrix = useSharedValue(Skia.Matrix());

  const getScore = (x: number, y: number): number => {
    const invertedMatrix = Skia.Matrix(matrix.current);
    invertedMatrix.invert();
    const point = invertedMatrix.mapPoint(x, y);

    const distance = Math.sqrt(Math.pow(point[0] - center.x, 2) + Math.pow(point[1] - center.y, 2));
    const radius = distance / (canvasSize / 2);

    for (const ring of RINGS) {
      if (radius <= ring.radius) {
        if (ring.score <= 5) {
          const innerRadius = ring.radius - 0.05; // 假设内环是区域的一半
          if (radius <= innerRadius) {
            return ring.score === 5 ? 6 : ring.score + 1; // 5环内是6环，其他+1
          }
        }
        return ring.score;
      }
    }
    return 0; // M
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (selectedShotIndex !== null) {
        // 精确移动落点
        const invertedMatrix = Skia.Matrix(matrix.current);
        invertedMatrix.invert();
        const point = invertedMatrix.mapPoint(e.absoluteX - (width - canvasSize)/2, e.absoluteY - 100); // 减去canvas的偏移
        const newShots = [...shots];
        newShots[selectedShotIndex].x = point[0];
        newShots[selectedShotIndex].y = point[1];
        newShots[selectedShotIndex].score = getScore(e.absoluteX - (width - canvasSize)/2, e.absoluteY - 100);
        setShots(newShots);
      } else {
        // 平移画布
        matrix.current.preTranslate(e.changeX, e.changeY);
      }
    })
    .onEnd(() => {
      savedMatrix.current.preConcat(matrix.current);
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      const { scale, focalX, focalY } = e;
      matrix.current.preScale(scale, scale, focalX, focalY);
    })
    .onEnd(() => {
      savedMatrix.current.preConcat(matrix.current);
    });

  const longPressGesture = Gesture.LongPress()
    .minDuration(800)
    .onStart((e) => {
      const invertedMatrix = Skia.Matrix(matrix.current);
      invertedMatrix.invert();
      const point = invertedMatrix.mapPoint(e.x, e.y);

      let closestShotIndex = -1;
      let minDistance = Infinity;

      shots.forEach((shot, index) => {
        const distance = Math.sqrt(Math.pow(shot.x - point[0], 2) + Math.pow(shot.y - point[1], 2));
        if (distance < minDistance && distance < 20) { // 20像素的触摸容差
          minDistance = distance;
          closestShotIndex = index;
        }
      });

      if (closestShotIndex !== -1) {
        setSelectedShotIndex(closestShotIndex);
      }
    });

  const tapGesture = Gesture.Tap()
    .onStart((e) => {
        if (selectedShotIndex !== null) {
            setSelectedShotIndex(null);
            return;
        }
        if (shots.length >= 6) return;

        const score = getScore(e.x, e.y);
        const invertedMatrix = Skia.Matrix(matrix.current);
        invertedMatrix.invert();
        const point = invertedMatrix.mapPoint(e.x, e.y);

        const newShot: Shot = { x: point[0], y: point[1], score };
        setShots([...shots, newShot]);
    });

  const composedGesture = Gesture.Race(longPressGesture, Gesture.Simultaneous(pinchGesture, panGesture), tapGesture);

  const resetCanvas = () => {
      setShots([]);
      matrix.current = Skia.Matrix();
      savedMatrix.current = Skia.Matrix();
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>落点记录</Text>
        <GestureDetector gesture={composedGesture}>
          <Canvas style={{ width: canvasSize, height: canvasSize, backgroundColor: 'lightgrey' }}>
            <Group matrix={matrix}>
              {/* ... 靶纸绘制逻辑不变 ... */}
              {RINGS.slice().reverse().map((ring, index) => (
                <Path
                  key={index}
                  path={Skia.Path.Make().addCircle(center.x, center.y, ring.radius * (canvasSize / 2))}
                  color={ring.color}
                  style="fill"
                />
              ))}
              {RINGS.map((ring, index) => (
                  <Circle
                      key={`line-${index}`}
                      cx={center.x}
                      cy={center.y}
                      r={ring.radius * (canvasSize / 2)}
                      color={COLORS.BLACK}
                      style="stroke"
                      strokeWidth={1}
                  />
              ))}
              <Path path={`M ${center.x} ${center.y - (RINGS[4].radius * (canvasSize/2))} L ${center.x} ${center.y + (RINGS[4].radius * (canvasSize/2))}`} color={COLORS.BLACK} style="stroke" strokeWidth={1} />
              <Path path={`M ${center.x - (RINGS[4].radius * (canvasSize/2))} ${center.y} L ${center.x + (RINGS[4].radius * (canvasSize/2))} ${center.y}`} color={COLORS.BLACK} style="stroke" strokeWidth={1} />

              {/* 绘制落点 */}
              {shots.map((shot, index) => (
                <Circle key={index} cx={shot.x} cy={shot.y} r={5} color={selectedShotIndex === index ? 'blue' : 'green'} />
              ))}
            </Group>
          </Canvas>
        </GestureDetector>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreTitle}>本组环值:</Text>
          <View style={styles.scores}>
              {shots.map((shot, index) => (
                  <Text key={index} style={styles.scoreText}>{shot.score === 0 ? 'M' : shot.score}</Text>
              ))}
          </View>
          <Text style={styles.scoreTotal}>总分: {shots.reduce((sum, shot) => sum + shot.score, 0)}</Text>
        </View>
        <View style={styles.buttonContainer}>
            <Button title="清除本组" onPress={resetCanvas} />
            <Button title="提交本组" onPress={() => { /* TODO: 保存数据 */ alert('数据已提交')}} />
        </View>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scoreContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  scoreTitle: {
      fontSize: 18,
      fontWeight: 'bold',
  },
  scores: {
      flexDirection: 'row',
      marginTop: 10,
  },
  scoreText: {
    fontSize: 18,
    marginHorizontal: 5,
  },
  scoreTotal: {
      marginTop: 10,
      fontSize: 20,
      fontWeight: 'bold',
  },
  buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '80%',
      marginTop: 20,
  }
});

export default ShotLocationRecordScreen;