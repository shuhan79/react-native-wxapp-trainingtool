<template>
  <scroll-page
    bottom-class="scroll-page--bottom"
    :scroll-into-view="focusedEndConfig?.phaseId
    ? `toolkit-score-sheet-scoring-phase-${focusedEndConfig?.phaseId}`: null"
    @click-container="clearFocus"
  >
    <template #navbar>
      <van-nav-bar
        :left-arrow="true"
        @clickleft="navigateBack"
      >
        <slot-view name="title">
          <view class="score-sheet--view-switches-container">
            <view class="score-sheet--view-switches">
              <view class="score-sheet--view-switch focus">记分</view>
              <view class="score-sheet--view-switch" @click="navigateToTargetView">落点</view>
              <view class="score-sheet--view-switch" @click="navigateToAnalytics">分析</view>
            </view>
          </view>
        </slot-view>
      </van-nav-bar>
    </template>

    <template #top>
      <scoring-toolkit-session :session-id="sessionId">
        <view class="score-sheet--metadata-container">
          <view class="score-sheet--metadata-row">
            <view class="score-sheet--metadata-cell van-hairline--right">
              <view class="score-sheet--metadata-title">总分</view>
              <view class="score-sheet--metadata-value">
                {{ scoreAnalytics.sum + (scoreAnalytics.endLimit > 0 ? `/${scoreAnalytics.endLimit * 10}` : "") }}
                <text class="unit">环</text>
              </view>
            </view>
            <view class="score-sheet--metadata-cell van-hairline--right">
              <view class="score-sheet--metadata-title">总箭数</view>
              <view class="score-sheet--metadata-value">
                {{ scoreAnalytics.endCount + (scoreAnalytics.endLimit > 0 ? `/${scoreAnalytics.endLimit}` : "") }}
                <text class="unit">支</text>
              </view>
            </view>
            <view class="score-sheet--metadata-cell van-hairline--right">
              <view class="score-sheet--metadata-title">
                稳定性
                <van-icon name="question-o" @tap="handleStabilityTipsVisible" />
              </view>
              <view class="score-sheet--metadata-value">{{ scoreAnalytics.sdScore }}</view>
              <scoring-user-distribution-bar :session-id="sessionId" />
            </view>
            <view class="score-sheet--metadata-cell">
              <view class="score-sheet--setting" @tap="handleScoringSettings">
                <view class="score-sheet--setting--inner">
                  <view class="score-sheet--setting--title">
                    <text v-show="session?.metadata?.bowType" class="options--item">
                      {{ session?.metadata?.bowType }}
                    </text>
                    <view>
                      <text v-show="session?.metadata?.distance" class="options--item">
                        {{ session?.metadata?.distance }}
                      </text>
                      <text v-show="session?.metadata?.targetFace" class="options--item">
                        {{ session?.metadata?.targetFace }}
                      </text>
                    </view>
                    <text>{{ modeText }}</text>
                  </view>
                  <view v-show="isPendingSession && !hasSetMetadata" class="score-sheet--setting--button-horizontal">
                    <view>设置</view>
                    <image class="setting-icon" :src="settingIcon" />
                  </view>
                </view>
                <view v-show="isPendingSession && hasSetMetadata" class="score-sheet--setting--button-vertical">
                  <p>修</p>
                  <p>改</p>
                </view>
              </view>
            </view>
          </view>
        </view>
      </scoring-toolkit-session>
    </template>

    <scoring-toolkit-session :session-id="sessionId">
      <view class="score-sheet--phase-container">
        <scoring-phase
          v-for="(phase, phaseId) in phaseSummary"
          :id="`toolkit-score-sheet-scoring-phase-${phaseId}`"
          :key="`phase-${phaseId}`"
          :phase-id="phaseId"
          :custom-class="['score-sheet--phase-row',
                          { 'score-sheet--phase-row--active': phaseId === focusedEndConfig?.phaseId }
          ]"
        >
          <template v-if="phaseId === focusedEndConfig?.phaseId">
            <scoring-phase-sections>
              <view class="scoring-phase--section" style="flex: 1">
                <scoring-phase-sections custom-class="score-sheet--phase-row--header">
                  <view class="score-sheet--phase-row--phase-id scoring-phase--section">
                    第 <scoring-phase-index-plain /> 组
                  </view>
                  <view class="score-sheet--phase-row--header--right">
                    <view class="scoring-phase--section">
                      <scoring-phase-number-of-ends />
                      <text>
                        {{ session?.metadata?.numberOfEnds != null ? `/${session?.metadata?.numberOfEnds }箭` : "箭" }}
                      </text>
                    </view>
                    <view class="scoring-phase--section">
                      <scoring-phase-total-score />
                      <text>
                        {{
                          session?.metadata?.numberOfEnds != null ? `/${session?.metadata?.numberOfEnds * 10}环` : "环"
                        }}
                      </text>
                    </view>
                  </view>
                </scoring-phase-sections>
                <scoring-phase-sections>
                  <scoring-phase-inputs
                    :key="`inputs-${phaseId}`"
                    ref="scoringPhaseInputs"
                    input-custom-class="active-inputs"
                    row-style="padding-bottom: 8rpx"
                    :continue-when-reaching-end="true"
                    :number-of-ends-per-line="6"
                    :show-phase-sum="false"
                    disabled
                    :focused-end-id="focusedEndConfig?.phaseId === phaseId ? focusedEndConfig?.endId : undefined"
                  />
                </scoring-phase-sections>
              </view>
              <view
                class="scoring-phase--section score-sheet--phase-row--target-thumbnail"
                @tap="navigateToTargetView"
              >
                <scoring-phase-target-thumbnail :session-id="sessionId" />
              </view>
            </scoring-phase-sections>
          </template>
          <template v-else>
            <scoring-phase-sections @tap="focusPhase(phaseId, $event)">
              <view class="score-sheet--phase-row--phase-id scoring-phase--section scoring-phase--section--start">
                第 <scoring-phase-index-plain /> 组
              </view>
              <view
                class="score-sheet--phase-row--number-of-ends scoring-phase--section scoring-phase--section--start"
              >
                <scoring-phase-number-of-ends />
                <text class="unit">
                  {{ session?.metadata?.numberOfEnds != null ? `/${session?.metadata?.numberOfEnds}箭` : "箭" }}
                </text>
              </view>
              <view
                class="score-sheet--phase-row--number-of-ends scoring-phase--section scoring-phase--section--start"
              >
                <scoring-phase-total-score />
                <text class="unit">
                  {{ session?.metadata?.numberOfEnds != null ? `/${session?.metadata?.numberOfEnds * 10}环` : "环" }}
                </text>
              </view>
              <scoring-phase-inputs
                :key="`inputs-${phaseId}`"
                input-custom-class="score-sheet--phase-row--end"
                row-style="padding-bottom: 6rpx"
                :continue-when-reaching-end="true"
                :number-of-ends-per-line="6"
                :show-phase-sum="false"
                disabled
                :focused-end-id="focusedEndConfig?.phaseId === phaseId ? focusedEndConfig?.endId : undefined"
                ignore-trailing-spaces
              />
              <view class="score-sheet--phase-row--number-of-ends scoring-phase--section scoring-phase--section--start">
                <scoring-phase-shift-indicator />
              </view>
            </scoring-phase-sections>
          </template>
        </scoring-phase>
      </view>
    </scoring-toolkit-session>
    <template
      v-if="focusedEndConfig?.endId != null || (isPendingSession && focusedEndConfig?.endId == null)"
      #bottom
    >
      <scoring-toolkit-session
        v-if="focusedEndConfig?.endId != null"
        :session-id="sessionId"
      >
        <view class="scoring-phase--inputs-keyboard">
          <view class="scoring-phase--inputs-keyboard-header">
            <view class="scoring-phase--inputs-keyboard-header--button">
              <van-button
                type="default"
                :block="true"
                @click="finalizeSession"
              >
                结束记分
              </van-button>
            </view>
            <view class="scoring-phase--inputs-keyboard-header--button">
              <van-button
                type="default"
                :block="true"
                icon="underway-o"
                @click="navigateToTimer"
              >
                计时器
              </van-button>
            </view>
            <view class="scoring-phase--inputs-keyboard-header--button">
              <van-button
                type="primary"
                :block="true"
                :disabled="focusedEndConfig?.phaseId === session?.metadata?.numberOfPhases - 1"
                custom-style="border-radius: 12rpx"
                @click="focusOnNextPhase"
              >
                下一组
              </van-button>
            </view>
          </view>
          <scoring-keyboard
            custom-class="scoring-phase--inputs-keyboard-content"
            :layout="keyboardLayout"
            :key-style-overrides="keyStyleOverrides"
            @click="onKeyboardClick"
          />
        </view>
      </scoring-toolkit-session>
      <view
        v-if="isPendingSession && focusedEndConfig?.endId == null"
        class="scoring-phase--inputs-keyboard-header extra-padding"
      >
        <view class="scoring-phase--inputs-keyboard-header--button">
          <van-button
            type="default"
            :block="true"
            @click="finalizeSession"
          >
            结束记分
          </van-button>
        </view>
        <view class="scoring-phase--inputs-keyboard-header--button">
          <van-button
            type="default"
            :block="true"
            icon="underway-o"
            @click="navigateToTimer"
          >
            计时器
          </van-button>
        </view>
      </view>
    </template>
  </scroll-page>

  <scoring-metadata-setting
    v-model:is-visible="popupVisibility.isMetadataSettingVisible"
    :session-id="sessionId"
  />

  <Modal
    v-model:show="popupVisibility.isStabilityTipsVisible"
    title="稳定性说明"
    confirm-button-text="回到记分"
    :show-cancel-button="false"
    @confirm="popupVisibility.isStabilityTipsVisible = false"
  >
    <view>
      稳定性是用于衡量环值波动情况的数值
      <br />
      数字越小，越稳定；数字越大，越不稳定
    </view>
  </Modal>

  <!-- 未完成tips -->
  <Modal
    v-model:show="popupVisibility.isUnfinishedTipsVisible"
    title="还未填写训练信息，确认结束记分？"
    confirm-button-text="前往填写"
    cancel-button-text="直接结束"
    @confirm="showMetadataSettingsPopupAndHideTip"
    @cancel="submitSession"
  >
    <view>
      建议填写弓种、距离、靶纸等以便记录
    </view>
  </Modal>

  <!-- 结束记分tips -->
  <Modal
    v-model:show="popupVisibility.isEndScoringTipsVisible"
    title="确认结束记分？"
    confirm-button-text="提交成绩"
    cancel-button-text="返回记分"
    @confirm="submitSession"
    @cancel="popupVisibility.isEndScoringTipsVisible = false"
  >
    <view>
      提交后将无法修改本次记分
    </view>
  </Modal>

  <!-- 完成记分 -->
  <complete-scoring
    v-model:show="popupVisibility.isCompleteScoringPopupVisible"
    :persisted-session-id="persistedSessionId"
  />
