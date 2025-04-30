/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2945261690")

  // update collection data
  unmarshal({
    "viewRule": "@request.auth.id != \"\" && (@collection.groups.quests.id = id && @collection.groups.users.id = @request.auth.id) || @request.auth.id = creator"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2945261690")

  // update collection data
  unmarshal({
    "viewRule": null
  }, collection)

  return app.save(collection)
})
