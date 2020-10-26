// externals
import { Request } from "express";
import * as HttpStatus from "http-status-codes";
import { CreateOptions, Transaction } from "sequelize";

// utils
import { buildOptionsFromParams, getParamsFromRequest } from "../utils/filterHelper";
import { respondWithError } from "../utils/responder";
import { mapToSprintBacklog } from "../../dataaccess/mappers";
import { addIdToBody } from "../utils/uuidHelper";
import { sprintBacklogItemFetcher } from "./fetchers/sprintBacklogItemFetcher";

// data access
import { sequelize } from "../../dataaccess/connection";
import { SprintBacklogModel } from "../../dataaccess/models/SprintBacklog";

export const sprintBacklogItemsGetHandler = async (req: Request, res) => {
    const params = getParamsFromRequest(req);
    const result = await sprintBacklogItemFetcher(params.sprintId);
    if (result.status === HttpStatus.OK) {
        res.json(result);
    } else {
        res.status(result.status).json({
            status: result.status,
            error: {
                msg: result.error.msg
            }
        });
        console.log(`Unable to fetch sprintBacklogItems: ${result.error.msg}`);
    }
};

export const sprintBacklogItemsPostHandler = async (req: Request, res) => {
    const params = getParamsFromRequest(req);
    const sprintId = params.sprintId;
    let transaction: Transaction;
    try {
        let rolledBack = false;
        transaction = await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE });
        let displayIndex: number;
        const options = buildOptionsFromParams({ sprintId });
        const sprintBacklogs = await SprintBacklogModel.findAll({
            ...options,
            order: [["displayindex", "ASC"]]
        });
        if (sprintBacklogs && sprintBacklogs.length) {
            const lastSprintBacklogItem = mapToSprintBacklog(sprintBacklogs[sprintBacklogs.length - 1]);
            displayIndex = lastSprintBacklogItem.displayindex + 1;
        } else {
            displayIndex = 0;
        }
        console.log(`BODY: ${JSON.stringify(req.body)}`);
        const bodyWithId = addIdToBody({
            sprintId,
            backlogitemId: req.body.backlogitemId,
            displayindex: displayIndex
        });
        console.log(`DB BODY: ${JSON.stringify(bodyWithId)}`);
        const addedSprintBacklog = await SprintBacklogModel.create(bodyWithId, { transaction } as CreateOptions);
        if (!rolledBack) {
            await transaction.commit();
            console.log("GOT HERE");
            res.status(HttpStatus.CREATED).json({
                status: HttpStatus.CREATED,
                data: {
                    item: addedSprintBacklog
                }
            });
            console.log("GOT HERE 2");
        }
    } catch (err) {
        console.log(`GOT HERE 3: ${err}`);
        if (transaction) {
            await transaction.rollback();
        }
        respondWithError(res, err);
    }
};
