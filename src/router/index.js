import { createRouter, createWebHistory } from 'vue-router'

// 路由懒加载
const Login = () => import('../views/Login.vue')
const Register = () => import('../views/Register.vue')
const Layout = () => import('../views/Layout.vue')
const NotFound = () => import('../views/NotFound.vue')
const Home = () => import('../views/Home.vue')
const AssistantList = () => import('../views/assistant/List.vue')
const AssistantCreate = () => import('../views/assistant/Create.vue')
const AssistantDetail = () => import('../views/assistant/Detail.vue')
const KnowledgeBase = () => import('../views/knowledge/List.vue')
const KnowledgeUpload = () => import('../views/knowledge/Upload.vue')
const ChatInterface = () => import('../views/chat/Interface.vue')
const ChatHistory = () => import('../views/chat/History.vue')
const Dashboard = () => import('../views/dashboard/Index.vue')
const UserProfile = () => import('../views/user/Profile.vue')

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Home',
        component: Home
      },
      {
        path: 'assistants',
        name: 'AssistantList',
        component: AssistantList
      },
      {
        path: 'assistants/create',
        name: 'AssistantCreate',
        component: AssistantCreate
      },
      {
        path: 'assistants/:id',
        name: 'AssistantDetail',
        component: AssistantDetail,
        props: true
      },
      {
        path: 'knowledge',
        name: 'KnowledgeBase',
        component: KnowledgeBase
      },
      {
        path: 'knowledge/upload',
        name: 'KnowledgeUpload',
        component: KnowledgeUpload
      },
      {
        path: 'chat/:id',
        name: 'ChatInterface',
        component: ChatInterface,
        props: true
      },
      {
        path: 'chat/history',
        name: 'ChatHistory',
        component: ChatHistory
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard
      },
      {
        path: 'profile',
        name: 'UserProfile',
        component: UserProfile
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 导航守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  // 检查是否需要认证且没有token
  if (to.meta.requiresAuth && !token) {
    console.log('需要登录，重定向到登录页')
    next({ name: 'Login' })
  } 
  // 如果已登录且要去登录页，重定向到首页
  else if (token && (to.name === 'Login' || to.name === 'Register')) {
    console.log('已登录，重定向到首页')
    next({ name: 'Home' })
  }
  else {
    next()
  }
})

export default router 