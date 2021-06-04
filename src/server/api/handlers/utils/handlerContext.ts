// externals
import * as HttpStatus from "http-status-codes";
import { Transaction } from "sequelize";
import { Response } from "express";

// libraries
import { logger, LoggingContext } from "@atoll/shared";

// data access
import { sequelize } from "../../../dataaccess/connection";

// utils
import { respondWithError, respondWithNotFound } from "../../../api/utils/responder";

export interface HandlerTransactionContext {
    transaction: Transaction;
    aborted: boolean; // no further operations will be executed, but transaction has not been rolled back
    rolledBack: boolean; // transaction has been rolled back, do not attempt to rollback again
}

export interface HandlerExpressContext {
    res: Response;
}

export interface HandlerContext {
    logContext: LoggingContext;
    functionTag: string;
    expressContext: HandlerExpressContext;
    transactionContext?: HandlerTransactionContext;
}

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

export const commitWithOkResponseIfNotAborted = async (handlerContext: HandlerContext, addedItem, extra?) => {
    await commitWithResponseAndStatusIfNotAborted(handlerContext, HttpStatus.OK, addedItem, extra);
};

export const commitWithCreatedResponseIfNotAborted = async (handlerContext: HandlerContext, addedItem, extra?) => {
    await commitWithResponseAndStatusIfNotAborted(handlerContext, HttpStatus.CREATED, addedItem, extra);
};

export const abortSilently = (handlerContext: HandlerContext) => {
    handlerContext.transactionContext.aborted = true;
};

export const abortWithNotFoundResponse = (handlerContext: HandlerContext, message: string) => {
    respondWithNotFound(handlerContext.expressContext.res, message);
    handlerContext.transactionContext.aborted = true;
};

export const rollbackWithErrorResponse = async (handlerContext: HandlerContext, message: string) => {
    respondWithError(handlerContext.expressContext.res, message);
    await handlerContext.transactionContext.transaction.rollback();
    handlerContext.transactionContext.aborted = true;
    handlerContext.transactionContext.rolledBack = true;
};

export const handleUnexpectedErrorResponse = async (handlerContext: HandlerContext, err) => {
    const errLogContext = logger.warn(`handling error "${err}"`, [handlerContext.functionTag], handlerContext.logContext);
    const context = handlerContext.transactionContext;
    if (context.transaction && !context.rolledBack) {
        logger.info("rolling back transaction", [handlerContext.functionTag], errLogContext);
        try {
            await context.transaction.rollback();
        } catch (err) {
            logger.warn(`roll back failed with error "${err}"`, [handlerContext.functionTag], errLogContext);
        }
    }
    respondWithError(handlerContext.expressContext.res, err);
    logger.info(`handling error ${err}`, [handlerContext.functionTag], handlerContext.logContext);
};

export const hasAborted = (handlerContext: HandlerContext): boolean => handlerContext.transactionContext.aborted || false;

export const hasRolledBack = (handlerContext: HandlerContext): boolean => handlerContext.transactionContext.rolledBack || false;
