// externals
import { StatusCodes } from "http-status-codes";
import { Transaction } from "sequelize";
import type { Response } from "express";

// libraries
import { logger, LoggingContext } from "@atoll/shared";

// data access
import { sequelize } from "../../../dataaccess/connection";

// utils
import {
    respondWithError,
    respondWithFailedValidation,
    respondWithMessageAndStatus,
    respondWithNotFound,
    respondWithObj
} from "../../utils/responder";
import { RestApiCollectionResult, RestApiErrorResult, RestApiItemResult } from "../../utils/responseBuilder";

export type HandlerTransactionContext = {
    transaction: Transaction;
    aborted: boolean; // no further operations will be executed, but transaction has not been rolled back
    rolledBack: boolean; // transaction has been rolled back, do not attempt to rollback again
};

export type HandlerExpressContext = {
    res: Response;
};

export type HandlerContext = {
    logContext: LoggingContext;
    functionTag: string;
    expressContext: HandlerExpressContext;
    transactionContext?: HandlerTransactionContext;
};

export const start = (functionTag: string, res: Response): HandlerContext => {
    const logContext = logger.info("starting call", [functionTag]);
    return { logContext, functionTag, expressContext: { res } };
};

export const finish = (handlerContext: HandlerContext) => {
    logger.info("finishing call", [handlerContext.functionTag]);
};

export const beginSerializableTransaction = async (handlerContext: HandlerContext) => {
    const transaction = await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE });
    handlerContext.transactionContext = {
        transaction,
        rolledBack: false,
        aborted: false
    };
};

/**
 * @deprecated this doesn't work well with the "fetcher" pattern so it shouldn't be used.
 */
export const commitWithResponseAndStatusIfNotAborted = async (
    handlerContext: HandlerContext,
    status: number,
    addedItem,
    extra?
) => {
    if (!hasRolledBack(handlerContext)) {
        await handlerContext.transactionContext.transaction.commit();
        if (!hasAborted(handlerContext)) {
            const data: any = {
                item: addedItem
            };
            if (extra) {
                data.extra = extra;
            }
            handlerContext.expressContext.res.status(status).json({
                status,
                data
            });
        }
    }
};

/**
 * @deprecated this doesn't work well with the "fetcher" pattern so it shouldn't be used.
 */
export const commitWithOkResponseIfNotAborted = async (handlerContext: HandlerContext, addedItem, extra?) => {
    await commitWithResponseAndStatusIfNotAborted(handlerContext, StatusCodes.OK, addedItem, extra);
};

/**
 * @deprecated this doesn't work well with the "fetcher" pattern so it shouldn't be used.
 */
export const commitWithCreatedResponseIfNotAborted = async (handlerContext: HandlerContext, addedItem, extra?) => {
    await commitWithResponseAndStatusIfNotAborted(handlerContext, StatusCodes.CREATED, addedItem, extra);
};

export const abortSilently = (handlerContext: HandlerContext) => {
    handlerContext.transactionContext.aborted = true;
};

export const abortWithNotFoundResponse = (handlerContext: HandlerContext, message: string) => {
    respondWithNotFound(handlerContext.expressContext.res, message);
    handlerContext.transactionContext.aborted = true;
};

export const abortWithFailedValidationResponse = (handlerContext: HandlerContext, message: string) => {
    respondWithFailedValidation(handlerContext.expressContext.res, message);
    handlerContext.transactionContext.aborted = true;
};

export const abortWithErrorResponse = (handlerContext: HandlerContext, message: string) => {
    respondWithError(handlerContext.expressContext.res, message);
    handlerContext.transactionContext.aborted = true;
};

export const rollbackWithErrorResponse = async (handlerContext: HandlerContext, message: string) => {
    respondWithError(handlerContext.expressContext.res, message);
    await handlerContext.transactionContext.transaction.rollback();
    handlerContext.transactionContext.aborted = true;
    handlerContext.transactionContext.rolledBack = true;
};

