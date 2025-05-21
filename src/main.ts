import App from './app/index.vue';
import { createApp } from 'vue';
import './style.css';

async function bootstrap() {
  const app = createApp(App);
  app.mount('#app');
}

bootstrap().then(() => {
  // console.log('bootstrap');
});
