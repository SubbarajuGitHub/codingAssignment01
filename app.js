const express = require("express");
const app = express();

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");

const dbPath = path.join(__dirname, "todoApplication.db");

let DataBase = null;

const ServerUpdate = async () => {
  try {
    DataBase = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running");
    });
  } catch (error) {
    console.log("error");
    process.exit(1);
  }
};

ServerUpdate();

// API First

const Status = (RequestObject) => {
  return RequestObject.status !== undefined;
};

const Priority = (RequestObject) => {
  return RequestObject.priority !== undefined;
};

const Priority_Status = (RequestObject) => {
  return (
    RequestObject.priority !== undefined && RequestObject.status !== undefined
  );
};

const SearchQ = (RequestObject) => {
  return RequestObject.search_q !== undefined;
};

const Category_Status = (RequestObject) => {
  return (
    RequestObject.category !== undefined && RequestObject.status !== undefined
  );
};

const Category = (RequestObject) => {
  return RequestObject.category !== undefined;
};

const Category_Priority = (RequestObject) => {
  return (
    RequestObject.category !== undefined && RequestObject.priority !== undefined
  );
};

app.get("/todos/", async (request, response) => {
  const { status, priority, category, search_q = "" } = request.query;
  let getTodosQuery = "";
  let FirstQueryArray = "";
  switch (true) {
    case Status(request.query):
      getTodosQuery = `
      SELECT
        id as id,
        todo as todo,
        priority as priority,
        status as status,
        category as category,
        due_date as dueDate
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}'`;
      break;

    case Priority(request.query):
      getTodosQuery = `
      SELECT
        id as id,
        todo as todo,
        priority as priority,
        status as status,
        category as category,
        due_date as dueDate
      FROM
        todo 
      WHERE
         priority = '${priority}'`;
      break;

    case Priority_Status(request.query):
      getTodosQuery = `
      SELECT
        id as id,
        todo as todo,
        priority as priority,
        status as status,
        category as category,
        due_date as dueDate
      FROM
        todo 
      WHERE
         status="${status}" AND 
         priority = '${priority}'`;
      break;

    case SearchQ(request.query):
      getTodosQuery = `
      SELECT
        id as id,
        todo as todo,
        priority as priority,
        status as status,
        category as category,
        due_date as dueDate
      FROM
        todo 
      WHERE
         todo LIKE "%${search_q}%"`;
      break;

    case Category_Status(request.query):
      getTodosQuery = `
        SELECT
        id as id,
        todo as todo,
        priority as priority,
        status as status,
        category as category,
        due_date as dueDate
        FROM
        todo
        WHERE
        category="${category}" AND
        status="${status}"`;

    case Category(request.query):
      getTodosQuery = `
        SELECT
        id as id,
        todo as todo,
        priority as priority,
        status as status,
        category as category,
        due_date as dueDate
        FROM
        todo
        WHERE
        category="${category}"
        `;

    case Category_Priority(request.query):
      getTodosQuery = `
        SELECT
        id as id,
        todo as todo,
        priority as priority,
        status as status,
        category as category,
        due_date as dueDate
        FROM
        todo
        WHERE
        category="${category}
        AND priority="${priority}"
        `;
  }

  FirstQueryArray = await DataBase.all(getTodosQuery);
  response.send(FirstQueryArray);
});

module.exports = app;
