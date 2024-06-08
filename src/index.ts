import { Context, Schema } from "koishi";

export const name = "fei-pmforward";

export interface Config {
  getInfoCmd: boolean;
  selfId: string;
  yourId: string;
  forwardOn: boolean;
}

export const Config: Schema<Config> = Schema.object({
  getInfoCmd: Schema.boolean()
    .default(true)
    .description("是否启用获取信息命令"),
  selfId: Schema.string().description("机器人id"),
  yourId: Schema.string().description("你的id"),
  forwardOn: Schema.boolean().default(false).description("是否启用转发"),
});

export function apply(ctx: Context, config: Config) {
  if (config.getInfoCmd) {
    ctx.command("获取信息").action(async ({ session }) => {
      session.send(
        `机器人id: \n${session.selfId}\n` + `你的id: \n${session.userId}`
      );
    });
  }

  if (config.forwardOn) {
    ctx.on("message", async (session) => {
      if (session.event.channel.type) {
        ctx.bots
          .find((bot) => bot.selfId === config.selfId)
          .sendPrivateMessage(config.yourId, session.content);
      }
    });
  }
}
