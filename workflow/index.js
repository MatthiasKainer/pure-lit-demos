import { html } from "https://unpkg.com/lit@2.1.1/index.js?module";
import { pureLit, useWorkflow, useOnce } from "https://unpkg.com/pure-lit@2.0.1/lib/index.module.js?module";
import { io } from "https://cdn.socket.io/4.3.1/socket.io.esm.min.js";
import { hours } from "./duration"
import "./components"

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

    console.log("history", workflow.history())
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
                workflow.addActivity("joinChat", chat)
                workflow.addCompensation("leaveChat", chat)
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
            }

            useOnce(element, () => {
                socket.on("message", (stream) => {
                    workflow.addActivity("receiveMessage", stream)
                })
                registerTimeout();
            })

            const { userName } = workflow.projections("user");
            const { id, messages } = workflow.projections("chat");
            return html`<chat-window id="${id}" userName="${userName}" .messages="${messages}" @onSendMessage=${({ detail: message }) => {
                workflow.addActivity("sendMessage", { id, message, userName })
                registerTimeout();
            }}></chat-window>`;
        }
    })
});