</template>

<script setup lang="ts">
import Taro, { useReady, useRouter } from "@tarojs/taro";
import _isFinite from "lodash/isFinite";
import { computed, reactive, ref } from "vue";
import { useStore } from "vuex";

import CompleteScoring from "./components/CompleteScoring.vue";
import ScoringMetadataSetting from "./components/ScoringMetadataSetting.vue";

import settingIcon from "@/assets/images/setting.png";
import ScoringPhaseNumberOfEnds from "@/components/scoring/ScoringPhaseNumberOfEnds.vue";
import ScoringPhaseShiftIndicator from "@/components/scoring/ScoringPhaseShiftIndicator.vue";
import ScoringPhaseTargetThumbnail from "@/components/scoring/ScoringPhaseTargetThumbnail.vue";
import ScoringPhaseTotalScore from "@/components/scoring/ScoringPhaseTotalScore.vue";
import ScoringToolkitSession from "@/components/scoring/ScoringToolkitSession.vue";
import ScoringUserDistributionBar from "@/components/scoring/ScoringUserDistributionBar.vue";
import { useRequireToolkitSession } from "@/hooks/useRequireToolkitSession";
import useScoreAnalytics from "@/hooks/useScoreAnalytics";
import useToolkitScoringSessionConfig from "@/hooks/useToolkitScoringSessionConfig";
import * as pages from "@/pages.config";
import { MAXIMUM_ENDS, MAXIMUM_PHASES } from "@/store/modules/toolkitScoring";
import { provideEmitter } from "@ac/components/hooks/useEmitter";
import useScoringUserPhaseSummary from "@ac/components/hooks/useScoringUserPhaseSummary";
import Modal from "@ac/components/Modal.vue";
import ScoringKeyboard from "@ac/components/scoring/ScoringKeyboard.vue";
import ScoringPhase from "@ac/components/scoring/ScoringPhase.vue";
import ScoringPhaseIndexPlain from "@ac/components/scoring/ScoringPhaseIndexPlain.vue";
import ScoringPhaseInputs from "@ac/components/scoring/ScoringPhaseInputs.vue";
import ScoringPhaseSections from "@ac/components/scoring/ScoringPhaseSections.vue";
import ScrollPage from "@ac/components/ScrollPage.vue";

