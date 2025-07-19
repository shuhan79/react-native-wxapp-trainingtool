<template>
  <scroll-page>
    <template #navbar>
      <van-nav-bar
        :left-arrow="true"
        @clickleft="navigateBack"
      >
        <slot-view name="title">
          <view class="scoring-analytics--view-switches-container">
            <view class="scoring-analytics--view-switches">
              <view class="scoring-analytics--view-switch" @click="navigateToScoreSheet">记分</view>
              <view class="scoring-analytics--view-switch" @click="navigateToTargetView">落点</view>
              <view class="scoring-analytics--view-switch focus">分析</view>
            </view>
          </view>
        </slot-view>
      </van-nav-bar>
    </template>

    <view class="scoring-analytics--chart-container no-background">
      <ScoringToolkitSession :session-id="sessionId">
        <ScoringAnalyticsBlock :session-id="sessionId" />
      </ScoringToolkitSession>
    </view>

    <view class="scoring-analytics--chart-multiple-container">
      <view class="scoring-analytics--chart-container">
        <view class="scoring-analytics--chart-title">水平分布</view>
        <scoring-toolkit-session :session-id="sessionId">
          <ScoringPhaseTargetAxisDistributionAnalysis
            :session-id="sessionId"
            aggregation-axis="Y"
          />
        </scoring-toolkit-session>
      </view>
      <view class="scoring-analytics--chart-container" style="flex: 1;">
        <view class="scoring-analytics--chart-title">垂直分布</view>
        <scoring-toolkit-session :session-id="sessionId">
          <ScoringPhaseTargetAxisDistributionAnalysis
            :session-id="sessionId"
            aggregation-axis="X"
          />
        </scoring-toolkit-session>
      </view>
    </view>

    <view class="scoring-analytics--chart-container">
      <view class="scoring-analytics--chart-title">环数分布</view>
      <e-charts :option="countByRingBarOption" custom-class="scoring-analytics--chart" />
    </view>

    <view class="scoring-analytics--chart-container">
      <view class="scoring-analytics--chart-title">聚类分析</view>
      <scoring-toolkit-session :session-id="sessionId">
        <scoring-phase-target-clustering-analysis :session-id="sessionId" />
      </scoring-toolkit-session>
    </view>

    <view class="scoring-analytics--chart-container">
      <view class="scoring-analytics--chart-title">象限分析</view>
      <scoring-toolkit-session :session-id="sessionId">
        <scoring-phase-target-octant-analysis :session-id="sessionId" />
      </scoring-toolkit-session>
    </view>
  </scroll-page>
</template>

<script setup lang="ts">
import Taro, { useRouter } from "@tarojs/taro";
import _flatten from "lodash/flatten";
import _isFinite from "lodash/isFinite";
import { computed, ref } from "vue";
import { useStore } from "vuex";

import ScoringAnalyticsBlock from "./components/ScoringAnalyticsBlock.vue";

import ECharts from "@/components/ECharts.vue";
import ScoringPhaseTargetAxisDistributionAnalysis
  from "@/components/scoring/ScoringPhaseTargetAxisDistributionAnalysis.vue";
import ScoringPhaseTargetClusteringAnalysis from "@/components/scoring/ScoringPhaseTargetClusteringAnalysis.vue";
import ScoringPhaseTargetOctantAnalysis from "@/components/scoring/ScoringPhaseTargetOctantAnalysis.vue";
import ScoringToolkitSession from "@/components/scoring/ScoringToolkitSession.vue";
import { useRequireToolkitSession } from "@/hooks/useRequireToolkitSession";
import useToolkitScoringSessionConfig from "@/hooks/useToolkitScoringSessionConfig";
import * as pages from "@/pages.config";
import { generateCountByRingBarChart } from "@/utils/analyticsOptionSerializers";
import ScrollPage from "@ac/components/ScrollPage.vue";

definePageConfig({
  navigationBarTitleText: "Score Sheet",
  disableScroll: true,
  navigationStyle: "custom",
  usingComponents: {
    "ec-canvas": "../../components/ec-canvas/ec-canvas",
  },
});

const router = useRouter();

const store = useStore();

store.dispatch("toolkitScoring/setConfig", { mode: "analytics" });

const sessionId = router.params?.sessionId;

const config = useToolkitScoringSessionConfig(sessionId);

const session = computed(() => store.getters[ "toolkitScoring/session" ]({ sessionId }));

const userScores = computed(() => {
  const user = store.getters[ "match/user" ](config);
  const scores: string[] = (_flatten(user?.phases
      ?.map((phase) => phase?.modifiedScores ?? phase?.finalScores ?? phase?.scores)) as string[])
      ?.filter((score) => score != null && score !== "");
  return scores;
});

const countByRingBarOption = computed(() => generateCountByRingBarChart(
  userScores.value,
  session.value.metadata?.targetFace,
));

const getPhaseIdFromRouteParams = (): number|null => {
  const phaseId = parseInt(router.params?.focusedPhaseId ?? "", 10);
  return _isFinite(phaseId) ? phaseId : null;
};

const initialFocusedPhaseId = getPhaseIdFromRouteParams();

const focusedEndConfig = ref<{ roundId; phaseId; endId? } | null>({
  roundId: 0,
  phaseId: initialFocusedPhaseId,
  endId: null,
});

// Navigation

const navigateBack = (): void => { Taro.navigateBack(); };

const navigateToScoreSheet = (): void => {
  Taro.redirectTo({
    // eslint-disable-next-line max-len
    url: `/${pages.TOOLKIT_PAGE_SCORING_SCORE_SHEET}?sessionId=${sessionId}&focusedPhaseId=${focusedEndConfig.value?.phaseId}`,
  });
};

const navigateToTargetView = (): void => {
  Taro.redirectTo({
    // eslint-disable-next-line max-len
    url: `/${pages.TOOLKIT_PAGE_SCORING_TARGET_VIEW}?sessionId=${sessionId}&focusedPhaseId=${focusedEndConfig.value?.phaseId}`,
  });
};

useRequireToolkitSession({ sessionId });
</script>

<style lang="scss">
page {
  @extend .scroll-page--page;

  background: $background-color;

  width: 100%;
  height: 100%;
}

.scoring-analytics {
  &--view-switches-container {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    align-self: stretch;

    height: 46px;
  }
  &--view-switches {
    display: flex;
    background: #EEEFF0;
    border-radius: $border-radius-md;
    padding: 2px;

    font-size: $font-size-sm;
    line-height: $line-height-sm;
    .scoring-analytics--view-switch {
      width: 50px;
      border-radius: $border-radius-md;
      padding: 10rpx;
      text-align: center;
      color: $gray-4;

      &.focus {
        background: $white;
        color: $black;
      }
    }
  }

  &--chart-container {
    margin: $padding-sm;
    background-color: white;
    border-radius: $border-radius-md;
    &.no-background {
      background: none;
    }
  }

  &--chart-multiple-container {
    display: flex;
    flex-direction: row;
    margin: $padding-sm;
  }
  &--chart-multiple-container &--chart-container {
    flex: 1;
    margin: 0;
    &:not(:last-child) {
      margin-right: $padding-sm;
    }
  }

  &--chart-title {
    padding: $padding-xs 0 0 $padding-xs;

    font-size: $font-size-md;
    line-height: $line-height-md;
    color: $gray-7;
    font-weight: $font-weight-bold;
  }
  &--chart {
    height: 500rpx;
  }
}

</style>
