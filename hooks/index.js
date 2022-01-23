import { html } from 'https://unpkg.com/lit@2.1.1/index.js?module';
import { pureLit, useState, useReducer, dispatch } from 'https://unpkg.com/pure-lit@2.0.1/lib/index.module.js?module';

const addTodosReducer = (state) => ({
  update: (payload) => payload,
  add: () => state,
});

pureLit(
  "todo-list",
  (element) => html`<ul>
    ${element.items.map(
      (el) => html`<li @click=${() => dispatch(element, "remove", el)}>${el}</li>`
    )}
  </ul>`,
  {
    styles: [],
    defaults: { items: [] },
  }
);

pureLit("todo-add", (element) => {
  const { set, get } = useReducer(element, addTodosReducer, "", {
    dispatchEvent: true,
  });
  const onComplete = () => 
    get().length > 0 && (set("add").then(() => set("update", "")));
  const onUpdate = ({ value }) => set("update", value);

  return html`
    <input
      type="text"
      name="item"
      .value="${get()}"
      @input="${(e) => onUpdate(e.target)}"
      @keypress="${(e) => e.key === "Enter" && onComplete()}"
      placeholder="insert new item"
    />
    <button @click=${() => onComplete()}>
      Add Item
    </button>
  `;
});

pureLit("todo-app", (element) => {
  const elements = useState(element, []);
  return html`
    <div>
      <todo-add @add=${(e) => elements.set([...elements.value, e.detail])}></todo-add>
    </div>
    <div>
      <todo-list
        .items=${elements.value}
        @remove=${(e) => elements.set([...elements.value.filter((el) => el !== e.detail)])}
      ></todo-list>
    </div>
  `;
});