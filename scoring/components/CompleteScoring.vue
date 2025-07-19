<template>
  <van-popup
    :show="show"
    :overlay="true"
    position="bottom"
    :catch-move="true"
    :catch-tap="true"
    :round="true"
    overlay-style="z-index: 1 !important;"
    custom-style="z-index: 1 !important;"
    @close="emit('update:show', false)"
  >
    <view class="scoring-phase-popup">
      <view class="popup-title">提示</view>
      <view class="success-message">恭喜你已完成记分</view>
      <image
        class="success-icon"
        :src="transcodeOssUrl('assets/images/login_step_4.jpg')"
      />
      <view class="button-list">
        <van-button
          type="primary"
          :block="true"
          :round="true"
          color="#F6F6F6"
          custom-class="button-list--item"
          custom-style="color: #9B9B9B;"
          @click="navigateToPersistedScoreSheet"
        >
          查看成绩
        </van-button>
        <van-button
          type="primary"
          :block="true"
          :round="true"
          custom-class="button-list--item"
          open-type="share"
        >
          分享成绩
        </van-button>
      </view>
    </view>
  </van-popup>
</template>

<script setup lang="ts">
import Taro from "@tarojs/taro";
import { defineProps, withDefaults, defineEmits } from "vue";

import * as pages from "@/pages.config";
import { transcodeOssUrl } from "@ac/services/oss";

interface Props {
  show: boolean;
  persistedSessionId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
});

const emit = defineEmits([ "update:show" ]);

const navigateToPersistedScoreSheet = async (): Promise<void> => {
  await Taro.redirectTo({
    url: `/${pages.TOOLKIT_PAGE_SCORING_SCORE_SHEET}?sessionId=${props.persistedSessionId}`,
  });
};
</script>

<style lang="scss">
.scoring-phase-popup {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  text-align: center;
  padding: $padding-md;
  .popup-title {
    font-size: $font-size-lg;
    color: $gray-6;
    text-align: center;
    margin-bottom: $padding-md;
  }
  .success-message {
    font-size: $font-size-xl;
    color: $gray-6;
    font-weight: 500;
    margin: 0 auto $padding-md;
  }
  .success-icon {
    width: 460rpx;
    height: 330rpx;
    margin: 0 auto $padding-md;
  }
  .button-list {
    display: flex;
    justify-content: space-between;
    &--item {
      width: 330rpx;
    }
  }
}
</style>
