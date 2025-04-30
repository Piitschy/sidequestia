/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3836754036")

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "file4227416285",
    "maxSelect": 1,
    "maxSize": 0,
    "mimeTypes": [],
    "name": "proof",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3836754036")

  // remove field
  collection.fields.removeById("file4227416285")

  return app.save(collection)
})
