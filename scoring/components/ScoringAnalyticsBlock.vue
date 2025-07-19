<template>
  <view class="scoring-analytics-block">
    <view class="scoring-analytics-block--row">
      <view class="scoring-analytics-block--cell">
        <view class="scoring-analytics-block--title">总分</view>
        <view class="scoring-analytics-block--value">
          {{ scoreAnalytics.sum +
            (scoreAnalytics.endLimit != null && scoreAnalytics.endLimit > 0 ?
              `/${scoreAnalytics.endLimit * 10}` : "") }}
          <text class="unit">环</text>
        </view>
      </view>
      <view class="scoring-analytics-block--cell">
        <view class="scoring-analytics-block--title">总箭数</view>
        <view class="scoring-analytics-block--value">
          {{ scoreAnalytics.endCount +
            (scoreAnalytics.endLimit != null && scoreAnalytics.endLimit > 0 ? `/${scoreAnalytics.endLimit}` : "") }}
          <text class="unit">支</text>
        </view>
      </view>
      <view class="scoring-analytics-block--cell">
        <view class="scoring-analytics-block--title">
          稳定性
          <van-icon name="question-o" @tap="isStabilityTipsVisible= true" />
        </view>
        <view class="scoring-analytics-block--value">{{ scoreAnalytics.sdScore }}</view>
        <scoring-user-distribution-bar :session-id="sessionId" />
      </view>
    </view>
    <view class="scoring-analytics-block--row">
      <view class="scoring-analytics-block--cell">
        <view class="scoring-analytics-block--title">箭均环值</view>
        <view class="scoring-analytics-block--value">
          {{ scoreAnalytics.mean ?? "--" }}
          <text class="unit">环</text>
        </view>
      </view>
      <view class="scoring-analytics-block--cell">
        <view class="scoring-analytics-block--title">X+10</view>
        <view class="scoring-analytics-block--value">
          {{ scoreAnalytics.xPlusTen }}
        </view>
      </view>
      <view class="scoring-analytics-block--cell">
        <view class="scoring-analytics-block--title">黄心率</view>
        <view class="scoring-analytics-block--value">
          {{ scoreAnalytics.yellowZonePercentage ?? "--" }}
          <text class="unit">%</text>
        </view>
      </view>
    </view>
  </view>

  <Modal
    v-model:show="isStabilityTipsVisible"
    title="稳定性说明"
    confirm-button-text="回到记分"
    :show-cancel-button="false"
    @confirm="isStabilityTipsVisible = false"
  >
    <view>
      稳定性是用于衡量环值波动情况的数值
      <br />
      数字越小，越稳定；数字越大，越不稳定
    </view>
  </Modal>
</template>

<script setup lang="ts">
import Taro from "@tarojs/taro";
import {
  defineProps, withDefaults, defineEmits, computed, ref,
} from "vue";
import { useStore } from "vuex";

import ScoringUserDistributionBar from "@/components/scoring/ScoringUserDistributionBar.vue";
import useScoreAnalytics from "@/hooks/useScoreAnalytics";
import useToolkitScoringSessionConfig from "@/hooks/useToolkitScoringSessionConfig";
import * as pages from "@/pages.config";
import useScoringConfig from "@ac/components/hooks/useScoringConfigV2";
import Modal from "@ac/components/Modal.vue";

const props = defineProps<{
  sessionId: string;
}>();

const config = useToolkitScoringSessionConfig(props.sessionId);

const scoreAnalytics = useScoreAnalytics(config);

const isStabilityTipsVisible = ref(false);

</script>

<style lang="scss">
.scoring-analytics-block {
  &--row {
    display: flex;
    justify-content: stretch;

    &:not(:first-child) {
      margin-top: $padding-sm;
    }
  }
  &--cell {
    flex: 1;

    background: $white;
    border-radius: $border-radius-md;

    &:not(:first-child) {
      margin-left: $padding-sm;
    }

    padding: $padding-xs;

    display: flex;
    flex-direction: column;
    align-self: stretch;
    justify-content: space-between;
  }
  &--title {
    font-size: $font-size-md;
    line-height: $line-height-md;
    color: $gray-7;
    font-weight: $font-weight-bold;
  }
  &--value {
    white-space: nowrap;
    font-size: $font-size-xl;
    line-height: $line-height-xl;
    font-weight: $font-weight-bold;
    .unit {
      font-size: $font-size-sm;
      line-height: $line-height-sm;
      font-weight: normal;
    }
  }
}
</style>
