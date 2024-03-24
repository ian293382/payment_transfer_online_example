const serverDomain = 'http://localhost:3000';

const app = Vue.createApp({
    data() {
        return {
            products: [],
        };
    },
    async mounted() {
        this.products = await fetch(`${serverDomain}/products/list`).then((res) => res.json());
    },
});

// 將 Vue app 掛載到指定的元素上
app.mount('#app');