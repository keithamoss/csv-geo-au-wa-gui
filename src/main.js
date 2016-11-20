import Vue from 'vue'
import Quasar from 'quasar'
import router from './router'
import App from './App'

Quasar.theme.set(__THEME)
Vue.use(Quasar) // Install Quasar Framework

Quasar.start(() => {
  /* eslint-disable no-new */
  // var FileUpload = require('vue-upload-component')

  new Vue({
    el: '#quasar-app',
    // components: {
    //   FileUpload: FileUpload
    // },
    router,
    render: h => h(App)
  })
})
