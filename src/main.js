import { createApp, provide, h, render } from 'vue'
import './style.css'
import App from './App.vue'
import {ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core'
import {DefaultApolloClient} from '@vue/apollo-composable'


const httpLink = createHttpLink({
    uri: 'http://localhost:8888/graphql',
})

const cache = new InMemoryCache()

const apolloClient = new ApolloClient({
    link: httpLink,
    cache,
})

const app = createApp({
    setup() {
        provide(DefaultApolloClient, apolloClient)
    },

    render: () => h(App)
})

app.mount('#app');
