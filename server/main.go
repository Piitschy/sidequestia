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
		g.POST("/payout", PayOutHandler)

		return se.Next()
	})

	app.OnRecordAfterUpdateSuccess("quests").BindFunc(func(e *core.RecordEvent) error {
		// Check if the quest is completed
		if e.Record.GetString("status") != "completed" {
			return e.Next()
		}
		// Give all users who completed the quest points

		// Get all users who completed the quest
		type UserId struct {
			Id string `db:"user"`
		}
		users := []UserId{}
		e.App.DB().
			NewQuery("SELECT user FROM quest_subscriptions WHERE quest = {:quest} AND status = 'done' AND NOT paid_out").
			Bind(dbx.Params{
				"quest": e.Record.Id,
			}).
			All(&users)
		for _, user := range users {
			e.App.DB().
				NewQuery("UPDATE users SET questpoints = questpoints + {:sqp} WHERE id = {:id}").
				Bind(dbx.Params{
					"sqp": e.Record.GetInt("questpoints"),
					"id":  user.Id,
				},
				).
				Execute()
		}
		return e.Next()
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}

type PayOutRequest struct {
	SubscriptionID string `json:"subscription_id" form:"subscription_id" binding:"required"`
}

func PayOutHandler(e *core.RequestEvent) error {
	body := &PayOutRequest{}
	if err := e.BindBody(&body); err != nil {
		return e.BadRequestError("Failed to read request data", err)
	}

	subscription, err := e.App.FindRecordById("quest_subscriptions", body.SubscriptionID)
	if err != nil {
		return e.BadRequestError("Failed to get subscription", err)
	}

	quest, err := e.App.FindRecordById("quests", subscription.GetString("quest"))
	if err != nil {
		return e.BadRequestError("Failed to find quest", err)
	}

	if subscription.GetString("status") != "done" {
		return e.BadRequestError("Subscription is not done", nil)
	}

	// Set user's quest points
	userId := subscription.GetString("user")
	user, err := e.App.FindRecordById("users", userId)
	if err != nil {
		return e.BadRequestError("Failed to find user", err)
	}
	questPoints := quest.GetInt("questpoints")
	// Update the user's quest points
	user.Set("questpoints", user.GetInt("questpoints")+questPoints)
	if err := e.App.Save(user); err != nil {
		return e.BadRequestError("Failed to update user quest points", err)
	}

	// Update the subscription status to paid
	subscription.Set("paid_out", true)
	if err := e.App.Save(subscription); err != nil {
		return e.BadRequestError("Failed to update subscription status", err)
	}

	// Return a success response
	return e.JSON(http.StatusOK, map[string]any{"success": true})
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
	err = e.App.DB().
		NewQuery("SELECT * FROM quest_subscriptions WHERE quest = {:quest} AND user = {:user}").
		Bind(dbx.Params{
			"quest": quest.Id,
			"user":  e.Auth.Id,
		}).
		One(&core.Record{})
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

	// Return a success response
	return e.JSON(http.StatusOK, map[string]any{"success": true, "subscription_id": sub.Id})
}
