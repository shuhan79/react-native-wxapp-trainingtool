<template>
  <error-boundary>
    <view
      ref="container"
      class="target-view"
    >
      <canvas
        ref="destination"
        class="target-view--canvas"
        :style="canvasStyle"
        :canvas-id="`destination-${canvasUniqueId}`"
        type="2d"
        :disable-scroll="true"
        :catch-move="true"
        @touchstart="start"
        @touchmove="move"
        @touchend="end"
        @touchcancel="cancel"
      >
        <van-nav-bar
          :left-arrow="true"
          custom-class="target-view--nav-bar"
          style="z-index: 1"
          @clickback="navigateBack"
        >
        </van-nav-bar>
        <cover-view
          :class="{
            'target-view--nav-bar': true,
            'target-view--overlay-active': isMetadataSettingVisible,
          }"
          style="z-index: 2"
        >
          <cover-view
            class="target-view--nav-bar--header"
            :style="{ paddingTop: `${statusBarHeight}px` }"
          >
            <cover-view class="target-view--arrow-left" @tap="cvt(navigateBack)" />
            <cover-view
              class="target-view--view-switches-container"
              :style="{ paddingTop: `${statusBarHeight}px` }"
            >
              <cover-view class="target-view--view-switches">
                <cover-view class="target-view--view-switch" @tap="cvt(navigateToScoreSheet)">记分</cover-view>
                <cover-view class="target-view--view-switch focus">落点</cover-view>
                <cover-view class="target-view--view-switch" @tap="cvt(navigateToAnalytics)">分析</cover-view>
              </cover-view>
            </cover-view>
          </cover-view>
          <cover-view
            class="target-view--nav-bar--statistics-container"
            :style="{paddingTop: `${statusBarHeight + 46}px` }"
          >
            <cover-view class="target-view--nav-bar--statistics">
              <cover-view class="target-view--metadata-cell">
                <cover-view class="target-view--metadata-title">总分</cover-view>
                <cover-view class="target-view--metadata-value">
                  {{ scoreAnalytics.sum + (scoreAnalytics.endLimit > 0 ? `/${scoreAnalytics.endLimit * 10}` : "") }}
                </cover-view>
              </cover-view>
              <cover-view class="target-view--metadata-vertical-border" />
              <cover-view class="target-view--metadata-cell">
                <cover-view class="target-view--metadata-title">总箭数</cover-view>
                <cover-view class="target-view--metadata-value">
                  {{ scoreAnalytics.endCount + (scoreAnalytics.endLimit > 0 ? `/${scoreAnalytics.endLimit}` : "") }}
                </cover-view>
              </cover-view>
              <cover-view class="target-view--metadata-vertical-border" />
              <cover-view class="target-view--metadata-cell">
                <cover-view class="target-view--metadata-title">稳定性</cover-view>
                <cover-view class="target-view--metadata-value">{{ scoreAnalytics.sdScore }}</cover-view>
                <scoring-toolkit-session-cover-view :session-id="sessionId">
                  <scoring-user-distribution-bar-cover-view :session-id="sessionId" />
                </scoring-toolkit-session-cover-view>
              </cover-view>
              <cover-view class="target-view--metadata-vertical-border" />
              <cover-view class="target-view--metadata-cell">
                <cover-view class="target-view--setting" @tap="cvt(showMetadataSettingPopup)">
                  <cover-view class="target-view--setting--inner">
                    <cover-view class="target-view--setting--title">
                      <cover-view v-show="session?.metadata?.bowType">
                        {{ session?.metadata?.bowType }}
                      </cover-view>
                      <cover-view v-show="session?.metadata?.distance || session?.metadata?.targetFace">
                        {{ (session?.metadata?.distance ?? "") + " " + (session?.metadata?.targetFace ?? "") }}
                      </cover-view>
                      <cover-view>{{ modeText }}</cover-view>
                    </cover-view>
                    <cover-view
                      v-show="isPendingSession && !hasSetMetadata"
                      class="target-view--setting--button-horizontal"
                    >
                      <cover-view>设置</cover-view>
                      <cover-image class="setting-icon" :src="settingIcon" />
                    </cover-view>
                  </cover-view>
                  <cover-view v-show="isPendingSession && hasSetMetadata" class="target-view--setting--button-vertical">
                    <cover-view>修</cover-view>
                    <cover-view>改</cover-view>
                  </cover-view>
                </cover-view>
              </cover-view>
            </cover-view>
            <cover-view>
              <cover-view class="target-view--nav-bar--controlls-top-border">
                <cover-view class="target-view--metadata-horizontal-border" />
              </cover-view>
              <cover-view class="target-view--nav-bar--controlls">
                <cover-view
                  v-for="dc in displayConfigs"
                  :key="dc.key"
                  class="target-view--nav-bar--controll"
                  @tap="cvt(toggleDisplayConfig, dc.key)"
                >
                  <cover-view
                    :class="{
                      'target-view--nav-bar--controll--indicator': true,
                      'active': displayConfig[dc.key],
                    }"
                  />
                  <cover-view>{{ dc.title }}</cover-view>
                </cover-view>
                <cover-view
                  class="target-view--nav-bar--controll"
                >
                  <button
                    class="target-view--button"
                    hover-class="target-view--button--active"
                    @tap="navigateToTimer"
                  >计时器</button>
                </cover-view>
              </cover-view>
            </cover-view>
          </cover-view>
        </cover-view>

        <cover-view v-show="!isMetadataSettingVisible" class="target-view--bottom-container">
          <cover-view class="target-view--row target-view--button-container">
            <button
              class="target-view--button"
              hover-class="target-view--button--active"
              @tap="navigateToScoreSheet(true)"
            >结束记分</button>
            <button
              :class="{
                'target-view--button': true,
                'disabled': focusedEndConfig?.phaseId === 0,
              }"
              hover-class="target-view--button--active"
              @tap="focusOnPreviousPhase"
            >上一组</button>
            <button
              :class="{
                'target-view--button': true,
                'primary': true,
                'last': true,
                'disabled': focusedEndConfig?.phaseId === session?.metadata?.numberOfPhases - 1,
              }"
              hover-class="target-view--button--active"
              @tap="focusOnNextPhase"
            >下一组</button>
          </cover-view>
          <cover-view class="keyboard-context target-view--row last target-view--columns bottom">
            <cover-view style="flex: 1">
              <cover-view class="target-view--row">
                <cover-view class="target-view--row-text">第{{ focusedEndConfig.phaseId + 1 }}组</cover-view>
              </cover-view>
              <cover-view
                v-for="(_, row) in rowCount"
                :key="`row-${row}`"
                :class="{
                  'target-view--ends': true,
                  'target-view--row': true,
                  'last': row === rowCount - 1,
                }"
              >
                <cover-view
                  v-for="(_, column) in 6"
                  v-show="row * 6 + column < ends.length"
                  :key="`target-view--end-input-${row * 6 + column}`"
                  :class="{
                    'target-view--end': true,
                    'focus': row * 6 + column === focusedEndConfig?.endId,
                  }"
                  @tap="focusEnd($event, row * 6 + column)"
                >
                  <cover-view class="target-view--text">{{ ends[row * 6 + column]?.score }}</cover-view>
                </cover-view>
              </cover-view>
            </cover-view>
            <cover-view v-if="isPendingSession" class="keyboard--options">
              <button
                class="target-view--button target-view--button--options target-view--row last"
                hover-class="target-view--button--active"
                @tap="removeEnd($event)"
              >删除</button>
            </cover-view>
          </cover-view>
        </cover-view></canvas>
    </view>

    <scoring-metadata-setting
      v-model:is-visible="isMetadataSettingVisible"
      :session-id="sessionId"
    />
  </error-boundary>
