import type { PositionTag, Player } from '../types'

export const ALL_POSITIONS: PositionTag[] = ['GK','LB','CB','RB','LWB','RWB','CDM','CM','CAM','LW','RW','CF','ST']

// Map the tactics slot id to acceptable position tags
export const SLOT_ELIGIBLE_TAGS: Record<string, PositionTag[]> = {
	gk: ['GK'],
	lb: ['LB', 'LWB'],
	lcb: ['CB'],
	rcb: ['CB'],
	rb: ['RB', 'RWB'],
	cdm: ['CDM', 'CM', 'CAM'],
	lcm: ['CDM', 'CM', 'CAM'],
	cm: ['CDM', 'CM', 'CAM'],
	cm1: ['CDM', 'CM', 'CAM'],
	cm2: ['CDM', 'CM', 'CAM'],
	rcm: ['CDM', 'CM', 'CAM'],
	lw: ['LW'],
	st: ['ST', 'CF'],
	st1: ['ST', 'CF'],
	st2: ['ST', 'CF'],
	rw: ['RW'],
}

export function getEligibleTagsForSlot(slotId: string): PositionTag[] {
	return SLOT_ELIGIBLE_TAGS[slotId] ?? []
}

export function playerEligibleForSlot(player: Player, slotId: string): boolean {
	const tags = getEligibleTagsForSlot(slotId)
	if (tags.length === 0) return true // if unknown slot id, allow all
	return player.positionTags.some(t => tags.includes(t))
}