definePageConfig({
  navigationBarTitleText: "Score Sheet",
  disableScroll: true,
  navigationStyle: "custom",
});

const router = useRouter();

const store = useStore();

store.dispatch("toolkitScoring/setConfig", { mode: "score-sheet" });

const emitter = provideEmitter();

const sessionId = router.params?.sessionId;

const config = useToolkitScoringSessionConfig(sessionId);

const session = computed(() => store.getters[ "toolkitScoring/session" ]({ sessionId }));

const isPendingSession = computed(() => store.getters[ "toolkitScoring/isPendingSession" ]({ sessionId }));

const getPhaseIdFromRouteParams = (): number|null => {
  const phaseId = parseInt(router.params?.focusedPhaseId ?? "", 10);
  return _isFinite(phaseId) ? phaseId : null;
};

const phaseSummary = useScoringUserPhaseSummary(config);

const scoreAnalytics = useScoreAnalytics(config);

const getFirstEmptyEndId = (phaseId: number): number => {
  const localConfig = {
    matchId: `ts-${sessionId}`,
    groupId: "0",
    roundId: 0,
    userId: 0,
    phaseId,
  };
  const phase = store.getters[ "match/phase" ](localConfig);
  const index = phase?.scores?.findIndex((score) => score == null || score === "");
  if (index == null) return 0;
  if (index < 0) return (phase?.scores?.length ?? 1) - 1;
  return index;
};

