<script setup>
import { ref, getCurrentInstance, computed, onBeforeMount } from 'vue';
import store from '@store/index';
import { useRoute } from 'vue-router';

const { proxy } = getCurrentInstance();
const route = useRoute();
const loginDialog = store.loginDialogStore();
const accountStore = store.accountInfoStore();
const playerSettingStore = store.playerSettingStore();
const searchWords = ref('');

const isLogin = computed(() => accountStore.getLogin);
const accountInfo = computed(() => accountStore.getAccountInfo);

const loginHanlder = () => {
    loginDialog.loginDialogVisible = true;
};

const toggleTheme = () => {
    playerSettingStore.themeMode = !playerSettingStore.themeMode;
    setThemeMode(playerSettingStore.themeMode);
    playerSettingStore.setPlayerSetting('themeMode', playerSettingStore.themeMode);
}

const setThemeMode = (mode) => {
    document.querySelector('html').className = mode ? 'dark' : '';
}

onBeforeMount(() => {
    setThemeMode(playerSettingStore.themeMode);
});

const logout = async() => {
    const { data: res } = await proxy.$http.logout()

    if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败')
    }

    proxy.$msg.success('退出成功')
    window.localStorage.removeItem('cookie')
    window.localStorage.removeItem('accountInfo');
    window.localStorage.removeItem('isLogin');
    
    accountStore.logout();

    if (route.path.indexOf('/my') >= 0) {
        router.push({ path: '/' })
    }
};
</script>
<template>
    <el-header class="header">
        <!-- 搜索框 -->
        <div class="search">
            <el-input class="search-ipt" v-model="searchWords" placeholder="请输入歌名、歌词、歌手或专辑" clearable />
        </div>
        <!-- 用户操作：登录注册退出 -->
        <div class="user-info">
            <div class="logined" v-if="isLogin">
                <el-dropdown trigger="click">
                    <el-image :src="accountInfo.avatarUrl" class="avatar">
                        <template #placeholder>
                            <i class="iconfont icon-placeholder"></i>
                        </template>
                    </el-image>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item>Action 1</el-dropdown-item>
                            <el-dropdown-item> Action 2</el-dropdown-item>
                            <el-dropdown-item>Action 3</el-dropdown-item>
                            <el-dropdown-item>Action 4</el-dropdown-item>
                            <el-dropdown-item @click="logout">退出</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
            <span class="login-btn" @click="loginHanlder" v-else>登录</span>
        </div>
        <div class="toggle-theme">
            <div :class="['theme-box', {'active' : !playerSettingStore.themeMode}]" @click="toggleTheme">
                <div class="theme-icon">
                    <i class="iconfont icon-light"></i>
                    <i class="iconfont icon-dark"></i>
                </div>
            </div>
        </div>
    </el-header>
</template>

<style lang="less" scoped>
.header {
    position: fixed;
    right: 0;
    z-index: 98;
    width: calc(100% - @menuWidth);
    display: flex;
    padding: 0 @paddingW;
    justify-content: flex-end;
    align-items: center;
    height: 60px;
    // border-radius: var(--border-radius);
    background: var(--box-background);
    box-shadow: var(--t-modal-shadow);
}

.search {
    position: relative;
}

.user-info {
    padding: 0 0 0 20px;
    text-align: center;

    .avatar {
        display: inline-block;
        width: 30px;
        height: 30px;
        border-radius: var(--border-radius);
        overflow: hidden;
        cursor: pointer;
    }

    .logined {
        display: flex;
        align-items: center;

        span {
            display: inline-block;
            font-weight: 300;
            padding: 0 10px;
            cursor: pointer;
        }

        .iconfont {
            color: var(--color-text-main);
            vertical-align: top;
        }
    }

    .login-btn {
        font-size: 16px;
        cursor: pointer;

        &:hover {
            text-decoration: underline;
        }
    }
}

.toggle-theme {
    padding-left: 20px;

    .theme-icon {
        display: flex;
        justify-content: space-around;
    }
}
.theme-box {
    position: relative;
    width: 40px;
    height: 20px;
    line-height: 20px;
    border-radius: var(--border-radius);
    cursor: pointer;
    background: var(--btn-background);
    box-shadow: inset var(--t-modal-shadow);

    &::after {
        position: absolute;
        top: 2px;
        left: 2px;
        content: '';
        display: inline-block;
        width: 16px;
        height: 16px;
        border-radius: var(--border-radius);
        background: var(--box-background);
        transition: all .3s ease-in;
    }

    &.active {
        .icon-dark {
            opacity: 0;
        }

        .icon-light {
            opacity: 1;
        }

        &::after {
            left: 100%;
            margin-left: -18px;
        }
    }

    .iconfont {
        width: 20px;
        text-align: center;
        transition: opacity .2s ease-in;
    }

    .icon-light {
        opacity: 0;
    }
}
</style>