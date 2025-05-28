package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/SherClockHolmes/webpush-go"
)

type Subscription struct {
	Endpoint string `db:"endpoint"`
	Keys     struct {
		Auth   string `db:"auth"`
		P256dh string `db:"p256dh"`
	} `db:"keys"`
}

func sendPush(subscription Subscription, title, body, url string) error {
	// Notification-Payload inkl. URL
	payload := map[string]string{
		"title": title,
		"body":  body,
		"url":   url,
	}
	jsonPayload, _ := json.Marshal(payload)

	// WebPush-Abo
	sub := &webpush.Subscription{
		Endpoint: subscription.Endpoint,
		Keys: webpush.Keys{
			Auth:   subscription.Keys.Auth,
			P256dh: subscription.Keys.P256dh,
		},
	}

	// Push senden
	resp, err := webpush.SendNotification(jsonPayload, sub, &webpush.Options{
		TTL:             60,
		Subscriber:      os.Getenv("VAPID_SUBSCRIBER"),
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
