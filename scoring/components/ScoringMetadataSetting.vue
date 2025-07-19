<template>
  <van-popup
    :overlay="true"
    :z-index="999"
    :close-on-click-overlay="true"
    :show="props.isVisible"
    custom-class="scoring-setting-popup"
    position="bottom"
    :closeable="true"
    close-icon-position="top-left"
    :round="true"
    @close="handleCloseScoringSettings"
  >
    <view class="scoring-setting-popup--header">
      <text></text>
      <view class="scoring-setting-popup--title">记分设置</view>
      <text class="scoring-setting-popup--submit" @tap="handleCloseScoringSettings">确认</text>
    </view>

    <view class="scoring-setting-popup--options">
      <text v-if="!hasSetMetadata" class="no-options">待设置</text>
      <template v-else>
        <text v-if="session?.metadata?.bowType" class="options--item">{{ session?.metadata?.bowType }}</text>
        <text v-if="session?.metadata?.distance" class="options--item">{{ session?.metadata?.distance }}</text>
        <text v-if="session?.metadata?.targetFace" class="options--item">{{ session?.metadata?.targetFace }}</text>
        <text v-if="session?.metadata?.numberOfPhases" class="options--item">
          {{ session?.metadata?.numberOfPhases }}组
        </text>
        <text v-if="session?.metadata?.numberOfEnds" class="options--item">
          每组{{ session?.metadata?.numberOfEnds }}箭
        </text>
      </template>
    </view>
    <van-tabs :key="props.isVisible" color="#363D8F">
      <van-tab title="弓种">
        <view class="scoring-setting--list bow-list">
          <view
            v-for="bowType in bowTypes"
            :key="bowType"
            :class="{
              'bow-item': true,
              'bow-item--active': session?.metadata?.bowType === bowType,
            }"
            @tap="updateMetadata('bowType', bowType)"
          >
            <image class="bow-icon" :src="bowTypeListIcons[bowType]" />
            <text class="bow-name">{{ bowType }}</text>
          </view>
        </view>
      </van-tab>
      <van-tab title="距离">
        <view class="scoring-setting--list distance-list">
          <view
            v-for="(distance, index) in distances"
            :key="`distance-${distance}`"
            :class="{
              'distance-item': true,
              'distance-item--active': session?.metadata?.distance === distance,
            }"
            @tap="updateMetadata('distance', distance, index === distances.length - 1)"
          >
            {{ distance ?? "自定义" }}
          </view>
        </view>
      </van-tab>
      <van-tab title="靶纸">
        <view class="scoring-setting--list target-list">
          <view
            v-for="targetFace in targetFaceKeys"
            :key="targetFace"
            :class="{
              'target-item': true,
              'target-item--active': session?.metadata?.targetFace === targetFace,
            }"
            @tap="preUpdateTargetFace(targetFace)"
          >
            {{ targetFace }}
          </view>
        </view>
      </van-tab>
      <van-tab title="组数/箭数">
        <view class="scoring-setting--list group-list">
          <view class="group-item">
            <text class="group-item--label">组数</text>
            <view
              :class="['group-item--value', {'group-item--value--active': session?.metadata?.numberOfPhases}]"
              @tap="handleToggleGroupVisible(true)"
            >
              <text class="text"> {{ session?.metadata?.numberOfPhases ?? UNLIMITED }}  </text>
              <van-icon class="down-icon" name="play" />
            </view>
          </view>
          <view class="group-item">
            <text class="group-item--label">每组</text>
            <view
              :class="['group-item--value', {'group-item--value--active': session?.metadata?.numberOfEnds}]"
              @tap="handleToggleGroupVisible(false)"
            >
              <text class="text"> {{ session?.metadata?.numberOfEnds ?? UNLIMITED }} </text>
              <van-icon class="down-icon" name="play" />
            </view>
          </view>
        </view>
      </van-tab>
    </van-tabs>
  </van-popup>

  <!-- 组数/箭数 -->
  <van-popup
    :show="scoringSettings.isNumberOfPhasesOrEndsPopupVisible"
    position="bottom"
    :round="true"
    :z-index="1000"
    custom-class="select-group--popup"
  >
    <van-picker
      :title="`选择${scoringSettings.isSelectingNumberOfPhases ? '组' : '箭'}数`"
      :show-toolbar="true"
      :columns="scoringSettings.isSelectingNumberOfPhases ? numberOfPhasesOptions : numberOfEndsOptions"
      :default-index="
        (scoringSettings.isSelectingNumberOfPhases
          ? session?.metadata?.numberOfPhases
          : session?.metadata?.numberOfEnds) ?? 0
      "
      value-key="label"
      @confirm="handleNumberOfPhasesOrEndsConfirm"
      @cancel="scoringSettings.isNumberOfPhasesOrEndsPopupVisible = false"
    />
  </van-popup>

  <Modal
    v-model:show="scoringSettings.isCustomDistanceVisible"
    title="输入记分距离"
    :show-cancel-button="false"
    @confirm="updateMetadata('distance', scoringSettings.customDistance)"
  >
    <view class="custom-distance-modal">
      <input v-model="scoringSettings.customDistance" class="custom-distance-input" type="digit" />m
    </view>
  </Modal>

  <Modal
    v-model:show="scoringSettings.isUpdatingTargetFaceVisible"
    title="确认修改靶纸？"
    confirm-button-text="确认"
    cancel-button-text="取消"
    @confirm="updateMetadata('targetFace', scoringSettings.newTargetFace)"
    @cancel="scoringSettings.isUpdatingTargetFaceVisible = false"
  >
    <view>
      当前靶纸上已有落点，更换靶纸可能会导致落点与环数不符。
    </view>
  </Modal>
