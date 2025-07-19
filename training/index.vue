<template>
  <scroll-page :left-arrow="false">
    <view class="training-index">
      <view class="training-nav-content">
        <van-nav-bar custom-class="training-nav" :border="false" />
        <view class="training-nav training-menu">
          <template v-for="item in menuList" :key="item.id">
            <menu-item
              v-bind="item"
              :active="state.activeMenu === item.id"
              @tap="changeMenu(item)"
            />
          </template>
        </view>
      </view>
      <view class="training-layout">
        <component :is="state.view" />
      </view>
    </view>
  </scroll-page>
</template>

<script setup lang="ts">
import Taro from "@tarojs/taro";
import {
  ref, reactive, markRaw, provide,
} from "vue";

// import Analysis from "./analysis.vue";
import MenuItem from "./components/menu-item.vue";
import History from "./history.vue";
import Training from "./training.vue";

// import AnalysisIcon from "@/assets/images/analysescore.svg";
import HistoryIcon from "@/assets/images/historyscore.png";
import TrainingIcon from "@/assets/images/training.png";
import ScrollPage from "@ac/components/ScrollPage.vue";

const isJoinGroupChatVisible = ref<boolean>(false);

provide("isJoinGroupChatVisible", isJoinGroupChatVisible);

definePageConfig({
  navigationBarTitleText: "训练",
  navigationStyle: "custom",
});

interface State {
  activeMenu: number;
  iconStyle?: string;
  view: any;
}

interface MenuItem {
  id: number;
  menuIcon: string;
  name: string;
  iconStyle?: string;
  disabled: boolean;
  view: any;
}

const menuList: MenuItem[] = [
  {
    id: 0,
    menuIcon: TrainingIcon,
    name: "训练",
    view: markRaw(Training),
    disabled: false,
  },
  {
    id: 1,
    menuIcon: HistoryIcon,
    name: "历史",
    iconStyle: "width: 60rpx; height: 60rpx;",
    view: markRaw(History),
    disabled: false,
  },
  // {
  //   id: 2,
  //   menuIcon: AnalysisIcon,
  //   name: "分析",
  //   iconStyle: "width: 68rpx; height: 68rpx;",
  //   view: markRaw(Analysis),
  //   disabled: true,
  // },
];

const state = reactive<State>({
  activeMenu: 0,
  view: Training,
});

const changeMenu = (item: MenuItem): void => {
  if (item.disabled) {
    Taro.showToast({ title: "即将开放", icon: "none" });
    return;
  }
  state.activeMenu = item.id;
  state.view = item.view;
};
</script>

<style lang="scss">
page {
  @extend .scroll-page--page;
}
.training-index {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  .training-nav-content {
    flex: none;
    .training-nav {
      background-color: $yellow-1 !important;
    }
    .training-menu {
      padding: 0 $padding-sm $padding-sm $padding-sm;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      column-gap: $padding-sm;
    }
  }
  .training-layout {
    flex: 1;
    overflow-y: auto;
  }
}
</style>
