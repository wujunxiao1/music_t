<script setup>
import { computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();   // 当前路由地址
const router = useRouter(); // 路由实例
const navList = reactive([{ // 一般是后端返回的整个网站的导航菜单
    name: '首页',
    path: 'index'
}, {
    name: '排行榜',
    path: 'rank'
}, {
    name: '歌单',
    path: 'playlist'
}, {
    name: 'MV',
    path: 'mvlist'
}, {
    name: '歌手',
    path: 'singer'
}, {
    name: '我的音乐',
    path: 'my'
}]);

//获取当前的路由地址
const curNav = computed(() => route.path);

// 当前当前菜单，导航到该菜单的URL
// 这个方法会向 history 栈添加一个新的记录，所以，当用户点击浏览器后退按钮时，会回到之前的 URL。
const selectNav = (item) => {
    router.push({
        path: `/${item.path}`
    })
};
</script>

<template>
    <el-aside class="side-main">
        <router-link to="/" class="logo">
            <img src="@/assets/img/logo.jpg">
        </router-link>
        <ul class="nav">
            <li :class="{'is-active': curNav.indexOf(item.path) >= 0}" v-for="item in navList" :key="item.path" @click="selectNav(item)">
                <i :class="[`iconfont`, `icon-${item.path}`]"></i> <span>{{item.name}}</span>
            </li>
        </ul>
    </el-aside>
</template>

<style lang="less" scoped>
.side-main {
    position: relative;
    z-index: 100;
    width: @menuWidth;
    text-align: center;
    box-shadow: var(--t-modal-shadow);
    background: var(--box-background);
}
.logo {
    display: inline-block;
    width: 145px;
    padding: 20px;
    border-bottom: 1px solid #f5f5f5;
    margin: 0 auto;
    font-size: 0;
}
.nav {
    padding-top: 50px;

    li {
        display: block;
        padding: 10px;
        margin: 10px 20px;
        border-radius: var(--border-radius);
        color: var(--t-text-color);
        text-align: left;
        cursor: pointer;

        &.is-active {
            color: var(--t-highlight-color);
            font-weight: 400;
            // border-right: 4px solid var(--t-highlight-color);
            background: var(--t-muted-background);

            .iconfont {
                color: var(--t-highlight-color);
            }
        }

        span {
            display: inline-block;
            line-height: 32px;
        }
    }

    .iconfont {
        display: inline-flex;
        width: 32px;
        height: 32px;
        margin-right: 20px;
        justify-content: center;
        align-items: center;
        font-size: 20px;
        color: var(--t-text-color);
        vertical-align: top;
    }
}

</style>