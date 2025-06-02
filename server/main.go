package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/SherClockHolmes/webpush-go"
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
		// se.Router.GET("/{path...}", apis.Static(os.DirFS("./pb_public"), false))
		g := se.Router.Group("/api/v1")
		g.Bind(apis.RequireAuth())
		g.POST("/accept-quest", AcceptQuestHandler)
		g.POST("/payout", PayOutHandler)
		g.POST("/join-party", JoinPartyHandler)
		g.GET("/vapid-public-key", func(c *core.RequestEvent) error {
			// Return the VAPID public key
			return c.JSON(http.StatusOK, map[string]string{
				"vapid_public_key": os.Getenv("VAPID_PUBLIC_KEY"),
			})
		})

		return se.Next()
	})

	app.OnRecordAfterUpdateSuccess("quest_subscriptions").BindFunc(func(e *core.RecordEvent) error {
		questId := e.Record.GetString("quest")
		quest, err := e.App.FindRecordById("quests", questId)
		if err != nil {
			log.Printf("Failed to find quest with ID %s: %v", questId, err)
			return e.Next()
		}
		creatorId := quest.GetString("creator")
		if e.Record.GetString("status") == "done" {
			// Notify the user who created the subscription that the quest is done
			err = NotifyUserOnQuest(
				e.App,
				creatorId,
				questId,
				"Quest Completed",
				fmt.Sprintf("Your quest '%s' has been completed.", quest.GetString("title")),
			)
			if err != nil {
				log.Printf("Failed to notify user %s about quest completion: %v", creatorId, err)
			}
		} else if e.Record.GetString("proof") != "" {
			// Notify the user who created the subscription that the proof is AcceptQuestHandler
			err = NotifyUserOnQuest(
				e.App,
				creatorId,
				questId,
				"Proof Submitted",
				fmt.Sprintf("A proof for your quest '%s' has been submitted.", quest.GetString("title")),
			)
			if err != nil {
				log.Printf("Failed to notify user %s about proof submission: %v", creatorId, err)
			}
		}
		return e.Next()
	})

	app.OnRecordAfterCreateSuccess("quest_subscriptions").BindFunc(func(e *core.RecordEvent) error {
		questId := e.Record.GetString("quest")
		quest, err := e.App.FindRecordById("quests", questId)
		if err != nil {
			log.Printf("Failed to find quest with ID %s: %v", questId, err)
			return e.Next()
		}
		creatorId := quest.GetString("creator")
		err = NotifyUserOnQuest(
			e.App,
			creatorId,
			questId,
			"New Adventurer",
			fmt.Sprintf(
				"Your quest '%s' has a new adventurer.",
				quest.GetString("title"),
			),
		)
		return e.Next()
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
			rec, err := e.App.FindFirstRecordByFilter(
				"party_users",
				"user.id={:user} && party.id={:party}",
				dbx.Params{
					"user":  user.Id,
					"party": e.Record.GetString("party"),
				},
			)
			if err != nil {
				log.Printf("Failed to update quest points for user %s: %v", user.Id, err)
				continue
			}
			questPoints := e.Record.GetInt("questpoints")
			// Update the user's quest questPoints
			rec.Set("questpoints", rec.GetInt("questpoints")+questPoints)
			if err := e.App.Save(rec); err != nil {
				log.Printf("Failed to update quest points for user %s: %v", user.Id, err)
				continue
			}
			log.Printf("Updated quest points for user %s: %d", user.Id, rec.GetInt("questpoints"))
			if err := e.App.Save(rec); err != nil {
				log.Printf("Failed to save updated quest points for user %s: %v", user.Id, err)
				continue
			}
			// Notify the user that they received quest points
			err = NotifyUserOnQuest(
				e.App,
				user.Id,
				e.Record.Id,
				"Quest Completed",
				fmt.Sprintf(
					"You have completed the quest '%s' and received %d quest points.",
					e.Record.GetString("title"),
					questPoints,
				),
			)
			if err != nil {
				log.Printf("Failed to notify user %s about quest completion: %v", user.Id, err)
			}
		}
		return e.Next()
	})

	app.OnRecordAfterCreateSuccess("quests").BindFunc(func(e *core.RecordEvent) error {
		partyId := e.Record.GetString("party")

		err := NotifyPartyOnQuest(e.App, partyId, e.Record.Id, "New Quest Available",
			fmt.Sprintf(
				"A new quest '%s' is available in your party.",
				e.Record.GetString("title"),
			),
		)

		if err != nil {
			log.Printf("%s", err)
		}

		return e.Next()
	})

	app.OnRecordAfterCreateSuccess("parties").BindFunc(func(e *core.RecordEvent) error {
		// create party_users from admin user
		admins := e.Record.GetStringSlice("admins")
		partyId := e.Record.Id
		if len(admins) == 0 {
			return e.Next()
		}
		for _, admin := range admins {
			_, err := e.App.DB().
				NewQuery("INSERT INTO party_users (party, user, questpoints) VALUES ({:party}, {:user}, 0)").
				Bind(dbx.Params{
					"party": partyId,
					"user":  admin,
				}).
				Execute()
			if err != nil {
				log.Printf("Failed to create party user for admin %s: %v", admin, err)
				continue
			}
		}
		return e.Next()
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}

func NotifyPartyOnQuest(app core.App, partyId, questId, msgTitle, msgBody string) error {
	pushSubs := []PushSubscription{}
	err := app.DB().
		NewQuery("SELECT ps.endpoint as endpoint, ps.auth as auth, ps.p256dh as p256dh FROM push_subscriptions ps LEFT JOIN party_users pu ON pu.user = ps.user WHERE pu.party = {:party}").
		Bind(dbx.Params{
			"party": partyId,
		}).
		All(&pushSubs)

	if err != nil {
		return fmt.Errorf("Failed to get push subscriptions for party %s: %v", partyId, err)
	}

	for _, sub := range pushSubs {
		// Notification-Payload inkl. URL
		err = SendPush(
			sub,
			msgTitle,
			msgBody,
			"/quests/"+questId,
		)
		if err != nil {
			log.Printf("Failed to send push notification to %s: %v", sub.Endpoint, err)
			continue
		}
	}

	return nil
}

func NotifyUserOnQuest(app core.App, userId, questId, msgTitle, msgBody string) error {
	pushSubs := []PushSubscription{}
	err := app.DB().
		NewQuery("SELECT endpoint, auth, p256dh FROM push_subscriptions WHERE user = {:user}").
		Bind(dbx.Params{
			"user": userId,
		}).
		All(&pushSubs)

	if err != nil {
		return fmt.Errorf("Failed to get push subscriptions for user %s: %v", userId, err)
	}

	for _, sub := range pushSubs {
		// Notification-Payload inkl. URL
		err = SendPush(
			sub,
			msgTitle,
			msgBody,
			"/quests/"+questId,
		)
		if err != nil {
			log.Printf("Failed to send push notification to %s: %v", sub.Endpoint, err)
			continue
		}
	}

	return nil
}

type JoinPartyRequest struct {
	InviteCode string `json:"invite_code" form:"invite_code" binding:"required"`
}

func JoinPartyHandler(e *core.RequestEvent) error {
	body := &JoinPartyRequest{}
	if err := e.BindBody(&body); err != nil {
		return e.BadRequestError("Failed to read request data", err)
	}

	// Find the party by invite code
	inviteCode := strings.ToUpper(body.InviteCode)
	party, err := e.App.FindFirstRecordByFilter(
		"parties",
		"invite_code={:invite_code}",
		dbx.Params{
			"invite_code": inviteCode,
		},
	)
	if err != nil {
		return e.BadRequestError("Failed to find party", err)
	}

	rec, err := e.App.FindFirstRecordByFilter(
		"party_users",
		"user.id={:user} && party.id={:party}",
		dbx.Params{
			"user":  e.Auth.Id,
			"party": party.Id,
		},
	)
	if err == nil {
		// User is already in the party
		disabled := rec.GetBool("disabled")
		if disabled {
			// If the user is disabled, re-enable them
			rec.Set("disabled", false)
			if err := e.App.Save(rec); err != nil {
				return e.BadRequestError("Failed to re-enable user in party", err)
			}
			return e.JSON(
				http.StatusOK,
				map[string]any{"success": true, "message": "Re-enabled user in party"},
			)
		}
		return e.BadRequestError("User is already in the party", nil)
	}

	_, err = e.App.DB().
		NewQuery("INSERT INTO party_users (party, user, questpoints) VALUES ({:party}, {:user}, 0)").
		Bind(dbx.Params{
			"party": party.Id,
			"user":  e.Auth.Id,
		}).
		Execute()
	if err != nil {
		return e.BadRequestError("Failed to join party", err)
	}

	// Return a success response
	return e.JSON(http.StatusOK, map[string]any{"success": true, "party_id": party.Id})
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
	partyuser, err := e.App.FindFirstRecordByFilter(
		"party_users",
		"user.id={:user} && party.id={:party}",
		dbx.Params{
			"user":  userId,
			"party": quest.GetString("party"),
		},
	)
	if err != nil {
		return e.BadRequestError("Failed to find user", err)
	}
	questPoints := quest.GetInt("questpoints")
	// Update the user's quest points
	partyuser.Set("questpoints", partyuser.GetInt("questpoints")+questPoints)
	if err := e.App.Save(partyuser); err != nil {
		return e.BadRequestError("Failed to update user quest points", err)
	}

	// Update the subscription status to paid
	subscription.Set("paid_out", true)
	if err := e.App.Save(subscription); err != nil {
		return e.BadRequestError("Failed to update subscription status", err)
	}

	// Notify the user that the payout was successful
	err = NotifyUserOnQuest(
		e.App,
		userId,
		quest.Id,
		"You received a payout",
		fmt.Sprintf(
			"You have received a payout of %d quest points for completing the quest '%s'.",
			questPoints,
			quest.GetString("title"),
		),
	)
	if err != nil {
		log.Printf("Failed to notify user %s about payout: %v", userId, err)
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

type PushSubscription struct {
	Endpoint string `db:"endpoint"`
	Auth     string `db:"auth"`
	P256dh   string `db:"p256dh"`
}

func SendPush(subscription PushSubscription, title, body, url string) error {
	// Notification-Payload inkl. URL
	payload := map[string]string{
		"title": title,
		"body":  body,
		"url":   url,
	}
	jsonPayload, _ := json.Marshal(payload)

	ss := fmt.Sprintf(
		`{"endpoint":"%s","expirationTime":null,"keys":{"auth":"%s","p256dh":"%s"}}`,
		subscription.Endpoint,
		subscription.Auth,
		subscription.P256dh,
	)

	fmt.Println("Push Subscription:", ss)

	s := &webpush.Subscription{}
	json.Unmarshal([]byte(ss), s)

	// Push senden
	resp, err := webpush.SendNotification(jsonPayload, s, &webpush.Options{
		TTL:             30,
		Subscriber:      "example@example.com",
		VAPIDPublicKey:  os.Getenv("VAPID_PUBLIC_KEY"),
		VAPIDPrivateKey: os.Getenv("VAPID_PRIVATE_KEY"),
	})
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode == http.StatusGone || resp.StatusCode == http.StatusNotFound {
		log.Println("Push-Abo nicht mehr gültig:", subscription.Endpoint)
		// optional: aus DB löschen
	}
	return nil
}
