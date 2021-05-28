<template>
    <v-container
            fluid
            class="lighten-4"
    >
        <v-row dense>
            <v-col
                    cols="4"
            >
                <v-card
                        class="mx-auto"
                        shaped
                >
                    <v-card-title class="headline">Последние изменения</v-card-title>
                    <v-list>
                        <v-list-item
                                :key="item.uri.toString()"
                                v-for="(item) in lastChanges"
                                link
                                @click="goLink(item)"
                        >
                            <v-list-item-icon>
                                <v-icon>{{ item.icon }}</v-icon>
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-title v-text="item.title"></v-list-item-title>
                                <v-list-item-subtitle class="text--primary" v-text="item.location"></v-list-item-subtitle>
                                <v-list-item-subtitle v-text="item.author"></v-list-item-subtitle>
                            </v-list-item-content>
                            <v-list-item-action>
                                <v-list-item-action-text v-html="item.display_moment"></v-list-item-action-text>
                            </v-list-item-action>
                        </v-list-item>
                    </v-list>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    import GitHelper from './../helpers/gitlab';
    import dateFormat from  'dateformat';

    export default {
        name: 'MainPage',
        methods: {
            goLink(item) {
                this.$router.push({
                    name: 'swagger',
                    params: {
                        source: btoa(item.uri)
                    }
                });
            }
        },
        mounted() {
            // eslint-disable-next-line no-debugger
            let hash  = GitHelper.parseHashParams(this.$route.hash.substr(1));
            if('access_token' in hash) {
                this.$store.dispatch('onReceivedOAuthToken', hash.access_token);
            }
        },
        computed: {
            lastChanges() {
                let result = [];
                for(let key in this.$store.state.last_changes) {
                    let item = this.$store.state.last_changes[key];
                    let doc = this.$store.state.docs[key];
                    let moment = new Date(item[0].created_at);
                    result.push({
                        title: item[0].title,
                        moment : moment,
                        display_moment: dateFormat(moment,'dd.mm.yy<br>hh:mm:ss'),
                        author: item[0].author_name,
                        icon: doc.icon,
                        uri: doc.uri,
                        location: doc.location
                    });
                }
                return result.sort((a, b) => b.moment - a.moment);
            }
        },
        data () {
            return {
            };
        }
    };
</script>

<style scoped>

</style>
