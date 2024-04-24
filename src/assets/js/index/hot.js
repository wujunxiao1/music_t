import { getCurrentInstance, onMounted, reactive } from 'vue';

export function hotPlayList() {
    const { proxy } = getCurrentInstance();

    const playlist_info = reactive({
        tags: [],  // 热门标签列表
        lists: [], // 歌单列表
        index: 0,  // 当前选中标签
        loading: true,
        params: { limit: 6, offset: 0 }
    });

    // 获取热门推荐歌单标签
    const getHotTags = async() => {
        const { data: res } = await proxy.$http.hotPlayList()

        if (res.code !== 200) {
            return proxy.$msg.error('数据请求失败')
        }

        res.tags.unshift({ name: '为您推荐' })
        playlist_info['tags'] = res.tags.splice(0, 6);
    };

    // 切换热门推荐歌单标签
    const choosePlayListTag = (index) => {
        playlist_info['index'] = index;
        playlist_info['params']['cat'] = index !== 0 ? playlist_info['tags'][index].name : '';
        playlist_info['loading'] = true;
        getPlayList(playlist_info['params']);
    }

    // 分类歌单列表
    const getPlayList = async(params) => {
        const { data: res } = await proxy.$http.playList(params)

        if (res.code !== 200) {
            return proxy.$msg.error('数据请求失败')
        }

        playlist_info['lists'] = res.playlists;
        playlist_info['loading'] = false;
    }

    onMounted(() => {
        getHotTags();
        getPlayList(playlist_info['params']);
    });

    return {
        playlist_info,
        choosePlayListTag
    }
}