</template>

<script setup lang="ts">
import Taro, { useDidShow, useRouter } from "@tarojs/taro";
import { vec2 } from "gl-matrix";
import _clamp from "lodash/clamp";
import _flatten from "lodash/flatten";
import _isFinite from "lodash/isFinite";
import _pullAt from "lodash/pullAt";
import _take from "lodash/take";
import _zipWith from "lodash/zipWith";
import { computed, ref, watch } from "vue";
import { useStore } from "vuex";

import ScoringMetadataSetting from "./components/ScoringMetadataSetting.vue";

import settingIcon from "@/assets/images/setting.png";
import ScoringToolkitSessionCoverView from "@/components/scoring/ScoringToolkitSessionCoverView.vue";
import ScoringUserDistributionBarCoverView from "@/components/scoring/ScoringUserDistributionBarCoverView.vue";
import { useRequireToolkitSession } from "@/hooks/useRequireToolkitSession";
import { useScoreAnalytics } from "@/hooks/useScoreAnalytics";
import { useToolkitScoringSessionConfig } from "@/hooks/useToolkitScoringSessionConfig";
import * as pages from "@/pages.config";
import { MAXIMUM_ENDS, MAXIMUM_PHASES } from "@/store/modules/toolkitScoring";
import { getDomNode, getDomPosition } from "@/utils/dom";
import MinaTouch from "@/utils/MinaTouch";
import { getMeanCenter, getShiftCircle, standardDeviationalEllipse } from "@/utils/standardDeviationalEllipse";
import ErrorBoundary from "@ac/components/ErrorBoundary.vue";
import { useScoringUserPhaseSummary } from "@ac/components/hooks/useScoringUserPhaseSummary";
import { clampArray, trimArray } from "@ac/services/utils/array";
import {
  drawCenterX, drawCircle, drawEllipse, drawLine, drawText,
} from "@ac/services/utils/graphics";
import { getRealTranslate, getRelativeTranslate, targetFaces } from "@ac/services/utils/targetFace";

definePageConfig({
  navigationBarTitleText: "Target View",
  disableScroll: true,
  navigationStyle: "custom",
});

const { statusBarHeight } = Taro.getSystemInfoSync();

const router = useRouter();

const store = useStore();

store.dispatch("toolkitScoring/setConfig", { mode: "target-view" });

const sessionId = router.params?.sessionId as string;

const config = useToolkitScoringSessionConfig(sessionId);

const session = computed(() => store.getters[ "toolkitScoring/session" ]({ sessionId }));

const isPendingSession = computed(() => store.getters[ "toolkitScoring/isPendingSession" ]({ sessionId }));

const getPhaseIdFromRouteParams = (): number|null => {
  const phaseId = parseInt(router.params?.focusedPhaseId ?? "", 10);
  return _isFinite(phaseId) ? phaseId : null;
};

const phaseSummary = useScoringUserPhaseSummary(config);

const scoreAnalytics = useScoreAnalytics(config);

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

