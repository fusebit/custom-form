/**
 * Returns a schema of the JSON Forms to render to collect information.
 * @param {*} req The HTTP GET request for the form
 * @returns The jsonforms.io definition of the web form
 */
exports.getForm = (req) => ({
  windowTitle: "Contoso",
  dialogTitle: "We need to collect extra information",
  schema: {
    // See https://jsonforms.io/ for schema
    type: "object",
    required: ["age"],
    properties: {
      firstName: {
        type: "string",
        minLength: 2,
        maxLength: 20,
      },
      lastName: {
        type: "string",
        minLength: 5,
        maxLength: 15,
      },
      age: {
        type: "integer",
        minimum: 18,
        maximum: 100,
      },
      gender: {
        type: "string",
        enum: ["Male", "Female", "Undisclosed"],
      },
    },
  },
  uischema: {
    // See https://jsonforms.io/ for schema
    type: "VerticalLayout",
    elements: [
      {
        type: "HorizontalLayout",
        elements: [
          {
            type: "Control",
            scope: "#/properties/firstName",
          },
          {
            type: "Control",
            scope: "#/properties/lastName",
          },
        ],
      },
      {
        type: "HorizontalLayout",
        elements: [
          {
            type: "Control",
            scope: "#/properties/age",
          },
          {
            type: "Control",
            scope: "#/properties/gender",
          },
        ],
      },
    ],
  },
  data: {
    // See https://jsonforms.io/ for schema
    firstName: req.query.firstName || undefined,
    lastName: req.query.lastName || undefined,
  },
});

/**
 * Implements any side-effects of the web form post-back. After this method returns, the
 * HTTP 302 redirect is sent to the redirectUrl associatd with the session indicating the
 * result of the transaction. The data collected from the form is stored within the session itself.
 * @param {*} req The HTTP POST request with web form post-back
 * @param {*} session The session associated with the transaction
 */
exports.postForm = async (req, session) => {
  // Any custom form-post side-effects
};
