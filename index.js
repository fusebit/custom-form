const Sdk = require("@fusebit/add-on-sdk");
const Crypto = require("crypto");
const Fs = require("fs");
const { getForm, postForm } = require("./form");
const Path = require("path");
const app = require("express")();

const formTemplate = Fs.readFileSync(Path.join(__dirname, "form.html"), {
  encoding: "utf8",
});

const error = (res, status, message) =>
  res.status(status).send({ status, message });

const authorize = (req, res, next) =>
  req.fusebit.caller.permissions ? next() : error(res, 403, "Not authorized");

app.post("/session", authorize, async (req, res) => {
  if (!req.body.redirectUrl) {
    return error(res, 400, 'The "redirectUrl" must be specified in the body.');
  }
  const sessionId = Crypto.randomBytes(32).toString("hex");
  await req.fusebit.storage.put({ data: req.body }, `session/${sessionId}`);
  return res.status(200).send({ sessionId });
});

app.get("/session/:sessionId", authorize, async (req, res) => {
  const item = await req.fusebit.storage.get(`session/${req.params.sessionId}`);
  return item ? res.status(200).send(item.data) : error(res, 404, "Not found");
});

app.delete("/session/:sessionId", authorize, async (req, res) => {
  await req.fusebit.storage.delete(`session/${req.params.sessionId}`);
  return res.status(204).send();
});

app.get("/", async (req, res) => {
  if (!req.query.sessionId) {
    return error(res, 400, 'The "sessionId" query parameter is required.');
  }
  const spec = getForm(req);
  const form = formTemplate
    .replace("##schema##", JSON.stringify(spec.schema))
    .replace("##uischema##", JSON.stringify(spec.uiSchema))
    .replace("##data##", JSON.stringify(spec.data))
    .replace("##windowTitle##", spec.windowTitle)
    .replace("##dialogTitle##", spec.dialogTitle)
    .replace("##state##", JSON.stringify(req.query.sessionId));
  return res.send(form);
});

app.post("/", async (req, res) => {
  try {
    req.body = JSON.parse(req.body.payload);
    if (
      !req.body.payload ||
      !req.body.state ||
      (req.body.payload.submit && !req.body.payload.output)
    )
      throw new Error();
  } catch (e) {
    return error(res, 400, "Schema violation.");
  }
  const key = `session/${req.body.state}`;
  const item = await req.fusebit.storage.get(key);
  if (!item) {
    return error(res, 404, "Not found");
  }
  let error;
  try {
    await postForm(req, item.data);
    if (req.body.payload.submit) {
      item.data = { ...item.data, output: req.body.payload.output };
      await req.fusebit.storage.put(item, key);
    }
  } catch (e) {
    error = e;
  }
  const location = `${item.data.redirectUrl}?sessionId=${req.body.state}&${
    error
      ? `error=${encodeURIComponent(e.message)}`
      : req.body.payload.submit
      ? "submit=1"
      : "cancel=1"
  }`;
  res.status(302).set("location", location).send();
});

module.exports = Sdk.createFusebitFunctionFromExpress(app);
