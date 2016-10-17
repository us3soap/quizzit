import Vue from './instance/vue'
import installGlobalAPI from './global-api'
import { inBrowser, devtools } from './util/index'
import config from './config'

installGlobalAPI(Vue)

<<<<<<< HEAD
Vue.version = '1.0.26'
=======
Vue.version = '1.0.28'
>>>>>>> 0fb031e1fcec6e23b724b00c1061b1c1a1c5f583

export default Vue

// devtools global hook
/* istanbul ignore next */
setTimeout(() => {
  if (config.devtools) {
    if (devtools) {
      devtools.emit('init', Vue)
    } else if (
      process.env.NODE_ENV !== 'production' &&
      inBrowser && /Chrome\/\d+/.test(window.navigator.userAgent)
    ) {
      console.log(
        'Download the Vue Devtools for a better development experience:\n' +
        'https://github.com/vuejs/vue-devtools'
      )
    }
  }
}, 0)
