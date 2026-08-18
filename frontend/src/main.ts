import { createApp } from 'vue'
import App from './App.vue'

import HomeComponent from './components/HomeComponent.vue'
import FormComponent from './components/FormComponent.vue'

const app = createApp(App)

app.component('HomeComponent', HomeComponent)
app.component('FormComponent', FormComponent)

app.mount('#app')