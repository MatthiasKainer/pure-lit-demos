import { css, html } from 'https://unpkg.com/lit@2.1.1/index.js?module';
import { pureLit, useState as useState$1, dispatch, useOnce } from 'https://unpkg.com/pure-lit@2.0.1/lib/index.module.js?module';
import { io } from 'https://cdn.socket.io/4.3.1/socket.io.esm.min.js';

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var dist = {};

var state = {};

var clone = {};

Object.defineProperty(clone, "__esModule", { value: true });
clone.shallowClone = void 0;
function shallowClone(value) {
    if (typeof value !== "object" || !value || value instanceof Date || value instanceof RegExp)
        return value;
    return (Array.isArray(value)) ? [...value] : Object.assign({}, value);
}
clone.shallowClone = shallowClone;

var decorator = {};

Object.defineProperty(decorator, "__esModule", { value: true });
decorator.withWorkflow = decorator.withReducer = decorator.withState = decorator.decorate = decorator.asUpdateableLitElement = void 0;
function asUpdateableLitElement(element) {
    if (!element.dispatchEvent || !element.requestUpdate)
        throw new Error("Element missing required functions (dispatchEvent/requestUpdate)");
    return element;
}
decorator.asUpdateableLitElement = asUpdateableLitElement;
const reservedField = "__registered_states";
function decorate(litElement) {
    const decoratedLitElement = litElement;
    if (decoratedLitElement[reservedField])
        return decoratedLitElement;
    const updateableLitLikeElement = asUpdateableLitElement(litElement);
    const oldUpdated = updateableLitLikeElement.updated;
    decoratedLitElement[reservedField] = {
        index: 0,
        count: 0,
        states: [],
        reducers: [],
        workflows: []
    };
    updateableLitLikeElement.updated = (args) => {
        decoratedLitElement[reservedField].index = 0;
        return oldUpdated(args);
    };
    return decoratedLitElement;
}
decorator.decorate = decorate;
function withState(litElement, state, options = {}) {
    const decoratedLitElement = decorate(litElement);
    const { index, count } = decoratedLitElement[reservedField];
    if (index === count) {
        decoratedLitElement[reservedField].index++;
        decoratedLitElement[reservedField].count++;
        decoratedLitElement[reservedField].states.push(state);
        return state;
    }
    decoratedLitElement[reservedField].index++;
    if (options.updateDefault)
        decoratedLitElement[reservedField].states[index].inject(state.get());
    return decoratedLitElement[reservedField].states[index];
}
decorator.withState = withState;
function withReducer(litElement, reduce) {
    const decoratedLitElement = decorate(litElement);
    const { index, count, reducers } = decoratedLitElement[reservedField];
    if (index === count && !reducers[index - 1]) {
        decoratedLitElement[reservedField].reducers[index - 1] = reduce;
        return reduce;
    }
    return decoratedLitElement[reservedField].reducers[index - 1];
}
decorator.withReducer = withReducer;
function withWorkflow(litElement, workflow) {
    const decoratedLitElement = decorate(litElement);
    const { index, count, workflows } = decoratedLitElement[reservedField];
    if (index === count && !workflows[index - 1]) {
        decoratedLitElement[reservedField].workflows[index - 1] = workflow;
        return workflow;
    }
    return decoratedLitElement[reservedField].workflows[index - 1];
}
decorator.withWorkflow = withWorkflow;