const getFirstIncompletePhaseId = (): number => {
  const { numberOfEnds } = session.value?.metadata ?? {};
  const numberOfPhases = phaseSummary.value.length;
  const firstIncompletePhaseId = Array(numberOfPhases).findIndex((_, phaseId) => {
    const localConfig = {
      matchId: `ts-${sessionId}`,
      groupId: "0",
      roundId: 0,
      userId: 0,
      phaseId,
    };
    const phase = store.getters[ "match/phase" ](localConfig);
    // When [numberOfEnds] is not set, find the first phase that is all empty
    if (numberOfEnds == null) {
      return phase?.scores?.every((score) => score == null || score === "");
    }
    // Otherwise, find the first phase that has empty slot
    return phase?.scores?.some((score) => score == null || score === "");
  });
  // If all session if full, focus on last one.
  return firstIncompletePhaseId < 0 ? numberOfPhases - 1 : firstIncompletePhaseId;
};

const initialFocusedPhaseId = getPhaseIdFromRouteParams() ?? getFirstIncompletePhaseId();

const focusedEndConfig = ref<{ roundId; phaseId; endId? } | null>(
  !isPendingSession.value ? {
    roundId: 0,
    phaseId: null,
    endId: null,
  } : {
    roundId: 0,
    phaseId: initialFocusedPhaseId,
    endId: getFirstEmptyEndId(initialFocusedPhaseId),
  },
);

