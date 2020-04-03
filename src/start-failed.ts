/* eslint-disable max-len */

import * as ck from "chalker";
import * as ErrorCommon from "./error-common";
import logger from "./logger.js";
import * as Promise from "bluebird";
import * as _ from "lodash";
import { PLUGIN_KEY } from "./symbols";

export default function startFailed(err: any): void {
  const errors = {
    EADDRINUSE: () => {
      return {
        reason: `the network port (${err.port}) is already in use but your server is trying to listen to it`,
        resolution: `
      Ensure no other processes are running on this port, or change the port
      your server should listen on.

      To identify which process is listening on port ${err.port} run this command:
    lsof -i :${err.port}
`
      };
    },
    unknown: () => {
      return {
        reason: `There was an error starting the Hapi.js server.`,
        resolution: `
      This generally is not related to Hapi or electrode-server.
      The most likely cause is you have a Hapi plugin that's misbehaving.
      Please check the output of the stack trace below and correct the error shown
`
      };
    },
    XEVENT_TIMEOUT: () => {
      const eventMsg = ck`<green>${err.event}</>`;
      const nextMsg = ck`<magenta>next</>`;
      const configMsg = ck`<green>config.electrode.eventTimeout</>`;
      const timeoutMsg = ck`<green>${err.timeout}</>`;
      const listenerMsg = ck`<green>config.listener</>`;

      return {
        reason: `Your handler for event ${eventMsg} did not call ${nextMsg} within ${timeoutMsg} msec.`,
        resolution: `
      Event timeout is configured with '${configMsg}' (in milliseconds),
      and it is not enabled unless you set it to a non-zero value.
      If you need more time, then please set a longer timeout value.

      Please double check your event handler registered by your '${listenerMsg}'
      and make sure it completes and calls ${nextMsg}.
`
      };
    },
    XEVENT_FAILED: () => {
      const eventMsg = ck`<green>${err.event}</>`;
      const listenerMsg = ck`<green>config.listener</>`;

      return {
        reason: `electrode-server received error from your handler for event ${eventMsg}`,
        resolution: `
      Please double check and verify your event handler for ${eventMsg} registered by your '${listenerMsg}'.
`
      };
    },
    XPLUGIN_FAILED: () => {
      const name = _.get(err, ["plugin", PLUGIN_KEY], "unknown");
      return {
        reason: `failed registering your plugin '${name}' ${err.method}`,
        resolution: `
      Please double check and verify your plugin '${name}'.
`
      };
    }
  };

  const msg = (errors[err.code] || errors.unknown)();

  const stack = err.stack.split("\n");
  stack[0] = ck`<red>${stack[0]}</>`;

  const errDetail = ck`
    <bold.bgRed>${ErrorCommon.errContext}</>

    ${Chalk.bold.red(msg.reason)}
    ${Chalk.bold.red("message:")} ${err.message}

    ${Chalk.bold.green("Suggestion to resolve the issue:")}
    ${Chalk.inverse.bold.yellow(msg.resolution)}
    ${ErrorCommon.fileIssue}
    ${stack.join("\n")}
`;

  err.message = `${msg.reason}\n${err.message}`;
  err.moreInfo = msg;

  logger.error(errDetail);

  return Promise.reject(err);
}
