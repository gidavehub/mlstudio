/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as apiBilling from "../apiBilling.js";
import type * as convex__generated_api from "../convex/_generated/api.js";
import type * as convex__generated_server from "../convex/_generated/server.js";
import type * as dataContributions from "../dataContributions.js";
import type * as datasetVersions from "../datasetVersions.js";
import type * as datasets from "../datasets.js";
import type * as deployedAPIs from "../deployedAPIs.js";
import type * as files from "../files.js";
import type * as marketplace from "../marketplace.js";
import type * as migrations from "../migrations.js";
import type * as models from "../models.js";
import type * as pipelines from "../pipelines.js";
import type * as predictions from "../predictions.js";
import type * as rewardTransactions from "../rewardTransactions.js";
import type * as teams from "../teams.js";
import type * as training from "../training.js";
import type * as trainingJobs from "../trainingJobs.js";
import type * as transformationPipelines from "../transformationPipelines.js";
import type * as users from "../users.js";
import type * as utils from "../utils.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  apiBilling: typeof apiBilling;
  "convex/_generated/api": typeof convex__generated_api;
  "convex/_generated/server": typeof convex__generated_server;
  dataContributions: typeof dataContributions;
  datasetVersions: typeof datasetVersions;
  datasets: typeof datasets;
  deployedAPIs: typeof deployedAPIs;
  files: typeof files;
  marketplace: typeof marketplace;
  migrations: typeof migrations;
  models: typeof models;
  pipelines: typeof pipelines;
  predictions: typeof predictions;
  rewardTransactions: typeof rewardTransactions;
  teams: typeof teams;
  training: typeof training;
  trainingJobs: typeof trainingJobs;
  transformationPipelines: typeof transformationPipelines;
  users: typeof users;
  utils: typeof utils;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
