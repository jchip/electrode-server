import * as _ from "lodash";
import * as ck from "chalker";
import * as logger from "./logger.js";

export function checkNodeEnv(): void {
  const allowed = ["qa", "development", "staging", "production", "test"];

  if (process.env.NODE_ENV && !_.includes(allowed, process.env.NODE_ENV)) {
    const msg = `Electrode Server Notice: NODE_ENV (${process.env.NODE_ENV}) should be empty or one of ${allowed}`; // eslint-disable-line
    logger.warn(ck`    <inverse.bold.yellow>${msg}</>`);
  }
}
