import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores'

// 路由组件懒加载
const Home = () => import('@/components/Home.vue')
const Discover = () => import('@/components/Discover.vue')
const Search = () => import('@/components/Search.vue')
const Me = () => import('@/components/Me.vue')
const Login = () => import('@/components/Login.vue')
const QrLogin = () => import('@/components/QrLogin.vue')
const NowPlaying = () => import('@/components/NowPlaying.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '首页',
      requiresAuth: false
    }
  },
  {
    path: '/discover',
    name: 'Discover',
    component: Discover,
    meta: {
      title: '发现音乐',
      requiresAuth: false
    }
  },
  {
    path: '/search',
    name: 'Search',
    component: Search,
    meta: {
      title: '搜索',
      requiresAuth: false
    }
  },
  {
    path: '/now-playing',
    name: 'NowPlaying', 
    component: NowPlaying,
    meta: {
      title: '正在播放',
      requiresAuth: false
    }
  },
  {
    path: '/me',
    name: 'Me',
    component: Me,
    meta: {
      title: '我的音乐',
      requiresAuth: false  // 允许未登录用户访问，但会显示登录提示
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/login/qr',
    name: 'QrLogin',
    component: QrLogin,
    meta: {
      title: '扫码登录',
      requiresAuth: false
    }
  },
  // 重定向规则
  {
    path: '/home',
    redirect: '/'
  },
  // 404 页面
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - Vue NeuMusic`
  }
  
  // 检查是否需要登录
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    // 需要登录但用户未登录，重定向到登录页
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    })
  } else if (to.name === 'Login' && userStore.isLoggedIn) {
    // 已登录用户访问登录页，重定向到首页
    next({ name: 'Home' })
  } else {
    next()
  }
})

export default router