import { Inst } from "../services/problem-backend.service";
import { Node } from './coding.component'

export function canRefer(inst: Inst): boolean {
    let name = inst.name;
    return name.includes('copy') || name.includes('add') || name.includes('sub') || name.includes('bump')
}

export function canJump(inst: Inst): boolean {
    let name = inst.name;
    return name.includes('jump')
}

export function nodeToInst(insts: Inst[], node: Node): Inst {
    return insts[parseInt(node.id)];
}