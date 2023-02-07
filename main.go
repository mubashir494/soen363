package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/sivchari/gotwtr"
)

type ToJson struct {
	Tweets []*gotwtr.SearchTweetsResponse `json:"tweets"`
	Issue  string                         `json:"issue_id"`
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal(err)
	}
	getTweets()
}

func getTweets() {
	f, _ := os.Create("output.json")
	defer f.Close()

	//array to query for 1000 tweets
	var count, iteration int = 0, 0
	total := ToJson{}
	nextToken := ""

	queries := []string{"ukraine war world economic",
		"ukraine war world political", "ukraine war world death",
		"ukraine war world lives", "ukraine war world humanity", "ukraine war world environment"}
	count1 := 0

	for i := 0; i < len(queries); i++ {

		for i := 0; i < 4; i++ {
			fmt.Println("query", queries[iteration])
			client := gotwtr.New(os.Getenv("BEARER_TOKEN"))
			tsr, err := client.SearchRecentTweets(context.Background(), queries[iteration], &gotwtr.SearchTweetsOption{

				Expansions: []gotwtr.Expansion{
					gotwtr.ExpansionAttachmentsMediaKeys,
					gotwtr.ExpansionEntitiesMentionsUserName,
					gotwtr.ExpansionAuthorID,
					// gotwtr.ExpansionEntitiesMentionsUserName,
				},
				TweetFields: []gotwtr.TweetField{
					gotwtr.TweetFieldAuthorID,
					gotwtr.TweetFieldText,
					gotwtr.TweetFieldID,
					gotwtr.TweetFieldEntities,
					gotwtr.TweetFieldGeo,
					gotwtr.TweetFieldLanguage,
				},
				UserFields: []gotwtr.UserField{
					gotwtr.UserFieldID,
					gotwtr.UserFieldName,
					gotwtr.UserFieldCreatedAt,
					gotwtr.UserFieldUserName,
					gotwtr.UserFieldEntities,
					gotwtr.UserFieldPinnedTweetID,
					gotwtr.UserFieldVerified,
					gotwtr.UserFieldLocation,
				},
				MaxResults: 100,
				NextToken:  nextToken,
			})
			if err != nil {
				log.Fatal(err)
			}
			for i, _ := range tsr.Tweets {
				_ = i
				count1++
			}
			tsr.Type = queries[iteration]
			fmt.Println("TYPOE", tsr.Type)
			total.Tweets = append(total.Tweets, tsr)

			fmt.Println(total)
			fmt.Println(nextToken)
			fmt.Println(count)

			count++

			nextToken = tsr.Meta.NextToken
		}
		fmt.Println("entries number", count1)

		iteration++

		nextToken = ""
		if count >= 1000 {
			break
		}
	}

	jsn, err := json.MarshalIndent(total, "", "\t")
	if err != nil {
		panic(err)
	}
	f.Write(jsn)
	log.Println(nextToken) //tsr.Meta.NextToken)

}
