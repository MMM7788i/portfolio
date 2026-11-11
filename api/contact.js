const MAX_NAME_LENGTH = 80;
const MAX_MESSAGE_LENGTH = 2000;

function sendJson(response, status, body) {
  response.status(status).json(body);
}

module.exports = async function contactHandler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return sendJson(response, 405, { error: "Method not allowed." });
  }

  const origin = request.headers.origin;
  const host = request.headers["x-forwarded-host"] || request.headers.host;
  if (!origin || !host) {
    return sendJson(response, 403, { error: "Request origin is not allowed." });
  }

  try {
    if (new URL(origin).host !== host.toLowerCase()) {
      return sendJson(response, 403, {
        error: "Request origin is not allowed.",
      });
    }
  } catch {
    return sendJson(response, 403, { error: "Request origin is not allowed." });
  }

  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return sendJson(response, 500, {
      error: "The contact form is not configured yet.",
    });
  }

  let body = request.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return sendJson(response, 400, { error: "Invalid form submission." });
    }
  }

  const { name, surname, message } = body || {};
  if (
    typeof name !== "string" ||
    typeof surname !== "string" ||
    typeof message !== "string"
  ) {
    return sendJson(response, 400, { error: "Please complete all fields." });
  }

  const cleanName = name.trim();
  const cleanSurname = surname.trim();
  const cleanMessage = message.trim();

  if (!cleanName || !cleanSurname || !cleanMessage) {
    return sendJson(response, 400, { error: "Please complete all fields." });
  }

  if (
    cleanName.length > MAX_NAME_LENGTH ||
    cleanSurname.length > MAX_NAME_LENGTH ||
    cleanMessage.length > MAX_MESSAGE_LENGTH
  ) {
    return sendJson(response, 400, {
      error: "One or more fields are too long.",
    });
  }

  const text = [
    "New portfolio message",
    `Name: ${cleanName}`,
    `Surname: ${cleanSurname}`,
    "",
    "Message:",
    cleanMessage,
  ].join("\n");

  let telegramResponse;
  try {
    telegramResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text }),
      },
    );
  } catch {
    return sendJson(response, 502, {
      error: "Could not reach Telegram. Please try again later.",
    });
  }

  if (!telegramResponse.ok) {
    return sendJson(response, 502, {
      error: "Telegram could not deliver your message. Please try again later.",
    });
  }

  let telegramResult;
  try {
    telegramResult = await telegramResponse.json();
  } catch {
    return sendJson(response, 502, {
      error: "Telegram returned an invalid response. Please try again later.",
    });
  }

  if (!telegramResult.ok) {
    return sendJson(response, 502, {
      error: "Telegram could not deliver your message. Please try again later.",
    });
  }

  return sendJson(response, 200, { ok: true });
};
