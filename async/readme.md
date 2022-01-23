# async render

While with pure-lit you can use effect hooks for async functions, you don't have to.

Rather than writing

```js
pureLit('posts-list', (element) => {
  const articles = useState(element, [])

  useEffect(() => {
    fetch(url)
        .then((response) => response.json())
        .then(json => articles.set(json))
  }, [])

  return html`<ul>
    ${data.map((entry) => html`<li>${entry.title}</li>`)}
  </ul>`;
});
```

you can just write

```js
pureLit('posts-list', async () => {
  const data = await fetch(url)
    .then((response) => response.json());

  return html`<ul>
    ${data.map((entry) => html`<li>${entry.title}</li>`)}
  </ul>`;
});
```