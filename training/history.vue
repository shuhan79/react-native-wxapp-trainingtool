<template>
  <scroll-page
    :title="title"
    :scroll-y="true"
    :scroll-with-animation="true"
    :refresher-enabled="true"
    :refresher-triggered="pagingState.isRefreshing"
    @refresherrefresh="refresh"
    @scrolltolower="loadMore"
  >
    <view class="toolkit-scoring-history--header">
      <view class="toolkit-scoring-history--header--cell van-hairline--right">
        <view class="title">总训练量</view>
        <view class="value">{{ statistics?.totalNumberOfEnds ?? "--" }}<text class="unit">支箭</text></view>
      </view>
      <view class="toolkit-scoring-history--header--cell">
        <view class="title">总训练时长</view>
        <view class="value">{{ statistics?.numberOfDaysRecorded ?? "--" }}<text class="unit">天</text></view>
      </view>
    </view>

    <view
      class="toolkit-scoring-history--current-month"
      @tap="isDateTimePickerVisible = true"
    >
      {{ dayjs(pagingState.timestamp).format("YYYY年M月") }}
    </view>

    <view v-if="!pagingState.isEmpty" class="toolkit-scoring-history--sessions">
      <view
        v-for="session in pagingState.sessions"
        :key="`toolkit-scoring-history-session-${session.sessionId}`"
        class="toolkit-scoring-history--session"
        @click="navigateToSession(session.sessionId)"
      >
        <view class="left">
          <view class="date-time">{{ session.createTime?.format("YYYY-MM-DD HH:MM") }}</view>
          <view class="bow-type-score">
            <view class="bow-type">{{ session.metadata?.bowType ?? "未填写弓种" }}</view>
            <view class="score">{{ session.totalScore }}<text class="unit">环</text></view>
          </view>
          <view class="other-metadata">
            <view class="distance-target-face after-dot">
              {{ session.metadata?.distance == null && session.metadata?.targetFace == null ? "未填写距离靶纸" :
                (session.metadata?.distance ?? "") + "" + (session.metadata?.targetFace ?? "") }}
            </view>
            <view class="number-of-arrows">TODO</view>
          </view>
        </view>
        <view class="right">
          <template v-if="session.metadata?.bowType">
            <van-image custom-class="bow-icon" :src="bowTypeListIcons[session.metadata?.bowType]"></van-image>
          </template>
        </view>
      </view>
      <view v-if="pagingState.isLoading && !pagingState.isRefreshing">加载中...</view>
    </view>

    <van-empty
      v-if="pagingState.isEmpty"
      description="暂无数据"
    />
  </scroll-page>

  <van-popup
    :show="isDateTimePickerVisible"
    position="bottom"
    :close-on-click-overlay="true"
    :overlay="true"
    @close="isDateTimePickerVisible = false"
  >
    <van-datetime-picker
      type="year-month"
      :max-date="+dayjs()"
      :value="pagingState.timestamp"
      @cancel="isDateTimePickerVisible = false"
      @confirm="onMonthChange"
    />
  </van-popup>
</template>

<script setup lang="ts">
import Taro from "@tarojs/taro";
import dayjs from "dayjs";
import { reactive, ref, defineProps } from "vue";
import { useStore } from "vuex";

import * as pages from "@/pages.config";
import ScrollPage from "@ac/components/ScrollPage.vue";
import { bowTypeListIcons } from "@ac/services/bowType";

import type { ToolkitScoringSession } from "@ac/services/model/ToolkitScoringSession";

definePageConfig({
  navigationBarTitleText: "我的记分",
  disableScroll: true,
  navigationStyle: "custom",
});

defineProps<{ title?: string }>();

const store = useStore();

// Paging

interface PagingState {
  timestamp: number;

  sessions: Array<ToolkitScoringSession>;

  isLoading: boolean;
  isEmpty: boolean;
  isLast: boolean;

  isRefreshing: boolean;

}

const pagingState = reactive<PagingState>({
  timestamp: +dayjs(),

  sessions: [],

  isLoading: false,
  isEmpty: true,
  isLast: true,

  isRefreshing: false,
});

let page = 0;

const getNextPageData = async (): Promise<Array<ToolkitScoringSession> | undefined> => {
  if (pagingState.isLoading) return undefined;
  pagingState.isLoading = true;
  try {
    const { list } = await store.dispatch("toolkitScoring/getToolkitScoringSessions", {
      month: dayjs(pagingState.timestamp).format("YYYY-MM"),
      page: page + 1,
    });
    pagingState.isEmpty = Boolean(!list.length);
    pagingState.isLast = list.length < 10; // TODO
    pagingState.isLoading = false;
    return list;
  } catch (e) {
    pagingState.isLoading = false;
    await Taro.showToast({
      title: e.errMsg ?? e.message ?? "未知错误",
      icon: "error",
    });
    return undefined;
  }
};

