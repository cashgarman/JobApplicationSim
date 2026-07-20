import { SEEKER_GENERATORS, SEEKER_UPGRADES } from '../game/upgrades';
import { getUpgradeCost } from '../game/formulas';
import { useGameStore } from '../store/gameStore';
import { UpgradeButton } from './UpgradeButton';

export function ApplicantView()
{
  const state = useGameStore((s) => s.state);
  const clickApply = useGameStore((s) => s.clickApply);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);
  const buyGenerator = useGameStore((s) => s.buyGenerator);

  const { seeker } = state;
  const broke = seeker.savings <= 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 text-center">
        <button
          type="button"
          onClick={clickApply}
          className="btn-green font-pixel w-full rounded px-3 py-4 text-xs uppercase lg:py-5 lg:text-sm"
        >
          <i className="fa-solid fa-paper-plane mr-1.5" />
          Apply
        </button>
        {broke && (
          <p className="mt-1.5 text-xs text-corp-red">
            Savings depleted. Upgrades locked.
          </p>
        )}
      </div>

      <div className="upgrade-scroll mt-2 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        <div>
          <h3 className="font-pixel mb-1 text-xs text-corp-muted lg:text-sm">Auto-Apply Bots</h3>
          <div className="space-y-1.5">
            {SEEKER_GENERATORS.map((gen) => {
              const level = seeker.generatorLevels[gen.id] ?? 0;
              const cost = getUpgradeCost(gen.baseCost, gen.costMultiplier, level);
              const canAfford = seeker.savings >= cost;
              return (
                <UpgradeButton
                  key={gen.id}
                  item={gen}
                  currentLevel={level}
                  canAfford={canAfford && !broke}
                  onBuy={() => buyGenerator(gen.id)}
                  isGenerator
                />
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="font-pixel mb-1 text-xs text-corp-muted lg:text-sm">Resume Upgrades</h3>
          <div className="space-y-1.5">
            {SEEKER_UPGRADES.map((upgrade) => {
              const level = seeker.upgradeLevels[upgrade.id] ?? 0;
              const cost = getUpgradeCost(upgrade.baseCost, upgrade.costMultiplier, level);
              const canAfford = seeker.savings >= cost;
              return (
                <UpgradeButton
                  key={upgrade.id}
                  item={upgrade}
                  currentLevel={level}
                  canAfford={canAfford && !broke}
                  onBuy={() => buyUpgrade(upgrade.id)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
