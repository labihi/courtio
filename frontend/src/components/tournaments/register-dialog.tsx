'use client';

import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { teamApi, registrationApi } from '@/lib/api';
import { Tournament, Team, VolleyballRole, ROLE_LABELS } from '@/types';

interface RegisterDialogProps {
  tournament: Tournament;
  type: 'team' | 'solo';
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const ROLES = Object.entries(ROLE_LABELS) as [VolleyballRole, string][];

export function RegisterDialog({ tournament, type, open, onOpenChange }: RegisterDialogProps) {
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedRole, setSelectedRole] = useState<VolleyballRole | ''>('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (type === 'team') {
      teamApi.getMine().then((r) => setMyTeams(r.data)).catch(console.error);
    }
  }, [type]);

  const handleSubmit = async () => {
    if (!selectedRole) return;
    setLoading(true);
    try {
      if (type === 'team') {
        await registrationApi.registerAsTeam({
          tournamentId: tournament._id,
          teamId: selectedTeam,
          role: selectedRole,
          type: 'TEAM',
        });
      } else {
        await registrationApi.registerAsSolo({
          tournamentId: tournament._id,
          role: selectedRole,
          type: 'SOLO',
          status: 'WANT_TO_JOIN',
        });
      }
      setDone(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === 'team' ? 'Register as Team' : 'Join Solo'}
          </DialogTitle>
        </DialogHeader>

        {done ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">🏐</div>
            <p className="font-semibold">
              {type === 'solo' ? 'You\'re on the Want to Join list!' : 'Team registered!'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {type === 'solo'
                ? 'Captains can now invite you to their team.'
                : 'Your team is registered for ' + tournament.name}
            </p>
            <Button className="mt-4 w-full" onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-2">
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">
                  Tournament
                </Label>
                <p className="font-semibold">{tournament.name}</p>
              </div>

              {type === 'team' && (
                <div>
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">
                    Select Team
                  </Label>
                  <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a team..." />
                    </SelectTrigger>
                    <SelectContent>
                      {myTeams.map((t) => (
                        <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">
                  Your Role
                </Label>
                <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as VolleyballRole)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.filter(([r]) => r !== 'DS').map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label} ({value})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || !selectedRole || (type === 'team' && !selectedTeam)}
              >
                {loading ? 'Registering...' : 'Confirm'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
