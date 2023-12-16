const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
let dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("server is running at http://localhost/3001/");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//get all players API
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT 
    *
    FROM 
    cricket_team;`;
  const playersArray = await db.all(getPlayersQuery);
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//create new Player
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const newPlayerQuery = `
  INSERT INTO
  cricket_team (player_name, jersey_number, role)
  VALUES (
    '${playerName}',
    ${jerseyNumber},
    '${role}'
    );`;
  const dbResponse = await db.run(newPlayerQuery);
  const lastId = dbResponse.lastID;
  response.send("Player Added to Team");
});

//get A Player
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `
  SELECT 
    *
  FROM 
    cricket_team 
  WHERE
    player_id = ${playerId};`;
  let playerDb = await db.get(getPlayer);
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };
  response.send(convertDbObjectToResponseObject(playerDb));
});

//update player details Api
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updateQuery = `
  UPDATE 
  cricket_team
  SET 
  player_name='${playerName}',
  jersey_number=${jerseyNumber},
  role = '${role}'
  WHERE
  player_id=${playerId};`;
  const updatedDb = await db.run(updateQuery);
  response.send("Player Details Updated");
});

//Delete Player API
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
  DELETE FROM 
  cricket_team
  WHERE 
  player_id = ${playerId};`;
  await db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
