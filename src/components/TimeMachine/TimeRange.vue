<template>
<v-container grid-list-md style="max-width: 300px">
    <v-layout row wrap style="padding-top: 16px">
      <v-flex xs12 lg6>
        <v-menu
          ref="menu1"
          v-model="menuFrom"
          :close-on-content-click="false"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              v-model="dateFrom"
              persistent-hint
              prepend-icon="event"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker 
            v-model="dateFrom"
            no-title
            @input="menuFrom = false"
            :events="events"
            event-color="green lighten-1"
          >
          </v-date-picker>
        </v-menu>
      </v-flex>

      <v-flex xs12 lg6>
        <v-menu
          v-model="menuTo"
          :close-on-content-click="false"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              v-model="dateTo"
              persistent-hint
              prepend-icon="event"
              readonly
              v-on="on"
              :events="events"
              event-color="green lighten-1"
            ></v-text-field>
          </template>
          <v-date-picker 
            v-model="dateTo" 
            no-title 
            @input="menuTo = false"
            :events="events"
          ></v-date-picker>
        </v-menu>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>

import datetime from '../../helpers/datetime';

export default {
    name: 'TimeRange',
    data() {
      return  {
        menuFrom: false,
        menuTo: false
      }
    },

    computed: {
      dateFrom: {
        get() {
          return datetime.getPUMLDate(this.$store.state.timeMachine.dateFrom);
        },
        set (value) {
          this.$store.commit('setTimeMachineDateFrom', new Date(value));
        }
      },
      dateTo: {
        get() {
          return datetime.getPUMLDate(this.$store.state.timeMachine.dateTo);
        },
        set (value) {
          this.$store.commit('setTimeMachineDateTo', new Date(value));
        }
      },
      computedDateFormatted () {
        return this.formatDate(this.date)
      },
      events () {
        return this.$store.state.timeMachine.changes;
      }
    },

    watch: {
    },

    methods: {
    }
};
</script>

<style scoped>

</style>
