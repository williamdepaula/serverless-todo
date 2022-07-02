import {
  formatJSONResponse,
  ValidatedEventAPIGatewayProxyEvent,
} from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import schema from "./schema";
const { v4: uuidv4 } = require("uuid");
var AWS = require("aws-sdk");

const createTodo: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const { title } = event.body;

  if (!title) {
    return formatJSONResponse(
      {
        title: "Cannot be empty",
      },
      403
    );
  }
  const id = uuidv4();
  const createdAt = `${new Date()}`;
  const updatedAt = `${new Date()}`;
  const checked = false;

  AWS.config.update({ region: "us-east-1" });
  // Create the DynamoDB service object
  var ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
  const TableName = process.env.TODOS_TABLE;

  var params = {
    Item: {
      id: {
        S: id,
      },
      title: {
        S: title,
      },
      createdAt: {
        S: createdAt,
      },
      updatedAt: {
        S: updatedAt,
      },
      checked: {
        BOOL: checked,
      },
    },
    TableName,
  };

  let todo;
  try {
    todo = await ddb.putItem(params).promise();
    console.log("Item entered successfully:", todo);
    console.log("Params", params);
  } catch (err) {
    console.log("Error: ", err);
  }

  return formatJSONResponse({
    title,
    id,
    createdAt,
    updatedAt,
    checked,
  });
};

export const main = middyfy(createTodo);
