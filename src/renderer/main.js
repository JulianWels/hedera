import Vue from 'vue'
import App from './App'
import store from './store'
import i18n from './lang'
import MenuHandler from './classes/MenuHandler'
import Dexie from 'dexie'
import './assets/styles/main.scss'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false


// Keeping the database clean
Dexie.getDatabaseNames((dbs) => {
	for (var i = dbs.length - 1; i >= 0; i--) {
		Dexie.delete(dbs[i])
	}
})

Vue.prototype.$menubar = new MenuHandler()

new Vue({
	components: { App },
	i18n,
	store,
	template: '<App/>'
}).$mount('#app')
