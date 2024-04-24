import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        AutoImport({
            resolvers: [ElementPlusResolver()],
        }),
        Components({
            resolvers: [ElementPlusResolver()],
        }),
    ],
    css: {
        preprocessorOptions: {
            less: {
                modifyVars: {
                    hack: `true; @import (reference) "${resolve('src/assets/less/global.less')}";`,
                },
                javascriptEnabled: true,
            }
        }
    },
    resolve: {
        extensions: ['.less', '.js', '.json'],
        alias: {
            '@': resolve(__dirname, 'src'),
            '@apis': resolve(__dirname, 'src/apis'),
            '@assets': resolve(__dirname, 'src/assets'),
            '@components': resolve(__dirname, 'src/components'),
            '@store': resolve(__dirname, 'src/store'),
            '@utils': resolve(__dirname, 'src/utils'),
            '@views': resolve(__dirname, 'src/views'),
            '@directives': resolve(__dirname, 'src/directives'),
        }
    },
    server: {
        port: 1234,
        host: '0.0.0.0'
    }
})