var __awaiter$1 = (commonjsGlobal && commonjsGlobal.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(state, "__esModule", { value: true });
state.useState = void 0;
const clone_1 = clone;
const decorator_1$1 = decorator;
const useState = (element, defaultValue, options = {}) => {
    let state = (0, clone_1.shallowClone)(defaultValue);
    const subscribers = [() => __awaiter$1(void 0, void 0, void 0, function* () { return (element.requestUpdate(), yield element.updateComplete); })];
    const set = (update) => __awaiter$1(void 0, void 0, void 0, function* () {
        if (state === update)
            return;
        state = (0, clone_1.shallowClone)(update);
        yield Promise.all(subscribers.map(s => s(state)));
    });
    return (0, decorator_1$1.withState)(element, new class {
        set value(update) {
            set(update);
        }
        get value() { return state; }
        publish(update) { set(update); }
        set(update) {
            return __awaiter$1(this, void 0, void 0, function* () { yield set(update); });
        }
        subscribe(onChange) { subscribers.push(onChange); }
        inject(update) { state = update; }
        get() { return state; }
        getState() { return state; }
    }, options);
};
state.useState = useState;

var reducer = {};

var __awaiter = (commonjsGlobal && commonjsGlobal.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(reducer, "__esModule", { value: true });
reducer.useReducer = void 0;
const state_1 = state;
const decorator_1 = decorator;
const useReducer = (element, reducer, defaultValue, options = {}) => {
    const { get: getState, set } = (0, state_1.useState)(element, defaultValue, options);
    const subscribers = [];
    const dispatch = (action, payload) => __awaiter(void 0, void 0, void 0, function* () {
        const reducers = reducer(getState());
        if (reducers[action]) {
            yield set(yield reducers[action](payload));
            subscribers.forEach(subscriber => subscriber(action, getState()));
            options.dispatchEvent &&
                element.dispatchEvent(new CustomEvent(action, { detail: getState() }));
        }
        return getState();
    });
    return (0, decorator_1.withReducer)(element, {
        get: getState,
        subscribe: (onChange) => subscribers.push(onChange),
        when: (action, onChange) => subscribers.push((triggeredAction, state) => triggeredAction === action && onChange(state)),
        set: dispatch,
        dispatch
    });
};
reducer.useReducer = useReducer;

var workflow = {};

var hasRequiredWorkflow;

function requireWorkflow () {
	if (hasRequiredWorkflow) return workflow;
	hasRequiredWorkflow = 1;
	var __awaiter = (commonjsGlobal && commonjsGlobal.__awaiter) || function (thisArg, _arguments, P, generator) {
	    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	};
	Object.defineProperty(workflow, "__esModule", { value: true });
	workflow.useWorkflow = void 0;
	const _1 = requireDist();
	const decorator_1 = decorator;
	const useWorkflow = (element, reducers) => {
	    const innerReducers = Object.entries(reducers).reduce((prev, [projection, { reducer, initialState }]) => (prev[projection] = (0, _1.useReducer)(element, reducer, initialState), prev), {});
	    const sideeffect = {};
	    const compensations = {};
	    const workflowHistory = [];
	    const projections = (key) => {
	        workflowHistory.push({
	            type: "projections",
	            args: [key]
	        });
	        return (innerReducers[key]) ? innerReducers[key].get() : undefined;
	    };
	    const addActivity = (activity, data) => __awaiter(void 0, void 0, void 0, function* () {
	        var _a, _b;
	        workflowHistory.push({
	            type: "addActivity",
	            args: [activity, data]
	        });
	        yield Promise.all((_b = (_a = sideeffect[activity]) === null || _a === void 0 ? void 0 : _a.map(effect => effect(data))) !== null && _b !== void 0 ? _b : []);
	        for (const reducer of Object.values(innerReducers)) {
	            yield reducer.dispatch(activity, data);
	        }
	    });
	    const addCompensation = (activity, data) => {
	        workflowHistory.push({
	            type: "addCompensation",
	            args: [activity, data]
	        });
	        compensations[activity] = [
	            ...(compensations[activity] || []),
	            data
	        ];
	    };
	    const addSideeffect = (activity, effect) => {
	        workflowHistory.push({
	            type: "addSideeffect",
	            args: [activity, effect]
	        });
	        sideeffect[activity] = [
	            ...(sideeffect[activity] || []),
	            effect
	        ];
	    };
	    const compensate = () => __awaiter(void 0, void 0, void 0, function* () {
	        workflowHistory.push({
	            type: "compensate",
	            args: []
	        });
	        for (const [activity, dataArguments] of Object.entries(compensations)) {
	            for (const data of dataArguments) {
	                for (const reducer of Object.values(innerReducers)) {
	                    yield reducer.dispatch(activity, data);
	                }
	            }
	        }
	    });
	    const after = (timeout, unlessActivity, execute) => {
	        workflowHistory.push({
	            type: "after",
	            args: [timeout, unlessActivity, execute]
	        });
	        const compareWorkflow = (entry, unless) => {
	            if (entry.type !== unless.type)
	                return false;
	            for (let arg = 0; arg < unless.args.length; arg++) {
	                if (entry.args[arg] !== unless.args[arg])
	                    return false;
	            }
	            return true;
	        };
	        const check = () => __awaiter(void 0, void 0, void 0, function* () {
	            if (workflowHistory.some(entry => compareWorkflow(entry, unlessActivity))) {
	                return;
	            }
	            else if (new Date(Date.now()) > timeout) {
	                yield execute();
	            }
	            else {
	                setTimeout(check, 100);
	            }
	        });
	        check();
	    };
	    const plan = (plan) => __awaiter(void 0, void 0, void 0, function* () {
	        for (const [entity, workflow] of Object.entries(plan)) {
	            if (reducers[entity] &&
	                JSON.stringify(projections(entity)) === JSON.stringify(reducers[entity].initialState)) {
	                return yield workflow();
	            }
	        }
	        return plan[""]
	            ? yield plan[""]()
	            : Promise.resolve(null);
	    });
	    return (0, decorator_1.withWorkflow)(element, {
	        addActivity,
	        addSideeffect,
	        projections,
	        addCompensation,
	        compensate,
	        after,
	        plan,
	        history: () => [...workflowHistory]
	    });
	};
	workflow.useWorkflow = useWorkflow;
	
	return workflow;
}

var hasRequiredDist;

function requireDist () {
	if (hasRequiredDist) return dist;
	hasRequiredDist = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.useWorkflow = exports.useReducer = exports.useState = void 0;
		var state_1 = state;
		Object.defineProperty(exports, "useState", { enumerable: true, get: function () { return state_1.useState; } });
		var reducer_1 = reducer;
		Object.defineProperty(exports, "useReducer", { enumerable: true, get: function () { return reducer_1.useReducer; } });
		var workflow_1 = requireWorkflow();
		Object.defineProperty(exports, "useWorkflow", { enumerable: true, get: function () { return workflow_1.useWorkflow; } });
		
} (dist));
	return dist;
}