const hasSetMetadata = computed(
  () => session?.value?.metadata != null && [
    "bowType", "distance", "targetFace", "numberOfPhases", "numberOfEnds",
  ].some((key) => session.value.metadata?.[key] != null),
);

const modeText = computed(() => {
  const { numberOfPhases, numberOfEnds } = session.value?.metadata ?? {};
  if (numberOfPhases == null && numberOfEnds == null) return "当前为自由模式";
  let text = "";
  if (numberOfPhases != null) text += `${numberOfPhases}组`;
  if (numberOfEnds != null) text += `${numberOfEnds}箭`;
  return text;
});

const keyStyleOverrides = {
  DELETE: {
    border: "2rpx solid #363D8F !important",
    color: "#363D8F",
    background: "#fff",
    "font-size": "28rpx",
  },
};

const keyboardLayout = computed(() => {
  switch (session.value?.metadata?.targetFace) {
  case "侯靶":
    return "toolkit-hou-target-face";
  case "40半环靶":
  case "60半环靶":
  case "80半环靶":
    return "toolkit-six-rings-target-face";
  case "三联靶":
  case "品字靶":
    return "toolkit-triple-or-triangular-target-face";
  case "40全环靶":
  case "60全环靶":
  case "80全环靶":
  case "122全环靶":
  default:
    return "toolkit-ten-rings-target-face";
  }
});

let hasScoreUpdated = false;

const persistedSessionId = ref<string | null>(null);

// Navigation

const popupVisibility = reactive<{
  isMetadataSettingVisible: boolean;
  isStabilityTipsVisible: boolean;
  isEndScoringTipsVisible: boolean;
  isUnfinishedTipsVisible: boolean;
  isCompleteScoringPopupVisible: boolean;
}>({
  isMetadataSettingVisible: false,
  isStabilityTipsVisible: false,
  isEndScoringTipsVisible: false,
  isUnfinishedTipsVisible: false,
  isCompleteScoringPopupVisible: false,
});

const navigateBack = (): void => { Taro.navigateBack(); };

const navigateToTargetView = (): void => {
  Taro.redirectTo({
    // eslint-disable-next-line max-len
    url: `/${pages.TOOLKIT_PAGE_SCORING_TARGET_VIEW}?sessionId=${sessionId}&focusedPhaseId=${focusedEndConfig.value?.phaseId}`,
  });
};

const navigateToAnalytics = (): void => {
  Taro.redirectTo({
    // eslint-disable-next-line max-len
    url: `/${pages.TOOLKIT_PAGE_SCORING_ANALYTICS}?sessionId=${sessionId}&focusedPhaseId=${focusedEndConfig.value?.phaseId}`,
  });
};

const navigateToTimer = (): void => {
  Taro.navigateTo({ url: `/${pages.TOOLKIT_PAGE_TIMER_INDEX}` });
};

const handleScoringSettings = (): void => {
  if (!isPendingSession.value) return;
  focusedEndConfig.value = null;
  popupVisibility.isMetadataSettingVisible = true;
};

const handleStabilityTipsVisible = (): void => {
  focusedEndConfig.value = null;
  popupVisibility.isStabilityTipsVisible = true;
};

emitter.on("clickEndInput", ({
  event, roundId, phaseId, endId,
}) => {
  event.stopPropagation();
  if (isPendingSession.value) {
    // When user clicking on the same end, toggle the focus
    if (focusedEndConfig.value?.phaseId === phaseId && focusedEndConfig.value?.endId === endId) {
      focusedEndConfig.value = { roundId, phaseId, endId: undefined };
    } else {
      focusedEndConfig.value = { roundId, phaseId, endId };
    }
  } else {
    focusedEndConfig.value = { roundId, phaseId };
  }
  popupVisibility.isMetadataSettingVisible = false;
});

