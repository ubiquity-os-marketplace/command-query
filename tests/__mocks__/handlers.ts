import { http, HttpResponse } from "msw";

/**
 * Intercepts the routes and returns a custom payload
 */
export const handlers = [
  http.get("https://api.github.com/users/:user", (req) => {
    const { user } = req.params;

    const mockedUserData = {
      login: user,
      id: 1,
      url: `https://api.github.com/users/${user}`,
      type: "User",
    };

    return HttpResponse.json(mockedUserData);
  }),
  http.post("https://api.github.com/repos/:org/:repo/issues/:id/comments", () => {
    return HttpResponse.json();
  }),
];
