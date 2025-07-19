<template>
  <view class="training">
    <Menu />
    <view class="training-title">
      正在进行
    </view>
    <van-cell-group custom-class="training-list">
      <van-swipe-cell
        v-for="(session, index) in pendingSessions"
        :key="session.id"
        :right-width="65"
        :async-close="true"
        @close="
          onClose(
            $event,
            session.id,
          )
        "
      >
        <van-cell
          custom-class="training-item"
          :center="true"
          :title="dayjs(session.createTime).format('YYYY-MM-DD HH:mm:ss')"
          :is-link="true"
          :border="index < pendingSessions.length - 1"
          @click="navigateToSession(session.id)"
        />
        <slot-view :name="`right`">删除</slot-view>
      </van-swipe-cell>
      <van-empty
        v-if="_isEmpty(pendingSessions)"
        image=""
        class="training-empty"
        description="无记录"
      ></van-empty>
    </van-cell-group>
    <WhenSubscriptionExpired>
      <view class="training-ad-container">
        <ad unit-id="adunit-e03b89c246b53cb9"></ad>
      </view>
    </WhenSubscriptionExpired>
    <van-image
      custom-class="training-more"
      fit="widthFix"
      width="100%"
      height="auto"
      :src="transcodeOssUrl('article%26video/%E8%AE%AD%E7%BB%83%E5%B7%A5%E5%85%B7%E5%AE%A3%E4%BC%A0%E5%9B%BE.jpg')"
    />
    <SubscriptionUpsellDialog ref="subscriptionUpsellDialog" />
  </view>
</template>

<script setup lang="ts">
import Taro from "@tarojs/taro";
import dayjs from "dayjs";
import _isEmpty from "lodash/isEmpty";
import { computed, ref } from "vue";
import { useStore } from "vuex";

import Menu from "./components/menu-training.vue";

import SubscriptionUpsellDialog from "@/components/SubscriptionUpsellDialog.vue";
import WhenSubscriptionExpired from "@/components/WhenSubscriptionExpired.vue";
import * as pages from "@/pages.config";
import { transcodeOssUrl } from "@ac/services/oss";

const subscriptionUpsellDialog = ref();

const store = useStore();

const navigateToSession = async (sessionId: string): Promise<void> => {
  // if (!subscriptionUpsellDialog.value.requireSubscription()) { return; }
  const mode = store.getters[ "toolkitScoring/config" ]?.mode;
  if (mode === "target-view") {
    await Taro.navigateTo({ url: `/${pages.TOOLKIT_PAGE_SCORING_TARGET_VIEW}?sessionId=${sessionId}` });
  } else if (mode === "analytics") {
    await Taro.navigateTo({ url: `/${pages.TOOLKIT_PAGE_SCORING_ANALYTICS}?sessionId=${sessionId}` });
  } else {
    await Taro.navigateTo({ url: `/${pages.TOOLKIT_PAGE_SCORING_SCORE_SHEET}?sessionId=${sessionId}` });
  }
};

const pendingSessions = computed(() => store.getters[ "toolkitScoring/pendingSessions" ]);

const onClose = async ({ detail }, sessionId: string): Promise<void> => {
  store.dispatch("toolkitScoring/deleteSession", { sessionId });
  detail.instance.close();
};

</script>

<style lang="scss">
page {
  @extend .scroll-page--page;
  background: $background-color;
}

.training {
  padding: $padding-sm;
  &-title {
    margin: $padding-md 0 $padding-sm 0;
    font-size: $font-size-md;
    line-height: $line-height-md;
    font-weight: $font-weight-bold;
    padding: 0 $padding-sm;
    position: relative;
    &::before {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 6rpx;
      border-radius: 999em;
      background-color: $yellow;
      content: "";
    }
  }
  &-list {
    margin: 0 0 $padding-md 0;
    overflow: hidden;
  }
  &-item {
    border-radius: $border-radius-xl;
    margin-bottom: $padding-xs;
  }
  &-more {
    border-radius: $border-radius-xl;
    overflow: hidden;
  }
  &-empty {
    display: block;
    background-color: $white;
    border-radius: $border-radius-xl;
  }
}

.van-swipe-cell__right {
  display: inline-block;
  width: 65px;
  height: 100%;
  color: #fff;
  background-color: #ee0a24;
  border-radius: $border-radius-xl;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-md;
}

.training-ad-container {
  width: 100%;
  margin-bottom: $padding-md;
}
</style>