const clearFocus = (): void => { focusedEndConfig.value = null; };

const focusOnPreviousPhase = async (event): Promise<void> => {
  event.stopPropagation();
  Taro.vibrateShort();
  const currentPhaseId = focusedEndConfig.value?.phaseId;
  if (currentPhaseId <= 0) return;
  focusedEndConfig.value = {
    roundId: 0,
    phaseId: currentPhaseId - 1,
    endId: getFirstEmptyEndId(currentPhaseId - 1),
  };
};

const focusOnNextPhase = async (event): Promise<void> => {
  event?.stopPropagation();
  Taro.vibrateShort();
  const numberOfPhases = session?.value?.metadata?.numberOfPhases;
  const currentPhaseId = focusedEndConfig.value?.phaseId;
  if (currentPhaseId >= MAXIMUM_PHASES - 1) {
    Taro.showToast({ title: "到达记分上限", icon: "none" });
    return;
  }
  if (numberOfPhases != null && currentPhaseId === numberOfPhases - 1) {
    Taro.showToast({ title: "已经是最后一组", icon: "none" });
    return;
  }
  // When current phase score is empty, do not process to next phase.
  if (numberOfPhases == null) {
    const localConfig = {
      ...config,
      phaseId: currentPhaseId,
    };
    const currentPhase = store.getters[ "match/phase" ](localConfig);
    const hasScores = currentPhase.scores?.some((score) => score != null && score !== "") ?? false;
    if (!hasScores) {
      return;
    }
  }
  // Extend phase
  let maximalPhaseId = phaseSummary.value.length - 1;
  if (isPendingSession.value) {
    if (currentPhaseId === maximalPhaseId) {
      await store.dispatch("toolkitScoring/extendPhase", { sessionId });
      maximalPhaseId += 1;
    }
  }
  if (hasScoreUpdated) {
    await store.dispatch("toolkitScoring/clean", { sessionId, keepOneTrailingSpace: true });
    hasScoreUpdated = false;
  }
  if (currentPhaseId == null) {
    focusedEndConfig.value = {
      roundId: 0,
      phaseId: maximalPhaseId,
      endId: getFirstEmptyEndId(maximalPhaseId),
    };
  } else if (!isPendingSession.value) {
    focusedEndConfig.value = {
      roundId: 0,
      phaseId: Math.min(currentPhaseId + 1, maximalPhaseId),
      endId: undefined,
    };
  } else {
    focusedEndConfig.value = {
      roundId: 0,
      phaseId: currentPhaseId + 1,
      endId: getFirstEmptyEndId(currentPhaseId + 1),
    };
  }
};

const focusPhase = (phaseId: number, event: Event): void => {
  event.stopPropagation();
  if (!isPendingSession.value) {
    focusedEndConfig.value = { roundId: 0, phaseId, endId: undefined };
  } else {
    focusedEndConfig.value = { roundId: 0, phaseId, endId: getFirstEmptyEndId(phaseId) };
  }
};

const showMetadataSettingsPopupAndHideTip = async (): Promise<void> => {
  popupVisibility.isUnfinishedTipsVisible = false;
  popupVisibility.isMetadataSettingVisible = true;
};

const finalizeSession = async (): Promise<void> => {
  popupVisibility.isMetadataSettingVisible = false;
  focusedEndConfig.value = null;
  if (!hasSetMetadata.value) {
    popupVisibility.isUnfinishedTipsVisible = true;
  } else {
    popupVisibility.isEndScoringTipsVisible = true;
  }
};