</template>

<script setup lang="ts">
import {
  computed, defineEmits, defineProps, reactive,
} from "vue";
import { useStore } from "vuex";

import useToolkitScoringSessionConfig from "@/hooks/useToolkitScoringSessionConfig";
import { isDebugOrTrial } from "@/utils/version";
import Modal from "@ac/components/Modal.vue";
import { bowTypeListIcons } from "@ac/services/bowType";
import * as ruleHelpers from "@ac/services/ruleHelper";
import { targetFaces } from "@ac/services/utils/targetFace";

const props = defineProps<{
  sessionId: string;
  isVisible: boolean;
}>();

const emit = defineEmits([ "update:isVisible" ]);

const store = useStore();

const session = computed(() => store.getters[ "toolkitScoring/session" ]({ sessionId: props.sessionId }));

const config = useToolkitScoringSessionConfig(props.sessionId);

// metadata settings

const UNLIMITED = "不限";

interface ScoringSettings {
  isCustomDistanceVisible: boolean;
  customDistance: number | null;
  isUpdatingTargetFaceVisible: boolean;
  newTargetFace: string|null;
  isNumberOfPhasesOrEndsPopupVisible: boolean;
  isSelectingNumberOfPhases: boolean;
}

const scoringSettings = reactive<ScoringSettings>({
  isCustomDistanceVisible: false,
  customDistance: 0,
  isUpdatingTargetFaceVisible: false,
  newTargetFace: null,
  isNumberOfPhasesOrEndsPopupVisible: false,
  isSelectingNumberOfPhases: true,
});

const hasSetMetadata = computed(
  () => session?.value?.metadata != null && [
    "bowType", "distance", "targetFace", "numberOfPhases", "numberOfEnds",
  ].some((key) => session.value.metadata?.[key] != null),
);

const bowTypes = Object.values(ruleHelpers.bowTypes);

const distances = computed(() => {
  const values = [ ...Object.values(ruleHelpers.distances), null ];
  const currentDistance = session.value?.metadata?.distance;
  if (currentDistance != null && !values.includes(currentDistance)) {
    values[ values.length - 1 ] = currentDistance;
  }
  return values;
});

const targetFaceKeys = [
  ...Object.keys(targetFaces).filter((it) => it !== "DEFAULT"),
  // ...Object.values(ruleHelpers.targetFaces).filter((v) => ![ "原野", "萨仁靶" ].includes(v)),
  // ...ruleHelpers.clientOnlyTargetFaces,
];

const numberOfPhasesOptions = [ UNLIMITED, ...Array.from({ length: 40 }, (_, i) => i + 1) ];

const numberOfEndsOptions = [ UNLIMITED, ...Array.from({ length: 18 }, (_, i) => i + 1) ];

// Metadata methods

const updateMetadata = async (key, value, isCustomOption = false): Promise<void> => {
  if (key === "distance" && isCustomOption && !scoringSettings.isCustomDistanceVisible) {
    scoringSettings.isCustomDistanceVisible = true;
    return;
  }
  const mappedValue = value === session.value?.metadata?.[key] ? null : value;
  await store.dispatch("toolkitScoring/updateSessionConfig", {
    sessionId: props.sessionId,
    metadata: {
      [ key ]: mappedValue,
    },
  });
};

const handleNumberOfPhasesOrEndsConfirm = async ({ detail: { value } }): Promise<void> => {
  await updateMetadata(
    scoringSettings?.isSelectingNumberOfPhases ? "numberOfPhases" : "numberOfEnds",
    value === UNLIMITED ? null : parseInt(value, 10),
  );
  await store.dispatch("toolkitScoring/clean", { sessionId: props.sessionId, keepOneTrailingSpace: true });
  scoringSettings.isNumberOfPhasesOrEndsPopupVisible = false;
};

