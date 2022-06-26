// an item is always singular
// it can be notable but not noted
// this is the abstract "possible item", not an actual single item which would be an ItemStack
// since it is the possible item, only one of each name can exist
const items = []
export class Item {
  constructor(name, config = {}) {
    const existingItem = items.find(i => i.name === name)
    if (existingItem) return existingItem

    const {
      geValue = 0,
      alchValue = 0,
      stackable = false,
      notable = false
    } = config

    if (stackable && notable) throw Error ('items can only be stackable OR notable, not both')

    this.name = name
    this.notable = notable
    this.stackable = stackable

    this.geValue = geValue
    this.alchValue = alchValue
  }
}

// an ItemStack is what is in any non-empty slot of an inventory
// it can be noted or not, stackable or not
// note that while an Item cannot be notable and stackable, noted ItemStack are ALWAYS stackable
export class ItemStack {
  constructor(item, quantity = 1, noted = false) {
    if (quantity > 1 && !noted && !item.stackable) throw Error(`Unstackable item ${item.name} has quantity ${quantity} without being noted`)
    this.item = item
    this.quantity = quantity
    this.noted = noted
  }
}

// inventory is just the items they want to sell and any coins they have made from alching
// NOT notepaper, alch runes, food, untradeables, etc
export class Inventory {
  constructor(totalSlots = 0) {
    this.slots = []
    this.coins = 0
    this.totalSlots = totalSlots

    this._calculateValue()
  }

  canAddItemStack(itemStack) {
    const slotToStackInto = this.slots.find(s => {
      const slotItem = s.item
      return slotItem.name === itemStack.item.name
      && (slotItem.stackable || (s.noted && itemStack.noted))
    })

    return slotToStackInto || (this.totalSlots > this.slots.length)
  }

  addItemStack(itemStack) {
    if (!this.canAddItemStack(itemStack)) throw Error('Trying to add item to full inventory')

    // see if we can combine this into any stack
    const slotToStackInto = this.slots.find(s => {
      const slotItem = s.item
      return slotItem.name === itemStack.item.name
      && (slotItem.stackable || (s.noted && itemStack.noted))
    })
    if (slotToStackInto) slotToStackInto.quantity += itemStack.quantity // maybe should make new instead of mutating
    else {
      this.slots.push(itemStack)
    }

    this._calculateValue()
  }

  setTotalSlots(totalSlots) {
    if (totalSlots < this.slots.length) throw Error('Trying to reduce size of inventory below current number of items')
    this.totalSlots = Number(totalSlots)
  }

  getFreeSlots() {
    return this.totalSlots - this.slots.length
  }

  _calculateValue() {
    const slotsValue = this.slots
      .map(s => s.item.geValue * s.quantity)
      .reduce((total, val) => total + val, 0)
    this.value = this.coins + slotsValue
  }
}