const focusedEndConfig = ref<{ roundId; phaseId; endId? }>({
  roundId: 0,
  phaseId: getPhaseIdFromRouteParams() ?? (!isPendingSession.value ? 0 : getFirstIncompletePhaseId()),
  endId: undefined,
});

const hasSetMetadata = computed(
  () => session?.value?.metadata != null && [
    "bowType", "distance", "targetFace", "numberOfPhases", "numberOfEnds",
  ].some((key) => session.value.metadata?.[key] != null),
);

const modeText = computed(() => {
  const { numberOfPhases, numberOfEnds } = session.value?.metadata ?? {};
  if (numberOfPhases == null && numberOfEnds == null) return "自由模式";
  let text = "";
  if (numberOfPhases != null) text += `${numberOfPhases}组`;
  if (numberOfEnds != null) text += `${numberOfEnds}箭`;
  return text;
});

const isMetadataSettingVisible = ref(false);

const phase = computed(() => store.getters[ "match/phase" ]({
  ...config,
  phaseId: focusedEndConfig.value.phaseId ?? -1,
}));

const ends = ref<Array<{ score?: string; position?: vec2 }>>([]);

const allOtherEnds = ref<Array<{ score?: string; position?: vec2 }>>([]);

const rowCount = computed(() => Math.max(1, Math.ceil(ends.value.length / 6)));

const targetFaceRender = computed(() => targetFaces[ session.value?.metadata?.targetFace ] ?? targetFaces.DEFAULT);

const displayConfig = computed(() => store.getters[ "toolkitScoring/config" ]);

const useRadianInEllipseDrawing = computed(
  () => store.getters[ "config/useRadianInEllipseDrawing" ],
);

const displayConfigs = [
  { key: "isShiftAnalysisEnabled", title: "散布偏移" },
  { key: "isDistributionAnalysisEnabled", title: "落点分布" },
  { key: "shouldShowAllEnds", title: "显示全部" },
];

const width = ref(0);
const height = ref(0);
const canvasStyle = computed(() => ({
  width: `${width.value}px`,
  height: `${height.value}px`,
}));

const canvasUniqueId = ref(0);

let zoom = 1;

const cachedTargetCenter = vec2.create();
const targetCenter = vec2.create();

const container = ref<{ sid: string } | null>(null);
const destination = ref<{ sid: string } | null>(null);

let singleTapTimeout: ReturnType<typeof setTimeout> | null = null;
let isAutoFocus: boolean | null = null;
let isInTouch = false;
let hasEnabledPrecisePositioning = false;
let hasPositionUpdated: boolean|null = null;
let hasScoresUpdated = false;

let isSkippingPhases = false;
let skippingPhasesOffset = 0;
let skippingPhasesOriginalPhaseId: number | null = null;
const SKIPPING_PHASES_TOUCH_AREA_WIDTH = 36;
const SKIPPING_PHASES_TOUCH_AREA_HEIGHT = 128;
const SKIPPING_PHASES_FLAG_HEIGHT = 32;

let focusOnNextPhase: any = () => { /* bypass */ };
let showMetadataSettingPopup: any = () => { /* bypass */ };

const cvt = (fn, ...args) => {
  if (isMetadataSettingVisible.value) return;
  fn(...args);
};

const navigateBack = (): void => { Taro.navigateBack(); };

