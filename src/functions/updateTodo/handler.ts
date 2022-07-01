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
  let { text, checked } = event.body;
  const { id } = event.pathParameters;
  const updatedAt = `${new Date()}`;

  console.log("Checed", checked);

  // Create the DynamoDB service object
  var ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
  const TableName = process.env.TODOS_TABLE;

  var params = {
    Key: {
      id: {
        S: `${id}`,
      },
    },
    TableName,
  };

  let data;
  try {
    data = await ddb.getItem(params).promise();
    console.log("Item updated successfully:", data);
    console.log("Params", params);
  } catch (err) {
    console.log("Error: ", err);
  }

  data = AWS.DynamoDB.Converter.unmarshall(data["Item"]);
  console.log("Data:", data);
  var params2 = {
    TableName,
    Key: {
      id: id,
    },
    UpdateExpression: `set text = :updateValue`,
    ExpressionAttributeValues: {
      ":updateValue": text,
    },
  };

  // {
  //   text: {
  //     Value: text,
  //   },
  //   updatedAt: {
  //     Value: updatedAt,
  //   },
  //   checked: {
  //     Value: checked,
  //   },
  // },
  // TableName,

  let todo;
  try {
    console.log("Params2", params2);
    todo = await ddb.updateItem(params2).promise();
    console.log("Item entered successfully:", todo);
  } catch (err) {
    console.log("Error: ", err);
  }

  todo = AWS.DynamoDB.Converter.unmarshall(data["Item"]);
  console.log("Todo:", todo);

  return formatJSONResponse(todo);
};

export const main = middyfy(updateTodo);
