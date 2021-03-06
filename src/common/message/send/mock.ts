import { Message } from "../message";

import EventEmitter = NodeJS.EventEmitter;

let lastSequence = 0;

export async function sendMockMessage<M extends Message<unknown>>(
  opts: {
    emitter: EventEmitter;
    id: string;
    url: string;
  },
  port: string,
  msg: M
): Promise<M extends Message<infer R> ? R : never> {
  msg.validateBasic();

  return new Promise((resolve, reject) => {
    const sequence = lastSequence + 1;
    lastSequence++;

    opts.emitter.once(`message-result-${sequence}`, result => {
      if (!result) {
        reject(Error("Null result"));
        return;
      }

      if (result.error) {
        reject(new Error(result.error));
        return;
      }

      resolve(result.return);
    });

    opts.emitter.emit("message", {
      port,
      type: msg.type(),
      msg,
      sequence,
      sender: {
        id: opts.id,
        url: opts.url
      }
    });
  });
}
