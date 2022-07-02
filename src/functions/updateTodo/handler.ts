import {
  formatJSONResponse,
  ValidatedEventAPIGatewayProxyEvent,
} from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import schema from "./schema";
var AWS = require("aws-sdk");

const updateTodo: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  let { title, checked } = event.body;
  const { id } = event.pathParameters;
  const updatedAt = `${new Date()}`;

  console.log("Checed", checked);

  // Create the DynamoDB service object
  var ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
  const TableName = process.env.TODOS_TABLE;

  var params = {
    Key: {
      id: {
        S: id,
      },
    },
    UpdateExpression:
      "set title = :title, checked = :checked, updatedAt = :updatedAt  ",
    ExpressionAttributeValues: {
      ":title": { S: title },
      ":checked": { BOOL: checked },
      ":updatedAt": { S: updatedAt },
    },
    ReturnValues: "UPDATED_NEW",
    TableName,
  };

  let todo;
  try {
    console.log("Params", params);
    todo = await ddb.updateItem(params).promise();
    console.log("Item entered successfully:", todo);
  } catch (err) {
    console.log("Error: ", err);
  }

  todo = AWS.DynamoDB.Converter.unmarshall(todo["Item"]);
  console.log("Todo:", todo);

  return formatJSONResponse(todo);
};

export const main = middyfy(updateTodo);
