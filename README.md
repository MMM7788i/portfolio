# Portfolio contact form

The contact form uses the Vercel serverless function in `api/contact.js` to send
submissions to Telegram. The bot token is only used on the server and must never
be added to HTML, JavaScript, or other public files.

## Configure deployment

1. Revoke any bot token that has been shared publicly and create a replacement
   with BotFather.
2. Deploy this project to Vercel.
3. In the Vercel project settings, add these environment variables for the
   deployment environment:
   - `TELEGRAM_BOT_TOKEN`: the replacement token from BotFather.
   - `TELEGRAM_CHAT_ID`: the private chat or group that should receive messages.
4. Start a conversation with your bot using `/start`, then redeploy after
   setting the environment variables.

For a private bot conversation, set `TELEGRAM_CHAT_ID` to your Telegram user
ID. You can find your user ID using a Telegram ID lookup bot; never give that
bot your portfolio bot token.

The form reports an error if the endpoint or Telegram is unavailable. It does
not claim a message was sent unless Telegram confirms delivery.
