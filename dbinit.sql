/* SQL Export using CockroachDB SQL Migration Tool */

-- Statement 1
SET default_int_size = 4;

-- Statement 2
CREATE TABLE users (
	id VARCHAR(20) PRIMARY KEY,
	name VARCHAR(50),
	username VARCHAR(20)
);

-- Statement 3
CREATE TABLE language (
	lang_id VARCHAR(20) PRIMARY KEY, lang_name VARCHAR(40)
);

-- Statement 4
CREATE TABLE hashtags (
	hashtag_id VARCHAR(20) PRIMARY KEY,
	hashtags_text VARCHAR(140)
);

-- Statement 5
CREATE TABLE issues (
	issue_id VARCHAR(20) PRIMARY KEY,
	issue_type VARCHAR(140)
);

-- Statement 6
CREATE TABLE tweets (
	id VARCHAR(20),
	tweetid VARCHAR(30) PRIMARY KEY,
	tweets_text VARCHAR(1500),
	issue_id VARCHAR(20),
	lang_id VARCHAR(20),
	FOREIGN KEY (issue_id) REFERENCES issues (issue_id),
	FOREIGN KEY (id) REFERENCES users (id),
	FOREIGN KEY (lang_id) REFERENCES language (lang_id)
);

-- Statement 7
CREATE TABLE has (
	hashtag_id VARCHAR(20), tweetid VARCHAR(20),
	FOREIGN KEY (hashtag_id)
		REFERENCES hashtags (hashtag_id),
	FOREIGN KEY (tweetid) REFERENCES tweets (tweetid),
	PRIMARY KEY (hashtag_id, tweetid)
);