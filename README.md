## 前言
hello，大家好，我是怀旧的文学小青年。今天我为大家带来Vue3全家桶项目实战的教程，本教程主要是使用 vite 来创建一个vue3项目，结合 componsition API 的使用，目的是让从未接触过vue3的同学上手体验一下。希望大家能够喜欢！

关于网易云音乐我以前分别用vue2.x以及vue3.x各写过一版，大致上实现了网易云音乐的一些基础功能，目前代码都已开源，参考《[基于网易云音乐API实现PC端音乐网站](https://gitee.com/trtst/vue_pc_music)》、《[Vue3.x 网易云音乐_PC音乐播放器](https://gitee.com/trtst/vue3-music)》。我不是大佬，整个项目写的有可能会比较臃肿、抑或有不对的地方，有问题可以随时留言一起探讨！如果觉得对您有帮助，您可以给个三连击，抑或给个 star 支持一下，十分感谢！

 **这是一个系列的图文教程，我会努力持续更新该教程，第一次写系列教程，写的感觉好像有些啰嗦，hh，希望能够坚持下去，大家多多鼓励一下哈！即将上线，持续更新中......** 

## 项目介绍
### 适宜人群
因为该教程是项目的实战，所以我就不在这个教程中去讲解vue相关的基础知识，默认大家都是有一定的vue及JS基础。如果不懂的，可以事先去补习一下基础理论，然后再回头看本实战教程。
### 项目目录

```js
├── node_modules      // npm依赖包
├── dist              // 项目build后的文件
├── public            // 
├── src               // 静态资源文件
│   ├── apis          // axios 封装及接口请求地址
│   ├── assets        // 公共资源静态文件
│   ├── components    // 公共组件
│   ├── router        // 路由
│   ├── store         // vue的状态管理
│   ├── utils         // 封装的工具
│   ├── views         // 项目的主要页面
│   ├── App.vue       // vue项目的主组件
│   └── main.js       // vue项目的主JS文件
├── .gitignore       // gitignore忽略文件
├── index.html       // vite入口文件
├── package.json     // node包管理文件
├── README.md        // 描述文件
└── vite.config.js   // vite的配置文件
```

### 技术栈
vite + vue3.x + vue-router4.x + Pinia + element-plus + axio + less + swiper
### 项目效果预览及源码
页面效果我就不展示出来了，在git上都有展出，可以下载下来运行。

[哔哩哔哩](https://www.bilibili.com/video/BV1rA411s7oE/)

[线上Demo预览](https://m3.trtst.com)

[gitee 2.x](https://gitee.com/trtst/vue_pc_music)

[gitee 3.x](https://gitee.com/trtst/vue3-music)