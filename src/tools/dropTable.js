/*
Examples:

Non-stackable:
Uncut sapphire.png: RS3 Elf warrior drops Uncut sapphire with rarity Common in quantity 1	Uncut sapphire	1	Common	603

Stackable fixed:
Rune javelin.png: RS3 Elf warrior drops Rune javelin with rarity Rare in quantity 5	Rune javelin	5	Rare	945

Stackable range:
Rune arrowheads.png: RS3 Elf warrior drops Rune arrowheads with rarity Common in quantity 113-137	Rune arrowheads	113–137	Common	18,419-22,331

Noted range:
Raw shark.png: RS3 Elf warrior drops Raw shark with rarity Uncommon in quantity 225-275 (noted)	Raw shark (m)	225–275 (noted)	Uncommon	167,400-204,600

Don't know of example for Noted fixed
*/

import { Item } from "./inventory"

// since drops have a quantity range and rarity, we cannot use ItemStack
// we don't track if it is noted, but that can be determined from max and item.notable
class DropTableItem {
  constructor(item, min, max, rarity) {
    this.item = item
    this.min = min
    this.max = max
    this.rarity = rarity
    this.noted = max > 1 && item.notable
  }
}

// TODO: currently testing this with rare drop table
export default function translate(input) {
  return input.split('\n').map(line => {
    // replace weird hyphen:
    line = line.replace(/–/g, '-')

    /*
      use regex to break this into parts
      note that (?:) is for a non capturing group, essentially using parentheses without the capture showing up in the matches array
      matches (space separators removed):
      - name: drops (.*)
      - rarity: with rarity (.*)
      - quantity: in quantity ([\d\-,]+(?: \(noted\))?)
      - name again, plus a note if it is members: \1(?: \(m\))?
      - quantity again: \3
      - rarity again, sometimes with one or more footnote, also sometimes an extra comma: .*
      - the last two (.*) are the GE price and alch price, with a few variations (see below)
    */
    const regex = /drops (.*) with rarity (.*) in quantity ([\d\-,]+(?: \(noted\))?)\t\1(?: \(m\))?\t\3\t.*\t(.*)\t(.*)/
    const parts = line.match(regex).slice(1)
    if (parts.some(p => !p)) throw Error(`Failed to parse: ${line}`)

    const [ name, rarity, quantityStr, geValueStr, alchValueStr ] = parts

    const { notable, stackable, min, max } = parseQuantity(quantityStr)
    const { geValue, alchValue } = parseValues(min, geValueStr, alchValueStr)

    const item = new Item(name, { geValue, alchValue, notable, stackable})
    return new DropTableItem(item, min, max, rarity)
  })
}

// determine if it is stackable or notable, and the range
// return { stackable, notable, min, max }
/*
Examples:
remember that any of these (except where the quantity is 1) can have commas as well

Non-stackable:
1

Stackable fixed:
1,000

Stackable range:
1,000-3,000

Noted range:
4,500-5,500 (noted)

have not seen any noted fixed

*/
function parseQuantity(quantityStr) {
  // non-stackable
  if (quantityStr === '1') return { min: 1, max: 1, stackable: false, notable: true }

  // noted range
  if (quantityStr.endsWith(' (noted)')) {
    const rangeStr = quantityStr.slice(0, -8)
    const [min, max] = parseRangeStr(rangeStr)
    return { min, max, stackable: false, notable: true }
  }

  // stackable range
  if (quantityStr.includes('-')) {
    const [min, max] = parseRangeStr(quantityStr)
    return { min, max, stackable: true, notable: false }
  }

  // stackable fixed
  const quantity = parseNum(quantityStr)
  return { min: quantity, max: quantity, stackable: true, notable: false }
}

// determine ge price and high alch price
// return { geValue, alchValue }
/*
Examples:
Note that both prices are always multiplied by the quantity
Note the \t character is the delimiter

Single/fixed:
13,720	210

Range:
215-645	75-225

Alch only fixed:x
30,000High Level Alchemy icon.png	30,000

Alch only range:x
20-427High Level Alchemy icon.png	20-427

GE only:
2,900	Not alchemisable

GE only range:
6,650-7,980	Not alchemisable

Neither:x
Not sold	Not alchemisable
*/
function parseValues(min, geValueStr, alchValueStr) {
  // Neither
  // this works because if it is alch only, the wiki puts the alch value into the GE price column
  if (geValueStr === 'Not sold') return { geValue: 0, alchValue: 0 }

  if (geValueStr.includes('High Level Alchemy icon.png')) {
    // go off the alchValueStr since it is easier

    // Alch only range
    if (alchValueStr.includes('-')) {
      const [minValue] = parseRangeStr(alchValueStr)
      return { geValue: 0, alchValue: minValue/min }
    }

    // Alch only fixed
    const price = parseNum(alchValueStr)
    return { geValue: 0, alchValue: price/min }
  }

  // weird cases are handled, so we can do the rest normally
  let alchValue
  if (alchValueStr === 'Not alchemisable') alchValue = 0
  else if (alchValueStr.includes('-')) {
    const [minValue] = parseRangeStr(alchValueStr)
    alchValue = minValue/min
  } else alchValue = parseNum(alchValueStr)/min

  let geValue
  if (geValueStr.includes('-')) {
    const [minValue] = parseRangeStr(geValueStr)
    geValue = minValue/min
  } else geValue = parseNum(geValueStr)/min

  return { alchValue, geValue }
}

function parseRangeStr(str) {
  return str.split('-').map(parseNum)
}

function parseNum(str) {
  return Number(str.replace(/,/g, ''))
}