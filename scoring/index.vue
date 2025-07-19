<template>
  <scroll-page title="记分工具">
    <view class="header-button-container">
      <van-button
        type="primary"
        size="large"
        :block="true"
        icon="plus"
        @click="startNewSession"
      >
        开始记分
      </van-button>
    </view>

    <van-cell-group title="进行中">
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
          :center="true"
          :title="dayjs(session.createTime).format('YYYY-MM-DD HH:mm:ss')"
          :is-link="true"
          :border="index < pendingSessions.length - 1"
          @click="navigateToSession(session.id)"
        />
        <slot-view :name="`right`">删除</slot-view>
      </van-swipe-cell>
      <view
        v-if="_isEmpty(pendingSessions)"
        style="background: white;"
      >
        <van-empty
          description="无记录"
        ></van-empty>
      </view>
    </van-cell-group>
  </scroll-page>
</template>

<script setup lang="ts">
import Taro, { useReady } from "@tarojs/taro";
import dayjs from "dayjs";
import _isEmpty from "lodash/isEmpty";
import { computed } from "vue";
import { useStore } from "vuex";

import * as pages from "@/pages.config";
import ScrollPage from "@ac/components/ScrollPage.vue";

definePageConfig({
  navigationBarTitleText: "记分工具",
  disableScroll: true,
  navigationStyle: "custom",
});

const store = useStore();

const navigateToSession = async (sessionId: string): Promise<void> => {
  const mode = store.getters[ "toolkitScoring/config" ]?.mode;
  if (mode === "target-view") {
    await Taro.navigateTo({ url: `/${pages.TOOLKIT_PAGE_SCORING_TARGET_VIEW}?sessionId=${sessionId}` });
  } else if (mode === "analytics") {
    await Taro.navigateTo({ url: `/${pages.TOOLKIT_PAGE_SCORING_ANALYTICS}?sessionId=${sessionId}` });
  } else {
    await Taro.navigateTo({ url: `/${pages.TOOLKIT_PAGE_SCORING_SCORE_SHEET}?sessionId=${sessionId}` });
  }
};

const startNewSession = async (): Promise<void> => {
  const sessionId = await store.dispatch("toolkitScoring/startNewSession");
  navigateToSession(sessionId);
};

const pendingSessions = computed(() => store.getters[ "toolkitScoring/pendingSessions" ]);

const onClose = async ({ detail }, sessionId: string): Promise<void> => {
  store.dispatch("toolkitScoring/deleteSession", { sessionId });
  detail.instance.close();
};

// Auto start new session when there is none pending
useReady(() => {
  const localPendingSessions = store.getters[ "toolkitScoring/pendingSessions" ];
  if (localPendingSessions == null || localPendingSessions.length === 0) {
    startNewSession();
  }
});
</script>

<style lang="scss">
page {
  @extend .scroll-page--page;

  background: $background-color;

  width: 100%;
  height: 100%;
}

.header-button-container {
  padding: $padding-md;
}

.van-swipe-cell__right {
  display: inline-block;
  width: 65px;
  height: 100%;
  color: #fff;
  background-color: #ee0a24;

  display: flex;
  align-items: center;
  justify-content: center;
}

</style>
