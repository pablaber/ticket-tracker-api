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

-- inserts multiple rows into the prices table
CREATE FUNCTION insert_prices (typ_price[]) 
RETURNS void AS $$
BEGIN
	INSERT INTO PRICES (scrape_time, game_time, home_team, away_team, price)
    SELECT scrape_time, game_time, home_team, away_team, price
    FROM UNNEST($1);
END;
$$ LANGUAGE plpgsql;