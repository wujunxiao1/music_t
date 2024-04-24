<script setup>
import { } from 'vue';

import albumMain from '@components/AlbumMain.vue'

const props = defineProps({
    albumList: Array,
});

</script>

<template>
    <div class="album-main">
        <div class="item" v-for="item in props.albumList" key="id">
            <album-main :info="item"></album-main>
        </div>
    </div>
</template>

<style lang='less' scoped>
.album-main {
    display: flex;
    font-size: 0;
    flex-wrap: wrap;
    justify-content: space-between;
    padding-bottom: 30px;
    margin: 0 -10px;

    &::after {
        display: inline-block;
        content: '';
        flex: 1;
    }
}

.item {
    width: calc(100% / 5 - 20px);
    margin: 10px;
}
</style>