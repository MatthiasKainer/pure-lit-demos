import { html } from 'https://unpkg.com/lit@2.1.1/index.js?module';
import { pureLit } from 'https://unpkg.com/pure-lit@2.0.1/lib/index.module.js?module';

const url = 'https://jsonplaceholder.typicode.com/posts';

pureLit('greeter-me', async () => {
  const data = await fetch(url)
    .then((response) => response.json());

  return html`<ul>
    ${data.map((entry) => html`<li>${entry.title}</li>`)}
  </ul>`;
});
