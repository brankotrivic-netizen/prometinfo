// SAMODEJNO ZAJETO: zgodovina čakalnih dob (za napoved 'običajno ob tem času').
// i=crossingId, p=osebna vozila (min), k=tovorna (min), t=epoch ms. Hrani 60 dni.
export interface WaitHist { i: string; p: number | null; k: number | null; t: number }
export const WAIT_HISTORY: WaitHist[] = [];
