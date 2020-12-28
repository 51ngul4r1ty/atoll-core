export {};

interface MsgAndValueObj {
    name: string;
    value: any;
}

declare global {
    namespace jest {
        interface Matchers<R> {
            toEqualX(msgAndValueObj: MsgAndValueObj): R;
        }
    }
}
