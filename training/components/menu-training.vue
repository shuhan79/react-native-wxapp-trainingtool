<template>
  <view class="menu-training">
    <view
      class="menu-training-item menu-training-item-target-view"
      @tap="checkAndStartNewSession('target-view')"
    >
      <view class="menu-training-item-title">落点模式</view>
      <view class="menu-training-item-subtitle">记录落点，获取靶面分析</view>
      <van-button
        custom-class="menu-training-item-start-button training"
        type="default"
        size="small"
        :round="true"
        color="#fff"
      >
        开始训练
      </van-button>
    </view>
    <view
      class="menu-training-item menu-training-item-score-sheet"
      @tap="checkAndStartNewSession('score-sheet')"
    >
      <view class="menu-training-item-title">环值模式</view>
      <view class="menu-training-item-subtitle">日常记分，基础训练</view>
      <van-button
        custom-class="menu-training-item-start-button"
        type="default"
        size="small"
        :round="true"
        color="#fff"
      >
        记分
      </van-button>
    </view>
  </view>
  <view>
    <van-button
      custom-class="menu-training-timer-button"
      type="default"
      :round="false"
      size="large"
      icon="underway-o"
      @click="navigateToTimer"
    >
      计时器
    </van-button>
  </view>
  <JoinGroupChat class="mt-20" />
  <SubscriptionUpsellDialogAd
    ref="subscriptionUpsellDialog"
    @finish-ad="startNewSession(cachedMode)"
  />
</template>

<script setup lang="ts">
import Taro from "@tarojs/taro";
import { ref } from "vue";
import { useStore } from "vuex";

import SubscriptionUpsellDialogAd from "@/components/SubscriptionUpsellDialogAd.vue";
import * as pages from "@/pages.config";
import { logClick } from "@ac/components/hooks/useTelemetry";
import JoinGroupChat from "@ac/components/JoinGroupChat.vue";

const subscriptionUpsellDialog = ref();

const store = useStore();

type Mode = "target-view" | "analytics" | "score-sheet"

const navigateToSession = async (sessionId: string, mode: Mode): Promise<void> => {
  // const mode = store.getters[ "toolkitScoring/config" ]?.mode;
  if (mode === "target-view") {
    await Taro.navigateTo({ url: `/${pages.TOOLKIT_PAGE_SCORING_TARGET_VIEW}?sessionId=${sessionId}` });
  } else if (mode === "analytics") {
    await Taro.navigateTo({ url: `/${pages.TOOLKIT_PAGE_SCORING_ANALYTICS}?sessionId=${sessionId}` });
  } else {
    await Taro.navigateTo({ url: `/${pages.TOOLKIT_PAGE_SCORING_SCORE_SHEET}?sessionId=${sessionId}` });
  }
};

const cachedMode = ref<Mode>("target-view");

const startNewSession = async (mode): Promise<void> => {
  const sessionId = await store.dispatch("toolkitScoring/startNewSession");
  navigateToSession(sessionId, mode);
};

const checkAndStartNewSession = async (mode): Promise<void> => {
  logClick(store, "start_training");
  cachedMode.value = mode;
  if (!subscriptionUpsellDialog.value.requireSubscription()) { return; }
  startNewSession(mode);
};

const navigateToTimer = (): void => {
  Taro.navigateTo({ url: `/${pages.TOOLKIT_PAGE_TIMER_INDEX}` });
};
</script>

<style lang="scss">
.menu-training {
  display: flex;
  justify-content: stretch;
  &-timer-button {
    border-radius: $border-radius-xl !important;
    margin-top: $padding-sm;
  }
  &-item {
    flex-grow: 1;
    &:not(:last-child) {
      margin-right: $padding-sm;
    }
    padding: $padding-md;
    border-radius: $border-radius-xl;
    background-size: cover;
    background-color: $white;
    &-title {
      font-weight: $font-weight-bold;
      font-size: $font-size-xl;
      line-height: $line-height-xl;
    }
    &-subtitle {
      font-size: $font-size-sm;
      line-height: $line-height-sm;
      color: $gray-5;
      margin-bottom: $padding-sm;
    }
    &-start-button {
      background-color: $yellow-5 !important;
      color: $white !important;
    }

    .training {
      background-color: $yellow-4 !important;
    }

    &-target-view {
      background-image: url('https://archery-club-prod.oss-cn-zhangjiakou.aliyuncs.com/article%26video/luodian.svg');
    }
    &-score-sheet {
      background-image: url('https://archery-club-prod.oss-cn-zhangjiakou.aliyuncs.com/article%26video/huanzhi.svg');
    }
  }
}
.mt-20 {
  margin-top: 20rpx;
}
</style>
