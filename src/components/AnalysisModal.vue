<template>
  <b-modal visible @hidden="$emit('hidden')" hide-header hide-footer body-class="p-0">
    <b-table :items="analysis" :fields="fields">
      <template #cell(confirm)="{item}">
        <b-button @click="onConfirm(item.type)">Confirm</b-button>
      </template>
    </b-table>
  </b-modal>
</template>

<script>
export default {
  props: {
    analysis: Array
  },
  data() {
    return {
      fields: [
        {
          key: 'name',
          label: 'Action'
        },
        'score',
        {
          key: 'confirm',
          label: ''
        }
      ]
    }
  },
  methods: {
    onConfirm(actionType) {
      this.$emit('confirm', actionType)
      this.$emit('hidden')
    }
  }
}
</script>