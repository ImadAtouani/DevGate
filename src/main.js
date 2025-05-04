import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"

// Bootstrap
import { BootstrapVue3 } from "bootstrap-vue-3"
import "bootstrap/dist/css/bootstrap.css"
import "bootstrap-vue-3/dist/bootstrap-vue-3.css"
import "bootstrap/dist/js/bootstrap.bundle.min.js"

// Chartkick
import Chart from "chart.js/auto"
import VueChartkick from "vue-chartkick"

// FontAwesome - Updated with missing icons
/* eslint-disable */
import { library } from "@fortawesome/fontawesome-svg-core"
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
import { faSearch, faUndo } from "@fortawesome/free-solid-svg-icons"

// Solid icons
import {
  faCode,
  faLaptopCode,
  faTasks,
  faProjectDiagram,
  faHistory,
  faBullseye,
  faChartLine,
  faEllipsisV,
  faSignOutAlt,
  faPlus,
  faEdit,
  faTrash,
  faCircleNotch,
  faEye,
  faList,
  faTh,
  faCheck,
  faExclamationTriangle,
  faLink,
  faBars,
  faChevronLeft,
  faChevronDown,
  faGauge,
  faTimes,
  faCloudUploadAlt,
} from "@fortawesome/free-solid-svg-icons"

// Brand icons
import { faGithub } from "@fortawesome/free-brands-svg-icons"

// Add all icons to library
library.add(
  // Solid icons
  faUndo,
  faCode,
  faLaptopCode,
  faTasks,
  faEllipsisV,
  faCircleNotch,
  faProjectDiagram,
  faHistory,
  faBullseye,
  faChartLine,
  faSignOutAlt,
  faPlus,
  faEdit,
  faTrash,
  faSearch,
  faEye,
  faList,
  faTh,
  faCheck,
  faExclamationTriangle,
  faLink,
  faBars,
  faChevronLeft,
  faChevronDown,
  faGauge,
  faTimes,
  faCloudUploadAlt,

  // Brand icons
  faGithub,
)

// Styles
import "./assets/main.css"

// Create app instance
const app = createApp(App)

// Plugins
app.use(router)
app.use(BootstrapVue3)
app.use(VueChartkick.use(Chart))

// Global components
app.component("FontAwesomeIcon", FontAwesomeIcon) // Using PascalCase

// Mount app
app.mount("#app")