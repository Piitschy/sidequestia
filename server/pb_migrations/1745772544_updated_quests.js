/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2945261690")

  // remove field
  collection.fields.removeById("bool271442091")

  // remove field
  collection.fields.removeById("bool3851113217")

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "select2063623452",
    "maxSelect": 1,
    "name": "status",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "active",
      "complete",
      "failed"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2945261690")

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "bool271442091",
    "name": "done",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "bool3851113217",
    "name": "canceled",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // remove field
  collection.fields.removeById("select2063623452")

  return app.save(collection)
})