export const rollbackWithMessageAndStatus = async (handlerContext: HandlerContext, message: string, status: number) => {
    respondWithMessageAndStatus(handlerContext.expressContext.res, message, status);
    await handlerContext.transactionContext.transaction.rollback();
    handlerContext.transactionContext.aborted = true;
    handlerContext.transactionContext.rolledBack = true;
};

const handleTransactionRollback = async (handlerContext: HandlerContext, logContext: LoggingContext) => {
    const context = handlerContext.transactionContext;
    if (!context) {
        return;
    }
    if (context.transaction && !context.rolledBack) {
        logger.info("rolling back transaction", [handlerContext.functionTag], logContext);
        try {
            await context.transaction.rollback();
        } catch (err) {
            logger.warn(`roll back failed with error "${err}"`, [handlerContext.functionTag], logContext);
        }
    }
};

export const handleUnexpectedErrorResponse = async (handlerContext: HandlerContext, err) => {
    const errLogContext = logger.warn(`handling error "${err}"`, [handlerContext.functionTag], handlerContext.logContext);
    await handleTransactionRollback(handlerContext, errLogContext);
    respondWithError(handlerContext.expressContext.res, err);
    logger.info(`handled error ${err}`, [handlerContext.functionTag], handlerContext.logContext);
    finish(handlerContext);
};

export const handleFailedValidationResponse = async (handlerContext: HandlerContext, message: string) => {
    const logContext = logger.info(`validation error: "${message}"`, [handlerContext.functionTag], handlerContext.logContext);
    await handleTransactionRollback(handlerContext, logContext);
    respondWithFailedValidation(handlerContext.expressContext.res, message);
    logger.info(`processed validation: "${message}"`, [handlerContext.functionTag], handlerContext.logContext);
    finish(handlerContext);
};

export const handlePersistenceErrorResponse = async (
    handlerContext: HandlerContext,
    message: string,
    fetcherResult?: RestApiErrorResult
) => {
    const logContext = logger.info(`persistence error: "${message}"`, [handlerContext.functionTag], handlerContext.logContext);
    await handleTransactionRollback(handlerContext, logContext);
    respondWithError(handlerContext.expressContext.res, message);
    if (fetcherResult?.message) {
        logger.info(
            `fetcher result: "${fetcherResult.message}" (status ${fetcherResult?.status})`,
            [handlerContext.functionTag],
            handlerContext.logContext
        );
    }
    logger.info(`processed persistence error: "${message}"`, [handlerContext.functionTag], handlerContext.logContext);
    finish(handlerContext);
};

export const handleTransactionCommit = async (handlerContext: HandlerContext, logContext: LoggingContext) => {
    const context = handlerContext.transactionContext;
    if (context.transaction && !context.rolledBack) {
        logger.info("committing transaction", [handlerContext.functionTag], logContext);
        try {
            await handlerContext.transactionContext.transaction.commit();
        } catch (err) {
            logger.warn(`commit failed with error "${err}"`, [handlerContext.functionTag], logContext);
        }
    }
};

export const handleSuccessResponse = async <T = any, U = any, V = any>(
    handlerContext: HandlerContext,
    result: RestApiCollectionResult<T, U, V> | RestApiItemResult<T, U, V>
) => {
    const logContext = logger.info("success", [handlerContext.functionTag], handlerContext.logContext);
    await handleTransactionCommit(handlerContext, logContext);
    respondWithObj(handlerContext.expressContext.res, result);
    logger.info("processed success response", [handlerContext.functionTag], handlerContext.logContext);
    finish(handlerContext);
};

export const hasAborted = (handlerContext: HandlerContext): boolean => handlerContext.transactionContext.aborted || false;

export const hasRolledBack = (handlerContext: HandlerContext): boolean => handlerContext.transactionContext.rolledBack || false;
