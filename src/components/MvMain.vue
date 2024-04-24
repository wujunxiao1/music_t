<script setup>
import { toRefs } from "vue";

const props = defineProps({
    info: Object,
});

const { info } = toRefs(props);
</script>

<template>
    <router-link :to="{ path: '/mv', query: { id: info.id }}" class="item">
        <div class="faceImg">
            <i class="iconfont icon-mvlist"></i>
            <el-image :src="info.cover || info.imgurl">
                <div slot="placeholder" class="image-slot">
                    <i class="iconfont icon-placeholder"></i>
                </div>
            </el-image>
        </div>
        <div class="info">
            <div class="mv-name">{{info.name}}</div>
            <div class="mv-author" v-if="!info.publishTime">{{info.artistName}}</div>
            <div class="mv-playCount"><i class="iconfont icon-mvlist"></i> {{$utils.formartNum(info.playCount)}}</div>
            <div class="mv-time" v-if="info.publishTime">发布时间：{{info.publishTime}}</div>
        </div>
    </router-link>
</template>

<style lang='less' scoped>
.item {
    flex: 30%;
    max-width: calc(100% / 5 - 20px);
    margin: 20px 10px 0;
    border-radius: 4px;

    &:hover {
        text-decoration: none;
        .el-image {
            transform: scale(1.1);
        }

        .icon-mvlist {
            opacity: 1;
            transform: scale(1);
        }
    }
}

.faceImg {
    display: block;
    position: relative;
    width: 100%;
    height: 123px;
    overflow: hidden;
    border-radius: var(--border-radius);

    .icon-mvlist {
        position: absolute;
        top: 45%;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 3;
        margin-top: -30px;
        font-size: 60px;
        text-align: center;
        color: #fff;
        opacity: 0;
        transform: scale(.5);
        transition: all .4s linear;
        text-shadow: 2px 2px 10px #000;
    }
}

.el-image {
    display:flex;
    height: 100%;
    justify-content: center;
    align-items: center;
    z-index: 2;
    transition: all .4s linear;

    :deep(img) {
        height: auto;
    }
}

.info {
    position: relative;
    padding: 15px 0 0;

    .mv-name {
        display: block;
        font-size: 14px;
        height: 20px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        word-break: break-all;
        color: var(--t-muted-color);
    }

    .mv-author, .mv-playCount, .mv-time {
        display: block;
        line-height: 24px;
        font-size: 14px;
        font-weight: 300;
        color: var(--t-muted-color);
    }

    .icon-mvlist {
        display: inline-block;
        font-size: 18px;
        color: var(--t-light-color);
        vertical-align: top;
    }
}
</style>