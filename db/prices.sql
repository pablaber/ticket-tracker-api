DROP TABLE prices;

CREATE TABLE prices (
  scrape_time timestamp NOT NULL,
  game_time timestamp NOT NULL,
  home_team varchar(3) NOT NULL,
  away_team varchar(3) NOT NULL,
  price integer NOT NULL,
  PRIMARY KEY(scrape_time, game_time, home_team, away_team)
);