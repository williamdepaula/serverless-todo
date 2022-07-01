import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
var AWS = require("aws-sdk");

const hello: any = async (event) => {
  // AWS.config.update({ region: "us-east-1" });
  const { id } = event.pathParameters;

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
    console.log("Item entered successfully:", data);
    console.log("Params", params);
  } catch (err) {
    console.log("Error: ", err);
  }
  const todo = AWS.DynamoDB.Converter.unmarshall(data["Item"]);
  console.log("Todo:", todo);

  return formatJSONResponse(todo);
};

export const main = middyfy(hello);
