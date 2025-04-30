package main

import (
	"log"
	"net/http"
	"os"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/types"
)

func main() {
	app := pocketbase.New()

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		// serves static files from the provided public dir (if exists)
		se.Router.GET("/{path...}", apis.Static(os.DirFS("./pb_public"), false))
		g := se.Router.Group("/api/v1")
		g.Bind(apis.RequireAuth())
		g.POST("/accept-quest", AcceptQuestHandler)

		return se.Next()
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}

type AcceptQuestRequest struct {
	QuestID string `json:"quest_id" form:"quest_id" binding:"required"`
}

func AcceptQuestHandler(e *core.RequestEvent) error {
	body := &AcceptQuestRequest{}
	if err := e.BindBody(&body); err != nil {
		return e.BadRequestError("Failed to read request data", err)
	}

	quest, err := e.App.FindRecordById("quests", body.QuestID)
	if err != nil {
		return e.BadRequestError("Failed to get quest", err)
	}

	if quest.GetString("status") != "active" {
		return e.BadRequestError("Quest is not active", nil)
	}

	expires := quest.GetDateTime("expires")
	if !expires.IsZero() {
		// Check if the quest is expired
		if expires.Before(types.NowDateTime()) {
			return e.BadRequestError("Quest is expired", nil)
		}
	}

	// Check if the user is already subscribed to the quest
	err = e.App.DB().NewQuery("SELECT * FROM quest_subscriptions WHERE quest = :quest AND user = :user").Bind(dbx.Params{
		"quest": quest.Id,
		"user":  e.Auth.Id,
	}).One(&core.Record{})
	if err == nil {
		return e.BadRequestError("User is already subscribed to the quest", nil)
	}

	qsCol, err := e.App.FindCollectionByNameOrId("quest_subscriptions")
	if err != nil {
		return e.BadRequestError("Failed to find quest subscriptions collection", err)
	}
	sub := core.NewRecord(qsCol)
	sub.Set("quest", quest.Id)
	sub.Set("user", e.Auth.Id)
	sub.Set("status", "pending")
	err = e.App.Save(sub)
	if err != nil {
		return e.BadRequestError("Failed to save quest subscription", err)
	}

	quest.Set("times_done", quest.GetInt("times_done")+1)
	err = e.App.Save(quest)
	if err != nil {
		return e.BadRequestError("Failed to update quest", err)
	}

	// Return a success response
	return e.JSON(http.StatusOK, map[string]any{"success": true, "subscription_id": sub.Id})
}
