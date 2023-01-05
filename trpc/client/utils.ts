import type { AppRouter } from '../server';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

/**
 * Enum containing all api query paths
 */
export type TQuery = keyof AppRouter['_def']['procedures'];

/**
 * Enum containing all api mutation paths
 */
export type TMutation = keyof AppRouter['_def']['procedures'];

/**
 * Enum containing all api subscription paths
 */
export type TSubscription = keyof AppRouter['_def']['procedures'];

export type InferHandlerInput<TRouteKey extends TQuery> = inferRouterInputs<
  AppRouter['_def']['procedures'][TRouteKey]
>;

/**
 * This is a helper method to infer the output of a query resolver
 * @example type HelloOutput = InferQueryOutput<'hello'>
 */
export type InferQueryOutput<TRouteKey extends TQuery> = inferRouterOutputs<
  AppRouter['_def']['procedures'][TRouteKey]
>;

/**
 * This is a helper method to infer the input of a query resolver
 * @example type HelloInput = InferQueryInput<'hello'>
 */
export type InferQueryInput<TRouteKey extends TQuery> = inferRouterInputs<
  AppRouter['_def']['procedures'][TRouteKey]
>;

/**
 * This is a helper method to infer the output of a mutation resolver
 * @example type HelloOutput = InferMutationOutput<'hello'>
 */
export type InferMutationOutput<TRouteKey extends TMutation> =
  inferRouterOutputs<AppRouter['_def']['procedures'][TRouteKey]>;

/**
 * This is a helper method to infer the input of a mutation resolver
 * @example type HelloInput = InferMutationInput<'hello'>
 */
export type InferMutationInput<TRouteKey extends TMutation> = inferRouterInputs<
  AppRouter['_def']['procedures'][TRouteKey]
>;

/**
 * This is a helper method to infer the output of a subscription resolver
 * @example type HelloOutput = InferSubscriptionOutput<'hello'>
 */
export type InferSubscriptionOutput<TRouteKey extends TSubscription> =
  inferRouterOutputs<AppRouter['_def']['procedures'][TRouteKey]>;

/**
 * This is a helper method to infer the asynchronous output of a subscription resolver
 * @example type HelloAsyncOutput = InferAsyncSubscriptionOutput<'hello'>
 */
// export type InferAsyncSubscriptionOutput<TRouteKey extends TSubscription> =
//   inferRouterOutputs<AppRouter, TRouteKey>;

/**
 * This is a helper method to infer the input of a subscription resolver
 * @example type HelloInput = InferSubscriptionInput<'hello'>
 */
// export type InferSubscriptionInput<TRouteKey extends TSubscription> =
//   inferProcedureInput<AppRouter['_def']['subscriptions'][TRouteKey]>;
