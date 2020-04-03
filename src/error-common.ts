"use strict";

import * as ck from "chalker";
import * as Pkg from "../package.json";

const caught = ck`<cyan>caught</>`;

export const fileIssue = ck`<green>
    If you have followed this resolution step and you are still seeing an
    error, please file an issue on the electrode-server repository

    ${Pkg.repository.url}
  </>`;

export const errContext = `${Pkg.name} ${caught} an error while starting your server`;
