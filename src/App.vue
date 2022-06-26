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
    <b-input type="search" v-model="dropTableSearch"></b-input>
    <b-table :items="dropTableItems" :fields="dropTableFields" :filter="dropTableSearch">
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
    <analysis-modal v-if="analysis" :analysis="analysis" @hidden="analysis = null" @confirm="onTakeAction"/>

    <h2>Inventory</h2>
    <b-table :items="inventoryTableItems"></b-table>
    Coins from alching: {{inventory.coins}}

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
import { translate, calcRarityNumber } from '@/tools/dropTable'
import analyze from '@/tools/analyze'
import dropTableStartingPaste from '@/tools/example drop table paste.json'
import AnalysisModal from '@/components/AnalysisModal.vue'

export default {
  components: { AnalysisModal },
  name: 'App',
  data() {
    return {
      highAlchCost: 624,
      notepaperCost: 416,
      totalInventorySlots: 24,
      inventory: new Inventory(24),
      dropTablePaste: '',
      dropTableSearch: '',
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
      ],
      analysisItemStack: null,
      analysis: null
    }
  },
  computed: {
    inventoryTableItems() {
      return this.inventory.slots.map(is => ({
        ...is.item,
        ..._.omit(is, 'item')
      }))
    },
    dropTableItems() {
      return _.cloneDeep(this.dropTable).sort((a, b) => {
        const aRarity = calcRarityNumber(a.rarity)
        const bRarity = calcRarityNumber(b.rarity)
        return bRarity - aRarity
      })
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
      this.analysisItemStack = itemStack
      const options = _.pick(this, ['highAlchCost', 'notepaperCost'])
      this.analysis = analyze(options, this.inventory, itemStack)
    },
    onTakeAction(actionType) {
      this.inventory.takeAction(actionType, this.analysisItemStack)
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
