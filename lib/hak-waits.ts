// SAMODEJNO ZAJETO: zive cakalne dobe HAK/MUP. Trenutno brez objavljenih cakanj.
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; level: string; waitMinutes: number | null; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [];
