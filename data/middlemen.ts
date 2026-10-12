export interface Middleman {
  name: string;
  fee: string;
  telegram_vouches: string;
  ogu_vouches: string;
  username: string;
}

export const middlemen: Middleman[] = [
  { name: 'beam', fee: '5%', telegram_vouches: '20,186', ogu_vouches: '8,213', username: 'beam' },
  { name: 'cold', fee: '5%', telegram_vouches: '7,000+', ogu_vouches: '2,980', username: 'cold' },
  { name: 'cool', fee: '5%', telegram_vouches: '7,237', ogu_vouches: '2,006', username: 'cool' },
  { name: 'cry', fee: '5%', telegram_vouches: 'Not listed', ogu_vouches: '2,171', username: 'melon' },
  { name: 'cupid', fee: '3%', telegram_vouches: '7,438', ogu_vouches: '1,100', username: 'cupid' },
  { name: 'Top', fee: '2%', telegram_vouches: '300+', ogu_vouches: '151+', username: 'drift' },
  { name: 'faiq', fee: '5%', telegram_vouches: '24,457', ogu_vouches: '3,698', username: 'faiq' },
  { name: 'fame', fee: '5%', telegram_vouches: '6,070', ogu_vouches: '839', username: 'fame' },
  { name: 'ja', fee: '5%', telegram_vouches: '400+', ogu_vouches: '600+', username: 'wrosen' },
  { name: 'laugh', fee: '3%', telegram_vouches: '34,422', ogu_vouches: '786', username: 'laugh' },
  { name: 'nine', fee: '5%', telegram_vouches: '13,577', ogu_vouches: '2,037', username: 'nine' },
  { name: 'nova', fee: '3%', telegram_vouches: '6,857', ogu_vouches: '672', username: 'nova' },
  { name: 'Scholar', fee: '2%', telegram_vouches: '227', ogu_vouches: '223', username: 'scholar' },
  { name: 'sprint', fee: '2%', telegram_vouches: '716', ogu_vouches: '101', username: 'sprint' },
  { name: 'streaky', fee: '2%', telegram_vouches: '712', ogu_vouches: '117', username: 'streaky' },
  { name: 'tweak', fee: '2%', telegram_vouches: '200', ogu_vouches: '103', username: 'tweak' },
  { name: 'Shib', fee: '5%', telegram_vouches: '1,047', ogu_vouches: '2,670', username: 'shib' },
  { name: 'wave', fee: '5%', telegram_vouches: '7,000', ogu_vouches: '625', username: 'wave' },
  { name: 'will', fee: '2%', telegram_vouches: '2,281+', ogu_vouches: '443', username: 'will' },
];

/** "7,000+" -> 7000, "Not listed" -> 0 (used for sorting and the stats strip). */
export function parseCount(value: string): number {
  const n = parseInt(value.replace(/[^\d]/g, ''), 10);
  return Number.isNaN(n) ? 0 : n;
}

/** "5%" -> 5 */
export function parseFee(value: string): number {
  const n = parseFloat(value.replace('%', ''));
  return Number.isNaN(n) ? 0 : n;
}
