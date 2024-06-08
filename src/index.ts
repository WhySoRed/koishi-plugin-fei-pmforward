import { Bot, Context, Schema } from "koishi";

export const name = "fei-pmforward";

export let usage = "";

export interface Config {
  getInfoCmd: boolean;
  selfId: string;
  yourId: string;
  forwardOn: boolean;
  onlyNotCommand: boolean;
}

export const Config: Schema<Config> = Schema.object({
  getInfoCmd: Schema.boolean()
    .default(true)
    .description("是否启用获取信息指令"),
  selfId: Schema.string().description("机器人id"),
  yourId: Schema.string().description("你的id"),
  forwardOn: Schema.boolean().default(false).description("开启转发"),
  onlyNotCommand: Schema.boolean()
    .default(false)
    .description("是否只转发非指令消息，对于以ctx.command之外的方法实现的指令无效"),
});

export function apply(ctx: Context, config: Config) {
  ctx.command("获取pm信息").action(async ({ session }) => {
    return `机器人id: \n${session.selfId}\n` + `你的id: \n${session.userId}`;
  });
  if (config.getInfoCmd) {
  }

  if (config.forwardOn) {
    if (!config.selfId || !config.yourId) {
      usage = `请先配置<strong style="font-size:1.3em">机器人id</strong>和<strong style="font-size:1.3em">你的id</strong>!`;
      return;
    } else {
      usage = "启动咯~";
    }

    const lastMsgInfo = {
      platform: "",
      userId: "",
      timestamp: 0,
      upDate: ({ platform, userId, timestamp }) => {
        lastMsgInfo.platform = platform;
        lastMsgInfo.userId = userId;
        lastMsgInfo.timestamp = timestamp;
      },
    };

    const pmBot: Bot = ctx.bots.find((bot) => bot.selfId === config.selfId);
    if (!pmBot) {
      usage = "配置的机器人id有误";
    }

    ctx.on("message", async (session) => {
      if (session.event.channel.type) {
        if (session.userId === config.selfId) return;
        if (session.userId === config.yourId) return;
        if (
          config.onlyNotCommand &&
          (session.content?.startsWith(ctx.root.config.prefix) ||
            ctx.$commander.get(session.content?.split(" ")[0]))
        )
          return;
        let pmFrom = "";
        if (lastMsgInfo.platform !== session.platform)
          pmFrom += `来自${session.platform}的\n`;
        if (
          lastMsgInfo.userId !== session.userId ||
          session.timestamp - lastMsgInfo.timestamp > 600000
        )
          pmFrom += `${session.username} (${session.userId})说：<message/>`;
        try {
          pmBot.sendPrivateMessage(config.yourId, pmFrom + session.content);
        } catch (error) {
          usage = "转发失败，请检查是否是因为bot被风控或者是私聊信息填写有误";
          throw error;
        }
        lastMsgInfo.upDate(session);
      }
    });
  } else {
    usage = `本插件应群友需求制作，用户对bot私聊发送的信息会全部转发，请酌情选择是否开启。<br><br>
    初次使用请开启获取信息功能，<br>发送指令 <strong>${
      ctx.$commander.get("获取pm信息").name
    }</strong> 获取信息，<br>然后配置机器人id和你的id，开启转发<br><br>在配置完毕后建议关闭获取信息功能`;
  }
}
