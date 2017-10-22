-- used to insert into the prices table
CREATE TYPE typ_price AS (
	scrape_time timestamp,
  	game_time timestamp,
  	home_team varchar(3),
  	away_team varchar(3),
  	price integer
);