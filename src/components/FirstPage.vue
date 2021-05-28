<template>
    <v-card
            max-width="500"
            class="mx-auto"
    >
        <h1>Последние действия</h1>
        <v-list
                two-line subheader
                v-model="lastActions"
        >
            <v-subheader>Последние действия</v-subheader>
            <v-list-item>
                <template v-for="(item, index) in items">
                    <v-list-item :key="item.title">
                        <template v-slot:default="{ active, toggle }">
                            <v-list-item-content>
                                <v-list-item-title v-text="item.title"></v-list-item-title>
                                <v-list-item-subtitle class="text--primary" v-text="item.headline"></v-list-item-subtitle>
                                <v-list-item-subtitle v-text="item.subtitle"></v-list-item-subtitle>
                            </v-list-item-content>
                        </template>
                    </v-list-item>
                </template>
            </v-list-item>
        </v-list>
    </v-card>
</template>

<script>

    export default {
        mounted () {
        },
        watch: {
        },
        methods: {
        },
        props: {
        },
        computed: {
            lastActions() {
                return [];
            }
        },
        data () {
            return {

            };
        }
    };
</script>

<style>

</style>
