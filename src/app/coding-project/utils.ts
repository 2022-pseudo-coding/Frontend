import { Action, Module } from "../services/mod-proj.service";
import { Inst } from "../services/problem-backend.service";
import { ActionNode, Cluster } from "./coding-project.component";


export function isModule(action: Action): action is Action {
    return 'instructions' in action;
}

export function nodeToAction(action: Action[], node: ActionNode): Action {
    return action[parseInt(node.id)];
}

export function instIdToNodeId(actions: Action[]): any {
    let dict: any = {};
    let count = 0;
    actions.forEach((action, i) => {
        if (isModule(action)) {
            (action as Module).instructions.forEach((smallInst, j) => {
                dict[count] = i + '-' + j;
                count++;
            })
        } else {
            dict[count] = i + '';
            count++;
        }
    })
    return dict;
}