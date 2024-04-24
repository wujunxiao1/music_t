import { getCurrentInstance, onMounted, reactive } from 'vue';

export function newAlbumList() {
    const { proxy } = getCurrentInstance();

    const album_info = reactive({
        tags: proxy.$AREA.ALBUM_AREA,  // 新碟上架标签列表
        lists: [], // 歌单列表
        index: 0,  // 当前选中标签
        loading: true,
        params: { limit: 6, offset: 0 }
    });

    // 新碟上架
    const getAlbumList = async(params) => {
        const { data: res } = await proxy.$http.topAlbum(params)

        if (res.code !== 200) {
            return proxy.$msg.error('数据请求失败')
        }

        album_info['lists'] = res.weekData.slice(0, params.limit);
        album_info['loading'] = false;
    }

    // 切换卡碟类别
    const chooseAlbumTag = (index) => {
        album_info['index'] = index;
        album_info['params']['cat'] = index !== 0 ? album_info['tags'][index].name : '';
        album_info['loading'] = true;
        getAlbumList(album_info['params']);
    }

    onMounted(() => {
        getAlbumList(album_info['params']);
    });

    return {
        album_info,
        chooseAlbumTag
    }
}