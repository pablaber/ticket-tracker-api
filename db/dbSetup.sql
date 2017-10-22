drop table prices;

CREATE TABLE prices (
  scrape_time timestamp NOT NULL,
  game_time timestamp NOT NULL,
  home_team varchar(3) NOT NULL,
  away_team varchar(3) NOT NULL,
  price integer NOT NULL,
  PRIMARY KEY(scrape_time, game_time, home_team, away_team)
);
 
-- for dev purposes
insert into prices (scrape_time, game_time, home_team, away_team, price)
values ('2017-10-20 12:00:00', '2017-10-20 19:30:00', 'NYR', 'PIT', 130),
('2017-10-19 12:00:00', '2017-10-20 19:30:00', 'NYR', 'PIT', 120),
('2017-10-18 12:00:00', '2017-10-20 19:30:00', 'NYR', 'PIT', 122),
('2017-10-17 12:00:00', '2017-10-20 19:30:00', 'NYR', 'PIT', 125),
('2017-10-16 12:00:00', '2017-10-20 19:30:00', 'NYR', 'PIT', 130),
('2017-10-15 12:00:00', '2017-10-20 19:30:00', 'NYR', 'PIT', 133),
('2017-10-20 12:00:00', '2017-10-20 19:30:00', 'PHI', 'VGK', 75),
('2017-10-19 12:00:00', '2017-10-20 19:30:00', 'PHI', 'VGK', 78),
('2017-10-18 12:00:00', '2017-10-20 19:30:00', 'PHI', 'VGK', 89),
('2017-10-17 12:00:00', '2017-10-20 19:30:00', 'PHI', 'VGK', 90),
('2017-10-16 12:00:00', '2017-10-20 19:30:00', 'PHI', 'VGK', 95),
('2017-10-15 12:00:00', '2017-10-20 19:30:00', 'PHI', 'VGK', 99),
('2017-10-20 12:00:00', '2017-10-21 19:00:00', 'STL', 'WSH', 100),
('2017-10-19 12:00:00', '2017-10-21 19:00:00', 'STL', 'WSH', 100),
('2017-10-18 12:00:00', '2017-10-21 19:00:00', 'STL', 'WSH', 102),
('2017-10-17 12:00:00', '2017-10-21 19:00:00', 'STL', 'WSH', 99),
('2017-10-16 12:00:00', '2017-10-21 19:00:00', 'STL', 'WSH', 100),
('2017-10-15 12:00:00', '2017-10-21 19:00:00', 'STL', 'WSH', 100),
('2017-10-20 12:00:00', '2017-10-22 12:30:00', 'WSH', 'NYR', 150),
('2017-10-19 12:00:00', '2017-10-22 12:30:00', 'WSH', 'NYR', 148),
('2017-10-18 12:00:00', '2017-10-22 12:30:00', 'WSH', 'NYR', 150),
('2017-10-17 12:00:00', '2017-10-22 12:30:00', 'WSH', 'NYR', 151),
('2017-10-16 12:00:00', '2017-10-22 12:30:00', 'WSH', 'NYR', 160),
('2017-10-15 12:00:00', '2017-10-22 12:30:00', 'WSH', 'NYR', 155);
 
-- prices over time for an exact game (with home and away teams specified)
CREATE FUNCTION prices_for_game (gt timestamp, home varchar(3), away varchar(3)) 
RETURNS setof prices AS $$
BEGIN 
	RETURN QUERY 
    	SELECT * FROM prices 
    	WHERE home_team = home 
    	AND away_team = away 
    	AND game_time = gt 
    	ORDER BY scrape_time ASC; 
    RETURN; 
END; 
$$ LANGUAGE plpgsql;
 
-- prices over time for an exact game (with one team specified)
CREATE FUNCTION prices_for_game (gt timestamp, team varchar(3)) 
RETURNS setof prices AS $$ 
BEGIN 
	RETURN QUERY 
    	SELECT * FROM prices 
        WHERE (home_team = team OR away_team = TEAM) 
        AND game_time = gt 
        ORDER BY scrape_time ASC; 
    RETURN; 
END; 
$$ LANGUAGE plpgsql;
 
-- gives all the prices for a specific scrape
CREATE FUNCTION prices_for_scrape (st timestamp) 
RETURNS setof prices AS $$ 
BEGIN 
	RETURN QUERY 
    	SELECT * FROM prices 
        WHERE scrape_time = st 
        ORDER BY game_time DESC, home_team ASC; 
    RETURN; 
END; 
$$ LANGUAGE plpgsql;
 
-- gives the latest price of all of a teams games
CREATE FUNCTION current_prices_for_team (team varchar(3)) 
RETURNS setof prices AS $$ 
BEGIN 
	RETURN QUERY 
    	SELECT * FROM prices p1 
    	WHERE (p1.home_team = team OR p1.away_team = team) 
        AND p1.scrape_time = (SELECT MAX(p2.scrape_time) 
                              FROM prices p2 
                              WHERE p2.game_time = p1.game_time 
                              AND p2.home_team = p1.home_team 
                              AND p2.away_team = p1.away_team) 
        ORDER BY game_time DESC; 
    RETURN; 
    END; 
$$ LANGUAGE plpgsql;
 
-- gives the latest price for all games on a specific day
CREATE FUNCTION current_prices_for_day (gt timestamp) 
RETURNS setof prices AS $$ 
BEGIN 
	RETURN QUERY SELECT * FROM prices p1 
    WHERE p1.game_time > gt::date 
    AND p1.game_time < gt::date + INTERVAL '1 day' 
    AND p1.scrape_time = (SELECT MAX(p2.scrape_time) FROM prices p2 
                          WHERE p2.game_time = p1.game_time 
                          AND p2.home_team = p1.home_team 
                          AND p2.away_team = p1.away_team) 
    ORDER BY game_time DESC; 
RETURN; 
END; 
$$ LANGUAGE plpgsql;
 
CREATE TYPE typ_price AS (
	scrape_time timestamp,
  	game_time timestamp,
  	home_team varchar(3),
  	away_team varchar(3),
  	price integer
);

CREATE FUNCTION insert_prices (typ_price[]) 
RETURNS void AS $$
BEGIN
	INSERT INTO PRICES (scrape_time, game_time, home_team, away_team, price)
    SELECT scrape_time, game_time, home_team, away_team, price
    FROM UNNEST($1);
END;
$$ LANGUAGE plpgsql;