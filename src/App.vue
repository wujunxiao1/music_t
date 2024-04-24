<template>
    <!-- 页面主体边框 -->
    <el-container>

        <!-- 页面左侧导航 -->
        <Sidebar />

        <!-- 页面内容主体 -->
        <el-main>
            <!-- 主体部分，顶部搜索及登录部分 -->
            <Header />

            <!-- 主体部分，页面渲染区域 -->
            <div class="container">
                <router-view></router-view>
            </div>
        </el-main>

        <!-- 登录框模块 -->
        <Login />
        <!-- 音乐播放条 -->
        <Playbar @setCurrentTime="setCurrentTime" />
    </el-container>
</template>
<script setup>
import Sidebar from '@components/Sidebar.vue';
import Header from '@components/Header.vue';
import Playbar from '@components/Playbar.vue'
import Login from '@components/Login.vue';

import { ref, provide } from 'vue';

const currentTime = ref(0);

// 当前音频的播放时长
const setCurrentTime = (t) => {
    currentTime.value = t;
};

// 下发当前音频时间戳
provide('currentTime', currentTime);
</script>

<style lang="less">
    .container {
        padding: 65px @paddingW 70px;
    }

    .el-main {
        padding: 0;
        background: var(--main-background);
    }
</style>
