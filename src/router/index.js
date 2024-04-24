import { createRouter, createWebHistory} from 'vue-router';

const routes = [
    { path: '/', redirect: '/index'},
    { path: '/index', name: 'index', component: () => import('@views/index/Index.vue')},
    { path: '/rank', name: 'rank', component: () => import('@views/rank/Index.vue')},
    { path: '/song', name: 'song', component: () => import('@views/song/Index.vue')},
    { path: '/singer', name: 'singer', component: () => import('@views/singer/Index.vue')},
    { path: '/singer/detail', name: 'singerdetail', component: () => import('@views/singer/Detail.vue')},
    { path: '/album', name: 'album', component: () => import('@views/album/Index.vue')},
    { path: '/playlist', name: 'playlist', component: () => import('@views/playlist/Index.vue')},
    { path: '/playlist/detail', name: 'playlistdetail', component: () => import('@views/playlist/Detail.vue')},
    { path: '/home', name: 'home', component: () => import('@views/home/Index.vue')},
    { path: '/mv', name: 'mv', component: () => import('@views/mv/Index.vue')},
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;