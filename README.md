# Custom web form using Fusebit Functions and Sessions

This is a Fusebit Function that serves a JSON Forms based web form and stores the collected information in a durable session before redirecting back to the client application.

General flow:

1. Client app creates a new session that specifies the redirect URL of the final callback.
2. Client redirects the browser to the Fusebit Function and provides the session Id.
3. User fills out the web form.
4. The form post-back stores the collected information in the session and redirects back to the client application.

## Create the function

```
git clone git@github.com:fusebit/custom-form.git
cd custom-form
fuse function deploy -b contoso custom-form -d ./
```

## Endpoints

### POST {functionBaseUrl}/session

Authorization: requires a bearer access token with _function:\*_ permission on the {functionBaseUrl}

Creates a new session using information in the body . The body must at minimum specify the _redirectUrl_ for the final redirect. Returns a body with _sessionId_ identifier of the session.

### GET {functionBaseUrl}/session/:sessionId

Authorization: requires a bearer access token with _function:\*_ permission on the {functionBaseUrl}

Returns the current value of the session or HTTP 404 if not found.

### DELETE {functionBaseUrl}/session/:sessionId

Authorization: requires a bearer access token with _function:\*_ permission on the {functionBaseUrl}

Deletes the session.

### GET {functionBaseUrl}?sessionId={sessionId}

Authorization: none

Renders the web form associated with the _sessionId_.

### POST {functionBaseUrl}

Authorization: valid _sessionId_ value specified in the body of the request.

Web form post-back. Stores the collected parameters in the session and HTTP 302 redirects the browser to the _redirectUrl_ specified when the session was created.