const onKeyboardClick = async ({ key: { text } }): Promise<void> => {
  const focusedConfig = focusedEndConfig.value;
  if (focusedConfig == null || focusedConfig.endId == null) return;

  hasScoreUpdated = true;

  const localConfig = {
    matchId: `ts-${sessionId}`,
    groupId: "0",
    roundId: 0,
    userId: 0,
    phaseId: focusedConfig.phaseId,
  };

  const phase = store.getters[ "match/phase" ](localConfig);
  const localScores = phase?.scores;

  const oldScores = [ ...localScores ];

  const setScores = async (newScores: Array<string>): Promise<void> => {
    const positions = phase.positions;
    if (positions != null) {
      newScores.forEach((newScore, endId) => {
        if (newScore !== oldScores[ endId ]) {
          if (positions?.[endId] != null) positions[ endId ] = null;
        }
      });
    }
    await store.commit("match/scores", {
      ...localConfig,
      scores: newScores,
    });
    await store.commit("match/updatePositions", {
      ...localConfig,
      positions,
    });
  };

  if (text === "删除") {
    localScores[ focusedConfig.endId ] = "";
    await setScores(localScores);
    await store.dispatch("toolkitScoring/cleanPhase", {
      sessionId,
      phaseId: localConfig.phaseId,
      keepOneTrailingSpace: true,
    });
    if (focusedConfig.endId > 0) {
      const currentPhase = store.getters[ "match/phase" ](localConfig);
      focusedEndConfig.value = {
        ...focusedConfig,
        endId: Math.min(focusedConfig.endId - 1, currentPhase.scores.length - 1),
      };
    } else if (focusedConfig.phaseId > 0) {
      const previousPhase = store.getters[ "match/phase" ]({
        ...localConfig,
        phaseId: focusedConfig.phaseId - 1,
      });
      focusedEndConfig.value = {
        ...focusedConfig,
        phaseId: focusedConfig.phaseId - 1,
        endId: previousPhase?.scores?.length - 1 ?? 0,
      };
    }
    return;
  }
  localScores[ focusedConfig.endId ] = text;
  if (session?.value?.metadata?.numberOfEnds == null && focusedConfig.endId === localScores.length - 1
    && localScores.length < MAXIMUM_ENDS) {
    await setScores([ ...localScores, "" ]);
    focusedEndConfig.value = {
      ...focusedConfig,
      endId: focusedConfig.endId + 1,
    };
    return;
  }
  await setScores(localScores);
  if (focusedConfig.endId < localScores.length - 1) {
    focusedEndConfig.value = {
      ...focusedConfig,
      endId: focusedConfig.endId + 1,
    };
  } else {
    const numberOfPhases = session?.value?.metadata?.numberOfPhases;
    if (numberOfPhases != null && focusedConfig.phaseId < numberOfPhases - 1) {
      focusedEndConfig.value = {
        ...focusedConfig,
        phaseId: focusedConfig.phaseId + 1,
        endId: getFirstEmptyEndId(focusedConfig.phaseId + 1),
      };
    } else if (numberOfPhases != null) {
      clearFocus();
    } else {
      await new Promise<void>((resolve) => {
        Taro.nextTick(async () => {
          await focusOnNextPhase(null);
          resolve();
        });
      });
    }
  }
};

const submitSession = async (): Promise<void> => {
  await Taro.showLoading({ title: "提交中" });
  try {
    const result = await store.dispatch("toolkitScoring/submitSession", { sessionId });
    persistedSessionId.value = result.persistedSessionId;
    popupVisibility.isCompleteScoringPopupVisible = true;
  } catch (e: Error) {
    console.error(e);
    await Taro.showToast({ title: e.message, icon: "error" });
  } finally {
    await Taro.hideLoading();
  }
};

useRequireToolkitSession({ sessionId });

useReady(() => {
  const shouldEndTraining = router.params.shouldEndTraining === "1";
  if (shouldEndTraining) finalizeSession();
});
</script>

<style lang="scss">
page {
  @extend .scroll-page--page;

  background: $background-color;

  width: 100%;
  height: 100%;
}

.scoring--input-inner.visible {
  background: $gray-8;
  border: solid 2rpx $gray-8;
}

.scoring-phase--section {
  flex: none;
  align-items: start !important;
  &:not(:last-child) {
    padding-right: $padding-base !important;
  }
}

.scoring-phase--section--start {
  height: 50rpx;
  line-height: 50rpx;
}