var distExports = requireDist();

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
    const text = useState$1(element, "");
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
    const name = useState$1(element, "");
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
    const message = useState$1(element, "");
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
    create: async (userName) => ({ userName }),
    delete: async (_) => undefined,
});

const chatReducer = (state) => ({
    join: (id) => Promise.resolve({ id }),
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
    leave: async () => undefined,
});

pureLit("easy-chat", async (element) => {
    const workflow = distExports.useWorkflow(element, {
        user: { reducer: userReducer },
        chat: { reducer: chatReducer },
    });

    console.log("history", workflow.history());
    return await workflow.plan({
        // create the user projection
        user: async () => {
            return html`<create-user @onCreate=${({ detail: userName }) => {
                workflow.trigger("user.create", userName);
                workflow.onCancel("user.delete", userName);
            }}></create-user>`;
        },
        // create the chat projection once we have an user
        chat: async () => {
            // if the user does not join a chat in hour, delete the account
            workflow.after(hours(1), {
                type: "trigger",
                args: ["chat.join"],
            }, async () => await workflow.cancel());
            return html`<chat-list @onJoin=${({ detail: chat }) => {
                workflow.trigger("chat.join", chat);
                workflow.onCancel("chat.leave", chat);
            }}></chat-list>`;
        },
        // execute the send a message-loop
        "": async () => {
            // if the user has not participated for an hour, leave the chat and delete the account
            const registerTimeout = () => {
                workflow.after(hours(1), {
                    type: "trigger",
                    args: ["chat.sendMessage"],
                }, async () => await workflow.cancel());
            };

            useOnce(element, () => {
                socket.on("message", (stream) => {
                    workflow.trigger("chat.receiveMessage", stream);
                });
                registerTimeout();
            });

            const { userName } = workflow.view("user");
            const { id, messages } = workflow.view("chat");
            return html`<chat-window id="${id}" userName="${userName}" .messages="${messages}" @onSendMessage=${({ detail: message }) => {
                workflow.trigger("chat.sendMessage", { id, message, userName });
                registerTimeout();
            }}></chat-window>`;
        }
    })
});
