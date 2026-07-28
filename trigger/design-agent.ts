import { logger, task } from "@trigger.dev/sdk";

interface DesignAgentPayload {
  prompt: string;
  roomId: string;
}

export const designAgentTask = task({
  id: "design-agent",
  run: async (payload: DesignAgentPayload) => {
    logger.log("design-agent: received request", {
      prompt: payload.prompt,
      roomId: payload.roomId,
    });

    // Scope for this unit ends here — no AI provider calls, no
    // node/edge generation, no canvas mutation. Just proves the
    // trigger → run → token pipeline works end-to-end.
    return {
      received: true,
      prompt: payload.prompt,
      roomId: payload.roomId,
    };
  },
});