const loadMore = async (): Promise<void> => {
  if (pagingState.isLoading) return;
  if (pagingState.isLast) {
    // TODO: show reached end text on ui instead of toast
    return;
  }
  const list = await getNextPageData();
  page += 1;
  pagingState.sessions = [ ...pagingState.sessions, ...(list ?? []) ];
};

const reset = (): void => {
  page = 0;
  pagingState.sessions = [];
  pagingState.isEmpty = false;
  pagingState.isLast = false;
};

const refresh = async (): Promise<void> => {
  pagingState.isRefreshing = true;
  reset();
  await loadMore();
  pagingState.isRefreshing = false;
};

const isDateTimePickerVisible = ref(false);

const onMonthChange = ({ detail }): void => {
  isDateTimePickerVisible.value = false;
  if (pagingState.timestamp === detail) return;
  pagingState.timestamp = detail;
  refresh();
};

// Month selector

// Statistics

const statistics = ref<{
  totalNumberOfEnds: number;
  numberOfDaysRecorded: number;
} | null>(null);
const pullUserStatistics = async (): Promise<void> => {
  statistics.value = null;
  statistics.value = await store.dispatch("toolkitScoring/getUserStatistics");
};

refresh();
pullUserStatistics();

const navigateToSession = async (sessionId: string): Promise<void> => {
  const mode = store.getters[ "toolkitScoring/config" ]?.mode;
  if (mode === "target-view") {
    await Taro.navigateTo({ url: `/${pages.TOOLKIT_PAGE_SCORING_TARGET_VIEW}?sessionId=${sessionId}` });
  } else {
    await Taro.navigateTo({ url: `/${pages.TOOLKIT_PAGE_SCORING_SCORE_SHEET}?sessionId=${sessionId}` });
  }
};

</script>

<style lang="scss">
page {
  @extend .scroll-page--page;

  background: $background-color;

  width: 100%;
  height: 100%;
}

.toolkit-scoring-history--header {
  display: flex;
  align-items: stretch;

  margin: $padding-sm;
  padding: $padding-sm;

  background-color: $white;
  border-radius: $border-radius-xl;

  &--cell {
    flex: 1;

    display: flex;
    flex-direction: column;
    align-items: center;

    .title {
      font-size: $font-size-md;
      color: $gray-4;

      margin-bottom: $padding-xs;
    }

    .unit {
      font-size: $font-size-sm;
      margin-left: $padding-base;
    }
  }
}

.toolkit-scoring-history--current-month {
  padding: 0 $padding-sm;

  margin-bottom: $padding-sm;

  font-size: $font-size-xl;
  line-height: $line-height-xl;

  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 0;
    height: 0;
    margin-top: -3px;
    margin-left: 3px;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid $black;
    clear: both;
  }
}

.toolkit-scoring-history--sessions {
  padding: 0 $padding-sm;

  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.toolkit-scoring-history--session {
  background-color: $white;
  padding: $padding-sm;
  margin-bottom: $padding-sm;

  border-radius: $border-radius-md;

  display: flex;
  flex-direction: row;

  .left {
    flex: 1;
    display: flex;
    flex-direction: column;

    .date-time {
      font-size: $font-size-sm;
      line-height: $line-height-sm;
    }

    .bow-type-score {
      flex: 1;
      display: flex;
      flex-direction: row;
      align-items: flex-end;

      font-size: $font-size-xl;
      line-height: $line-height-xl;

      padding: $padding-xs 0;

      .bow-type {
        margin-right: $padding-sm;
      }

      .score {
        color: $blue-1;
        .unit {
          font-size: $font-size-md;
          line-height: $line-height-md;
        }
      }
    }

    .other-metadata {
      display: flex;
      flex-direction: row;
      align-items: center;

      font-size: $font-size-sm;
      line-height: $line-height-sm;

      color: $gray-3;

      position: relative;

      .after-dot {
        margin-right: $padding-xs;
        &::after {
          $size: 2px;

          display: inline-block;
          content: "\A";
          width: $size;
          height: $size;
          border-radius: $size;
          background-color: $gray-3;

          position: absolute;
          top: 50%;
          margin-top: -$size * 0.5;
          margin-left: $padding-xs * 0.5 - $size * 0.5;
        }
      }
    }
  }
  .right {
    .bow-icon {
      width: 144rpx;
      height: 100%;
    }
  }
}
</style>
