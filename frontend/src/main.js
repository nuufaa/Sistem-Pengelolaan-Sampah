// import './assets/style.css'

// import { createApp } from 'vue'
// import { createPinia } from 'pinia'

// import App from './App.vue'
// import router from './router'

// const app = createApp(App)

// app.use(createPinia())
// app.use(router)

// app.mount('#app')

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/styles/home.css'

createApp(App).use(router).mount('#app')

