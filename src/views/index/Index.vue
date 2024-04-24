<script setup>
import Banner from "@views/index/Banner.vue";
import PlayList from '@components/PlayList.vue';
import AlbumList from '@components/AlbumList.vue';
import RankList from '@views/index/RankList.vue';
import MvList from '@components/MvList.vue';
import DjList from '@views/index/DjList.vue';
import ArtistList from '@views/index/ArtistList.vue';

import { hotPlayList } from '@assets/js/index/hot';
import { newAlbumList } from '@assets/js/index/album';
import { newMvList } from '@assets/js/index/mv';

// 热门推荐
const { playlist_info, choosePlayListTag } = hotPlayList();

const { album_info, chooseAlbumTag } = newAlbumList();

const { mv_info, chooseMvTag } = newMvList();
</script>
<template>
    <Banner />

    <div class="card">
        <div class="card-title">
            <h3>热门推荐</h3>
            <span v-for="(item, index) in playlist_info.tags" :key="item.id" :class="{'active': index == playlist_info.index}" @click="choosePlayListTag(index)">{{item.name}}</span>
        </div>
        <div class="card-body">
            <play-list :playList="playlist_info.lists" :loading="playlist_info.loading" :num="playlist_info.params.limit"></play-list>
        </div>
    </div>

    <div class="card">
        <div class="card-title">
            <h3>新碟上架</h3>
            <span v-for="(item, index) in album_info.tags" :key="item.id" :class="{'active': index == album_info.index}" @click="chooseAlbumTag(index)">{{item.name}}</span>
        </div>
        <div class="card-body">
            <album-list :albumList="album_info.lists" :loading="album_info.loading" :num="album_info.params.limit"></album-list>
        </div>
    </div>

    <div class="card-box">
        <rank-list />
    </div>

    <div class="card">
        <div class="card-title">
            <h3>最新MV</h3>
            <span v-for="(item, index) in mv_info.tags" :key="item.id" :class="{'active': index == mv_info.index}" @click="chooseMvTag(index)">{{item}}</span>
        </div>
        <div class="card-body">
            <mv-list :mvList="mv_info.lists" :loading="mv_info.loading" :num="mv_info.params.limit"></mv-list>
        </div>
    </div>

    <div class="card-box">
        <div class="card card-dj">
            <div class="card-title">
                <h3>热门电台</h3>
            </div>
            <dj-list />
        </div>
        <div class="card card-artist">
            <div class="card-title">
                <h3>热门歌手</h3>
            </div>
            <artist-list />
        </div>
    </div>
</template>
<style lang="less" scoped>
.card {
    padding: 0 20px;
    margin-bottom: 20px;
    box-shadow: var(--t-modal-shadow);
    background: var(--box-background);
    border-radius: var(--border-radius);

    .card-title {
        padding: 30px 0 10px;

        h3 {
            display: inline-block;
            padding-right: 20px;
            font-size: 20px;
            line-height: 20px;
            font-weight: 400;
            color: var(--t-text-color);
        }

        span {
            display: inline-block;
            font-size: 14px;
            margin: 0 20px 0 0;
            color: var(--t-muted-color);
            font-weight: 300;
            cursor: pointer;

            &.active {
                position: relative;
                z-index: 1;
                font-weight: 400;

                &:after {
                    position: absolute;
                    content: "";
                    left: 0;
                    bottom: 1px;
                    width: 100%;
                    height: 4px;
                    background: var(--t-primary-color);
                    z-index: -1;
                }
            }
        }
    }
}

.card-box {
    display: flex;

    .card-dj {
        flex: 1;
        margin-right: 20px;
    }

    .card-artist {
        width: 440px;
    }
}
</style>