<template>
  <view :class="['menu-item', { 'menu-item--active': active }]">
    <view class="menu-item-icon-box">
      <img class="menu-item-icon" :style="iconStyle" :src="menuIcon" />
    </view>
    <view class="menu-item-name">
      {{ name }}
    </view>
  </view>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

interface Props {
  id: number;
  active: boolean;
  menuIcon: string;
  name: string;
  iconStyle?: string;
}

defineProps<Props>();
</script>

<style lang="scss">
.menu-item {
  color: $yellow-2;
  &--active {
    color: $white;
  }

  &-icon-box {
    border: 3rpx solid $yellow-2;
    border-radius: $border-radius-xl;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 72rpx;
    padding: $padding-sm 0;
  }
  &--active &-icon-box {
    border-color: $white;
    color: $white;
    background: $yellow-3;
  }

  &-icon {
    width: 72rpx;
    height: 72rpx;
    margin: auto;
    opacity: 0.7;
  }
  &--active &-icon {
    opacity: 1;
  }

  &-name {
    text-align: center;
    font-weight: $font-weight-bold;
    font-size: $font-size-lg;
    line-height: $line-height-lg;
    margin-top: $padding-sm;
  }
}
</style>
