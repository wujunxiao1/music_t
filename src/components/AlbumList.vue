<script setup>
    const props = defineProps({
        albumList: Array,
        num: Number,
        loading: Boolean
    });
</script>
<template>
    <el-skeleton
        :loading="props.loading"
        animated
        :count="props.num"
        :throttle="500"
        >
        <template #template>
            <div class="item">
                <el-skeleton-item class="ske-img" variant="image" />
                <div class="ske-info">
                    <el-skeleton-item variant="h3" class="ske-name" />
                    <el-skeleton-item variant="h3" class="ske-name" style="width:50%" />
                    <el-skeleton-item variant="text" class="ske-txt" />
                </div>
            </div>
        </template>
        <template #default>
            <div class='album'>
                <router-link :to="{ path: '/album', query: { id: item.id }}" class="item" :key="item.id" v-for="item in props.albumList">
                    <div class="faceImg">
                        <el-image :src="item.picUrl + '?param=120y120'">
                            <div slot="placeholder" class="image-slot">
                                <i class="iconfont icon-placeholder"></i>
                            </div>
                        </el-image>
                    </div>
                    <div class="info">
                        <div class="album-name" v-if="item.name">{{item.name}}</div>
                        <div class="album-artist" v-if="item.artist">{{item.artist.name}}</div>
                        <div class="album-info"><span>{{item.type == 'Single' ? '单曲' : item.type}}</span><span>共{{item.size}}首</span></div>
                    </div>
                </router-link>
            </div>
        </template>
    </el-skeleton>
</template>
<style scoped lang="less">
.album {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: left;
    padding-bottom: 20px;
    margin: 0 -10px;
    font-size: 0;

    .item {
        display: flex;
        flex: 25%;
        margin: 20px 10px 0;
        border-radius: var(--border-radius);
        background: var(--t-container-background);

        &:hover {
            text-decoration: none;
            .album-name {
                color: var(--color-text-height);
            }

            .faceImg::after {
                right: -25px;
                transform: rotate(90deg);
            }
        }
    }

    .faceImg {
        display: block;
        position: relative;
        flex: 2;
        max-width: 120px;
        max-height: 120px;
        // width: 120px;
        // height: 120px;

        &::after {
            display: inline-block;
            content: '';
            position: absolute;
            top: 0;
            right: -20px;
            width: 100%;
            height: 100%;
            background: url('@assets/img/disc.png') no-repeat;
            background-size: contain;
            transition: all .4s linear;
        }

        &:hover {
            &::after {
                right: -25px;
                transform: rotate(90deg);
            }
        }
    }

    .el-image {
        border-radius: var(--border-radius);
        z-index: 2;
    }

    .info {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
        flex: 3;
        padding: 10px;
        margin-left: 30px;
        overflow: hidden;

        .album-name {
            font-size: 16px;
            line-height: 22px;
            font-weight: 400;
            height: 44px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            word-break: break-all;
            color: var(--t-muted-color);
        }

        .album-artist {
            font-size: 14px;
            height: 14px;
            color: var(--t-muted-color);
        }

        .album-info {
            display: flex;
            justify-content: space-between;
            line-height: 12px;
            font-size: 12px;
            font-weight: 300;
            color: var(--t-muted-color);
        }
    }
}

.el-skeleton {
    display: flex;
    width: auto;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: left;
    padding-bottom: 40px;
    margin: 0 -10px;
    font-size: 0;

    .item {
        display: flex;
        flex: 25%;
        margin: 20px 10px 0;
    }

    .ske-img {
        display: block;
        position: relative;
        width: 120px;
        height: 120px;
        line-height: 150px;
        text-align: center;
    }

    .ske-info {
        position: relative;
        flex: 1;
        margin: 5% 0 0 10%;
        overflow: hidden;
    }

    .ske-name {
        margin: 5px 0;
    }

    .ske-txt {
        display: block;
        margin-top: 10px;
        width: 10%;
    }
}
</style>