const navigateToScoreSheet = (shouldEndTraining = false): void => {
  Taro.redirectTo({
    // eslint-disable-next-line max-len
    url: `/${pages.TOOLKIT_PAGE_SCORING_SCORE_SHEET}?sessionId=${sessionId}&focusedPhaseId=${focusedEndConfig.value?.phaseId}&shouldEndTraining=${shouldEndTraining ? 1 : 0}`,
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

const zipScoreAndPosition = (scores: Array<string>, positions: Array<vec2>): Array<{score; position}> => {
  const unfiltered = _zipWith(scores, positions, (score, position) => ({ score, position }));
  return unfiltered;
};

const pullEndsFromStore = (): void => {
  const unfiltered = zipScoreAndPosition(phase.value?.scores, phase.value?.positions);
  ends.value = trimArray(unfiltered, (end) => end.score != null && end.score !== "");

  const user = store.getters[ "match/user" ](config);
  const allPhases = [ ...(user?.phases ?? []) ];
  _pullAt(allPhases, [ focusedEndConfig.value.phaseId ]);
  const allUnfiltered = allPhases.map((p) => zipScoreAndPosition(p?.scores, p?.positions));
  // @ts-ignore
  allOtherEnds.value = _flatten(allUnfiltered);
};

const pushEndsToStore = async (): Promise<void> => {
  if (focusedEndConfig.value.phaseId == null) return;
  const localConfig = {
    ...config,
    phaseId: focusedEndConfig.value.phaseId,
  };
  const scores = _take([ ...(phase.value?.scores ?? []) ], ends.value.length);
  const positions = _take([ ...(phase.value?.positions ?? []) ], ends.value.length);
  let newScores = _zipWith(scores, ends.value, (score, end) => end?.score ?? score);
  // Scores array needs at least one empty slot for score sheet to render the input
  if (
    session.value?.metadata?.numberOfEnds == null
    && newScores.length < MAXIMUM_ENDS
    && (newScores.length === 0 || newScores[ newScores.length - 1 ] !== "")) {
    newScores.push("");
  } else if (session.value?.metadata?.numberOfEnds != null) {
    newScores = clampArray(newScores, Math.max(newScores.length, session.value?.metadata?.numberOfEnds), "");
  }
  let newPositions = _zipWith(positions, ends.value, (position, end) => end?.position ?? position);
  newPositions = clampArray(newPositions, newScores.length, null);
  hasScoresUpdated = true;
  await store.commit("match/scores", { ...localConfig, scores: newScores });
  await store.commit("match/updatePositions", { ...localConfig, positions: newPositions });
  // When ends and phases limits are set, auto focus on next phase
  // if (isInFreeMode.value === false) {
  //   const { numberOfEnds, numberOfPhases } = groupInstance.value;
  //   if (ends.value.length >= numberOfEnds) {
  //     if (localConfig.phaseId < numberOfPhases - 1) {
  //       focusOnNextPhase();
  //     }
  //   }
  // }
};

pullEndsFromStore();

let hasInit = false;
let canvas;
const { pixelRatio } = Taro.getSystemInfoSync();
const init = async (): Promise<boolean> => {
  if (hasInit) return hasInit;
  if (container.value == null) return hasInit;
  const canvasRect = await getDomPosition(container);
  if (!canvasRect || !canvasRect.width) return hasInit;
  height.value = canvasRect.height;
  width.value = canvasRect.width;

  canvas = await getDomNode(destination);
  canvas.width = canvasRect.width * pixelRatio;
  canvas.height = canvasRect.height * pixelRatio;

  const context = canvas.getContext("2d");
  context.scale(pixelRatio, pixelRatio);

  vec2.set(targetCenter, width.value / 2, height.value / 2);
  vec2.copy(cachedTargetCenter, targetCenter);

  hasInit = true;
  return hasInit;
};

const draw = async (): Promise<void> => {
  if (!await init()) return;

  const currentTargetFaceRender = targetFaceRender.value;

  const context = canvas.getContext("2d");

  context.clearRect(0, 0, width.value, height.value);

  const unitSize = width.value * 0.8;

  const size = unitSize * zoom;

  const viewportRadius = size / 2;

  const focusedEnd = ends.value[ focusedEndConfig.value.endId ?? -1 ];
  let focusEndScore: string | null = null;
  if (focusedEnd?.position != null) {
    focusEndScore = currentTargetFaceRender.score(focusedEnd.position);
    if (focusedEnd.score !== focusEndScore) {
      if (focusedEnd.score != null) {
        Taro.vibrateShort();
      }
      focusedEnd.score = focusEndScore;
    }
  } else {
    focusEndScore = null;
  }

  currentTargetFaceRender.draw(context, targetCenter, viewportRadius, focusEndScore, focusedEnd?.position);

  if (displayConfig.value.isShiftAnalysisEnabled || displayConfig.value.isDistributionAnalysisEnabled) {
    let es = [ ...ends.value ];
    if (displayConfig.value.shouldShowAllEnds) {
      es = [ ...ends.value, ...allOtherEnds.value ];
    }
    // @ts-ignore
    const points: Array<vec2> = es
      .filter((end) => end?.position != null)
      .map((end) => end.position);

    const groups = currentTargetFaceRender.groupEnds(points);

    groups.forEach((group) => {
    // Shift analysis
      if (displayConfig.value.isShiftAnalysisEnabled) {
        const circle = getShiftCircle(group);
        const mappedCircleCenter = getRealTranslate(circle.center, targetCenter, viewportRadius);
        const mappedCircleRadius = circle.radius * viewportRadius;
        drawCircle(
          context,
          mappedCircleCenter,
          mappedCircleRadius,
          "rgba(95,216,95,0.0)",
          "rgba(95,216,95,0.8)",
          2,
        );
      }

      // distribution analysis
      if (displayConfig.value.isDistributionAnalysisEnabled && es?.length > 2) {
        const ellipse = standardDeviationalEllipse(group);
        if (ellipse != null) {
          const mappedCircleCenter = getRealTranslate(ellipse.center, targetCenter, viewportRadius);
          const mappedCircleSigmaX = ellipse.sigmaX * (size / 4);
          const mappedCircleSigmaY = ellipse.sigmaY * (size / 4);
          drawEllipse(
            context,
            mappedCircleCenter,
            mappedCircleSigmaX,
            mappedCircleSigmaY,
            ellipse.angle,
            "rgba(95,216,95,0.4)",
            "rgba(95,216,95,0.8)",
            useRadianInEllipseDrawing.value,
          );
        }
      }

      const meanCenter = getMeanCenter(group);
      const mappedCircleCenter = getRealTranslate(meanCenter, targetCenter, viewportRadius);
      drawCenterX(context, mappedCircleCenter);
    });
  }

  const endRadius = currentTargetFaceRender.getEndRadiusInPixel(viewportRadius, unitSize);

  if (displayConfig.value.shouldShowAllEnds) {
    allOtherEnds.value.forEach((end) => {
      if (!end.position) return;
      const mappedEndCenter = getRealTranslate(end.position, targetCenter, viewportRadius);
      drawCircle(
        context,
        mappedEndCenter,
        endRadius,
        "rgba(0,0,0,0.3)",
        "rgba(255,255,255,0.3)",
      );
    });
  }

  ends.value.forEach((end, index) => {
    if (!end.position) return;
    const mappedEndCenter = getRealTranslate(end.position, targetCenter, viewportRadius);
    const isFocused = index === focusedEndConfig.value.endId;
    // Ripple
    if (isFocused) {
      drawCircle(
        context,
        mappedEndCenter,
        endRadius * 2,
        "rgba(34,139,34,0.5)",
        null,
      );
      if (hasEnabledPrecisePositioning) {
        drawLine(
          context,
          [ mappedEndCenter[ 0 ] - 30, mappedEndCenter[ 1 ] ],
          [ mappedEndCenter[ 0 ] + 30, mappedEndCenter[ 1 ] ],
          "white",
        );
        drawLine(
          context,
          [ mappedEndCenter[ 0 ], mappedEndCenter[ 1 ] - 30 ],
          [ mappedEndCenter[ 0 ], mappedEndCenter[ 1 ] + 30 ],
          "white",
        );
        drawCircle(
          context,
          mappedEndCenter,
          15,
          null,
          "white",
        );
      }
    }
    drawCircle(
      context,
      mappedEndCenter,
      endRadius,
      isFocused ? "rgba(34,139,34,1)" : "#888",
      "white",
    );
  });

  // Phase selector
  const phaseFlagWidth = 32;

  const phaseFlagX = width.value;
  const phaseFlagY = height.value / 2 - SKIPPING_PHASES_FLAG_HEIGHT / 2;
  context.beginPath();
  context.moveTo(phaseFlagX, phaseFlagY);
  context.lineTo(phaseFlagX, phaseFlagY + SKIPPING_PHASES_FLAG_HEIGHT);
  context.lineTo(phaseFlagX - phaseFlagWidth, phaseFlagY + SKIPPING_PHASES_FLAG_HEIGHT);
  context.lineTo(
    phaseFlagX - phaseFlagWidth - SKIPPING_PHASES_FLAG_HEIGHT / 2,
    phaseFlagY + SKIPPING_PHASES_FLAG_HEIGHT / 2,
  );
  context.lineTo(phaseFlagX - phaseFlagWidth, phaseFlagY);
  context.fillStyle = isSkippingPhases ? "rgba(34,139,34,0.8)" : "rgba(34,139,34,0.4)";
  context.fill();

  const focusedPhaseId = focusedEndConfig.value.phaseId;
  const phaseTextX = width.value - 8;
  const phaseTextY = height.value / 2 - focusedPhaseId * SKIPPING_PHASES_FLAG_HEIGHT
    + skippingPhasesOffset
    + (focusedPhaseId - (skippingPhasesOriginalPhaseId ?? focusedPhaseId)) * SKIPPING_PHASES_FLAG_HEIGHT;
  phaseSummary.value.forEach((_, phaseId) => {
    const alpha = (isSkippingPhases ? 1 : 0.6) - Math.abs(focusedPhaseId - phaseId) * (isSkippingPhases ? 0.1 : 0.15);
    drawText(
      context,
      [ phaseTextX, phaseTextY + phaseId * SKIPPING_PHASES_FLAG_HEIGHT ],
      `${phaseId + 1}`,
      focusedPhaseId === phaseId ? "#fff" : `rgba(0,0,0,${alpha})`,
      "right",
      focusedPhaseId === phaseId
        ? "normal 800 24px -apple-system,PingFangSC-Light,PingFang"
        : "normal 400 16px -apple-system,PingFangSC-Light,PingFang",
      "middle",
    );
  });
};

let rendererId: number | null = null;
const stopRenderer = (): void => {
  if (rendererId != null && canvas != null) {
    canvas.cancelAnimationFrame(rendererId);
    rendererId = null;
  }
};
const startRenderer = () => {
  if (rendererId != null || canvas == null) return;
  const callback = () => {
    draw();
    rendererId = canvas.requestAnimationFrame(callback);
  };
  rendererId = canvas.requestAnimationFrame(callback);
};

const minaTouch = new MinaTouch({
  multipointStart(): void {
    vec2.copy(cachedTargetCenter, targetCenter);
  },
  pinch(evt): void {
    // Disable pinch when user is skipping phases
    if (isSkippingPhases) return;
    const { initialCenter, newCenter, singleZoom } = evt;
    vec2.copy(targetCenter, cachedTargetCenter);
    vec2.subtract(targetCenter, targetCenter, [ initialCenter.x, initialCenter.y ]);
    vec2.scale(targetCenter, targetCenter, singleZoom);
    vec2.add(targetCenter, targetCenter, [ newCenter.x, newCenter.y ]);
    zoom = evt.zoom;
    // draw();
  },
  pressMove(evt): void {
    const delta = vec2.create();
    vec2.subtract(delta, [ evt.currentX, evt.currentY ], [ evt.initialX, evt.initialY ]);
    if (isSkippingPhases) {
      skippingPhasesOffset = delta[ 1 ];
      if (skippingPhasesOriginalPhaseId != null) {
        const newPhaseId = skippingPhasesOriginalPhaseId
          + Math.round(-skippingPhasesOffset / SKIPPING_PHASES_FLAG_HEIGHT);
        const clampedNewPhaseId = _clamp(newPhaseId, 0, phaseSummary.value.length - 1);
        if (clampedNewPhaseId !== focusedEndConfig.value.phaseId) {
          Taro.vibrateShort();
          focusedEndConfig.value.phaseId = clampedNewPhaseId;
          pullEndsFromStore();
        }
      }
    } else if (!isPendingSession.value) {
      vec2.add(targetCenter, targetCenter, [ evt.deltaX, evt.deltaY ]);
      vec2.copy(cachedTargetCenter, targetCenter);
    } else if (focusedEndConfig.value.endId != null && ends.value[ focusedEndConfig.value.endId ]?.position != null) {
      // When any end is focused, always move the focused end
      const size = width.value * 0.8 * zoom;
      const realOffset = vec2.fromValues(evt.deltaX, evt.deltaY);
      // If is an auto-focused end and user moved it a lot, we give it an offset for easier positioning
      if (!hasEnabledPrecisePositioning && isAutoFocus && vec2.length(delta) > 10) {
        hasEnabledPrecisePositioning = true;
        vec2.add(realOffset, realOffset, [ 0, -60 ]);
      }
      const offset = getRelativeTranslate(realOffset, vec2.create(), size);
      // @ts-ignore
      vec2.add(
        ends.value[ focusedEndConfig.value.endId ].position,
        ends.value[ focusedEndConfig.value.endId ].position,
        offset,
      );
      ends.value[ focusedEndConfig.value.endId ].position = targetFaceRender.value.getValidPosition(
        ends.value[ focusedEndConfig.value.endId ].position,
      );
      hasPositionUpdated = true;
    } else if (focusedEndConfig.value.endId == null && isInTouch) {
      // When there is no focus end and is still in initial touch determination process,
      // if movement is larger than threshold, mark current drag as target drag
      if (vec2.length(delta) > 25) {
        isInTouch = false;
        if (singleTapTimeout != null) clearTimeout(singleTapTimeout);
        vec2.add(targetCenter, targetCenter, delta);
        vec2.copy(cachedTargetCenter, targetCenter);
      }
    } else if (focusedEndConfig.value.endId == null && !isInTouch) {
      // For target drag
      vec2.add(targetCenter, targetCenter, [ evt.deltaX, evt.deltaY ]);
      vec2.copy(cachedTargetCenter, targetCenter);
    }
    // draw();
  },
  touchStart(evt): void {
    startRenderer();
    if (hasPositionUpdated == null) {
      hasPositionUpdated = false;
    }
    if (evt.touches?.length > 1) {
      // Clear single tap determination when there is multiple touch points
      if (singleTapTimeout != null) clearTimeout(singleTapTimeout);
    } else if (width.value - evt.touches?.[0]?.x <= SKIPPING_PHASES_TOUCH_AREA_WIDTH
      // eslint-disable-next-line max-len
      && evt.touches?.[0]?.y >= height.value / 2 - Math.max(SKIPPING_PHASES_TOUCH_AREA_HEIGHT, SKIPPING_PHASES_FLAG_HEIGHT * (Math.min(focusedEndConfig.value.phaseId, 4) + 0.5))
      // eslint-disable-next-line max-len
      && evt.touches?.[0]?.y <= height.value / 2 + Math.max(SKIPPING_PHASES_TOUCH_AREA_HEIGHT, SKIPPING_PHASES_FLAG_HEIGHT * (Math.min(phaseSummary.value.length - focusedEndConfig.value.phaseId, 4) - 0.5))
    ) {
      Taro.vibrateShort();
      isSkippingPhases = true;
      skippingPhasesOriginalPhaseId = focusedEndConfig.value.phaseId;
    } else if (!isPendingSession.value) {
      // no op
    } else if (focusedEndConfig.value.endId != null && ends.value[ focusedEndConfig.value.endId ]?.position == null) {
      // When there is focused empty end, single tap to pin the arrow
      const size = width.value * 0.8 * zoom;
      const realOffset = vec2.fromValues(evt.touches?.[0]?.x, evt.touches?.[0]?.y);
      const position = getRelativeTranslate(realOffset, targetCenter, size);
      if (targetFaceRender.value.isValidPosition(position)) {
        ends.value[ focusedEndConfig.value.endId ] = {
          score: targetFaceRender.value.score(position),
          position,
        };
        hasPositionUpdated = true;
        Taro.vibrateShort();
      }
    } else if (focusedEndConfig.value.endId == null) {
      // When there is no focused end, start a 250ms task
      isInTouch = true;
      singleTapTimeout = setTimeout(() => {
        const size = width.value * 0.8 * zoom;
        const realOffset = vec2.fromValues(evt.changedTouches?.[0]?.x, evt.changedTouches?.[0]?.y);
        const position = getRelativeTranslate(realOffset, targetCenter, size);
        const isValid = targetFaceRender.value.isValidPosition(position);
        if (session.value?.metadata?.numberOfEnds != null && ends.value.length >= session.value.metadata.numberOfEnds) {
          if (isValid) {
            if (focusedEndConfig.value.phaseId >= session.value?.metadata?.numberOfPhases - 1) {
              Taro.showToast({ title: "本场已记满", icon: "none" });
            } else {
              Taro.showToast({ title: "请切换到下一组", icon: "none" });
            }
          }
        } else if (ends.value.length >= MAXIMUM_ENDS) {
          if (isValid) Taro.showToast({ title: "上限每组18箭", icon: "none" });
        } else if (session.value?.metadata.targetFace == null) {
          showMetadataSettingPopup();
        } else {
          // If touch point didn't move a lot in period, categorize it as new end
          // If it is a long touch, also focus the end so it can be moved around
          if (isInTouch) {
            const count = ends.value.push({
              score: targetFaceRender.value.score(position),
              position: targetFaceRender.value.getValidPosition(position),
            });
            hasPositionUpdated = true;
            Taro.vibrateShort();
            isAutoFocus = true;
            focusedEndConfig.value.endId = count - 1;
          } else if (isValid) {
            ends.value.push({
              score: targetFaceRender.value.score(position),
              position,
            });
            pushEndsToStore();
          }
          draw();
        }
      }, 300);
    }
    // draw();
  },
  touchEnd(evt): void {
    if (evt.touches?.length === 0) {
      stopRenderer();
    }
    isSkippingPhases = false;
    skippingPhasesOffset = 0;
    skippingPhasesOriginalPhaseId = null;
    isInTouch = false;
    if (isAutoFocus) {
      isAutoFocus = false;
      focusedEndConfig.value.endId = null;
    }
    hasEnabledPrecisePositioning = false;
    draw();
    if (evt.touches?.length === 0) {
      if (hasPositionUpdated === true) {
        pushEndsToStore();
      }
      hasPositionUpdated = null;
    }
  },
});

const start = (event): void => {
  if (isMetadataSettingVisible.value) return;
  minaTouch.start(event);
  event.stopPropagation();
};
const move = (event): void => {
  if (isMetadataSettingVisible.value) return;
  minaTouch.move(event);
  event.stopPropagation();
};
const end = (event): void => {
  if (isMetadataSettingVisible.value) return;
  minaTouch.end(event);
  event.stopPropagation();
};
const cancel = (event): void => {
  if (isMetadataSettingVisible.value) return;
  minaTouch.cancel(event);
  event.stopPropagation();
};

const addEnd = (event: Event): void => {
  event.stopPropagation();
  if (ends.value[ ends.value?.length ]?.position) return;
  ends.value.push({});
  focusedEndConfig.value.endId = ends.value.length - 1;
  Taro.vibrateShort();
  draw();
};

const removeEnd = (event: Event): void => {
  event.stopPropagation();
  if (focusedEndConfig.value.endId != null) {
    ends.value.splice(focusedEndConfig.value.endId, 1);
    focusedEndConfig.value.endId = null;
    Taro.vibrateShort();
  } else if (ends.value?.length > 0) {
    ends.value.splice(-1, 1);
    if (focusedEndConfig.value.endId != null && ends.value?.[focusedEndConfig.value.endId] == null) {
      focusedEndConfig.value.endId = ends.value.length - 1;
    }
    Taro.vibrateShort();
  }
  draw();
  pushEndsToStore();
};

const focusEnd = (event: Event, index: number): void => {
  event.stopPropagation();
  if (focusedEndConfig.value.endId === index) {
    focusedEndConfig.value.endId = null;
  } else {
    focusedEndConfig.value.endId = index;
    Taro.vibrateShort();
  }
  draw();
};

const focusOnPreviousPhase = async (event): Promise<void> => {
  event.stopPropagation();
  Taro.vibrateShort();
  const currentPhaseId = focusedEndConfig.value?.phaseId;
  if (currentPhaseId <= 0) return;
  focusedEndConfig.value = {
    roundId: 0,
    phaseId: currentPhaseId - 1,
    endId: undefined,
  };
  pullEndsFromStore();
  draw();
};

focusOnNextPhase = async (event): Promise<void> => {
  event?.stopPropagation();
  Taro.vibrateShort();
  const numberOfPhases = session?.value?.metadata?.numberOfPhases;
  const currentPhaseId = focusedEndConfig.value?.phaseId;
  if (currentPhaseId >= MAXIMUM_PHASES - 1) {
    Taro.showToast({ title: "到达记分上限", icon: "none" });
    return;
  }
  if (numberOfPhases != null && currentPhaseId >= numberOfPhases - 1) {
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
  if (hasScoresUpdated) {
    await store.dispatch("toolkitScoring/clean", { sessionId, keepOneTrailingSpace: true });
    hasScoresUpdated = false;
  }
  Taro.nextTick(() => {
    if (currentPhaseId == null) {
      focusedEndConfig.value = {
        roundId: 0,
        phaseId: maximalPhaseId,
        endId: undefined,
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
        endId: undefined,
      };
    }
    pullEndsFromStore();
    draw();
  });
};

showMetadataSettingPopup = (): void => {
  if (!isPendingSession.value) return;
  isMetadataSettingVisible.value = true;
  focusedEndConfig.value.endId = null;
};

const toggleDisplayConfig = async (key: string): Promise<void> => {
  await store.dispatch("toolkitScoring/setConfig", {
    [ key ]: !displayConfig.value[ key ],
  });
  Taro.vibrateShort();
  draw();
};

useDidShow(() => {
  Taro.nextTick(draw);
  setTimeout(draw, 500);
  setTimeout(draw, 1000);
  setTimeout(draw, 2000);
});
watch(destination, () => {
  canvasUniqueId.value = Date.now();
  draw();
}, { immediate: true });
// Redraw target view when metadata setting popup is dismissed
watch(isMetadataSettingVisible, (isVisible) => { if (!isVisible) draw(); });

useRequireToolkitSession({ sessionId }, () => {
  pullEndsFromStore();
  draw();
});
</script>

<style lang="scss">
page {
  @extend .scroll-page--page;

  background: $background-color;

  width: 100%;
  height: 100%;
}

.target-view {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;

  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  &--canvas {
    overflow: hidden;
    position: relative;
  }

  &--nav-bar {
    position: fixed !important;
    left: 0;
    top: 0;
    right: 0;

    // background: none !important;

    &--header {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;

      padding: 0;

      z-index: 1;

      height: 46px;
      overflow: hidden;

      display: flex;
      align-items: center;
      justify-content: center;

      // background: $white;
    }
  }

  &--nav-bar--statistics-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  &--nav-bar--statistics {
    flex: 1;
    padding: $padding-xs $padding-sm;
    display: flex;
    justify-content: stretch;
    background: $white;
  }
  &--metadata-cell {
    flex-grow: 1;

    background: none;
    text-align: left;
    padding: 0;
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
  // Cover view doesn't support one-side border
  &--metadata-vertical-border {
    width: 1rpx;
    background-color: #ebedf0;
  }
  &--metadata-horizontal-border {
    height: 1rpx;
    background-color: #ebedf0;
  }
  &--metadata-title {
    font-size: $font-size-md;
    line-height: $line-height-md;
    color: $gray-7;
    font-weight: 500;
  }
  &--metadata-value {
    font-size: $font-size-xl;
    line-height: $line-height-xl;
    font-weight: 500;
  }

  &--setting {
    flex: 1;

    display: flex;
    flex-direction: row;
    align-items: stretch;

    border-radius: $border-radius-md;
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
    }
    &--button-horizontal {
      display: flex;
      align-items: center;
      justify-content: center;

      margin-top: $padding-base;

      font-size: $font-size-sm;
      border-radius: $border-radius-xl;
      background-color: $blue-2;
      color: $white;
      padding: $padding-base;
      .setting-icon {
        width: 70rpx;
        height: 28rpx;
        margin-left: 4rpx;
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

  &--arrow-left {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;

    width: 80px;
  }

  &--view-switches-container {
    position: absolute;
    top: 0;
    left: 20%;
    right: 20%;

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
    .target-view--view-switch {
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

  &--nav-bar--controlls-top-border {
    padding: 0 $padding-sm;
    background: $white;
  }
  &--nav-bar--controlls {
    background: $white;

    padding: $padding-xs $padding-sm;

    display: flex;
    flex-direction: row;
    align-items: stretch;
    justify-content: space-around;
  }
  &--nav-bar--controll {
    flex: 1;

    display: flex;
    flex-direction: row;
    align-items: center;

    &--indicator {
      display: block;
      width: 16rpx;
      height: 16rpx;
      border-radius: 16rpx;
      background-color: $gray-2;
      margin-right: $padding-base;

      &.active {
        background-color: $green;
      }
    }

    .target-view--button {
      flex: 1;
    }
  }

  &--columns {
    display: flex;
    flex-direction: row;
    &.bottom {
      align-items: flex-end;
    }
  }

  .keyboard-context {
    padding: $padding-sm $padding-md;
    display: flex;
    align-items: flex-start;
    .target-view--row--text {
      font-size: $font-size-md;
      font-weight: $font-weight-bold;
    }
  }

  &--bottom-container {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;

    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
    display: flex;
    flex-direction: column;

    & .target-view--row {
      margin-bottom: $padding-xs;
      &.last {
        margin-bottom: 0;
      }
    }
  }

  &--button-container {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    justify-content: space-between;
    padding: $padding-sm;

    & .target-view--button {
      width: 220rpx;
      height: 60rpx;
      line-height: 60rpx;
      box-sizing: border-box;
    }
  }

  &--button {
    flex: none;
    text-align: center;
    box-sizing: border-box;
    &::before {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100%;
      height: 100%;
      border: inherit;
      border-radius: inherit; /* inherit parent's border radius */
      transform: translate(-50%, -50%);
      opacity: 0;
      content: ' ';
      background-color: #000;
      border-color: #000;
    }

    &::after {
      border-width: 0;
    }

    &.target-view--button--active::before, &.disabled::before {
      opacity: 0.15;
    }
    font-family: $base-font-family;
    font-size: $font-size-sm;
    border: 1px solid $primary-color-1;
    border-radius: var(--button-border-radius, 6px);
    color: $primary-color-1;
    padding: 0 $padding-base;
    margin-bottom: 1px;
    font-weight: 600;
    background: var(--button-default-background-color, #fff);

    &.primary {
      color: var(--button-primary-color, #fff);
      background: var(--button-primary-background-color);
    }
  }
  &--button--active::before {
    opacity: 0.15;
  }

  &--button--options {
    width: 112rpx;
    height: 75rpx;
    line-height: 75rpx;
    font-size: $font-size-md;
    color: $primary-color-1;
    box-sizing: border-box;
    font-weight: $font-weight-bold;
    margin-bottom: 14rpx !important;
  }

  &--ends {
    display: flex;
    flex-direction: row;

    & .target-view--end {
      margin-right: 10rpx;
      &:last-child {
        margin-right: 0;
      }
    }
  }

  &--end {
    height: 60rpx;
    width: 60rpx;
    border-radius: $border-radius-md;
    background: #fff;
    border: solid 1px transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;

    & .target-view--text {
      font-size: 42rpx;
      line-height: 42rpx;
      font-weight: $font-weight-bold;
    }

    &.focus {
      border: solid 1px #363D8F;
    }

  }
}

.target-view--overlay-active {
  opacity: 0.4;
}
</style>
