<template>
    <v-card>
        <v-card-title>
            <h3 class="headline">{{headline}} ({{rentalContracts.length}})</h3>
            <v-spacer></v-spacer>
            <v-text-field
                    append-icon="search"
                    label="Search"
                    single-line
                    hide-details
                    v-model="search"
            ></v-text-field>
        </v-card-title>
        <v-card-text>
            <v-data-table
                    :headers="headers"
                    :items="rentalContracts"
                    :search="search"
                    :hide-actions="rentalContracts.length <= 5"
                    class="elevation-1"
            >
                <template slot="items" slot-scope="props">
                    <td>
                        <app-identifier v-model="props.item"></app-identifier>
                    </td>
                    <td>{{props.item.MIETVERTRAG_VON}}</td>
                    <td>{{props.item.MIETVERTRAG_BIS}}</td>
                    <td>
                        <app-identifier v-model="props.item.einheit"></app-identifier>
                    </td>
                    <td>
                        <app-identifier v-model="props.item.einheit.haus"></app-identifier>
                    </td>
                    <td>
                        <app-identifier v-model="props.item.einheit.haus.objekt"></app-identifier>
                    </td>
                </template>
                <template slot="pageText" slot-scope="{ pageStart, pageStop }">
                    Von {{ pageStart }} bis {{ pageStop }}
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop} from "vue-property-decorator";

    @Component
    export default class RentalContractsCard extends Vue {
        @Prop({type: Array})
        rentalContracts: any;

        @Prop({type: String})
        headline;

        search: string = '';
        headers = [
            {text: 'Mietvertrag', value: 'ID'},
            {text: 'Von', value: 'MIETVERTRAG_VON'},
            {text: 'Bis', value: 'MIETVERTRAG_BIS'},
            {text: 'Einheit', value: 'EINHEIT_ID'},
            {text: 'Haus', value: 'HAUS_ID'},
            {text: 'Objekt', value: 'OBJEKT_ID'},
        ];
    }
</script>