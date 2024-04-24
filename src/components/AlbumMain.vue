<script setup>
import { toRefs } from "vue";

const props = defineProps({
    info: Object,
});

const { info } = toRefs(props);
</script>

<template>
<router-link :to="{ path: '/album', query: { id: info.id }}" class="album">
    <div class="album-img">
        <el-image :src="info.picUrl + '?param=120y120'">
            <div slot="placeholder" class="image-slot">
                <i class="iconfont icon-placeholder"></i>
            </div>
        </el-image>
        <div class="album-oper">
            <span class="oper-btn oper-collect" :class="[info.isSub ? 'active' : '']"><i :class="['iconfont', 'icon-collect' + (info.isSub ? '-active' : '')]"></i></span>
            <span class="oper-btn oper-play"><i class="iconfont icon-audio-play"></i></span>
            <span class="oper-btn oper-add"><i class="iconfont icon-add"></i></span>
        </div>
    </div>
    <div class="album-info">
        <div class="album-name">{{info.name}}</div>
        <div class="album-info-bottom">
            <div class="album-time">
                {{$utils.formartDate(info.publishTime, 'yyyy-MM-dd')}}
            </div>
            <div class="album-count">
                共{{ info.size }}首
            </div>
        </div>
    </div>
</router-link>
</template>

<style lang='less' scoped>
.album {
    text-decoration: none;

    &:hover {
        .album-oper {
            opacity: 1;
        }
    }
}

@w: calc((@mainWidth - 60px + 20px) / 5  - 20px);
.album-img {
    position: relative;
    height: @w;
    border-radius: var(--border-radius);
    overflow: hidden;
}

.album-oper {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity .5s ease-in;

    &::after {
        position: absolute;
        z-index: 1;
        content: '';
        display: inline-block;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, .1);
    }
}
.album-name {
    height: 40px;
    font-size: 14px;
    margin-top: 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    word-break: break-all;

    &:hover {
        color: var(--t-highlight-color);
    }
}

.album-info-bottom {
    display: flex;
    justify-content: space-between;

    .album-time, .album-count {
        line-height: 20px;
        font-size: 12px;
        font-weight: 300;
        color: var(--t-light-color);
    }
}

.oper-btn {
    position: relative;
    z-index: 9;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 36px;
    height: 36px;
    margin: 0 5px;
    background: var(--box-background);
    border-radius: 100%;
    box-shadow: var(--t-modal-shadow);

    .iconfont {
        font-size: 18px;
    }

    &.oper-play {
        width: 42px;
        height: 42px;
        background: var(--t-highlight-color);

        .iconfont {
            font-size: 26px;
            color: var(--white-color);
        }
    }

    &.active {
        .iconfont {
            color: var(--t-highlight-color);
        }
    }
}
</style>