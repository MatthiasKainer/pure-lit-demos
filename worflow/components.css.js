import { css } from "https://unpkg.com/lit@2.1.1/index.js?module";

export const chatWindow = css`
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
`