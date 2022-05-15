// This file is part of the @egomobile/next-utils distribution.
// Copyright (c) Next.e.GO Mobile SE, Aachen, Germany (https://e-go-mobile.com/)
//
// @egomobile/next-utils is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as
// published by the Free Software Foundation, version 3.
//
// @egomobile/next-utils is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

import path from "path";
import sanitizeFilename from "sanitize-filename";
import { IJob, ILoadAndStartJobsOptions, IWithWorkerOptions, JobAction, loadAndStartJobs, loadAndStartJobsSync, withWorker as _withWorker } from "@egomobile/jobs";
import { isNil } from "@egomobile/nodelike-utils";
import type { Nilable } from "@egomobile/types";

/**
 * Options for 'loadJobs()' and 'loadJobsSync()' functions.
 */
export interface ILoadJobsOptions extends ILoadAndStartJobsOptions {
    /**
     * The root directory of the job scripts.
     *
     * Default: Sub sirectory 'jobs' of current working directory.
     */
    dir?: Nilable<string>;
}

type WithWorkerOptions1 = Omit<IWithWorkerOptions, "filename">;
/**
 * Options for 'withWorker()' function.
 */
export type WithWorkerOptions = WithWorkerOptions1 & {
    /**
     * Inidictaes, if anything should be setup for
     * development environment or not.
     */
    development?: Nilable<boolean>;
    /**
     * The path of the job script (not the worker), from where
     * 'withWorker()' is executed.
     */
    jobFile: string;
    /**
     * The base / root directory of the underlying worker script,
     * which is executed by the job.
     *
     * By default the directory <JOB-DIR>/workers/<NAME> is used.
     */
    workerBaseDir?: Nilable<string>;
};

function checkAndPrepareOptions(options: ILoadJobsOptions): ILoadJobsOptions {
    const result: ILoadJobsOptions = {
        ...options
    };

    if (isNil(result.dir)) {
        result.dir = getJobDefaultDirectory();
    }

    if (typeof result.dir !== "string") {
        throw new TypeError("options.dir must be of type string");
    }

    if (!path.isAbsolute(result.dir)) {
        result.dir = path.join(getJobDefaultDirectory(), result.dir);
    }

    return result;
}

function getJobDefaultDirectory(): string {
    return path.join(process.cwd(), "jobs");
}

/**
 * Loads jobs and starts jobs, which are implemented as script files
 * in a specific directory asynchronously.
 *
 * @example
 * ```
 * import path from "path"
 * import { loadJobs } from "@egomobile/next-utils"
 *
 * const isDev = process.env.NODE_ENV === "development"
 *
 * const loadedAndStartedJobs = await loadJobs({
 *   dir: path.join(__dirname, "jobs"),
 *
 *   filter: (name) => {
 *     if (!name.startsWith("_")) {  // do not use filenames with leading _
 *       if (name.endsWith(".js")) {  // only use .js files
 *         // if we are in a development environment
 *         // take all files
 *         // otherwise do not include files
 *         // with ending ".dev.js" in name
 *         return isDev ? true : !name.endsWith(".dev.js")
 *       }
 *     }
 *
 *     return false
 *   },
 *
 *   timezone: "Europe/Berlin",
 * })
 *
 * console.log(loadedAndStartedJobs)
 * ```
 *
 * @param {ILoadJobsOptions} options Custom options.
 *
 * @returns {Promise<IJob[]>} The promise with the list of loaded and start jobs.
 */
export function loadJobs(options: ILoadJobsOptions = {}): Promise<IJob[]> {
    return loadAndStartJobs(
        checkAndPrepareOptions(options)
    );
}

