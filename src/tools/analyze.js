/*
The meat of the app.
Given a dropped ItemStack, analyze what the best action to take with it is.

Possible actions:
Alch it
Leave it
(If inventory not full or it can stack) Take it
(If full and it doesn’t stack) Drop the least valuable item and take it.
(If full and it doesn’t stack) Alch some other item and take it. This is useful because some items are better selling than alching, but if you run out of space they are still worth alching. This action also needs to calculate the optimal item to alch.
(If full, notable, and inventory has a matching item) Note it and note a matching item.
(If full and inventory has a noted stack of the same item) Note it.
(If full and inventory has two (potentially other) items that match and are notable) Note them, take it.

Algorithm:
Consider each available action. Generate a new inventory that would be the result of taking the action. Generate the score of the action by taking the value of the new inventory minus the cost of alch runes or notepaper used to get there.
*/

// eslint-disable-next-line no-unused-vars
import _ from 'lodash'

/*
*/
// eslint-disable-next-line no-unused-vars
export default function analyze({highAlchCost, notepaperCost}, inventory, itemStack) {
  const actions = []

  // alching always available
  actions.push({
    type: 'alch',
    name: 'Alch it',
    score: calcAlchScore(highAlchCost, itemStack)
  })

  // ignoring always available
  actions.push({
    type: 'ignore',
    name: 'Leave it',
    score: 0
  })

  if (inventory.canAddItemStack(itemStack)) {
    actions.push({
      type: 'take',
      name: 'Take it',
      score: calcTakeScore(itemStack)
    })
  }
 
  return _.sortBy(actions, a => -a.score)
}

function calcAlchScore(highAlchCost, itemStack) {
  // inventory doesn't change, we just return the profit/loss from alching
  return (itemStack.item.alchValue - highAlchCost) * itemStack.quantity
}

function calcTakeScore(itemStack) {
  return itemStack.item.geValue * itemStack.quantity
}