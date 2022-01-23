import { pureLit, useState, dispatch } from "https://unpkg.com/pure-lit@2.0.1/lib/index.module.js?module";
import { html } from "https://unpkg.com/lit@2.1.1/index.js?module";
import { chatWindow } from "./components.css";

pureLit("enter-input", (element) => {
    const text = useState(element, "")
    return html`<input type="text" .value="${text.get()}" placeholder=${element.placeholder} 
        @keydown=${(e) => {
            if (e.key === "Enter") {
                dispatch(element, "done", text.get())
                text.set("")
            }
        }} 
        @input="${(e) =>
        ( text.set(e.target.value),
            dispatch(element, "change", e.target.value))
        }">`
}, {
    defaults: { placeholder: "" }
})

pureLit("create-user", (element) => {
    const name = useState(element, "")
    return html`<div>
        <enter-input 
            placeholder="Whats your name?" 
            @change="${(e) => name.set(e.detail)}" 
            @done=${(e) => dispatch(element, "onCreate", e.detail)}></enter-input>
        <button @click="${() => dispatch(element, "onCreate", name.value)}">Join</button>
    </div>`
})

pureLit("chat-list", (element) => {
    return html`
    <h2>Select a chat room</h2>
    <ul>
        <li><button @click="${() => dispatch(element, " onJoin", { id: 1 })}">Chat 1</button></li>
    </ul>`
})

export default pureLit("chat-window", (element) => {
    const message = useState(element, "")
    return html`<ul>
        ${element.messages?.map(message =>
        html`<li><div class="user">${message.userName}</div> ${message.message}</li>`)}
        </ul>
        <enter-input 
            placeholder="Say something nice" 
            @change="${(e) => message.set(e.detail)}" 
            @done=${(e) => dispatch(element, "onSendMessage", e.detail)}></enter-input>
        <button @click="${() => {
            dispatch(element, " onSendMessage", message.value); message.set("")
        }}">Send</button>
    `
}, {
    defaults: {
        messages: []
    },
    styles: chatWindow
})