/**
 * Loads jobs and starts jobs, which are implemented as script files
 * in a specific directory synchronously.
 *
 * @example
 * ```
 * import path from "path"
 * import { loadJobsSync } from "@egomobile/next-utils"
 *
 * const isDev = process.env.NODE_ENV === "development"
 *
 * const loadedAndStartedJobs = loadJobsSync({
 *   dir: path.join(__dirname, "jobs"),
 *
 *   filter: (name) => {
 *     if (!name.startsWith("_")) {  // do not use filenames with leading _
 *       if (name.endsWith(".js")) {  // only use .js files
 *         // if we are in a development environment
 *         // take all files
 *         // otherwise do not include files
 *         // with ending ".dev.js" in name
 *         return isDev ? true : !name.endsWith(".dev.js")
 *       }
 *     }
 *
 *     return false
 *   },
 *
 *   timezone: "Europe/Berlin",
 * })
 *
 * console.log(loadedAndStartedJobs)
 * ```
 *
 * @param {ILoadJobsOptions} options Custom options.
 *
 * @returns {IJob[]} The list of loaded and start jobs.
 */
export function loadJobsSync(options: ILoadJobsOptions = {}): IJob[] {
    return loadAndStartJobsSync(
        checkAndPrepareOptions(options)
    );
}

/**
 * Creates a job action, which runs a worker script in the background
 * in separate thread.
 *
 * @example
 * ```
 * import { IJobConfig, withWorker } from "@egomobile/next-utils"
 *
 * const config: IJobConfig = {
 *   onTick: withWorker({
 *     // implement the worker script 'index.js' inside
 *     // 'workers/<BASE-NAME>' subdirectory of __filename
 *     //
 *     // <BASE-NAME> is the base name of __filename
 *     // without extension
 *     //
 *     // Example:
 *     // - __filename === '/usr/app/jobs/myFooJob.ts'
 *     // - worker script: '/usr/app/jobs/workers/myFooJob/index.js'
 *     file: __filename,  // <= this should always be done this way
 *   }),
 *
 *   time: "15 * * * * *"  // run every minute on second 15
 * }
 *
 * export default config
 * ```
 *
 * @param {WithWorkerOptions} options The custom options.
 *
 * @returns {JobAction} The job action.
 */
export function withWorker(options: WithWorkerOptions): JobAction {
    let { debug, jobFile, workerBaseDir } = options;
    const { checkIfShouldTick, data, name } = options;

    const isDev = !!options.development;
    const env = options.env || process.env;

    if (typeof jobFile !== "string") {
        throw new TypeError("options.file must be of type string");
    }

    if (!path.isAbsolute(jobFile)) {
        jobFile = path.join(getJobDefaultDirectory(), jobFile);
    }

    const jobDir = path.dirname(jobFile);
    const fileName = path.basename(jobFile, path.extname(jobFile));
    const fileNameParts = fileName.split(".");

    let workerName = name;
    if (!workerName) {
        workerName = fileNameParts[0].trim();
    }

    if (isNil(workerBaseDir)) {
        workerBaseDir = "workers";
    }
    else {
        if (typeof workerBaseDir !== "string") {
            throw new TypeError("options.workerBaseDir must be of type string");
        }
    }

    if (!path.isAbsolute(workerBaseDir)) {
        workerBaseDir = path.join(jobDir, workerBaseDir);
    }

    const workerFullPath = path.join(
        workerBaseDir,
        `${sanitizeFilename(workerName)}/index.js`,
    );

    if (isNil(debug)) {
        debug = (message, icon) => {
            const printMessage = () => {
                let l = console.log;
                if (icon === "ℹ️" || icon === "✅") {
                    l = console.info;
                }
                else if (icon === "⚠️") {
                    l = console.warn;
                }
                else if (icon === "❌") {
                    l = console.error;
                }

                l.bind(console)(
                    `[jobs/_utils/withWorker()::${workerName}]`,
                    icon,
                    message,
                );
            };

            if (isDev) {
                printMessage();
            }
            else if (icon !== "🐞") {
                printMessage();
            }
        };
    }
    else {
        if (typeof debug !== "function") {
            throw new TypeError("options.debug must be of type function");
        }
    }

    return _withWorker({
        data,
        debug,
        "filename": workerFullPath,
        "name": workerName,
        env,
        checkIfShouldTick
    });
}
