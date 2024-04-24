<script setup>
import 'swiper/css';
import 'swiper/css/pagination';
import { Navigation, Pagination, Autoplay } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { getCurrentInstance, onMounted, ref } from 'vue';

const  modules = [Navigation, Pagination, Autoplay];
const { proxy } = getCurrentInstance();
const lists = ref([]);
const loading = ref(true);

const getBanner = async() => {
    const { data: res } = await proxy.$http.getBanner()

    if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败')
    }

    lists.value = res.banners;
    loading.value = false;
}

onMounted(() => {
    getBanner();
})
</script>

<template>
    <div class="banner">
        <el-skeleton :loading="loading" animated>
            <template #template>
                <el-skeleton-item class="skeleton-img" variant="image" />
                <el-skeleton-item class="skeleton-img" variant="image" />
                <el-skeleton-item class="skeleton-img" variant="image" />
            </template>
            <template #default>
                <swiper
                    :slides-per-view="3"
                    :space-between="30"
                    :modules="modules"
                    :autoplay="{ delay: 3000 }"
                    :pagination="{ clickable: true }"
                    v-if="lists" 
                    ref="mySwiper"
                    class="banner_wrap"
                >
                    <swiper-slide v-for="item of lists" :key="item.imageUrl">
                        <el-image :src="item.imageUrl" :alt="item.typeTitle" class="banner_img">
                            <template #placeholder>
                                <div class="image-slot">
                                    <i class="iconfont icon-placeholder"></i>
                                </div>
                            </template>
                        </el-image>
                    </swiper-slide>
                </swiper>
            </template>
        </el-skeleton>
    </div>
</template>

<style lang='less' scoped>
// 轮播图的宽度
@w: calc((@containerWidth - 90px) / 3);
.banner {
    padding-bottom: 30px;
    font-size: 0;
}
.banner_wrap {
    position: relative;
    padding: 35px 0;
    .calcHeight(@w, 1080, 400);

    .banner_img {
        width: 100%;
        height: 100%;
        cursor: pointer;
    }

    .swiper-slide, .el-image {
        .calcHeight(@w, 1080, 400);
    }
}

.el-skeleton {
    display: flex;
    justify-content: space-between;
    padding: 35px 0;

    .skeleton-img {
        flex: 1;
        .calcHeight(@w, 1080, 400);
        margin-right: 30px;

        &:last-child {
            margin: 0;
        }
    }
}

.swiper {
    // opacity: .1;

    .swiper-slide {
        border-radius: var(--border-radius);
        box-shadow: var(--t-modal-shadow);
        overflow: hidden;
    }
    :deep(.swiper-pagination-bullet-active) {
        width: 15px;
        border-radius: var(--border-radius);
        background: var(--t-primary-color);
    }
}
</style>