const handleToggleGroupVisible = (isSelectingNumberOfPhases = true): void => {
  scoringSettings.isSelectingNumberOfPhases = isSelectingNumberOfPhases;
  scoringSettings.isNumberOfPhasesOrEndsPopupVisible = true;
};

const handleCloseScoringSettings = (): void => {
  scoringSettings.isCustomDistanceVisible = false;
  scoringSettings.isNumberOfPhasesOrEndsPopupVisible = false;

  emit("update:isVisible", false);
};

const preUpdateTargetFace = async (newTargetFace: string): Promise<void> => {
  console.log(`switch to ${newTargetFace}`);
  scoringSettings.newTargetFace = newTargetFace;
  const user = store.getters[ "match/user" ](config);
  const hasValidPositions = user?.phases?.some((phase) =>
    phase?.positions?.some((position) => position != null) ?? false
  ) ?? false;
  if (hasValidPositions) {
    scoringSettings.isUpdatingTargetFaceVisible = true;
  } else {
    updateMetadata("targetFace", newTargetFace);
  }
};

</script>

<style lang="scss">
.scoring-setting-popup {
  padding: $padding-md;
 &--header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: $padding-sm;
    font-size: $font-size-lg;
  }
  &--title {
    font-weight: 600;
  }
  &--submit {
    color: $primary-color-1;
  }
  &--options {
    height: 50rpx;
    border-radius: $border-radius-md;
    padding: $padding-xs;
    background-color: $gray-1;
    display: flex;
    align-items: center;
    .no-options {
      font-size: $font-size-sm;
      color: $gray-3;
    }
    .options--item {
      border: 2rpx solid $primary-color-1;
      color: $primary-color-1;
      border-radius: $border-radius-xxxl;
      padding: 0 $padding-xs;
      font-size: $font-size-sm;
      height: 50rpx;
      line-height: 48rpx;
      box-sizing: border-box;
      &:not(:last-child) {
        margin-right: $padding-xs;
      }
    }
  }
  .scoring-setting--list {
    border-top: 1rpx solid $gray-1;
    color: $gray-3;
    font-size: $font-size-sm;
    min-height: 245rpx;
    box-sizing: border-box;
  }
  .bow-list {
    display: grid;
    gap: $padding-sm;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: 160rpx;
    padding: $padding-md 0;
    .bow-item {
      border: 2rpx solid $gray-2;
      border-radius: $border-radius-xl;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: $padding-xs 0;
      .bow-icon {
        width: 100rpx;
        height: 100rpx;
      }
    }
    .bow-item--active {
      border-color: $primary-color-1;
      .bow-name {
        color: $primary-color-1;
      }
    }
  }
  .distance-list {
    display: grid;
    gap: $padding-md;
    justify-content: center;
    padding: $padding-md 0;
    grid-template-columns: repeat(4, 100rpx);
    grid-template-rows: repeat(2, 70rpx);
    grid-auto-rows: 70rpx;
    .distance-item {
      border: 2rpx solid $gray-2;
      border-radius: $border-radius-md;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .distance-item--active {
      border-color: $primary-color-1;
      color: $primary-color-1;
    }
  }
  .target-list {
    display: grid;
    gap: $padding-xs;
    justify-content: center;
    padding: $padding-md 0;
    grid-template-columns: repeat(4, calc((750rpx - 2 * $padding-md - 3 * $padding-xs) / 4));
    .target-item {
      border: 2rpx solid $gray-2;
      border-radius: $border-radius-md;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: $padding-xs 0;
    }
    .target-item--active {
      border-color: $primary-color-1;
      color: $primary-color-1;
    }
  }
  .group-list {
    display: flex;
    align-items: center;
    justify-content: center;
    .group-item {
      display: flex;
      align-items: center;
      justify-content: center;
      &--label {
        color: $primary-color-1;
        margin-right: $padding-xs;
      }
      &--value {
        width: 180rpx;
        height: 70rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2rpx solid $gray-2;
        border-radius: $border-radius-md;
        .text {
          width: 58rpx;
          margin-right: $padding-xs;
        }
        .down-icon {
          transform: rotate(90deg);
        }
      }
      &--value--active {
        border-color: $primary-color-1;
        color: $primary-color-1;
      }
      &:first-child {
        margin-right: $padding-lg;
      }
    }
  }
}

.custom-distance-modal {
  display: flex;
  align-items: center;
  justify-content: center;
  color: $black;
  .custom-distance-input {
    width: 120rpx;
    height: 96rpx;
    background-color: $gray-1;
    margin-right: $padding-xs;
  }
}

</style>
