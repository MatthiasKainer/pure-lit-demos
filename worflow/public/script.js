import { css, html } from 'https://unpkg.com/lit@2.1.1/index.js?module';
import { pureLit, useState, dispatch, useWorkflow, useOnce } from 'https://unpkg.com/pure-lit@2.0.1/lib/index.module.js?module';
import { io } from 'https://cdn.socket.io/4.3.1/socket.io.esm.min.js';

const hours = (value) => {
    const now = new Date();
    now.setHours(now.getHours() + value);
    return now
};

const chatWindow = css`
:host {
    display: block;
    height: 100%;
    width: 66%;
}
ul {
    height: 80%;
    display: block;
    overflow: auto;
    padding: 0;
    margin: 0;
}
li {
    background: #D3DEDC;
    list-style: none;
    padding: 0.6em;
    margin: 0.3em;
}
.user {
    display: inline-block;
    padding: 8px;
    background-color: #FFEFEF;
    margin: 0 1rem;
}
`;

pureLit("enter-input", (element) => {
    const text = useState(element, "");
    return html`<input type="text" .value="${text.get()}" placeholder=${element.placeholder} 
        @keydown=${(e) => {
            if (e.key === "Enter") {
                dispatch(element, "done", text.get());
                text.set("");
            }
        }} 
        @input="${(e) =>
        ( text.set(e.target.value),
            dispatch(element, "change", e.target.value))
        }">`
}, {
    defaults: { placeholder: "" }
});

pureLit("create-user", (element) => {
    const name = useState(element, "");
    return html`<div>
        <enter-input 
            placeholder="Whats your name?" 
            @change="${(e) => name.set(e.detail)}" 
            @done=${(e) => dispatch(element, "onCreate", e.detail)}></enter-input>
        <button @click="${() => dispatch(element, "onCreate", name.value)}">Join</button>
    </div>`
});

pureLit("chat-list", (element) => {
    return html`
    <h2>Select a chat room</h2>
    <ul>
        <li><button @click="${() => dispatch(element, " onJoin", { id: 1 })}">Chat 1</button></li>
    </ul>`
});

pureLit("chat-window", (element) => {
    const message = useState(element, "");
    return html`<ul>
        ${element.messages?.map(message =>
        html`<li><div class="user">${message.userName}</div> ${message.message}</li>`)}
        </ul>
        <enter-input 
            placeholder="Say something nice" 
            @change="${(e) => message.set(e.detail)}" 
            @done=${(e) => dispatch(element, "onSendMessage", e.detail)}></enter-input>
        <button @click="${() => {
            dispatch(element, " onSendMessage", message.value); message.set("");
        }}">Send</button>
    `
}, {
    defaults: {
        messages: []
    },
    styles: chatWindow
});

const socket = io("http://localhost:3001");

const userReducer = () => ({
    createUser: async (userName) => ({ userName }),
    deleteUser: async (userName) => undefined,
});

const chatReducer = (state) => ({
    joinChat: (id) => Promise.resolve({ id }),
    sendMessage: async (message) => {
        socket.emit("message", message);
        return state;
    },
    receiveMessage: async (message) => {
        return {
            ...state,
            messages: [
                ...(state.messages || []),
                message,
            ],
        };
    },
    leaveChat: async () => undefined,
});

pureLit("easy-chat", async (element) => {
    const workflow = useWorkflow(element, {
        user: { reducer: userReducer },
        chat: { reducer: chatReducer },
    });

    console.log("history", workflow.history());
    return await workflow.plan({
        // create the user projection
        user: async () => {
            return html`<create-user @onCreate=${({ detail: userName }) => {
                workflow.addActivity("createUser", userName);
                workflow.addCompensation("deleteUser", userName);
            }}></create-user>`;
        },
        // create the chat projection once we have an user
        chat: async () => {
            // if the user does not join a chat in hour, delete the account
            workflow.after(hours(1), {
                type: "addActivity",
                args: ["joinChat"],
            }, async () => await workflow.compensate());
            return html`<chat-list @onJoin=${({ detail: chat }) => {
                workflow.addActivity("joinChat", chat);
                workflow.addCompensation("leaveChat", chat);
            }}></chat-list>`;
        },
        // execute the send a message-loop
        "": async () => {
            // if the user has not participated for an hour, leave the chat and delete the account
            const registerTimeout = () => {
                workflow.after(hours(1), {
                    type: "addActivity",
                    args: ["sendMessage"],
                }, async () => await workflow.compensate());
            };

            useOnce(element, () => {
                socket.on("message", (stream) => {
                    workflow.addActivity("receiveMessage", stream);
                });
                registerTimeout();
            });

            const { userName } = workflow.projections("user");
            const { id, messages } = workflow.projections("chat");
            return html`<chat-window id="${id}" userName="${userName}" .messages="${messages}" @onSendMessage=${({ detail: message }) => {
                workflow.addActivity("sendMessage", { id, message, userName });
                registerTimeout();
            }}></chat-window>`;
        }
    })
});
