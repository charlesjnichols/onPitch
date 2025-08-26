import { useMemo } from "react";
import BottomSheet from "../MatchPanel/BottomSheet";
import { useAppStore } from "../../store";
import { SLOT_ELIGIBLE_TAGS } from "../../utils/positions";
import { Box, Typography } from "@mui/material";
import BenchItem from "../Bench/BenchItem";
import type { Player } from "../../types";

interface SubSheetProps {
  open: boolean;
  benchPlayerId?: string;
  onClose: () => void;
}

const SubList = ({
  players,
  makeSub,
  benchPlayerId,
  onClose,
}: {
  players: Player[];
  makeSub: (inId: string, outId?: string) => void;
  benchPlayerId: string;
  onClose: () => void;
}) => (
  <>
    {players.map((p) => {
      const slot = useAppStore
        .getState()
        .tactics.find((t) => t.playerId === p.id);
      const position = slot ? slot.id.toUpperCase() : "N/A";
      return (
        <Box
          key={p.id}
          onClick={() => {
            makeSub(benchPlayerId, p.id || undefined);
            onClose();
          }}
          sx={{ cursor: "pointer", backgroundColor: "rgba(20, 20, 20, 0.8)" }}
        >
          <BenchItem
            id={p.id}
            name={p.name}
            number={p.number}
            positionTags={[position]}
          />
        </Box>
      );
    })}
  </>
);

export default function SubSheet({
  open,
  benchPlayerId,
  onClose,
}: SubSheetProps) {
  const roster = useAppStore((s) => s.roster);
  const tactics = useAppStore((s) => s.tactics);
  const getLiveMinutesSec = useAppStore((s) => s.getLiveMinutesSec);
  const makeSub = useAppStore((s) => s.makeSub);

  const { eligible, ineligible } = useMemo(() => {
    if (!benchPlayerId)
      return { eligible: [], ineligible: [] } as {
        eligible: Player[];
        ineligible: Player[];
      };

    const bench = roster.find((p) => p.id === benchPlayerId);
    if (!bench)
      return { eligible: [], ineligible: [] } as {
        eligible: Player[];
        ineligible: Player[];
      };

    const onFieldIds = new Set(
      roster.filter((p) => p.isOnField).map((p) => p.id)
    );
    const playerIdToSlotId = new Map<string, string>();

    for (const t of tactics) {
      if (t.playerId) {
        playerIdToSlotId.set(t.playerId, t.id);
      }
    }

    const eligibleSlotIds = new Set<string>();
    for (const [slotId, tags] of Object.entries(SLOT_ELIGIBLE_TAGS)) {
      if (bench.positionTags.some((tag) => tags.includes(tag))) {
        eligibleSlotIds.add(slotId);
      }
    }

    const onField = roster.filter((p) => onFieldIds.has(p.id));

    const eligiblePlayers: Player[] = [];
    const ineligiblePlayers: Player[] = [];

    for (const p of onField) {
      const slotId = playerIdToSlotId.get(p.id);
      if (slotId ? eligibleSlotIds.has(slotId) : true) {
        eligiblePlayers.push(p);
      } else {
        ineligiblePlayers.push(p);
      }
    }

    const sortFn = (a: Player, b: Player) => {
      const timeDiff = getLiveMinutesSec(b.id) - getLiveMinutesSec(a.id);
      if (timeDiff !== 0) {
        return timeDiff; // Sort by time
      }
      //if time is equal, then sort by number
      return (a.number || 0) - (b.number || 0); // Sort by number
    };

    return {
      eligible: eligiblePlayers.sort(sortFn).slice(0, 8),
      ineligible: ineligiblePlayers.sort(sortFn).slice(0, 8),
    };
  }, [roster, tactics, benchPlayerId, getLiveMinutesSec]);

  return (
    <BottomSheet
      open={open && !!benchPlayerId}
      onClose={onClose}
      title="Sub for"
    >
      <Box sx={{ display: "grid", gap: 1 }}>
        {eligible.length === 0 && ineligible.length === 0 && (
          <Typography variant="subtitle2" color="textSecondary">
            No eligible on-field players
          </Typography>
        )}

        {eligible.length > 0 && (
          <>
            <Typography variant="subtitle2">Preferred Players</Typography>
            <SubList
              players={eligible}
              makeSub={makeSub}
              benchPlayerId={benchPlayerId!}
              onClose={onClose}
            />
          </>
        )}

        {ineligible.length > 0 && (
          <>
            <Typography variant="subtitle2">All Players</Typography>
            <SubList
              players={ineligible}
              makeSub={makeSub}
              benchPlayerId={benchPlayerId!}
              onClose={onClose}
            />
          </>
        )}
      </Box>
    </BottomSheet>
  );
}
