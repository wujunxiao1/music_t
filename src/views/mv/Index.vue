<script setup>
import CommentList from '@components/Comments.vue'
import { getCurrentInstance, onMounted, reactive } from 'vue';
import { onBeforeRouteUpdate, useRoute } from 'vue-router';

import 'vue3-video-play/dist/style.css'
import { videoPlay } from 'vue3-video-play'

const { proxy } = getCurrentInstance();
const route = useRoute();
const info = reactive({
    mId: '0',
    mvDetail: {},
    type: 1, // 0: 歌曲 1: mv 2: 歌单 3: 专辑  4: 电台 5: 视频 6: 动态
    videoOptions: {
        src: "", //视频源
        poster: "",
    },
    simiMv: [],
});

const getMvDetail = async() => {
    const { data: res } = await proxy.$http.mvDetail({ id: info.mId })

    if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败')
    }
    
    info.mvDetail = res.data;
    info.videoOptions.poster = res.data.cover;
};

const getMvUrl = async(r) => {
    const { data: res } = await proxy.$http.mvUrl({ id: info.mId, r })

    if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败')
    }

    info.videoOptions.src = res.data.url;
};

const getSimiMv = async() => {
    const { data: res } = await proxy.$http.simiMv({ id: info.mId })

    if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败')
    }
    
    info.simiMv = res.mvs
};

onBeforeRouteUpdate(() => {
    info['mId'] = route.query.id;
    _initialize(); 
})
onMounted(() => {
    info['mId'] = route.query.id;
    _initialize(); 
})

const _initialize = () => {
    if (info['mId']) {
        getMvDetail();
        getMvUrl();
        getSimiMv();
    }
}
</script>

<template>
    <div class="mv">
        <div class="mv-container">
            <div class="mv-main">
                <div class="mv-info-hd">
                    <div class="info-name">{{info.mvDetail.name}}</div>
                    <router-link :to="{ path: '/singer', query: { id: author.id }}" class="song-author" v-for="(author, k) in info.mvDetail.artists" :key="author.name">{{ k !== 0 ? ' / ' + author.name : author.name }}</router-link>
                </div>
                <div class="info-digital">
                    <span class="info-playCount"> <i class="iconfont icon-playnum"></i> {{$utils.formartNum(info.mvDetail.playCount)}}次播放</span>
                    <span class="info-collect"> <i class="iconfont icon-collect"></i> {{$utils.formartNum(info.mvDetail.subCount)}}次收藏</span>
                    <span class="info-comment"> <i class="iconfont icon-comment"></i> {{$utils.formartNum(info.mvDetail.commentCount)}}条留言</span>
                    <span class="info-time"> <i class="iconfont icon-time"></i> {{info.mvDetail.publishTime}}</span>
                </div>
                <div class="video-main">
                    <videoPlay 
                        width="100%" 
                        height="100%"
                        v-if="info.videoOptions.src"
                        :poster="info.videoOptions.poster"
                        :src="info.videoOptions.src" />
                    <el-image :src="info.videoOptions.poster" width="100%" height="100%" v-else>
                        <template #error>
                            <div class="image-slot">
                                <i class="iconfont icon-placeholder"></i>
                            </div>
                        </template>
                    </el-image>    
                </div>
                <div class="mv-desc">
                    {{ info.mvDetail.desc ? info.mvDetail.desc : '暂无简介'}}
                </div>
                <div class="mv-comment">
                    <comment-list :type="info.type" :sId="info.mId"></comment-list>
                </div>
            </div>
            <div class="mv-aside">
                <div class="aside-box mv-simi">
                    <div class="aside-title">相似MV</div>
                    <div class="aside-main simi-mv">
                        <template v-for="item in info.simiMv" key="id">
                            <mv-main :info="item"></mv-main>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang='less' scoped>
.mv-container {
    display: flex;
    padding: 35px 0 0 0;

    .mv-main {
        flex: 1;
    }

    .mv-aside {
        width: @sideWidth;
        padding-bottom: 25px;
        flex-shrink: 0;
        padding-left: @paddingW;
    }
}

.mv-info-hd {
    display: flex;
    align-items: flex-end;
    padding: 0 0 15px 0;

    .info-name {
        font-size: 28px;
        line-height: 28px;
        padding-right: 20px;
    }

    .song-author {
        line-height: 14px;
        font-weight: 300;
        color: var(--t-light-color);
    }
}

.info-digital {
    display: flex;
    padding-bottom: 25px;

    span {
        display: flex;
        color: var(--t-light-color);
        font-weight: 300;
        padding-right: 10px;
        line-height: 16px;
        align-items: center;
    }

    .iconfont {
        padding-right: 5px;
    }
}
.video-main {
    position: relative;
    height: 570px;
    font-size: 0;
}
.mv-desc {
    padding: 10px 0;
    font-size: 12px;
    color: var(--t-light-color);
    font-weight: 300;
}

.simi-mv {
    display: flex;
    flex-direction: column;
    
    .item {
        flex: 1;
        max-width: 100%;
        margin: 20px 0;
    }
}

.aside-box {
    padding: 20px 20px 0;
    margin-bottom: 20px;
    border-radius: var(--border-radius);
    box-shadow: var(--t-modal-shadow);

    .aside-title {
        position: relative;
        font-size: 16px;
        line-height: 16px;
        padding: 0 0 20px;
        color: var(--t-text-color);


        &::before {
            display: inline-block;
            content: '';
            width: 3px;
            height: 16px;
            margin-right: 5px;
            background: var(--t-muted-color);
            vertical-align: top;
            border-radius: var(--border-radius);
        }
    }
}
</style>