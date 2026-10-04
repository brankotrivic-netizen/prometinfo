// SAMODEJNO ZAJETO: zgodovina čakalnih dob (za napoved 'običajno ob tem času').
// i=crossingId, p=osebna vozila (min), k=tovorna (min), t=epoch ms. Hrani 60 dni.
export interface WaitHist { i: string; p: number | null; k: number | null; t: number }
export const WAIT_HISTORY: WaitHist[] = [{"i":"ba-velika-kladusa","p":60,"k":null,"t":1791095878790},{"i":"hr-bajakovo","p":null,"k":240,"t":1791095878790},{"i":"hr-tovarnik","p":null,"k":120,"t":1791095878790}];