.score-sheet {

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
    .score-sheet--view-switch {
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

  &--metadata-container {
    padding: $padding-xs $padding-sm;
    background: $white;
  }
  &--metadata-row {
    display: flex;
    justify-content: stretch;
  }
  &--metadata-cell {
    flex-grow: 1;

    background: none;
    text-align: left;
    box-sizing: border-box;
    &:not(:first-child) {
      padding-left: $padding-xs;
    }
    &:not(:last-child) {
      padding-right: $padding-xs;
    }
    display: flex;
    align-self: stretch;
    flex-direction: column;
    justify-content: space-between;
  }
  &--metadata-title {
    font-size: $font-size-md;
    line-height: $line-height-md;
    color: $gray-7;
    font-weight: 500;
  }
  &--metadata-value {
    white-space: nowrap;
    font-size: $font-size-xl;
    line-height: $line-height-xl;
    font-weight: 500;
    .unit {
      font-size: $font-size-sm;
      font-weight: normal;
    }
  }

  &--setting {
    flex: 1;
    border-radius: $border-radius-md;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    overflow: hidden;
    font-weight: 400;
    &--inner {
      flex: 1;
      background-color: $gray-1;
      padding: $padding-base;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    &--title {
      font-size: $font-size-xs;
      text-align: center;
      color: $gray-6;
      width: 100%;
      box-sizing: border-box;
      padding-bottom: $padding-base;
    }
    &--button-horizontal {
      width: 100%;
      box-sizing: border-box;
      font-size: $font-size-sm;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: $border-radius-xl;
      background-color: $blue-2;
      height: 42rpx;
      color: $white;
      .setting-icon {
        width: 70rpx;
        height: 28rpx;
        margin-left: $padding-base;
      }
    }
    &--button-vertical {
      font-size: $font-size-sm;
      background-color: $blue-2;
      color: $white;

      padding: $padding-base;

      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }
  }

  &--phase-container {
    & > .scoring-phase {
      margin: $padding-xs;
      background: $white;
      border-radius: $border-radius-md;
      padding:  $padding-xs;
    }

    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
  }

  &--phase-row {
    &--header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: $padding-xs;
      &--right {
        display: flex;
        font-size: $font-size-md;
        color: $primary-color-1;
      }
    }
    &--phase-id {
      align-self: stretch;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
    }
    &--number-of-ends {
      align-self: stretch;
      font-size: $font-size-sm;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    &--end {
      padding-right: 10rpx;
      flex: none;
      text {
        font-size: $font-size-sm;
        width: 50rpx;
        height: 50rpx;
        line-height: 50rpx;
      }
    }
    .active-inputs {
      & > text {
        width: 80rpx;
        font-size: 42rpx;
        font-weight: 500;
      }
      &:not(:last-child) {
        padding-right: $padding-base;
      }
      & > .scoring--input-inner--focus {
      border: 2rpx solid $primary-color-1 !important;
    }
    }
    &--target-thumbnail {
      align-self: center;
      border: solid 1px $gray-4;
      border-radius: $border-radius-md;

      position: relative;
    }
    .unit {
      font-size: $font-size-sm;
    }
  }

  &--phase-row--active {
    padding: $padding-sm $padding-xs !important;
    border: 2rpx solid $primary-color-1;
  }

  &--phase-row--phase-id {
    font-size: $font-size-md;
  }
}

.scroll-page--bottom {
  border-radius: 36rpx 36rpx 0 0;
  overflow: hidden;
}

.scoring-phase--inputs-keyboard {
  &-header {
    display: flex;
    flex-direction: row;
    &.extra-padding {
      padding: $padding-md;
    }
    &--button {
      flex: 1;
      margin-right: $padding-sm;
      &:last-child {
        margin-right: 0;
      }
    }
  }
  &-content {
    .scoring-keyboard--column {
      &:last-child {
        flex: 2;
      }
      .scoring-keyboard--button {
        font-size: 48rpx;
      }
    }
  }
}
</style>
