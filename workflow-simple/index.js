import "@shoelace-style/shoelace"
import { serialize } from "@shoelace-style/shoelace/dist/utilities/form.js"

import { pureLit, dispatch, useOnce } from "pure-lit"
import { html } from "lit-html"
import { useWorkflow } from "lit-element-state-decoupler"

const defaultVal = {}

// similar to a reducer, the plan functions receive a state and execute an action
//  unlike reducers, they are not called as reducer(state, action), 
//  but as reducer(state)[action](arguments). But same as reducers, whatever they return is
//  the new state.
const account = (state) => ({
    set: async ({ userName, password }) => ({ userName, password }),
    clear: async (_) => defaultVal,
});

const details = () => ({
    set: async ({ fullName, address, tc }) => ({ fullName, address, tc, tcAcceptedTimestamp: new Date() }),
    clear: async (_) => defaultVal,
})

pureLit("sign-up", (element) => {
    const workflow = useWorkflow(element, {
        // defines the workflow. Once the state is not the initial state, 
        //  moves to the next state
        account,
        details
    })

    return workflow.executePlan({
        // a plan execution consists of the same steps as the workflow
        account: () =>
            html`<user-account @submit="${(e) => 
                // a trigger calls a specific function with the syntax $STEP.$FUNCTION
                workflow.trigger("account.set", e.detail)
                    // if a step gets undone, then this function gets called
                    .onUndo("account.clear")
            }"></user-account>`,
        details: () =>
            html`<user-details @submit="${(e) => workflow.trigger("details.set", e.detail).onUndo("details.clear")}"></user-details>`,
        // if all steps are executed, it goes to run the default step
        //  and also dispatches a "complete" event in case anyone is listening
        "": async () =>
            await post({ account: workflow.view("account"), details: workflow.view("details") })
                .then(() => html`<div>Successfully created the user!</div>`)
                .catch(() => {
                    // if a workflow fails, or is otherwise aborted, all steps can be undone with a simple call to cancel
                    workflow.after(minute(1), "abort", () => workflow.cancel())
                    return html`<div>User creation failed! Please click <a href="#" @onClick=${() => (workflow.cancel(), false)}>here</a> or wait a minute to start over</div>`
                })
    })
})

pureLit("user-account", (element) => {
    // this works perfectly with shoelace controls with a form, because validation out of the box
    return slForm(html`<form>
        <sl-input name="userName" type="email" label="Email" placeholder="you@example.com" required></sl-input><br />
        <sl-input name="password" type="password" label="Password" required></sl-input><br />
        <sl-button type="submit" variant="primary">Submit</sl-button>
    </form>`, element)
})

pureLit("user-details", (element) => {
    return slForm(html`<form>
        <sl-input name="fullName" type="text" label="Full Name" placeholder="your full name" required></sl-input><br />
        <sl-input name="address" type="text" label="Address" required></sl-input><br />
        <sl-checkbox name="tc" required>Accept terms and conditions</sl-checkbox><br /><br />
        <sl-button type="submit" variant="primary">Submit</sl-button>
    </form>`, element)
})

const minute = (value) => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + value)
    return now
}

const post = async (data) => {
    const result = await fetch("/api/register", {
        method: "POST",
        body: JSON.stringify({ account: workflow.view("account"), details: workflow.view("details") }),
        headers: {
            "Content-Type": "application/json"
        }
    })
    if (result.status !== 201) throw new Error("ups")
}

const slForm = (html, element) => {
    useOnce(element, () => {
        setTimeout(() =>
            element.shadowRoot.querySelector("form").addEventListener('submit', e => (e.preventDefault(), dispatch(element, "submit", serialize(e.target)))),
            500)
    })
    return html;
}

pureLit("user-account", (element) => {
    return slForm(html`<form>
        <sl-input name="userName" type="email" label="Email" placeholder="you@example.com" required></sl-input><br />
        <sl-input name="password" type="password" label="Password" required></sl-input><br />
        <sl-button type="submit" variant="primary">Submit</sl-button>
    </form>`, element)
})

pureLit("user-details", (element) => {
    return slForm(html`<form>
        <sl-input name="fullName" type="text" label="Full Name" placeholder="your full name" required></sl-input><br />
        <sl-input name="address" type="text" label="Address" required></sl-input><br />
        <sl-checkbox name="tc" required>Accept terms and conditions</sl-checkbox><br /><br />
        <sl-button type="submit" variant="primary">Submit</sl-button>
    </form>`, element)
})