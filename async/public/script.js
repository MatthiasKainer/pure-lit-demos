import { html } from 'https://unpkg.com/lit@2.1.1/index.js?module';
import { pureLit } from 'https://unpkg.com/pure-lit@2.0.2/lib/index.module.js?module';

pureLit('posts-list', async (element) => {
  const data = await fetch(element.src)
    .then((response) => response.json());

  return html`<ul>
    ${data.map((entry) => html`<li>${entry.title}</li>`)}
  </ul>`;
}, {
  defaults: { src: "" }
});
