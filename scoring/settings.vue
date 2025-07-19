<template>
  <scroll-page title="训练设置">
    <view class="main-container">
      <van-cell-group title="落点分布" :inset="true">
        <van-cell
          title="使用弧度绘图"
          :clickable="false"
          :border="false"
        >
          <slot-view>
            <van-switch
              size="24px"
              style="display: block; height: 26px;"
              :checked="useRadianInEllipseDrawing"
              @change="onUseRadianInEllipseDrawing"
            />
          </slot-view>
        </van-cell>
      </van-cell-group>
      <view class="van-cell-group--description">落点分布默认使用角度绘制，微信在部分机型上使用弧度单位控制椭圆。开启后可能修复落点分布兼容性问题。</view>
    </view>
  </scroll-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";

import ScrollPage from "@ac/components/ScrollPage.vue";

definePageConfig({
  navigationBarTitleText: "训练设置",
  disableScroll: true,
  navigationStyle: "custom",
});

const store = useStore();

const useRadianInEllipseDrawing = computed(
  () => store.getters[ "config/useRadianInEllipseDrawing" ],
);

const onUseRadianInEllipseDrawing = ({ detail }): void => {
  store.commit("config/setUseRadianInEllipseDrawing", detail);
};
</script>

<style lang="scss">
page {
  @extend .scroll-page--page;

  background: $background-color;
}

.main-container {
  padding: 0 $padding-sm;
}

.van-cell-group--description {
  padding: 0 $padding-xs $padding-sm $padding-xs;
  font-size: $font-size-sm;
  line-height: $line-height-sm;
  color: $gray-4;
}
</style>
