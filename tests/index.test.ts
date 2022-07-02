import axios from "axios";

const url = process.env.URL;

describe("Todo List", () => {
  test("should create a todo item", async () => {
    const res = await axios.post(`${url}/todos`, {
      title: "Learn serverless",
    });
    expect(res.status).toEqual(200);
    expect(res.data.title).toMatch("Learn serverless");
    expect(res.data.id).toBeTruthy();
    expect(res.data.createdAt).toBeTruthy();
    expect(res.data.updatedAt).toBeTruthy();
    expect(res.data.checked).toBeFalsy();
  });

  test("should return an item previously created", async () => {
    const resCreate = await axios.post(`${url}/todos`, {
      title: "Learn serverless",
    });
    const { id } = resCreate.data;

    const resCheck = await axios.get(`${url}/todos/${id}`);
    expect(resCheck.status).toEqual(200);
    expect(resCheck.data.title).toMatch("Learn serverless");
  });

  test("should return 403 invalid format if try created todo with empty text", async () => {
    try {
      await axios.post(`${url}/todos`, {
        title: "",
      });
    } catch (e) {
      expect(e.response.status).toEqual(403);
      expect(e.response.data.title).toMatch("Cannot be empty");
    }
  });

  test("should updated todo new values", async () => {
    const resCreate = await axios.post(`${url}/todos`, {
      title: "Learn serverless",
    });
    const { id } = resCreate.data;

    const resUpdated = await axios.post(`${url}/todos/${id}`, {
      title: "New value",
      checked: true,
    });

    expect(resUpdated.status).toEqual(200);

    const resCheck = await axios.get(`${url}/todos/${id}`);
    console.log(resCheck);
    expect(resCheck.status).toEqual(200);
    expect(resCheck.data.title).toMatch("New value");
    expect(resCheck.data.checked).toBeTruthy();
  });
});
