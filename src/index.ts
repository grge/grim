import { App } from './components/App'
import './styles/App.css'

document.addEventListener('DOMContentLoaded', () => {
  const app_element = document.getElementById('app')

  if (app_element) {
    const app = new App(app_element)
  }
});

