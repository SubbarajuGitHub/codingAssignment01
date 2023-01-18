const express = require("express");
const app = express();

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
      if (!["TO DO", "IN PROGRESS", "DONE"].includes(status)) {
        return response.status(400).send("Invalid Todo Status");
      } else {
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
           status = '${status}'`;
      }
      break;
    case Priority(request.query):
      if (!["HIGH", "MEDIUM", "LOW"].includes(priority)) {
        return response.status(400).send("Invalid Todo Priority");
      } else {
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
      }
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
      break;

    case Category(request.query):
      if (!["WORK", "HOME", "LEARNING"].includes(category)) {
        return response.status(400).send("Invalid Todo Category");
      } else {
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
      }
      break;
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
      break;
  }

  FirstQueryArray = await DataBase.all(getTodosQuery);
  response.send(FirstQueryArray);
});

//API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const SingleToDo = `
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
   id=${todoId}`;
  const SingleTodoArray = await DataBase.get(SingleToDo);
  response.send(SingleTodoArray);
});

//API 3

app.get("/agenda/", (request, response) => {
  const newDate = format(new Date(2021, 12, 12), "yyyy-MM-dd");
  const queryDate = `
  SELECT
  *
  FROM
  todo
  WHERE
  due_date=${newDate}`;
});

//API 4 Create a new todo in todo Table

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  if (!["WORK", "HOME", "LEARNING"].includes(category)) {
    return response.status(400).send("Invalid Todo Category");
  }
  if (!["HIGH", "MEDIUM", "LOW"].includes(priority)) {
    return response.status(400).send("Invalid Todo Priority");
  }

  if (!["TO DO", "IN PROGRESS", "DONE"].includes(status)) {
    return response.status(400).send("Invalid Todo Status");
  } else {
    const CreateTodo = `
    INSERT INTO 
    todo (id,todo,priority,status,category,due_date)
    VALUES("${id}","${todo}","${priority}","${status}","${category}","${dueDate}")
    `;
    const newArray = await DataBase.run(CreateTodo);
    response.send("Todo Successfully Added");
  }
});

//API 5 Put

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;

  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
    case requestBody.category !== undefined:
      updateColumn = "Category";
      break;
    case requestBody.dueDate !== undefined:
      updateColumn = "dueDate";
      break;
  }
  const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`;
  const previousTodo = await DataBase.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.due_date,
  } = request.body;

  const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}',
      category="${category}",
      due_date="${dueDate}"
    WHERE
      id = ${todoId};`;

  await DataBase.run(updateTodoQuery);
  response.send(`${updateColumn} Updated`);
});

//API 6 Delete

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `
   DELETE FROM
   todo
   WHERE
   id=${todoId}`;
  await DataBase.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
