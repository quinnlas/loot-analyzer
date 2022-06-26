<template>
  <div id="app">
    <h2>Options</h2>
    High alch cost: <b-input type="number" v-model="highAlchCost"></b-input>
    Notepaper cost: <b-input type="number" v-model="notepaperCost"></b-input>
    Free inventory slots: <b-input type="number" v-model="totalInventorySlots"></b-input>

    <h2>Drop Table</h2>
    <p>Paste the drop tables from the wiki here, one at a time. <b>Make sure to click the gear and select "Show Both" for GE and alch prices.</b></p>
    <b-textarea v-model="dropTablePaste"></b-textarea>
    <b-button @click="addDropTable">Add drop table</b-button>
    <b-table :items="dropTable" :fields="dropTableFields">
      <template #cell(quantity)="{item}">
        <template v-if="item.min === item.max">{{item.min}}</template>
        <template v-else>{{item.min}}-{{item.max}}</template>
      </template>
      <template #cell(noted)="{item}">
        <b-check :checked="item.noted" disabled></b-check>
      </template>
      <template #cell(actions)="{item}">
        <b-button @click="analyzeItem(item)">Analyze</b-button>
      </template>
    </b-table>

    <h2>Inventory</h2>
    <b-table :items="inventoryTableItems"></b-table>

    <h2> Inventory Value: </h2>
    {{inventory.value}}

    <h2> Add Items </h2>
    <b-button @click="addItem">Add item</b-button>
    <b-button @click="addStackable">Add stackable</b-button>
    <b-button @click="addNoted">Add noted</b-button>
  </div>
</template>

<script>
import _ from 'lodash'
import { Item, Inventory, ItemStack } from '@/tools/inventory'
import translate from '@/tools/dropTable'
import analyze from '@/tools/analyze'

import dropTableStartingPaste from '@/tools/example drop table paste.json'
export default {
  name: 'App',
  data() {
    return {
      highAlchCost: 624,
      notepaperCost: 416,
      totalInventorySlots: 24,
      inventory: new Inventory(24),
      dropTablePaste: '',
      dropTable: [], // a list of ItemStack that can be dropped
      dropTableFields: [
        {
          key: 'item.name',
          label: 'Item'
        },
        'quantity',
        'noted',
        'rarity',
        {
          key: 'item.geValue',
          label: 'GE Value'
        },
        {
          key: 'item.alchValue',
          label: 'Alch Value'
        },
        'actions'
      ]
    }
  },
  computed: {
    inventoryTableItems() {
      return this.inventory.slots.map(is => ({
        ...is.item,
        ..._.omit(is, 'item')
      }))
    }
  },
  methods: {
    addItem() {
      this.inventory.addItemStack(new ItemStack(new Item('Uncut sapphire', { geValue: 603 })))
    },
    addStackable() {
      this.inventory.addItemStack(new ItemStack(new Item('Rune arrowheads', { geValue: 163, stackable: true }), 113))
    },
    addNoted() {
      this.inventory.addItemStack(new ItemStack(new Item('Raw shark', { geValue: 744 }), 225, true))
    },
    addDropTable() {
      this.dropTable.push(...translate(this.dropTablePaste))
    },
    analyzeItem(dropTableItem) {
      // need to pop up asking how many in future, for now just assume it was min
      const itemStack = new ItemStack(dropTableItem.item, dropTableItem.min, dropTableItem.noted)
      const options = _.pick(this, ['highAlchCost', 'notepaperCost'])
      analyze(options, this.inventory, itemStack)
    }
  },
  watch: {
    totalInventorySlots(newAmount) {
      this.inventory.setTotalSlots(newAmount)
    }
  },
  mounted() {
    this.dropTable.push(...translate(dropTableStartingPaste))
  }
}
</script>
